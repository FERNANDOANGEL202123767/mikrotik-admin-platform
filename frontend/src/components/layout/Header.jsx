import { Layout, Typography } from 'antd';
import { colors } from '../../utils/colors';

const { Header } = Layout;
const { Title } = Typography;

function AppHeader() {
  return (
    <Header
      style={{
        backgroundColor: colors.secondary,
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Title level={3} style={{ color: colors.light, margin: 0 }}>
        MikroTik Admin Platform
      </Title>
    </Header>
  );
}

export default AppHeader;