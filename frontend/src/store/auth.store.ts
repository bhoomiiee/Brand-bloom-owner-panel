import { create } from 'zustand';
import { apiClient } from '../lib/api-client';

export interface UserProfile {
  id: string;
  userId?: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  setUser: (user: UserProfile | null) => void;
  checkAuth: () => Promise<UserProfile | null>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  isLoading: false,

  setUser: (user) => {
    set({ user, isAuthenticated: !!user, isInitialized: true, isLoading: false });
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const data = await apiClient<{ user: UserProfile }>('/auth/me');
      set({ user: data.user, isAuthenticated: true, isInitialized: true, isLoading: false });
      return data.user;
    } catch {
      set({ user: null, isAuthenticated: false, isInitialized: true, isLoading: false });
      return null;
    }
  },

  logout: async () => {
    try {
      await apiClient('/auth/logout', { method: 'POST' });
    } catch {
      // Continue cleanup even if server is unreachable
    }
    localStorage.removeItem('sop_active_store_id');
    localStorage.removeItem('sop_active_store');
    set({ user: null, isAuthenticated: false, isInitialized: true, isLoading: false });
  }
}));
