// frontend/src/pages/Reports.jsx
import { useState, useEffect } from 'react';
import { Row, Col, Card, DatePicker, Button, Empty, message, Form, Select } from 'antd';
import { CSVLink } from 'react-csv';
import api from '../services/api';
import dayjs from 'dayjs';
import CPUChart from '../components/charts/CPUChart';
import RAMChart from '../components/charts/RAMChart';
import BandwidthChart from '../components/charts/BandwidthChart';

const { RangePicker } = DatePicker;
const { Option } = Select;

function Reports() {
  const [form] = Form.useForm();
  const [data, setData] = useState({ mikrotik1: [], mikrotik2: [] });
  const [dateRange, setDateRange] = useState([]);
  const [loading, setLoading] = useState(false);
  const [validDateRange, setValidDateRange] = useState({ min: null, max: null });

  const routerOptions = [
    { value: 'all', label: 'All Routers' },
    { value: 'mikrotik1', label: 'MikroTik 1' },
    { value: 'mikrotik2', label: 'MikroTik 2' },
  ];

  const fetchDateRange = async (start, end) => {
    try {
      setLoading(true);
      const [mikrotik1Response, mikrotik2Response] = await Promise.all([
        api.get(`/monitoring/mikrotik1${start && end ? `?start=${start}&end=${end}` : ''}`),
        api.get(`/monitoring/mikrotik2${start && end ? `?start=${start}&end=${end}` : ''}`),
      ]);

      const mikrotik1Data = Array.isArray(mikrotik1Response.data) ? mikrotik1Response.data : [];
      const mikrotik2Data = Array.isArray(mikrotik2Response.data) ? mikrotik2Response.data : [];

      console.log(`[${new Date().toISOString()}] Fetched ${mikrotik1Data.length} records for mikrotik1`);
      console.log(`[${new Date().toISOString()}] Fetched ${mikrotik2Data.length} records for mikrotik2`);

      setData({
        mikrotik1: mikrotik1Data,
        mikrotik2: mikrotik2Data,
      });

      const timestamps = [...mikrotik1Data, ...mikrotik2Data].map((record) => new Date(record.timestamp));
      if (timestamps.length > 0) {
        const minDate = dayjs(Math.min(...timestamps));
        const maxDate = dayjs(Math.max(...timestamps));
        setValidDateRange({ min: minDate, max: maxDate });
        form.setFieldsValue({ dateRange: [minDate, maxDate] });
      }

      if (mikrotik1Data.length === 0 && mikrotik2Data.length === 0) {
        message.warning('No data available for the selected range');
      }
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error fetching date range:`, error);
      message.error('Failed to load data');
      setData({ mikrotik1: [], mikrotik2: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    setDateRange([dayjs(oneWeekAgo), dayjs(now)]);
    fetchDateRange(oneWeekAgo.toISOString(), now.toISOString());
  }, []);

  const disabledDate = (current) => {
    if (!validDateRange.min || !validDateRange.max) return true;
    return current < validDateRange.min.startOf('day') || current > validDateRange.max.endOf('day');
  };

  const onDateRangeChange = (dates) => {
    if (dates && dates.length === 2) {
      setDateRange(dates);
      fetchDateRange(dates[0].toISOString(), dates[1].toISOString());
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const { routerId, dateRange, format } = values;
      const [startDate, endDate] = dateRange;

      const response = await api.post(
        '/reports/generate',
        {
          routerId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          format,
        },
        {
          responseType: format === 'pdf' ? 'blob' : 'text',
        }
      );

      if (format === 'pdf') {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `report-${routerId}-${dayjs().format('YYYYMMDD')}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      } else if (format === 'csv') {
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `report-${routerId}-${dayjs().format('YYYYMMDD')}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
      }

      message.success('Report generated successfully');
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error generating report:`, error);
      message.error(error.response?.data?.error || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const csvData = [
    ['Router', 'Timestamp', 'CPU Load (%)', 'Memory Usage (%)', 'RX Bytes (bps)', 'TX Bytes (bps)', 'Uptime'],
    ...data.mikrotik1.map((item) => [
      'mikrotik1',
      item.timestamp,
      item.cpu,
      item.memory.toFixed(2),
      item['rx-bytes'],
      item['tx-bytes'],
      item.uptime,
    ]),
    ...data.mikrotik2.map((item) => [
      'mikrotik2',
      item.timestamp,
      item.cpu,
      item.memory.toFixed(2),
      item['rx-bytes'],
      item['tx-bytes'],
      item.uptime,
    ]),
  ];

  return (
    <Row gutter={[16, 16]} style={{ padding: '24px' }}>
      <Col span={24}>
        <Card title="Generate Report">
          <Form form={form} onFinish={onFinish} layout="vertical">
            <Form.Item
              name="routerId"
              label="Router"
              rules={[{ required: true, message: 'Please select a router' }]}
            >
              <Select placeholder="Select a router">
                {routerOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="dateRange"
              label="Date Range"
              rules={[{ required: true, message: 'Please select a date range' }]}
            >
              <RangePicker disabledDate={disabledDate} onChange={onDateRangeChange} />
            </Form.Item>
            <Form.Item
              name="format"
              label="Format"
              rules={[{ required: true, message: 'Please select a format' }]}
            >
              <Select placeholder="Select format">
                <Option value="pdf">PDF</Option>
                <Option value="csv">CSV</Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Generate Report
              </Button>
              <Button style={{ marginLeft: 8 }} disabled={loading}>
                <CSVLink data={csvData} filename={`mikrotik-report-${dayjs().format('YYYYMMDD')}.csv`} style={{ color: 'inherit' }}>
                  Export CSV
                </CSVLink>
              </Button>
            </Form.Item>
          </Form>
          {data.mikrotik1.length === 0 && data.mikrotik2.length === 0 ? (
            <Empty description="No data available for the selected range" />
          ) : (
            <Row gutter={[16, 16]}>
              {data.mikrotik1.length > 0 && (
                <Col xs={24} lg={12}>
                  <Card title="MikroTik 1 Metrics">
                    <CPUChart data={data.mikrotik1} routerId="mikrotik1" />
                    <RAMChart data={data.mikrotik1} routerId="mikrotik1" />
                    <BandwidthChart data={data.mikrotik1} routerId="mikrotik1" />
                  </Card>
                </Col>
              )}
              {data.mikrotik2.length > 0 && (
                <Col xs={24} lg={12}>
                  <Card title="MikroTik 2 Metrics">
                    <CPUChart data={data.mikrotik2} routerId="mikrotik2" />
                    <RAMChart data={data.mikrotik2} routerId="mikrotik2" />
                    <BandwidthChart data={data.mikrotik2} routerId="mikrotik2" />
                  </Card>
                </Col>
              )}
            </Row>
          )}
        </Card>
      </Col>
    </Row>
  );
}

export default Reports;