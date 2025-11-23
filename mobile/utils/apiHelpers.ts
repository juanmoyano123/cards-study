import type { ApiResponse } from '../types';

/**
 * Handle API response and extract data
 * Throws an error if response contains an error or no data
 *
 * @param response - Axios response with ApiResponse<T> data
 * @returns Extracted data of type T
 * @throws Error if response contains error or no data
 */
export function handleApiResponse<T>(response: { data: ApiResponse<T> }): T {
  // Check for error in response
  if (response.data.error) {
    throw new Error(response.data.error);
  }

  // Check for missing data
  if (!response.data.data) {
    throw new Error('No data returned from server');
  }

  return response.data.data;
}

/**
 * Handle API errors consistently
 * Extracts meaningful error message from various error types
 *
 * @param error - Error object (could be Error, axios error, or unknown)
 * @param defaultMessage - Default message if error cannot be parsed
 * @returns User-friendly error message
 */
export function handleApiError(error: unknown, defaultMessage: string = 'An unexpected error occurred'): string {
  if (error instanceof Error) {
    return error.message;
  }

  // Handle axios errors
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const axiosError = error as any;
    if (axiosError.response?.data?.error) {
      return axiosError.response.data.error;
    }
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    if (axiosError.message) {
      return axiosError.message;
    }
  }

  return defaultMessage;
}
