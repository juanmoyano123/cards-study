/**
 * Pomodoro Service
 * API endpoints for Pomodoro timer functionality
 */

import { api } from './api';
import type { PomodoroSettings } from '../stores/pomodoroStore';

// Types
export interface PomodoroStats {
  pomodoro_sessions: number;
  total_focus_minutes: number;
  date: string;
}

export interface PomodoroSessionResponse {
  success: boolean;
  pomodoro_count: number;
  message?: string;
}

export interface PomodoroSettingsResponse {
  work_duration: number;
  break_duration: number;
  long_break_duration: number;
  pomodoros_until_long_break: number;
  auto_start_break: boolean;
  auto_start_work: boolean;
  sound_enabled: boolean;
  vibration_enabled: boolean;
}

/**
 * Pomodoro Service - handles all Pomodoro-related API calls
 */
export const pomodoroService = {
  /**
   * Record a completed Pomodoro session
   */
  async recordPomodoroComplete(): Promise<PomodoroSessionResponse> {
    const response = await api.post<PomodoroSessionResponse>(
      '/study/pomodoro/complete'
    );
    return response.data;
  },

  /**
   * Get today's Pomodoro statistics
   */
  async getTodayStats(): Promise<PomodoroStats | null> {
    try {
      const response = await api.get<PomodoroStats>('/study/pomodoro/today');
      return response.data;
    } catch (error) {
      // Return null if no session exists for today
      return null;
    }
  },

  /**
   * Get Pomodoro settings from server
   */
  async getSettings(): Promise<PomodoroSettingsResponse | null> {
    try {
      const response = await api.get<PomodoroSettingsResponse>(
        '/study/pomodoro/settings'
      );
      return response.data;
    } catch (error) {
      return null;
    }
  },

  /**
   * Update Pomodoro settings on server
   */
  async updateSettings(
    settings: Partial<PomodoroSettings>
  ): Promise<PomodoroSettingsResponse> {
    // Convert from frontend format to backend format
    const payload: Partial<PomodoroSettingsResponse> = {};

    if (settings.workDuration !== undefined) {
      payload.work_duration = settings.workDuration;
    }
    if (settings.breakDuration !== undefined) {
      payload.break_duration = settings.breakDuration;
    }
    if (settings.longBreakDuration !== undefined) {
      payload.long_break_duration = settings.longBreakDuration;
    }
    if (settings.pomodorosUntilLongBreak !== undefined) {
      payload.pomodoros_until_long_break = settings.pomodorosUntilLongBreak;
    }
    if (settings.autoStartBreak !== undefined) {
      payload.auto_start_break = settings.autoStartBreak;
    }
    if (settings.autoStartWork !== undefined) {
      payload.auto_start_work = settings.autoStartWork;
    }
    if (settings.soundEnabled !== undefined) {
      payload.sound_enabled = settings.soundEnabled;
    }
    if (settings.vibrationEnabled !== undefined) {
      payload.vibration_enabled = settings.vibrationEnabled;
    }

    const response = await api.patch<PomodoroSettingsResponse>(
      '/study/pomodoro/settings',
      payload
    );
    return response.data;
  },

  /**
   * Start a new Pomodoro session
   */
  async startSession(): Promise<{ session_id: string }> {
    const response = await api.post<{ session_id: string }>(
      '/study/pomodoro/start'
    );
    return response.data;
  },

  /**
   * Get Pomodoro history for a date range
   */
  async getHistory(
    startDate: string,
    endDate: string
  ): Promise<PomodoroStats[]> {
    const response = await api.get<PomodoroStats[]>('/study/pomodoro/history', {
      params: {
        start_date: startDate,
        end_date: endDate,
      },
    });
    return response.data;
  },
};
