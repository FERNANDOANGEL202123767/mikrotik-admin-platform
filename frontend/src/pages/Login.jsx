// frontend/src/pages/Login.jsx
import { useState } from 'react';
import { Form, Input, Button, Card } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../utils/colors';
import { connectSocket } from '../services/socketService';
import { toast } from 'react-toastify';

function Login() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

    
  // frontend/src/pages/Login.jsx
const onFinish = async (values) => {
  setLoading(true);
  try {
    console.log(`[${new Date().toISOString()}] Login attempt with username:`, values.username);
    const response = await login(values);
    console.log(`[${new Date().toISOString()}] Login response:`, response);
    connectSocket(response.token); // Use response.token directly
    toast.success('Login successful');
  } catch (error) {
    toast.error(error || 'Login failed');
    console.error(`[${new Date().toISOString()}] Login error:`, error);
  } finally {
    setLoading(false);
  }
};

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: colors.primary,
      }}
    >
      <Card
        title="Login"
        style={{ width: 400, backgroundColor: colors.secondary, color: colors.light }}
      >
        <Form name="login" onFinish={onFinish}>
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Username" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ width: '100%', backgroundColor: colors.accent, borderColor: colors.accent }}
            >
              Log In
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </motion.div>
  );
}

export default Login;