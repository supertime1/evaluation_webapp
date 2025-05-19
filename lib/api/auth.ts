import { apiClient } from './client';

interface LoginCredentials {
  username: string;  // FastAPI expects 'username', even though we're using email
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

// Token storage helpers
const TOKEN_KEY = 'fortieval_auth_token';

const setToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

const clearToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
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
      
      const response = await apiClient.post('/api/v1/auth/jwt/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        withCredentials: true,
      });
      
      console.log('Auth API: Login response status:', response.status);
      
      // Try to extract token from response - this depends on your FastAPI setup
      // Some implementations return the token directly in the response
      if (response.data && response.data.access_token) {
        setToken(response.data.access_token);
        console.log('Auth API: Saved token from response data');
      }
      
      // For FastAPI-Users, we need to manually extract it from cookies
      const cookies = document.cookie.split(';');
      const tokenCookie = cookies.find(c => c.trim().startsWith('fastapiusersauth='));
      if (tokenCookie) {
        const token = tokenCookie.split('=')[1];
        setToken(token);
        console.log('Auth API: Saved token from cookies');
      }
      
      // For status 204, there's no response data, so return a success object
      // But we need to have a token to consider this successful
      if (response.status === 204) {
        // For FastAPI-Users, create a query to get the current user
        // This will force the creation of a new token if needed
        try {
          // Give the server a moment to process the login
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Try to get the current user, which should provide us with a token
          const userResponse = await apiClient.get('/api/v1/users/me', {
            withCredentials: true,
          });
          
          return { success: true, user: userResponse.data };
        } catch (error) {
          console.error('Failed to get user data after login', error);
          return { success: true }; // Still return success for the login itself
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('Login API error:', error);
      throw error;
    }
  },

  register: async (data: RegisterData) => {
    try {
      const response = await apiClient.post('/api/v1/auth/register', data);
      return response.data;
    } catch (error) {
      console.error('Register API error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      const response = await apiClient.post('/api/v1/auth/jwt/logout');
      clearToken(); // Clear token on logout
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
      
      // Create headers object with token
      const token = getToken();
      console.log('Auth API: Token available:', !!token);
      
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await apiClient.get('/api/v1/users/me', { 
        headers,
        withCredentials: true 
      });
      
      console.log('Auth API: User fetched successfully');
      return response.data;
    } catch (error) {
      console.error('Get current user API error:', error);
      throw error;
    }
  },

  // Helper to get authentication status
  isAuthenticated: () => {
    return !!getToken();
  },
  
  // Get the current token
  getToken
}; 