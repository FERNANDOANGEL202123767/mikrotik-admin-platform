import { Layout } from 'antd';
import { motion } from 'framer-motion';
import AppHeader from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { colors } from '../../utils/colors';

const { Content } = Layout;

function AppLayout({ children }) {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Sider 
      style={{ backgroundColor: colors.primary }}
      breakpoint="lg" 
      collapsedWidth="0">
        <div 
        style={{ 
          padding: '16px', 
          color: colors.light, 
          textAlign: 'center' }}>
          <h2>MikroTik Admin</h2>
        </div>
        <Sidebar />
      </Layout.Sider>
      <Layout>
        <AppHeader />
        <Content 
        style={{ 
          margin: '24px 16px', 
          backgroundColor: '#fff', 
          padding: 24, 
          borderRadius: 8, 
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)' }}>
          <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}>
            {children}
          </motion.div>
        </Content>
        <Footer />
      </Layout>
    </Layout>
  );
}
export default AppLayout;