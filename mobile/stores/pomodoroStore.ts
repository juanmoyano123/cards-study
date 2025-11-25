/**
 * Pomodoro Timer Store
 * Manages state for the Pomodoro timer functionality
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { pomodoroService } from '../services/pomodoroService';

// Default durations in seconds
const DEFAULT_WORK_DURATION = 25 * 60; // 25 minutes
const DEFAULT_BREAK_DURATION = 5 * 60; // 5 minutes
const DEFAULT_LONG_BREAK_DURATION = 15 * 60; // 15 minutes
const POMODOROS_UNTIL_LONG_BREAK = 4;

export interface PomodoroSettings {
  workDuration: number; // in seconds
  breakDuration: number; // in seconds
  longBreakDuration: number; // in seconds
  pomodorosUntilLongBreak: number;
  autoStartBreak: boolean;
  autoStartWork: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

interface PomodoroState {
  // Timer state
  timeRemaining: number;
  isRunning: boolean;
  isBreak: boolean;
  isLongBreak: boolean;

  // Session tracking
  completedPomodoros: number;
  totalPomodorosToday: number;
  sessionStartTime: number | null;

  // Settings
  workDuration: number;
  breakDuration: number;
  longBreakDuration: number;
  pomodorosUntilLongBreak: number;
  autoStartBreak: boolean;
  autoStartWork: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;

  // Sync state
  isSyncing: boolean;
  lastSyncedAt: number | null;

  // Actions
  tick: () => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
  skipToBreak: () => void;
  skipToWork: () => void;
  completeSession: () => Promise<void>;
  updateSettings: (settings: Partial<PomodoroSettings>) => void;
  resetDay: () => void;
  syncWithServer: () => Promise<void>;
  loadTodayPomodoros: () => Promise<void>;
}

export const usePomodoroStore = create<PomodoroState>()(
  persist(
    (set, get) => ({
      // Initial timer state
      timeRemaining: DEFAULT_WORK_DURATION,
      isRunning: false,
      isBreak: false,
      isLongBreak: false,

      // Session tracking
      completedPomodoros: 0,
      totalPomodorosToday: 0,
      sessionStartTime: null,

      // Default settings
      workDuration: DEFAULT_WORK_DURATION,
      breakDuration: DEFAULT_BREAK_DURATION,
      longBreakDuration: DEFAULT_LONG_BREAK_DURATION,
      pomodorosUntilLongBreak: POMODOROS_UNTIL_LONG_BREAK,
      autoStartBreak: false,
      autoStartWork: false,
      soundEnabled: true,
      vibrationEnabled: true,

      // Sync state
      isSyncing: false,
      lastSyncedAt: null,

      // Tick the timer down by 1 second
      tick: () => {
        const state = get();
        if (state.timeRemaining <= 0) {
          // Timer completed
          if (!state.isBreak) {
            // Work session completed - switch to break
            const newCompletedCount = state.completedPomodoros + 1;
            const isLongBreakTime =
              newCompletedCount % state.pomodorosUntilLongBreak === 0;

            set({
              isBreak: true,
              isLongBreak: isLongBreakTime,
              timeRemaining: isLongBreakTime
                ? state.longBreakDuration
                : state.breakDuration,
              isRunning: state.autoStartBreak,
            });
          } else {
            // Break completed - switch to work
            set({
              isBreak: false,
              isLongBreak: false,
              timeRemaining: state.workDuration,
              isRunning: state.autoStartWork,
            });
          }
          return;
        }

        set({ timeRemaining: state.timeRemaining - 1 });
      },

      // Start the timer
      start: () => {
        const state = get();
        set({
          isRunning: true,
          sessionStartTime: state.sessionStartTime ?? Date.now(),
        });
      },

      // Pause the timer
      pause: () => {
        set({ isRunning: false });
      },

      // Reset the timer to work mode
      reset: () => {
        const state = get();
        set({
          timeRemaining: state.workDuration,
          isRunning: false,
          isBreak: false,
          isLongBreak: false,
          sessionStartTime: null,
        });
      },

      // Skip to break (useful when finishing early)
      skipToBreak: () => {
        const state = get();
        const newCompletedCount = state.completedPomodoros + 1;
        const isLongBreakTime =
          newCompletedCount % state.pomodorosUntilLongBreak === 0;

        set({
          isBreak: true,
          isLongBreak: isLongBreakTime,
          timeRemaining: isLongBreakTime
            ? state.longBreakDuration
            : state.breakDuration,
          isRunning: false,
          completedPomodoros: newCompletedCount,
          totalPomodorosToday: state.totalPomodorosToday + 1,
        });
      },

      // Skip to work (useful when skipping break)
      skipToWork: () => {
        const state = get();
        set({
          isBreak: false,
          isLongBreak: false,
          timeRemaining: state.workDuration,
          isRunning: false,
        });
      },

      // Complete a Pomodoro session and sync with server
      completeSession: async () => {
        const state = get();
        const newCompletedCount = state.completedPomodoros + 1;
        const isLongBreakTime =
          newCompletedCount % state.pomodorosUntilLongBreak === 0;

        // Update local state immediately
        set({
          completedPomodoros: newCompletedCount,
          totalPomodorosToday: state.totalPomodorosToday + 1,
          isBreak: true,
          isLongBreak: isLongBreakTime,
          timeRemaining: isLongBreakTime
            ? state.longBreakDuration
            : state.breakDuration,
          isRunning: state.autoStartBreak,
        });

        // Sync with server in background
        try {
          await pomodoroService.recordPomodoroComplete();
          set({ lastSyncedAt: Date.now() });
        } catch (error) {
          console.error('Failed to sync Pomodoro completion:', error);
          // Continue anyway - will sync later
        }
      },

      // Update settings
      updateSettings: (settings: Partial<PomodoroSettings>) => {
        const state = get();
        const updates: Partial<PomodoroState> = { ...settings };

        // If work duration changed and we're in work mode, update time remaining
        if (settings.workDuration && !state.isBreak && !state.isRunning) {
          updates.timeRemaining = settings.workDuration;
        }

        // If break duration changed and we're in break mode, update time remaining
        if (settings.breakDuration && state.isBreak && !state.isLongBreak && !state.isRunning) {
          updates.timeRemaining = settings.breakDuration;
        }

        // If long break duration changed and we're in long break mode, update time remaining
        if (settings.longBreakDuration && state.isLongBreak && !state.isRunning) {
          updates.timeRemaining = settings.longBreakDuration;
        }

        set(updates);

        // Sync settings with server
        pomodoroService.updateSettings(settings).catch((error) => {
          console.error('Failed to sync Pomodoro settings:', error);
        });
      },

      // Reset day counters (call at midnight or on new day)
      resetDay: () => {
        set({
          completedPomodoros: 0,
          totalPomodorosToday: 0,
        });
      },

      // Sync current state with server
      syncWithServer: async () => {
        const state = get();
        if (state.isSyncing) return;

        set({ isSyncing: true });
        try {
          // Get today's stats from server
          const serverStats = await pomodoroService.getTodayStats();
          if (serverStats) {
            set({
              totalPomodorosToday: serverStats.pomodoro_sessions,
              lastSyncedAt: Date.now(),
            });
          }
        } catch (error) {
          console.error('Failed to sync with server:', error);
        } finally {
          set({ isSyncing: false });
        }
      },

      // Load today's pomodoro count from server
      loadTodayPomodoros: async () => {
        try {
          const stats = await pomodoroService.getTodayStats();
          if (stats) {
            set({
              totalPomodorosToday: stats.pomodoro_sessions,
              completedPomodoros: stats.pomodoro_sessions,
            });
          }
        } catch (error) {
          console.error('Failed to load today pomodoros:', error);
        }
      },
    }),
    {
      name: 'pomodoro-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist settings and today's counts
        workDuration: state.workDuration,
        breakDuration: state.breakDuration,
        longBreakDuration: state.longBreakDuration,
        pomodorosUntilLongBreak: state.pomodorosUntilLongBreak,
        autoStartBreak: state.autoStartBreak,
        autoStartWork: state.autoStartWork,
        soundEnabled: state.soundEnabled,
        vibrationEnabled: state.vibrationEnabled,
        completedPomodoros: state.completedPomodoros,
        totalPomodorosToday: state.totalPomodorosToday,
      }),
    }
  )
);

// Helper hook to get formatted time
export function useFormattedTime() {
  const timeRemaining = usePomodoroStore((state) => state.timeRemaining);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return {
    minutes,
    seconds,
    formatted: `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
  };
}

// Helper hook to get progress percentage
export function useTimerProgress() {
  const { timeRemaining, isBreak, workDuration, breakDuration, isLongBreak, longBreakDuration } =
    usePomodoroStore((state) => ({
      timeRemaining: state.timeRemaining,
      isBreak: state.isBreak,
      workDuration: state.workDuration,
      breakDuration: state.breakDuration,
      isLongBreak: state.isLongBreak,
      longBreakDuration: state.longBreakDuration,
    }));

  const totalTime = isBreak
    ? isLongBreak
      ? longBreakDuration
      : breakDuration
    : workDuration;

  return {
    progress: timeRemaining / totalTime,
    percentage: Math.round((timeRemaining / totalTime) * 100),
  };
}
