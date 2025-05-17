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

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    // FastAPI expects form data for login
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    try {
      const response = await apiClient.post('/api/v1/auth/jwt/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        validateStatus: (status) => {
          // Consider both 200 and 204 as successful status codes
          return (status >= 200 && status < 300) || status === 204;
        },
      });
      
      // For status 204, there's no response data, so return a success object
      if (response.status === 204) {
        return { success: true };
      }
      
      return response.data;
    } catch (error) {
      console.error('Login API error:', error);
      throw error;
    }
  },

  register: async (data: RegisterData) => {
    const response = await apiClient.post('/api/v1/auth/register', data);
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post('/api/v1/auth/jwt/logout');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/api/v1/users/me');
    return response.data;
  },
}; 