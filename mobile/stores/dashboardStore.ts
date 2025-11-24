/**
 * Dashboard Store - Zustand store for dashboard statistics
 */

import { create } from 'zustand';
import { DashboardStats, getDashboardStats, getTodayStats, TodayStats } from '../services/statsService';

interface DashboardStore {
  // State
  stats: DashboardStats | null;
  todayStats: TodayStats | null;
  loading: boolean;
  error: string | null;
  lastFetched: Date | null;

  // Actions
  loadDashboardStats: () => Promise<void>;
  loadTodayStats: () => Promise<void>;
  refresh: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  stats: null,
  todayStats: null,
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
   * Refresh dashboard stats
   */
  refresh: async () => {
    const { loadDashboardStats } = get();
    await loadDashboardStats();
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
