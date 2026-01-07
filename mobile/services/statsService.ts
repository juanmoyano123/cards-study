/**
 * Stats Service - API calls for statistics and analytics
 */

import { api } from './api';

export interface HeatmapDay {
  date: string;
  count: number;
}

export interface SubjectProgress {
  subject: string;
  total_cards: number;
  mastered_cards: number;
  cards_due: number;
  mastery_percentage: number;
  last_studied?: string;
}

export interface DashboardStats {
  // Streak tracking
  current_streak: number;
  longest_streak: number;

  // Today's stats
  cards_due_today: number;
  cards_studied_today: number;

  // Overall stats
  total_cards: number;
  total_cards_mastered: number;
  total_study_time_minutes: number;

  // Recent activity
  cards_studied_this_week: number;
  study_time_this_week: number;

  // Heatmap data (last 90 days)
  heatmap_data: HeatmapDay[];

  // Progress by subject
  progress_by_subject: SubjectProgress[];
}

export interface TodayStats {
  cards_due: number;
  cards_studied: number;
  study_time_minutes: number;
  current_streak: number;
}

export interface DailyProgress {
  goal: number;
  progress: number;
  remaining: number;
  percentage: number;
  goal_type: 'easy_ratings' | 'cards_studied' | 'study_minutes';
  easy_ratings_today: number;
  cards_studied_today: number;
  study_minutes_today: number;
}

/**
 * Get complete dashboard statistics
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get<DashboardStats>('/stats/dashboard');
  return response.data;
};

/**
 * Get quick stats for today
 */
export const getTodayStats = async (): Promise<TodayStats> => {
  const response = await api.get<TodayStats>('/stats/today');
  return response.data;
};

/**
 * Get daily progress toward user's goal
 */
export const getDailyProgress = async (): Promise<DailyProgress> => {
  const response = await api.get<DailyProgress>('/stats/daily-progress');
  return response.data;
};
