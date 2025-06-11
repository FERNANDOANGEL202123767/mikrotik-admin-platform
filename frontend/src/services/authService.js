// frontend/src/services/authService.js
import axios from 'axios';
import { connectSocket, disconnectSocket } from './socketService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const login = async (credentials) => {
  try {
    console.log(`[${new Date().toISOString()}] Attempting login with username:`, credentials.username);
    const response = await axios.post(`${API_URL}/auth/login`, {
      username: credentials.username,
      password: credentials.password,
    });
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    console.log(`[${new Date().toISOString()}] Login success, token stored`);
    connectSocket(token);
    return response.data;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Login error:`, error.response?.data || error.message);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    throw error.response?.data?.error || 'Login failed';
  }
};

export const logout = () => {
  console.log(`[${new Date().toISOString()}] Logging out`);
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  disconnectSocket();
};
