// backend/src/services/mikrotikService.js
const RouterOSAPI = require('node-routeros').RouterOSAPI;
const mikrotikConfig = require('../config/mikrotik');

class MikrotikService {
  // backend/src/services/mikrotikService.js
async connectToMikrotik(router) {
  const { ip, user, password } = router;
  console.log(`[${new Date().toISOString()}] Attempting to connect to ${ip}:8728 with user ${user}`);
  const connection = new RouterOSAPI({
    host: ip,
    port: 8728,
    user,
    password,
  });
  try {
    await connection.connect();
    console.log(`[${new Date().toISOString()}] Successfully connected to ${ip}`);
    return connection;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Failed to connect to ${ip}:`, error.message);
    throw new Error(`Connection failed to ${ip}: ${error.message}`);
  }
}

  async getSystemResource(routerId) {
    const router = mikrotikConfig.find((r) => r.id === routerId);
    if (!router) throw new Error('Router not found');

    const connection = await this.connectToMikrotik(router);
    try {
      const response = await connection.write('/system/resource/print');
      console.log(`[${new Date().toISOString()}] System resource for ${routerId}:`, response[0]);
      await connection.close();
      return response[0];
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Failed to fetch system resource for ${routerId}:`, error.message);
      await connection.close();
      throw error;
    }
  }

  async getBandwidth(routerId) {
    const router = mikrotikConfig.find((r) => r.id === routerId);
    if (!router) throw new Error('Router not found');

    const connection = await this.connectToMikrotik(router);
    try {
      const response = await connection.write('/interface/monitor-traffic', ['=interface=ether1', '=once']);
      console.log(`[${new Date().toISOString()}] Bandwidth data for ${routerId}:`, response[0]);
      await connection.close();
      return response[0];
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error fetching bandwidth for ${routerId}:`, error.message);
      await connection.close();
      throw error;
    }
  }

  async getConnectedDevices(routerId) {
    const router = mikrotikConfig.find((r) => r.id === routerId);
    if (!router) throw new Error('Router not found');

    const connection = await this.connectToMikrotik(router);
    try {
      const response = await connection.write('/ip/dhcp-server/lease/print');
      console.log(`[${new Date().toISOString()}] Connected devices for ${routerId}:`, response);
      await connection.close();
      return response;
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error fetching connected devices for ${routerId}:`, error.message);
      await connection.close();
      throw error;
    }
  }

  async getSystemInfo(routerId) {
    const router = mikrotikConfig.find((r) => r.id === routerId);
    if (!router) throw new Error('Router not found');

    const connection = await this.connectToMikrotik(router);
    try {
      const [resource, identity] = await Promise.all([
        connection.write('/system/resource/print'),
        connection.write('/system/identity/print'),
      ]);
      console.log(`[${new Date().toISOString()}] System info for ${routerId}:`, { resource: resource[0], identity: identity[0] });
      await connection.close();
      return {
        ...resource[0],
        identity: identity[0]?.name || 'N/A',
        online: true,
      };
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error fetching system info for ${routerId}:`, error.message);
      await connection.close();
      throw error;
    }
  }

  async getInterfaces(routerId) {
    const router = mikrotikConfig.find((r) => r.id === routerId);
    if (!router) throw new Error('Router not found');

    const connection = await this.connectToMikrotik(router);
    try {
      const response = await connection.write('/interface/print');
      console.log(`[${new Date().toISOString()}] Interfaces for ${routerId}:`, response);
      await connection.close();
      return response;
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error fetching interfaces for ${routerId}:`, error.message);
      await connection.close();
      throw error;
    }
  }

  async executeCommand(routerId, command) {
    const router = mikrotikConfig.find((r) => r.id === routerId);
    if (!router) throw new Error('Router not found');

    const connection = await this.connectToMikrotik(router);
    try {
      const response = await connection.write(command);
      console.log(`[${new Date().toISOString()}] Command execution result for ${routerId}:`, response);
      await connection.close();
      return response;
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error executing command for ${routerId}:`, error.message);
      await connection.close();
      throw error;
    }
  }
}

module.exports = new MikrotikService();