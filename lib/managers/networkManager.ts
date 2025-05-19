import axios, { AxiosInstance } from 'axios';

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
  }

  // Create configured Axios instance
  private createApiClient(): AxiosInstance {
    const API_URL = 'http://127.0.0.1:8000';
    
    return axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Enable HTTP-only cookies for all requests by default
    });
  }

  // Get the configured API client
  getApiClient(): AxiosInstance {
    return this.apiClient;
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