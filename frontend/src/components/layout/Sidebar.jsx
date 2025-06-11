import { Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../utils/colors';
import {
  DashboardOutlined,
  LineChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  FileTextOutlined,
} from '@ant-design/icons';

function Sidebar() {
  const { logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { key: '/', icon: <DashboardOutlined />, label: <Link to="/">Dashboard</Link> },
    { key: '/monitoring', icon: <LineChartOutlined />, label: <Link to="/monitoring">Monitoring</Link> },
    { key: '/reports', icon: <FileTextOutlined />, label: <Link to="/reports">Reports</Link> },
    { key: '/settings', icon: <SettingOutlined />, label: <Link to="/settings">Settings</Link> },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', onClick: logout },
  ];

  return <Menu theme="dark" mode="inline" selectedKeys={[location.pathname]} items={menuItems} style={{ backgroundColor: colors.primary }} />;
}

export default Sidebar;