import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for handling cookies with JWT
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // You can add token from localStorage/cookies here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors (e.g., redirect to login)
    if (error.response && error.response.status === 401) {
      // Clear any stored tokens
      // Redirect to login page
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
); 