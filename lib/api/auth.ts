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

// Token storage helpers - simplified for HTTP-only cookies
const TOKEN_KEY = 'fortieval_auth_token';

// Simple token clearing function
const clearToken = () => {
  if (typeof window !== 'undefined') {
    // Clear from localStorage
    localStorage.removeItem(TOKEN_KEY);
    
    // Clear from API headers
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
      
      // Clear any existing tokens/markers that might interfere
      clearToken();
      
      const apiClient = networkManager.getApiClient();
      const response = await apiClient.post('/api/v1/auth/jwt/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        withCredentials: true, // Critical for cookies
      });
      
      console.log('Auth API: Login response status:', response.status);
      
      // For FastAPI with HTTP-only cookies, we don't have access to the actual token
      // So we need to verify that we're actually authenticated by making a test request
      if (response.status === 204 || response.status === 200) {
        try {
          // Try to verify authentication immediately
          const userResponse = await apiClient.get('/api/v1/users/me', {
            withCredentials: true,
          });
          
          // If this succeeds, we're authenticated via HTTP-only cookies
          if (userResponse.data) {
            console.log('Auth API: Authenticated via FastAPI cookies, user verified');
            // No need to set any markers - FastAPI's HTTP-only cookies handle auth
            return { success: true, user: userResponse.data };
          }
        } catch (error) {
          console.error('Auth API: Authentication verification failed', error);
          throw new Error('Login succeeded but authentication verification failed');
        }
      }
      
      // If we have access_token in the response, use it (fallback)
      if (response.data && response.data.access_token) {
        const token = response.data.access_token;
        // Only set in Authorization header, don't set cookies
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        localStorage.setItem(TOKEN_KEY, token);
        console.log('Auth API: Using explicit token from response');
        return { success: true };
      }
      
      // Should not reach here if auth was successful
      throw new Error('Login response did not contain expected authentication data');
    } catch (error) {
      console.error('Login API error:', error);
      throw error;
    }
  },

  register: async (data: RegisterData) => {
    try {
      const response = await networkManager.getApiClient().post('/api/v1/auth/register', data);
      return response.data;
    } catch (error) {
      console.error('Register API error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      // This should clear FastAPI's HTTP-only cookies
      const response = await networkManager.getApiClient().post('/api/v1/auth/jwt/logout', {}, {
        withCredentials: true
      });
      clearToken(); // Clear any local tokens as well
      return response.data;
    } catch (error) {
      console.error('Logout API error:', error);
      clearToken(); // Clear token even if API fails
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      console.log('Auth API: Fetching current user');
      
      // Always use withCredentials to send cookies
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
  },
  
  // Check synchronously (less reliable but needed in some cases)
  isAuthenticatedSync: () => {
    return localStorage.getItem(TOKEN_KEY) !== null;
  }
}; 
