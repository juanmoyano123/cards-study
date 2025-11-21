import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';
import { secureStorage } from '../utils/secureStorage';
import type { User, SignUpCredentials, SignInCredentials } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  initialized: boolean;

  // Actions
  initialize: () => Promise<void>;
  signUp: (credentials: SignUpCredentials) => Promise<void>;
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  loading: false,
  initialized: false,

  initialize: async () => {
    try {
      set({ loading: true });

      // Get stored token from secure storage and user from async storage
      const token = await secureStorage.getItem('auth_token');
      const userJson = await AsyncStorage.getItem('user');

      if (token && userJson) {
        const user = JSON.parse(userJson);
        set({ user, token, initialized: true });

        // Optionally verify token with backend
        try {
          const response = await api.get('/auth/me');
          set({ user: response.data });
        } catch (error) {
          // Token invalid, clear auth
          console.error('Token validation failed:', error);
          await secureStorage.removeItem('auth_token');
          await AsyncStorage.removeItem('user');
          set({ user: null, token: null });
        }
      } else {
        set({ user: null, token: null, initialized: true });
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      set({ user: null, token: null, initialized: true });
    } finally {
      set({ loading: false });
    }
  },

  signUp: async (credentials: SignUpCredentials) => {
    try {
      set({ loading: true });

      const response = await api.post('/auth/signup', {
        email: credentials.email,
        password: credentials.password,
        name: credentials.name,
      });

      const { access_token } = response.data;

      // Get user data after signup
      const userResponse = await api.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      const user = userResponse.data;

      // Store token in secure storage and user in async storage
      await secureStorage.setItem('auth_token', access_token);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      set({ user, token: access_token });
    } catch (error) {
      console.error('Sign up error:', error);
      const message =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { detail?: string } } }).response?.data
              ?.detail || 'Sign up failed';
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },

  signIn: async (credentials: SignInCredentials) => {
    try {
      set({ loading: true });

      // Send JSON with email field
      const response = await api.post('/auth/login', {
        email: credentials.email,
        password: credentials.password,
      });

      const { access_token, token_type } = response.data;

      // Get user data
      const userResponse = await api.get('/auth/me', {
        headers: {
          Authorization: `${token_type} ${access_token}`,
        },
      });

      const user = userResponse.data;

      // Store token in secure storage and user in async storage
      await secureStorage.setItem('auth_token', access_token);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      set({ user, token: access_token });
    } catch (error) {
      console.error('Sign in error:', error);
      const message =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { detail?: string } } }).response?.data
              ?.detail || 'Sign in failed';
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    try {
      set({ loading: true });

      // Clear stored data
      await secureStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user');

      set({ user: null, token: null });
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateProfile: async (data: Partial<User>) => {
    try {
      set({ loading: true });

      const response = await api.put('/users/me', data);
      const updatedUser = response.data;

      // Update stored user
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

      set({ user: updatedUser });
    } catch (error) {
      console.error('Update profile error:', error);
      const message =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { detail?: string } } }).response?.data
              ?.detail || 'Update failed';
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },
}));
