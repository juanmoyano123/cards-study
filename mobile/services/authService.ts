import { api } from './api';
import type { User, ApiResponse } from '../types';

export const authService = {
  /**
   * Get current user profile from backend
   */
  async getMe(): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    if (response.data.error) {
      throw new Error(response.data.error);
    }
    return response.data.data!;
  },

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put<ApiResponse<User>>('/auth/me', data);
    if (response.data.error) {
      throw new Error(response.data.error);
    }
    return response.data.data!;
  },
};
