import { Layout } from 'antd';
import { colors } from '../../utils/colors';

const { Footer } = Layout;

function AppFooter() {
  return (
    <Footer
      style={{
        textAlign: 'center',
        backgroundColor: colors.secondary,
        color: colors.light,
      }}
    >
      MikroTik Admin Platform ©2025
    </Footer>
  );
}

export default AppFooter;