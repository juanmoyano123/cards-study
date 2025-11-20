import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { supabase } from '../utils/supabase';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add JWT token
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session?.access_token) {
            config.headers.Authorization = `Bearer ${session.access_token}`;
          }
        } catch (error) {
          console.error('Failed to get session:', error);
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired, try to refresh
          try {
            const {
              data: { session },
            } = await supabase.auth.refreshSession();

            if (session) {
              // Retry the original request
              const config = error.config;
              config.headers.Authorization = `Bearer ${session.access_token}`;
              return this.client.request(config);
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            console.error('Session refresh failed:', refreshError);
            // You might want to trigger a logout here
          }
        }

        return Promise.reject(error);
      }
    );
  }

  public get<T>(url: string, config?: any) {
    return this.client.get<T>(url, config);
  }

  public post<T>(url: string, data?: any, config?: any) {
    return this.client.post<T>(url, data, config);
  }

  public put<T>(url: string, data?: any, config?: any) {
    return this.client.put<T>(url, data, config);
  }

  public delete<T>(url: string, config?: any) {
    return this.client.delete<T>(url, config);
  }

  public patch<T>(url: string, data?: any, config?: any) {
    return this.client.patch<T>(url, data, config);
  }
}

export const api = new ApiClient();
