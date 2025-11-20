import { create } from 'zustand';
import { supabase } from '../utils/supabase';
import type { User, SignUpCredentials, SignInCredentials } from '../types';
import type { Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
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
  session: null,
  loading: false,
  initialized: false,

  initialize: async () => {
    try {
      set({ loading: true });

      // Get current session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        // Fetch user profile from your backend
        const user: User = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name,
          subject: session.user.user_metadata?.subject,
          created_at: session.user.created_at || '',
          updated_at: session.user.updated_at || '',
        };

        set({ user, session, initialized: true });
      } else {
        set({ user: null, session: null, initialized: true });
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event);

        if (session?.user) {
          const user: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name,
            subject: session.user.user_metadata?.subject,
            created_at: session.user.created_at || '',
            updated_at: session.user.updated_at || '',
          };
          set({ user, session });
        } else {
          set({ user: null, session: null });
        }
      });
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      set({ user: null, session: null, initialized: true });
    } finally {
      set({ loading: false });
    }
  },

  signUp: async (credentials: SignUpCredentials) => {
    try {
      set({ loading: true });

      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            name: credentials.name,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        const user: User = {
          id: data.user.id,
          email: data.user.email || '',
          name: credentials.name,
          created_at: data.user.created_at || '',
          updated_at: data.user.updated_at || '',
        };

        set({ user, session: data.session });
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signIn: async (credentials: SignInCredentials) => {
    try {
      set({ loading: true });

      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;

      if (data.user) {
        const user: User = {
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.name,
          subject: data.user.user_metadata?.subject,
          created_at: data.user.created_at || '',
          updated_at: data.user.updated_at || '',
        };

        set({ user, session: data.session });
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    try {
      set({ loading: true });

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      set({ user: null, session: null });
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

      const { error } = await supabase.auth.updateUser({
        data: {
          name: data.name,
          subject: data.subject,
        },
      });

      if (error) throw error;

      // Update local state
      const currentUser = get().user;
      if (currentUser) {
        set({
          user: {
            ...currentUser,
            ...data,
          },
        });
      }
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));
