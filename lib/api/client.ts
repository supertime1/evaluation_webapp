import axios from 'axios';

// Create Axios instance with defaults
export const apiClient = axios.create({
  // Always use the actual backend
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies
});

// Add a request interceptor for auth
apiClient.interceptors.request.use(
  (config) => {
    // Any request configuration can be added here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses
    console.log(`API Response: ${response.status}`, {
      url: response.config.url,
      data: response.data ? 'Has data' : 'No data'
    });
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Redirect to login if unauthorized
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      
      return Promise.reject(error);
    }
    
    // Handle 400 Bad Request errors (validation errors, business logic violations)
    if (error.response?.status === 400) {
      const errorDetail = error.response?.data?.detail;
      
      // Check for dataset deletion with associated runs
      if (typeof errorDetail === 'string' && errorDetail.includes('runs that depend on this dataset')) {
        error.message = errorDetail; // Use the backend's descriptive message
      } else if (typeof errorDetail === 'string') {
        error.message = errorDetail;
      } else {
        error.message = 'Bad request. Please check your input and try again.';
      }
    }
    
    // Handle 500 Internal Server Errors with better messages
    if (error.response?.status === 500) {
      const errorDetail = error.response?.data?.detail;
      
      // Check for specific constraint violations
      if (typeof errorDetail === 'string' && errorDetail.includes('IntegrityError')) {
        if (errorDetail.includes('NotNullViolationError') && errorDetail.includes('dataset_version_id')) {
          error.message = 'Cannot delete dataset: There are experiment runs that depend on this dataset. Please delete the associated experiment runs first.';
        } else if (errorDetail.includes('ForeignKeyViolationError')) {
          error.message = 'Cannot delete: This item is referenced by other records. Please delete the dependent records first.';
        } else {
          error.message = 'Database constraint violation. This operation cannot be completed due to data dependencies.';
        }
      } else {
        error.message = 'Internal server error. Please try again or contact support.';
      }
    }
    
    // Handle network errors
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      error.message = 'Network error. Please check your connection and ensure the backend server is running.';
    }
    
    // Handle other errors
    return Promise.reject(error);
  }
); 