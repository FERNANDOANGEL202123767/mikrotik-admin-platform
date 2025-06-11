// frontend/src/hooks/useSocket.js
import { useEffect, useState } from 'react';
import socket, { connectSocket, disconnectSocket } from '../services/socketService';

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      connectSocket(token);
    }

    const onConnect = () => {
      console.log(`[${new Date().toISOString()}] Socket.IO client connected successfully`);
      setIsConnected(true);
    };

    const onDisconnect = () => {
      console.log(`[${new Date().toISOString()}] Socket.IO client disconnected`);
      setIsConnected(false);
    };

    const onConnectError = (error) => {
      console.error(`[${new Date().toISOString()}] Socket.IO connect error:`, error.message);
      setIsConnected(false);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      disconnectSocket();
    };
  }, []);

  return isConnected ? socket : null;
};