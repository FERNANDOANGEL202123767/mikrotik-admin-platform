const RouterOSAPI = require('node-routeros').RouterOSAPI;

class MikrotikApi {
  constructor(ip, user, password) {
    this.conn = new RouterOSAPI({
      host: ip,
      user,
      password,
      port: 8728,
    });
  }

  async connect() {
    console.log(`[${new Date().toISOString()}] Attempting to connect to ${this.conn.config.host}:8728 with user ${this.conn.config.user}`);
    await this.conn.connect();
    console.log(`[${new Date().toISOString()}] Successfully connected to ${this.conn.config.host}`);
  }

  async getSystemResource() {
    const response = await this.conn.write('/system/resource/print');
    return response[0];
  }

  async getInterfaceStats() {
    const response = await this.conn.write('/interface/monitor-traffic', ['=interface=ether1', '=once']);
    return response[0];
  }

  async getDhcpLeases() {
    const response = await this.conn.write('/ip/dhcp-server/lease/print');
    return response;
  }

  async close() {
    await this.conn.close();
  }
}

module.exports = MikrotikApi;