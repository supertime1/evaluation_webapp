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

    const response = await apiClient.post('/api/v1/auth/jwt/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    return response.data;
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