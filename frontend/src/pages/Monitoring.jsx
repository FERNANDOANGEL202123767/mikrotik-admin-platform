// frontend/src/pages/Monitoring.jsx
import { useEffect, useState } from 'react';
import { Card, Row, Col, Empty, Spin } from 'antd'; // Add Empty import
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useMonitoring } from '../contexts/MonitoringContext';
import CPUChart from '../components/charts/CPUChart';
import RAMChart from '../components/charts/RAMChart';
import BandwidthChart from '../components/charts/BandwidthChart';
import ComparisonChart from '../components/charts/ComparisonChart';

function Monitoring() {
  const { routers, socket } = useMonitoring();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!socket) {
      toast.error('Disconnected from monitoring server');
    }
    setLoading(false);
  }, [socket]);

  const comparisonData = {
    mikrotik1: routers.find((r) => r.id === 'mikrotik1')?.data || [],
    mikrotik2: routers.find((r) => r.id === 'mikrotik2')?.data || [],
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ padding: '24px' }}
    >
      <h1>Monitoring</h1>
      {loading ? (
        <Spin size="large" />
      ) : routers.length === 0 ? (
        <Empty description="No routers available for monitoring" />
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {routers.map((router) => (
              <Col xs={24} lg={12} key={router.id}>
                <Card
                  title={`${router.name} Metrics`}
                  extra={<span>{router.online ? 'Online' : 'Offline'}</span>}
                >
                  <Row gutter={[16, 16]}>
                    <Col xs={24}>
                      {router.data?.length > 0 ? (
                        <CPUChart data={router.data} routerId={router.id} />
                      ) : (
                        <Empty description="No CPU data available" />
                      )}
                    </Col>
                    <Col xs={24}>
                      {router.data?.length > 0 ? (
                        <RAMChart data={router.data} routerId={router.id} />
                      ) : (
                        <Empty description="No RAM data available" />
                      )}
                    </Col>
                    <Col xs={24}>
                      {router.data?.length > 0 ? (
                        <BandwidthChart data={router.data} routerId={router.id} />
                      ) : (
                        <Empty description="No bandwidth data available" />
                      )}
                    </Col>
                  </Row>
                </Card>
              </Col>
            ))}
          </Row>
          <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
            <Col xs={24}>
              <Card title="Router Comparison (CPU Usage)">
                {(comparisonData.mikrotik1.length > 0 || comparisonData.mikrotik2.length > 0) ? (
                  <ComparisonChart data={comparisonData} metric="cpu" />
                ) : (
                  <Empty description="No comparison data available" />
                )}
              </Card>
            </Col>
          </Row>
        </>
      )}
    </motion.div>
  );
}

export default Monitoring;