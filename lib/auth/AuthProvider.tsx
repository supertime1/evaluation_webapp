'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/lib/api/auth';

interface User {
  id: string;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  is_verified: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch the current user
  const fetchCurrentUser = async () => {
    try {
      setIsLoading(true);
      const userData = await authApi.getCurrentUser();
      setUser(userData);
      return true;
    } catch (err) {
      console.log('Not authenticated or error fetching user');
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Check auth status on initial load
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Attempting login with:', email);
      
      await authApi.login({
        username: email,
        password,
      });
      
      console.log('Login successful, fetching user data');
      
      // Wait to ensure cookie is set
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Fetch user data to confirm authentication
      const isAuthenticated = await fetchCurrentUser();
      
      if (!isAuthenticated) {
        setError('Authentication failed. Please try again.');
        return false;
      }
      
      return true;
    } catch (err: any) {
      console.error('Login error:', err);
      
      if (err.response) {
        if (err.response.status === 400 || err.response.status === 401 || err.response.status === 422) {
          setError('Invalid email or password. Please try again.');
        } else {
          setError(err.response.data?.detail || 'Login failed. Please check your credentials.');
        }
      } else if (err.request) {
        setError('Unable to connect to the server. Please try again later.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    
    try {
      await authApi.logout();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear error function
  const clearError = () => setError(null);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    login,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
} 