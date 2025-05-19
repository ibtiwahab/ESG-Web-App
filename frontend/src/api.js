import axios from 'axios';

// Create an instance of axios with default configs
const API = axios.create({
  baseURL: 'http://localhost:5000/api', // Base URL for all requests
});

// Add a request interceptor to attach the authentication token to every request
API.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to request headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors (token expired or invalid)
    if (error.response && error.response.status === 401) {
      // You could redirect to login or refresh token here
      localStorage.removeItem('token');
      // Optional: window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default API;