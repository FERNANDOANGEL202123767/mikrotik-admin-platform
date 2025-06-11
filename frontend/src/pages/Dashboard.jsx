// frontend/src/pages/Dashboard.jsx
import { useMonitoring } from '../contexts/MonitoringContext';
import { Card, Row, Col, Empty, Spin } from 'antd';
import { motion } from 'framer-motion';
import RouterCard from '../components/ui/RouterCard';

function Dashboard() {
  const { routers, loading } = useMonitoring() || { routers: [], loading: true }; // Fallback for undefined context

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ padding: '24px' }}
    >
      <h1>Dashboard</h1>
      {loading ? (
        <Spin size="large" />
      ) : routers.length === 0 ? (
        <Empty description="No routers available" />
      ) : (
        <Row gutter={[16, 16]}>
          {routers.map((router) => (
            <Col xs={24} sm={12} lg={8} key={router.id}>
              <RouterCard router={router} />
            </Col>
          ))}
        </Row>
      )}
    </motion.div>
  );
}

export default Dashboard;