import { authApi } from '../api/auth';

// Login credentials interface
export interface LoginCredentials {
  username: string;
  password: string;
}

// Registration data interface
export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

class AuthManager {
  private isLoggedIn: boolean = false;
  private authListeners: Set<() => void> = new Set();
  
  // Check if authenticated
  isAuthenticated(): boolean {
    return this.isLoggedIn;
  }

  // Login
  async login(credentials: LoginCredentials): Promise<void> {
    try {
      await authApi.login(credentials);
      this.isLoggedIn = true;
      this.notifyListeners();
    } catch (error) {
      this.isLoggedIn = false;
      this.notifyListeners();
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

  // Logout
  async logout(): Promise<void> {
    try {
      await authApi.logout();
      this.isLoggedIn = false;
      this.notifyListeners();
    } catch (error) {
      // Even if logout fails on server, clear auth state locally
      this.isLoggedIn = false;
      this.notifyListeners();
      throw error;
    }
  }

  // Check auth status on init or after page refresh
  async checkAuthStatus(): Promise<boolean> {
    try {
      const isAuthenticated = await authApi.isAuthenticated();
      this.isLoggedIn = isAuthenticated;
      this.notifyListeners();
      return isAuthenticated;
    } catch (error) {
      this.isLoggedIn = false;
      this.notifyListeners();
      return false;
    }
  }

  // Subscribe to auth state changes
  subscribeToAuth(listener: () => void): () => void {
    this.authListeners.add(listener);
    return () => {
      this.authListeners.delete(listener);
    };
  }

  // Notify all listeners of state change
  private notifyListeners(): void {
    this.authListeners.forEach(listener => listener());
  }
}

// Export singleton instance
export const authManager = new AuthManager(); 