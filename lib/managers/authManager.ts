import { authApi } from '../api/auth';

// Define types
export interface User {
  id: string;
  email: string;
  name?: string;
  is_active: boolean;
  is_superuser: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

class AuthManager {
  private user: User | null = null;
  private listeners: Set<() => void> = new Set();

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.user;
  }

  // Get current user data
  getCurrentUser(): User | null {
    return this.user;
  }

  // Load user data from the server
  async loadUser(): Promise<User | null> {
    try {
      const user = await authApi.getCurrentUser();
      this.user = user;
      this.notifyListeners();
      return user;
    } catch (error) {
      this.user = null;
      this.notifyListeners();
      return null;
    }
  }

  // Login with username and password
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      await authApi.login(credentials);
      const user = await this.loadUser();
      if (!user) {
        throw new Error('Authentication failed');
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  // Register new user
  async register(data: RegisterData): Promise<void> {
    try {
      await authApi.register(data);
      // Note: We don't automatically log in after registration
    } catch (error) {
      throw error;
    }
  }

  // Logout current user
  async logout(): Promise<void> {
    try {
      await authApi.logout();
      this.user = null;
      this.notifyListeners();
    } catch (error) {
      // Even if logout fails on server, clear user locally
      this.user = null;
      this.notifyListeners();
      throw error;
    }
  }

  // Subscribe to auth state changes
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Notify all listeners of state change
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }
}

// Export singleton instance
export const authManager = new AuthManager(); 