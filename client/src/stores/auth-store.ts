import { create } from 'zustand';
import type { User } from '../types';
import api from '../lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response: any = await api.post('/api/auth/login', { email, password });
      // response should contain { user, accessToken }
      const { user, accessToken } = response;
      localStorage.setItem('cashflow_token', accessToken);
      localStorage.setItem('cashflow_user', JSON.stringify(user));
      set({ user, token: accessToken, loading: false });
      return user;
    } catch (err: any) {
      set({ error: err.message || 'Login failed', loading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('cashflow_token');
    localStorage.removeItem('cashflow_user');
    set({ user: null, token: null, error: null });
  },

  initialize: async () => {
    const token = localStorage.getItem('cashflow_token');
    const userJson = localStorage.getItem('cashflow_user');

    if (token && userJson) {
      try {
        set({ token, user: JSON.parse(userJson) });
        // Fetch fresh user profile from backend
        const freshUser: any = await api.get('/api/auth/me');
        localStorage.setItem('cashflow_user', JSON.stringify(freshUser));
        set({ user: freshUser });
      } catch (err) {
        // If /me fails (e.g. token expired), reset state
        localStorage.removeItem('cashflow_token');
        localStorage.removeItem('cashflow_user');
        set({ user: null, token: null });
      }
    }
  },
}));
