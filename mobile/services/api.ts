import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { secureStorage } from '../utils/secureStorage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms
const RETRY_STATUS_CODES = [408, 429, 500, 502, 503, 504];

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
          const token = await secureStorage.getItem('auth_token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error('Failed to get auth token:', error);
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling and retry logic
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const config = error.config as AxiosRequestConfig & { _retryCount?: number };

        // Handle 401 - Token expired
        if (error.response?.status === 401) {
          await secureStorage.removeItem('auth_token');
          // Note: user data can stay in AsyncStorage as it's not sensitive
          // Trigger logout in your app here
          return Promise.reject(error);
        }

        // Retry logic for network errors and specific status codes
        if (
          !config._retryCount &&
          (error.code === 'ECONNABORTED' ||
            error.code === 'ERR_NETWORK' ||
            RETRY_STATUS_CODES.includes(error.response?.status))
        ) {
          config._retryCount = 0;
        }

        if (config._retryCount !== undefined && config._retryCount < MAX_RETRIES) {
          config._retryCount += 1;
          const delay = RETRY_DELAY * Math.pow(2, config._retryCount - 1);

          await new Promise((resolve) => setTimeout(resolve, delay));

          console.log(
            `Retrying request (attempt ${config._retryCount}/${MAX_RETRIES}):`,
            config.url
          );

          return this.client.request(config);
        }

        return Promise.reject(error);
      }
    );
  }

  public get<T>(url: string, config?: AxiosRequestConfig) {
    return this.client.get<T>(url, config);
  }

  public post<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.post<T>(url, data, config);
  }

  public put<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.put<T>(url, data, config);
  }

  public delete<T>(url: string, config?: AxiosRequestConfig) {
    return this.client.delete<T>(url, config);
  }

  public patch<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.patch<T>(url, data, config);
  }
}

export const api = new ApiClient();
