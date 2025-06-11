import api from './api';

const MikrotikService = {
  getSystemInfo: async (routerId) => {
    const response = await api.get(`/routers/${routerId}/system`);
    return response.data;
  },

  getInterfaces: async (routerId) => {
    const response = await api.get(`/routers/${routerId}/interfaces`);
    return response.data;
  },

  getConnectedDevices: async (routerId) => {
    const response = await api.get(`/routers/${routerId}/devices`);
    return response.data;
  },

  executeCommand: async (routerId, command) => {
    const response = await api.post(`/routers/${routerId}/execute`, { command });
    return response.data;
  },
};

export default MikrotikService;