import { networkManager } from '../managers/networkManager';

interface LoginCredentials {
  username: string;  // FastAPI expects 'username', even though we're using email
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

// Simple function to clear auth state (no localStorage usage)
const clearAuthState = () => {
  if (typeof window !== 'undefined') {
    // Clear from API headers just in case
    const apiClient = networkManager.getApiClient();
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    // FastAPI expects form data for login
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    try {
      console.log('Auth API: Sending login request with form data');
      
      // Clear any existing auth state
      clearAuthState();
      
      const apiClient = networkManager.getApiClient();
      const response = await apiClient.post('/api/v1/auth/jwt/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        withCredentials: true, // Critical for HTTP-only cookies
      });
      
      console.log('Auth API: Login response status:', response.status);
      
      // For FastAPI with HTTP-only cookies, we verify authentication by making a test request
      if (response.status === 204 || response.status === 200) {
        // Add a small delay before verification to allow cookies to be set
        await new Promise(resolve => setTimeout(resolve, 300)); // Increased delay for reliability
        
        try {
          // Verify authentication with protected endpoint
          const userResponse = await networkManager.getApiClient().get('/api/v1/users/me', {
            withCredentials: true
          });
          
          // If this succeeds, we're authenticated via HTTP-only cookies
          if (userResponse.data) {
            console.log('Auth API: Authenticated via FastAPI HTTP-only cookies, user verified');
            return { success: true, user: userResponse.data };
          }
        } catch (error) {
          console.error('Auth API: Authentication verification failed', error);
          throw new Error('Login succeeded but authentication verification failed');
        }
      }
      
      // If we reach here, something went wrong with the login
      throw new Error('Login response did not contain expected authentication data');
    } catch (error) {
      console.error('Login API error:', error);
      throw error;
    }
  },

  register: async (data: RegisterData) => {
    try {
      const response = await networkManager.getApiClient().post('/api/v1/auth/register', data, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Register API error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      // This will clear FastAPI's HTTP-only cookies
      const response = await networkManager.getApiClient().post('/api/v1/auth/jwt/logout', {}, {
        withCredentials: true
      });
      // No need to clear localStorage, just make sure header is clean
      clearAuthState();
      return response.data;
    } catch (error) {
      console.error('Logout API error:', error);
      clearAuthState();
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      console.log('Auth API: Fetching current user');
      
      // Always use withCredentials to send HTTP-only cookies
      const response = await networkManager.getApiClient().get('/api/v1/users/me', { 
        withCredentials: true 
      });
      
      console.log('Auth API: User fetched successfully');
      return response.data;
    } catch (error) {
      console.error('Get current user API error:', error);
      throw error;
    }
  },

  // Check authentication by making an actual API call
  isAuthenticated: async () => {
    try {
      const user = await authApi.getCurrentUser();
      return !!user;
    } catch (error) {
      return false;
    }
  }
}; 
