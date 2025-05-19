import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { authManager } from './authManager';

type NetworkListener = () => void;

class NetworkManager {
  private onlineListeners: Set<NetworkListener> = new Set();
  private offlineListeners: Set<NetworkListener> = new Set();
  private apiClient: AxiosInstance;
  
  constructor() {
    // Initialize network status listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }

    // Initialize API client
    this.apiClient = this.createApiClient();
    this.setupInterceptors();
  }

  // Create configured Axios instance
  private createApiClient(): AxiosInstance {
    const API_URL = 'http://127.0.0.1:8000';
    
    return axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Important for handling cookies with JWT
    });
  }

  // Setup request and response interceptors
  private setupInterceptors(): void {
    // Request interceptor
    this.apiClient.interceptors.request.use(
      (config) => {
        // You can add token from localStorage/cookies here if needed
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.apiClient.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        // Handle 401 Unauthorized errors (e.g., redirect to login)
        if (error.response && error.response.status === 401) {
          // Clear auth state
          authManager.logout().catch(console.error);
          
          // Redirect to login page
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Get the configured API client
  getApiClient(): AxiosInstance {
    return this.apiClient;
  }

  // Make a GET request
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.apiClient.get<T>(url, config);
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  // Make a POST request
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.apiClient.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  // Make a PUT request
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.apiClient.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  // Make a DELETE request
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.apiClient.delete<T>(url, config);
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  // Standard error handling
  private handleError(error: AxiosError): void {
    if (!error.response) {
      // Network error (offline, timeout, etc.)
      console.error('Network error:', error.message);
    } else {
      // HTTP error
      console.error(`HTTP error ${error.response.status}:`, error.response.data);
    }
  }

  // Check if currently online
  isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  // Register online event listener
  onOnline(listener: NetworkListener): () => void {
    this.onlineListeners.add(listener);
    return () => {
      this.onlineListeners.delete(listener);
    };
  }

  // Register offline event listener
  onOffline(listener: NetworkListener): () => void {
    this.offlineListeners.add(listener);
    return () => {
      this.offlineListeners.delete(listener);
    };
  }

  // Handle online event
  private handleOnline = (): void => {
    console.log('Network: Online');
    this.onlineListeners.forEach(listener => {
      try {
        listener();
      } catch (error) {
        console.error('Error in online listener:', error);
      }
    });
  };

  // Handle offline event
  private handleOffline = (): void => {
    console.log('Network: Offline');
    this.offlineListeners.forEach(listener => {
      try {
        listener();
      } catch (error) {
        console.error('Error in offline listener:', error);
      }
    });
  };

  // Clean up event listeners
  cleanup(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
    this.onlineListeners.clear();
    this.offlineListeners.clear();
  }
}

// Export singleton instance
export const networkManager = new NetworkManager(); 