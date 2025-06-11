import { Tag } from 'antd';
import { colors } from '../../utils/colors';

function StatusBadge({ status }) {
  return (
    <Tag color={status ? colors.highlight : 'red'}>
      {status ? 'Online' : 'Offline'}
    </Tag>
  );
}

export default StatusBadge;