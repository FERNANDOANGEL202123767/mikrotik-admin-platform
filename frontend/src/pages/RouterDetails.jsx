// frontend/src/pages/RouterDetails.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Row, Col, Card, Descriptions, Spin, Alert, Button, message } from 'antd';
import api from '../services/api';

function RouterDetails() {
  const { routerId } = useParams();
  const [router, setRouter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const executeCommand = async (command) => {
    try {
      const response = await api.post(`/routers/${routerId}/command`, { command });
      message.success('Command executed successfully');
      console.log(`[${new Date().toISOString()}] Command response:`, response.data);
    } catch (err) {
      message.error('Failed to execute command');
      console.error(`[${new Date().toISOString()}] Error executing command:`, err);
    }
  };

  useEffect(() => {
    const fetchRouter = async () => {
      try {
        console.log(`[${new Date().toISOString()}] Fetching router details for ${routerId}`);
        const response = await api.get(`/routers/${routerId}/system`);
        console.log(`[${new Date().toISOString()}] Router details:`, response.data);
        setRouter(response.data);
        setLoading(false);
      } catch (err) {
        console.error(`[${new Date().toISOString()}] Error fetching router details:`, err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchRouter();
    const interval = setInterval(fetchRouter, 30000);
    return () => clearInterval(interval);
  }, [routerId]);

  if (loading) return <Spin tip="Loading router details..." />;
  if (error) return <Alert message="Error" description={error} type="error" showIcon />;

  return (
    <Row gutter={[16, 16]} style={{ padding: '24px' }}>
      <Col span={24}>
        <Card title={`Router Details: ${routerId}`}>
          <Descriptions bordered>
            <Descriptions.Item label="Online">{router.online ? 'Yes' : 'No'}</Descriptions.Item>
            <Descriptions.Item label="CPU Load">{router['cpu-load'] || 0}%</Descriptions.Item>
            <Descriptions.Item label="Memory Usage">{(router.memory || 0).toFixed(2)}%</Descriptions.Item>
            <Descriptions.Item label="Uptime">{router.uptime || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Free Memory">{(router['free-memory'] / 1024 / 1024).toFixed(2)} MB</Descriptions.Item>
            <Descriptions.Item label="Total Memory">{(router['total-memory'] / 1024 / 1024).toFixed(2)} MB</Descriptions.Item>
            <Descriptions.Item label="Identity">{router.identity || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Version">{router.version || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Connected Devices">{(router.connectedDevices || []).length}</Descriptions.Item>
          </Descriptions>
          <Button
            type="primary"
            onClick={() => executeCommand('/system/reboot')}
            style={{ marginTop: 16 }}
          >
            Reboot Router
          </Button>
        </Card>
      </Col>
    </Row>
  );
}

export default RouterDetails;