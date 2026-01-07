/**
 * Dashboard Store - Zustand store for dashboard statistics
 */

import { create } from 'zustand';
import { DashboardStats, getDashboardStats, getTodayStats, TodayStats, DailyProgress, getDailyProgress } from '../services/statsService';

interface DashboardStore {
  // State
  stats: DashboardStats | null;
  todayStats: TodayStats | null;
  dailyProgress: DailyProgress | null;
  loading: boolean;
  error: string | null;
  lastFetched: Date | null;

  // Actions
  loadDashboardStats: () => Promise<void>;
  loadTodayStats: () => Promise<void>;
  loadDailyProgress: () => Promise<void>;
  refresh: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  stats: null,
  todayStats: null,
  dailyProgress: null,
  loading: false,
  error: null,
  lastFetched: null,
};

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  ...initialState,

  /**
   * Load complete dashboard statistics
   */
  loadDashboardStats: async () => {
    set({ loading: true, error: null });

    try {
      const stats = await getDashboardStats();
      set({
        stats,
        loading: false,
        lastFetched: new Date(),
      });
    } catch (error: any) {
      console.error('Error loading dashboard stats:', error);
      set({
        loading: false,
        error: error.response?.data?.detail || 'Failed to load dashboard stats',
      });
    }
  },

  /**
   * Load quick today stats
   */
  loadTodayStats: async () => {
    set({ loading: true, error: null });

    try {
      const todayStats = await getTodayStats();
      set({
        todayStats,
        loading: false,
        lastFetched: new Date(),
      });
    } catch (error: any) {
      console.error('Error loading today stats:', error);
      set({
        loading: false,
        error: error.response?.data?.detail || 'Failed to load today stats',
      });
    }
  },

  /**
   * Load daily progress toward goal
   */
  loadDailyProgress: async () => {
    set({ loading: true, error: null });

    try {
      const dailyProgress = await getDailyProgress();
      set({
        dailyProgress,
        loading: false,
        lastFetched: new Date(),
      });
    } catch (error: any) {
      console.error('Error loading daily progress:', error);
      set({
        loading: false,
        error: error.response?.data?.detail || 'Failed to load daily progress',
      });
    }
  },

  /**
   * Refresh dashboard stats
   */
  refresh: async () => {
    const { loadDashboardStats, loadDailyProgress } = get();
    await Promise.all([
      loadDashboardStats(),
      loadDailyProgress(),
    ]);
  },

  /**
   * Clear error message
   */
  clearError: () => {
    set({ error: null });
  },

  /**
   * Reset store to initial state
   */
  reset: () => {
    set(initialState);
  },
}));
