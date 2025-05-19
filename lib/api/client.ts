import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';
const TOKEN_KEY = 'fortieval_auth_token';

// Helper to get the token
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Still keep this for cookie auth as fallback
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Ensure withCredentials is always set
    config.withCredentials = true;
    
    // Add token to Authorization header if available
    const token = getAuthToken();
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('Added token to request headers');
    }
    
    // Log request details for debugging
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      withCredentials: config.withCredentials,
      hasAuthHeader: token ? true : false
    });
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses
    console.log(`API Response: ${response.status}`, {
      url: response.config.url,
      data: response.data ? 'Has data' : 'No data'
    });
    
    return response;
  },
  (error) => {
    // Log error responses
    console.error(`API Error: ${error.response?.status || 'No response'}`, {
      url: error.config?.url,
      message: error.message,
      responseData: error.response?.data
    });
    
    // Handle 401 Unauthorized errors (e.g., redirect to login)
    if (error.response && error.response.status === 401) {
      // Only redirect to login if we're not already on the login page
      // This prevents redirect loops
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/logout') {
        console.log('Unauthorized access detected, redirecting to login');
        // Clear any stored token since it's invalid
        if (typeof window !== 'undefined') {
          localStorage.removeItem(TOKEN_KEY);
        }
        // Redirect to login page
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
); 