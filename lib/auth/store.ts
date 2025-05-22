import { create } from 'zustand';
import { authApi } from '../api/auth';

interface User {
  id: string;
  email: string;
  name?: string;
  is_active: boolean;
  is_superuser: boolean;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      console.log('Store: Starting login request');
      
      // Login request
      const result = await authApi.login({ username: email, password });
      console.log('Store: Login successful, result:', result);
      
      // Add delay to ensure cookie is set
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Store: Delay complete, loading user');
      
      // Try to load user data
      try {
        await get().loadUser();
      } catch (userError) {
        console.error('Store: Error loading user after login:', userError);
        set({ 
          error: 'Login succeeded but session verification failed. Please try again.', 
          isLoading: false,
          isAuthenticated: false,
        });
      }
    } catch (error: any) {
      console.error('Store: Login error:', error);
      set({ 
        error: error.response?.data?.detail || 'Login failed', 
        isLoading: false,
        isAuthenticated: false,
      });
    }
  },

  register: async (email: string, password: string, name?: string) => {
    try {
      set({ isLoading: true, error: null });
      await authApi.register({ email, password, name });
      // After registration, we can either automatically log them in or redirect to login
      set({ isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Registration failed', 
        isLoading: false,
      });
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });
      await authApi.logout();
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (error) {
      // Even if the API call fails, we clear the state on the client
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  loadUser: async () => {
    try {
      set({ isLoading: true });
      const user = await authApi.getCurrentUser();
      console.log('Store: User loaded successfully:', user);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      console.error('Store: Error loading user:', error);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  clearError: () => {
    set({ error: null });
  },
})); 