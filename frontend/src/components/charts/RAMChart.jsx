
// frontend/src/components/charts/RAMChart.jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { colors } from '../../utils/colors';
import dayjs from 'dayjs';

function RAMChart({ data, routerId }) {
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
      <YAxis domain={[0, 100]} unit="%" />
      <Tooltip
        formatter={(value) => [`${value.toFixed(2)}%`, 'Memory Usage']}
        labelFormatter={(timestamp) => dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')}
      />
      <Line
        type="monotone"
        dataKey="memory"
        stroke={colors.accent}
        name={`RAM Usage - ${routerId.toUpperCase()}`}
        dot={false}
      />
    </LineChart>
  );
}

export default RAMChart;
