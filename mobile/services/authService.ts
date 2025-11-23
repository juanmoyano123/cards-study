import { api } from './api';
import type { User, ApiResponse } from '../types';
import { handleApiResponse } from '../utils/apiHelpers';

export const authService = {
  /**
   * Get current user profile from backend
   */
  async getMe(): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return handleApiResponse(response);
  },

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put<ApiResponse<User>>('/auth/me', data);
    return handleApiResponse(response);
  },
};
