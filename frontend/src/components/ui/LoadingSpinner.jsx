import { Spin } from 'antd';
import { colors } from '../../utils/colors';

function LoadingSpinner() {
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <Spin size="large" style={{ color: colors.primary }} />
    </div>
  );
}

export default LoadingSpinner;