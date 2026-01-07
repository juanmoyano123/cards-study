/**
 * Goal Service - API calls for user goal management
 */

import { api } from './api';

export interface UserGoal {
  user_id: string;
  daily_cards_goal: number;
  goal_type: 'easy_ratings' | 'cards_studied' | 'study_minutes';
  created_at: string;
  updated_at: string;
}

export interface UserGoalUpdate {
  daily_cards_goal: number;
  goal_type: 'easy_ratings' | 'cards_studied' | 'study_minutes';
}

/**
 * Get user's goal configuration
 */
export const getUserGoal = async (): Promise<UserGoal> => {
  const response = await api.get<UserGoal>('/goals');
  return response.data;
};

/**
 * Update user's goal configuration
 */
export const updateUserGoal = async (goal: UserGoalUpdate): Promise<UserGoal> => {
  const response = await api.put<UserGoal>('/goals', goal);
  return response.data;
};
