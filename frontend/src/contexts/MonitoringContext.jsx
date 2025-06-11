// frontend/src/contexts/MonitoringContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { getSocket } from '../services/socketService';

const MonitoringContext = createContext();

export function MonitoringProvider({ children }) {
  const [routers, setRouters] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = getSocket() || null;
  const navigate = useNavigate();

  const fetchRouters = async () => {
    try {
      console.log(`[${new Date().toISOString()}] Fetching routers from API`);
      const response = await api.get('/routers');
      console.log(`[${new Date().toISOString()}] Fetched routers:`, response.data);
      setRouters(response.data.map((router) => ({
        ...router,
        name: router.id.toUpperCase(),
        data: [],
        online: false,
        cpu: 0,
        memory: 0,
        uptime: '0s',
        connectedDevices: [],
      })));
      setLoading(false);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error fetching routers:`, error.message);
      toast.error('Failed to fetch routers');
      setRouters([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRouters();
  }, []);

  useEffect(() => {
    if (!socket) {
      console.warn(`[${new Date().toISOString()}] Socket.IO not initialized`);
      return;
    }

    console.log(`[${new Date().toISOString()}] Socket.IO connected`);

    socket.on('monitoringData', (data) => {
      console.log(`[${new Date().toISOString()}] Received monitoringData:`, data);
      setRouters((prevRouters) =>
        prevRouters.map((router) => {
          if (data[router.id]) {
            return {
              ...router,
              online: data[router.id].online,
              cpu: data[router.id].cpu || 0,
              memory: data[router.id].memory || 0,
              uptime: data[router.id].uptime || '0s',
              connectedDevices: data[router.id].connectedDevices || [],
              data: [...(router.data || []), data[router.id]].slice(-50),
            };
          }
          return router;
        })
      );
    });

    socket.on('alert', (alert) => {
      console.log(`[${new Date().toISOString()}] Received alert:`, alert);
      toast.info(`Alert: ${alert.message}`);
    });

    socket.on('connect_error', (error) => {
      console.error(`[${new Date().toISOString()}] Socket.IO connect_error:`, error.message);
      toast.error('Connection to monitoring server failed');
      if (error.message.includes('Authentication error')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    });

    return () => {
      socket.off('monitoringData');
      socket.off('alert');
      socket.off('connect_error');
    };
  }, [socket, navigate]);

  useEffect(() => {
    console.log(`[${new Date().toISOString()}] Updated routers state:`, routers);
  }, [routers]);

  return (
    <MonitoringContext.Provider value={{ routers, loading, socket }}>
      {children}
    </MonitoringContext.Provider>
  );
}

export const useMonitoring = () => useContext(MonitoringContext);