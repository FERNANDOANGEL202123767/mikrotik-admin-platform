// frontend/src/layouts/MainLayout.jsx (partial)
import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Layout, Spin } from 'antd';
import { useAuth } from '../contexts/AuthContext';

const { Content } = Layout;

function MainLayout() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log(`[${new Date().toISOString()}] MainLayout: checking auth status`, { isAuthenticated, user });
    if (!isAuthenticated && !localStorage.getItem('token')) {
      console.log(`[${new Date().toISOString()}] No authentication, redirecting to login`);
      navigate('/login');
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user, navigate]);

  if (loading) {
    return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }} />;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '24px' }}>
        <Outlet />
      </Content>
    </Layout>
  );
}

export default MainLayout;