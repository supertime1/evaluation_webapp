import { authApi } from '../api/auth';
import { authManager } from './authManager';

// User model
export interface User {
  id: string;
  email: string;
  name?: string;
  is_active: boolean;
  is_superuser: boolean;
}

class UserManager {
  private currentUser: User | null = null;
  private userListeners: Set<() => void> = new Set();

  constructor() {
    // Subscribe to auth changes to clear user data on logout
    authManager.subscribeToAuth(() => {
      if (!authManager.isAuthenticated()) {
        this.clearUserData();
      }
    });
  }

  // Get current user data
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Load user data from the server
  async loadUserData(): Promise<User | null> {
    try {
      // Only attempt to load user if authenticated
      if (!authManager.isAuthenticated()) {
        return null;
      }

      const user = await authApi.getCurrentUser();
      this.currentUser = user;
      this.notifyListeners();
      return user;
    } catch (error) {
      this.clearUserData();
      return null;
    }
  }

  // Clear user data (on logout or error)
  private clearUserData(): void {
    this.currentUser = null;
    this.notifyListeners();
  }

  // Subscribe to user data changes
  subscribeToUser(listener: () => void): () => void {
    this.userListeners.add(listener);
    return () => {
      this.userListeners.delete(listener);
    };
  }

  // Get user profile with full details
  async getUserProfile(): Promise<User | null> {
    // In a real app, this might be a separate API call for detailed profile data
    // For now, we'll just return the current user
    if (this.currentUser) {
      return this.currentUser;
    }
    
    return this.loadUserData();
  }

  // Update user profile
  async updateUserProfile(data: Partial<User>): Promise<User | null> {
    try {
      // This would be an API call in a real implementation
      // For now, just mock the behavior
      console.log('Updating user profile with:', data);
      
      // Simulate API call and update local state
      this.currentUser = {
        ...this.currentUser!,
        ...data
      };
      
      this.notifyListeners();
      return this.currentUser;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Notify all listeners of state change
  private notifyListeners(): void {
    this.userListeners.forEach(listener => {
      try {
        listener();
      } catch (error) {
        console.error('Error in user listener:', error);
      }
    });
  }

  // Initialize both auth and user state 
  async initializeUser(): Promise<User | null> {
    const isAuthenticated = await authManager.checkAuthStatus();
    
    if (isAuthenticated) {
      return this.loadUserData();
    }
    
    return null;
  }
}

// Export singleton instance
export const userManager = new UserManager(); 