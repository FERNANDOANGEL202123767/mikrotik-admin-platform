import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { colors } from '../../utils/colors';
import dayjs from 'dayjs';

function ComparisonChart({ data, metric }) {
  const routers = Object.keys(data);
  const mergedData = data[routers[0]].map((item, index) => ({
    timestamp: item.timestamp,
    [routers[0]]: item[metric],
    [routers[1]]: data[routers[1]][index]?.[metric] || 0,
  }));

  return (
    <LineChart
      width={800}
      height={400}
      data={mergedData}
      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
    >
      <CartesianGrid strokeDasharray="3 3" stroke={colors.complement} />
      <XAxis
        dataKey="timestamp"
        tickFormatter={timestamp => dayjs(timestamp).format('HH:mm:ss')}
      />
      <YAxis unit="%" domain={[0, 100]} />
      <Tooltip
        formatter={(value) => `${value.toFixed(2)}%`}
        labelFormatter={timestamp => dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')}
      />
      <Legend />
      {routers.map((routerId, index) => (
        <Line
          key={routerId}
          type="monotone"
          dataKey={routerId}
          stroke={colors.chartColors[index]}
          name={routerId.toUpperCase()}
          dot={false}
        />
      ))}
    </LineChart>
  );
}

export default ComparisonChart;