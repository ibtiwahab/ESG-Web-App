// Enhanced AuthContext.jsx with robust token handling
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Create an axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5000', // Set your backend server URL and port here
});

// Utility function to get the token from localStorage or sessionStorage
export const getToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('authToken');
};

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Setup axios interceptors to always include current token
  useEffect(() => {
    const interceptor = api.interceptors.request.use(
      config => {
        const token = getToken();
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );

    // Clean up interceptor on unmount
    return () => {
      api.interceptors.request.eject(interceptor);
    };
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Try to get token from either localStorage or sessionStorage
        const token = getToken();
        
        if (!token) {
          setLoading(false);
          return;
        }
        
        // Check if token is expired
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp < currentTime) {
          // Token expired
          logout();
          return;
        }
        
        // Set auth token header
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Get user data from token and stored user info
        const userRole = localStorage.getItem('userRole') || decoded.role || 'investor';
        const userData = {
          _id: decoded.id || decoded.sub, // Handle different JWT formats
          name: decoded.name || localStorage.getItem('userName') || 'User',
          email: decoded.email || localStorage.getItem('userEmail'),
          role: userRole,
          token: token, // Include token in user object for components that need it
          ...decoded
        };
        
        // Store token in session storage as backup
        sessionStorage.setItem('authToken', token);
        
        setUser(userData);
      } catch (err) {
        console.error('Token error:', err);
        cleanupAuth();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Helper to clean up all auth data
  const cleanupAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    sessionStorage.removeItem('authToken');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      const res = await api.post('/api/auth/register', userData);
      
      if (res.data.token) {
        const token = res.data.token;
        localStorage.setItem('token', token);
        localStorage.setItem('userRole', res.data.role || 'investor');
        if (res.data.name) localStorage.setItem('userName', res.data.name);
        if (res.data.email) localStorage.setItem('userEmail', res.data.email);
        
        // Store token in session storage as backup
        sessionStorage.setItem('authToken', token);
        
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Ensure token is included in user object
        const userWithToken = {
          ...res.data,
          token: token
        };
        
        setUser(userWithToken);
        toast.success('Registration successful!');
        
        return true;
      }
    } catch (err) {
      console.error('Registration error:', err);
      toast.error(err.response?.data?.message || 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (userData) => {
    try {
      setLoading(true);
      const res = await api.post('/api/auth/login', userData);
      
      if (res.data.token) {
        const token = res.data.token;
        localStorage.setItem('token', token);
        localStorage.setItem('userRole', res.data.role || 'investor');
        if (res.data.name) localStorage.setItem('userName', res.data.name);
        if (res.data.email) localStorage.setItem('userEmail', res.data.email);
        
        // Store token in session storage as backup
        sessionStorage.setItem('authToken', token);
        
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Ensure token is included in user object
        const userWithToken = {
          ...res.data,
          token: token
        };
        
        setUser(userWithToken);
        toast.success('Login successful!');
        
        return true;
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error(err.response?.data?.message || 'Invalid credentials');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    cleanupAuth();
    navigate('/login');
    toast.info('You have been logged out');
  };

  // Get axios instance with current auth headers
  const getAuthAxios = () => {
    const token = getToken();
    return axios.create({
      baseURL: 'http://localhost:5000',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    });
  };

  // Check if user has admin privileges
  const hasAdminPrivileges = (userObj = user) => {
    if (!userObj) return false;
    
    return (
      // Check for roles array
      (Array.isArray(userObj.roles) && 
        (userObj.roles.includes('admin') || userObj.roles.includes('superadmin'))) ||
      // Check for single role property
      (userObj.role === 'admin' || userObj.role === 'superadmin') ||
      // Check for role within user.auth object
      (userObj.auth && userObj.auth.role && 
        (userObj.auth.role === 'admin' || userObj.auth.role === 'superadmin')) ||
      // Check for isAdmin flag
      (userObj.isAdmin === true) ||
      // Check for admin flag
      (userObj.admin === true) ||
      // Check for type field
      (userObj.type === 'admin' || userObj.type === 'superadmin')
    );
  };

  // Manual token setting for troubleshooting
  const setManualToken = (token) => {
    if (!token) return false;
    
    try {
      // Validate the token format (basic check)
      const decoded = jwtDecode(token);
      
      // Store the token
      localStorage.setItem('token', token);
      sessionStorage.setItem('authToken', token);
      
      // Update headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Create user object from token
      const userData = {
        _id: decoded.id || decoded.sub,
        name: decoded.name || 'User',
        email: decoded.email,
        role: decoded.role || 'admin', // Assume admin for manual tokens
        token: token,
        ...decoded
      };
      
      setUser(userData);
      return true;
    } catch (err) {
      console.error('Invalid token format:', err);
      toast.error('Invalid token format');
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        getAuthAxios,
        hasAdminPrivileges,
        setManualToken,
        isAuthenticated: !!user,
        api
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;