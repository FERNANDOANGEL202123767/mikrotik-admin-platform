// frontend/src/components/charts/BandwidthChart.jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { colors } from '../../utils/colors';
import { formatBitsPerSecond } from '../../utils/formatters';
import dayjs from 'dayjs';

function BandwidthChart({ data, routerId }) {
  return (
    <LineChart
      width={600}
      height={300}
      data={data}
      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
    >
      <CartesianGrid strokeDasharray="3 3" stroke={colors.complement} />
      <XAxis
        dataKey="timestamp"
        tickFormatter={(timestamp) => dayjs(timestamp).format('HH:mm:ss')}
      />
      <YAxis tickFormatter={(value) => formatBitsPerSecond(value)} />
      <Tooltip
        formatter={(value) => [formatBitsPerSecond(value), 'Bandwidth']}
        labelFormatter={(timestamp) => dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')}
      />
      <Line
        type="monotone"
        dataKey="rx-bytes"
        stroke={colors.highlight}
        name={`Download - ${routerId.toUpperCase()}`}
        dot={false}
      />
      <Line
        type="monotone"
        dataKey="tx-bytes"
        stroke={colors.accent}
        name={`Upload - ${routerId.toUpperCase()}`}
        dot={false}
      />
    </LineChart>
  );
}

export default BandwidthChart;