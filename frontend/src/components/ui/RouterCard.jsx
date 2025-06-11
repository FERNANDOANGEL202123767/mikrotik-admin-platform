// frontend/src/components/ui/RouterCard.jsx
import { Card, Tag } from 'antd';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { colors } from '../../utils/colors';
import StatusBadge from './StatusBadge';
import { formatUptime } from '../../utils/formatters';

function RouterCard({ router }) {
  // Get the latest data record, if available
  const latestData = router.data && router.data.length > 0 ? router.data[router.data.length - 1] : {};

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        title={router.name || router.id.toUpperCase()}
        style={{ backgroundColor: colors.primary, color: colors.light }}
        hoverable
      >
        <p>
          Status: <StatusBadge status={router.online} />
        </p>
        <p>
          CPU Load:{' '}
          <Tag color={latestData.cpu > 80 ? 'red' : colors.accent}>
            {latestData.cpu || 0}%
          </Tag>
        </p>
        <p>
          Memory:{' '}
          <Tag color={latestData.memory > 85 ? 'red' : colors.accent}>
            {(latestData.memory || 0).toFixed(2)}%
          </Tag>
        </p>
        <p>
          Uptime:{' '}
          <Tag color={colors.accent}>{formatUptime(latestData.uptime || '0s')}</Tag>
        </p>
        <p>
          Connected Devices:{' '}
          <Tag color={colors.accent}>{(latestData.connectedDevices || []).length || 0}</Tag>
        </p>
        <Link to={`/router/${router.id}`} style={{ color: colors.light }}>
          View Details
        </Link>
      </Card>
    </motion.div>
  );
}

export default RouterCard;