import { useState, useEffect } from 'react';
import { userManager, User } from '../managers/userManager';

interface UseUserReturn {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loadUser: () => Promise<User | null>;
  updateProfile: (data: Partial<User>) => Promise<User | null>;
  clearError: () => void;
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(userManager.getCurrentUser());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Subscribe to user data changes
    const unsubscribe = userManager.subscribeToUser(() => {
      setUser(userManager.getCurrentUser());
    });

    // Load user on mount if not already loaded
    if (!user) {
      setIsLoading(true);
      userManager.loadUserData()
        .finally(() => setIsLoading(false));
    }

    return unsubscribe;
  }, [user]);

  const loadUser = async (): Promise<User | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const userData = await userManager.loadUserData();
      return userData;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load user data'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<User | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedUser = await userManager.updateUserProfile(data);
      return updatedUser;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update profile'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = (): void => {
    setError(null);
  };

  return {
    user,
    isLoading,
    error,
    loadUser,
    updateProfile,
    clearError
  };
}

// For components that only need to access user data without functionality
export function useUserData() {
  const [user, setUser] = useState<User | null>(userManager.getCurrentUser());
  
  useEffect(() => {
    const unsubscribe = userManager.subscribeToUser(() => {
      setUser(userManager.getCurrentUser());
    });
    
    return unsubscribe;
  }, []);
  
  return {
    user
  };
} 