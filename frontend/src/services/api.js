// frontend/src/services/api.js
import axios from 'axios';

// frontend/src/services/api.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log(`[${new Date().toISOString()}] Sending token:`, token);
    console.log(`[${new Date().toISOString()}] Request: ${config.method.toUpperCase()} ${config.url}`, token ? 'Token present' : 'No token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error(`[${new Date().toISOString()}] Request error:`, error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`[${new Date().toISOString()}] Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`[${new Date().toISOString()}] Response error: ${error.response?.status || 'N/A'}`, error.response?.data || error.message);
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      console.log(`[${new Date().toISOString()}] Unauthorized, clearing token and redirecting to login`);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;