// frontend/src/services/socketService.js
import { io } from 'socket.io-client';

const socketUrl = import.meta.env.VITE_SOCKET_URL || 'ws://localhost:3000';

let socket;

export const initializeSocket = () => {
  if (!socket) {
    console.log(`[${new Date().toISOString()}] Initializing Socket.IO client with URL: ${socketUrl}`);
    socket = io(socketUrl, {
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      transports: ['websocket', 'polling'],
      autoConnect: false,
      auth: {
        token: localStorage.getItem('token') || '',
      },
    });

    socket.on('connect', () => {
      console.log(`[${new Date().toISOString()}] Socket.IO connected`);
    });

    socket.on('disconnect', () => {
      console.log(`[${new Date().toISOString()}] Socket.IO disconnected`);
    });

    socket.on('connect_error', (error) => {
      console.error(`[${new Date().toISOString()}] Socket.IO connect_error:`, error.message);
    });
  }
  return socket;
};

export const connectSocket = (token) => {
  console.log(`[${new Date().toISOString()}] Attempting to connect Socket.IO with token: ${token}`);
  if (!socket) {
    initializeSocket();
  }
  socket.auth = { token };
  socket.connect();
};

export const getSocket = () => {
  if (!socket) {
    console.warn(`[${new Date().toISOString()}] Socket.IO not initialized in getSocket`);
    initializeSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    console.log(`[${new Date().toISOString()}] Disconnecting Socket.IO`);
    socket.disconnect();
    socket = null;
  }
};