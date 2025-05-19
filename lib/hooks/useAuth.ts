import { useState, useEffect } from 'react';
import { authManager, LoginCredentials, RegisterData } from '../managers/authManager';

interface UseAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(authManager.isAuthenticated());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = authManager.subscribeToAuth(() => {
      setIsAuthenticated(authManager.isAuthenticated());
    });

    // Check auth status on mount
    if (!isAuthenticated) {
      setIsLoading(true);
      authManager.checkAuthStatus()
        .finally(() => setIsLoading(false));
    }

    return unsubscribe;
  }, [isAuthenticated]);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await authManager.login(credentials);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Login failed'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await authManager.register(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Registration failed'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await authManager.logout();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Logout failed'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = (): void => {
    setError(null);
  };

  return {
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError
  };
}

// For components that only need to check auth status without functionality
export function useAuthStatus() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(authManager.isAuthenticated());
  
  useEffect(() => {
    const unsubscribe = authManager.subscribeToAuth(() => {
      setIsAuthenticated(authManager.isAuthenticated());
    });
    
    return unsubscribe;
  }, []);
  
  return {
    isAuthenticated
  };
} 