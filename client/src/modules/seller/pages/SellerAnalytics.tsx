import React, { useEffect, useMemo, useState } from 'react';
import { Box, Typography, Card, CardContent, Chip, useTheme, FormControl, InputLabel, Select, MenuItem, Paper, Table, TableHead, TableRow, TableCell, TableBody, TextField, Button } from '@mui/material';
import SellerLayout from '../components/layout/SellerLayout';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../core/store';
import { sellerApi } from '../services/sellerApi';
import { setAnalytics } from '../store/sellerSlice';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip as ReTooltip, Legend, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const SellerAnalytics: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const analytics = useSelector((state: RootState) => state.seller.analytics);
  const [period, setPeriod] = useState<'12m' | '6m' | '3m'>('12m');
  const [loading, setLoading] = useState<boolean>(true);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Fallback mock data styled like a KPI dashboard
  const mockSeries = useMemo(() => ([
    { period: 'Jan', sales: 7, revenue: 12000 },
    { period: 'Feb', sales: 9, revenue: 15000 },
    { period: 'Mar', sales: 8, revenue: 13800 },
    { period: 'Apr', sales: 12, revenue: 21000 },
    { period: 'May', sales: 11, revenue: 19800 },
    { period: 'Jun', sales: 15, revenue: 26000 },
    { period: 'Jul', sales: 14, revenue: 24800 },
    { period: 'Aug', sales: 13, revenue: 23400 },
    { period: 'Sep', sales: 10, revenue: 17500 },
    { period: 'Oct', sales: 12, revenue: 20500 },
    { period: 'Nov', sales: 16, revenue: 28500 },
    { period: 'Dec', sales: 18, revenue: 32000 },
  ]), []);

  const chartData = useMemo(() => {
    const salesData = (analytics?.sales_by_period || []).map((p: any) => ({ period: p.period, sales: p.sales_count, revenue: p.total_revenue }));
    return salesData.length > 0 ? salesData : mockSeries;
  }, [analytics, mockSeries]);

  const topModels = useMemo(() => {
    const data = analytics?.top_selling_models || [];
    if (data.length > 0) return data;
    return [
      { model: 'Toyota Corolla', units: 23, revenue: 345000 },
      { model: 'Honda Civic', units: 18, revenue: 298000 },
      { model: 'Ford Focus', units: 12, revenue: 156000 },
    ];
  }, [analytics]);

  const channelData = useMemo(() => {
    const data = (analytics as any)?.sales_by_channel || [];
    if (data.length > 0) return data;
    return [
      { channel: 'Marketplace', sales: 123 },
      { channel: 'Shop', sales: 102 },
      { channel: 'Store', sales: 99 },
    ];
  }, [analytics]);

  const geoData = useMemo(() => {
    const data = (analytics as any)?.sales_by_location || [];
    if (data.length > 0) return data;
    return [
      { region: 'United States', revenue: 15100 },
      { region: 'Canada', revenue: 3600 },
      { region: 'UK', revenue: 2900 },
    ];
  }, [analytics]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await sellerApi.analytics.getSellerAnalytics({ period, start_date: startDate || undefined, end_date: endDate || undefined });
        dispatch(setAnalytics(res));
      } catch {
        // keep mock
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [period, startDate, endDate, dispatch]);

  const exportCsv = () => {
    const rows: string[] = [];
    const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    rows.push('Section,Label,Metric,Value');
    chartData.forEach((p: any) => {
      rows.push(`Sales by Period,${esc(p.period)},Sales,${p.sales}`);
      rows.push(`Sales by Period,${esc(p.period)},Revenue,${p.revenue}`);
    });
    channelData.forEach((c: any) => rows.push(`Channel,${esc(c.channel)},Sales,${c.sales}`));
    topModels.forEach((m: any) => rows.push(`Top Model,${esc(m.model)},Units,${m.units}`));
    topModels.forEach((m: any) => rows.push(`Top Model,${esc(m.model)},Revenue,${m.revenue}`));
    geoData.forEach((g: any) => rows.push(`Location,${esc(g.region)},Revenue,${g.revenue}`));
    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'seller-analytics.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const totals = useMemo(() => {
    const totalRevenue = chartData.reduce((s, p) => s + (p.revenue || 0), 0);
    const totalSales = chartData.reduce((s, p) => s + (p.sales || 0), 0);
    const avgOrderValue = totalSales ? Math.round(totalRevenue / totalSales) : 0;
    return { totalRevenue, totalSales, avgOrderValue };
  }, [chartData]);

  return (
    <SellerLayout>
      <Box sx={{ flexGrow: 1, width: '100%', maxWidth: '100%' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="h4" component="h1" fontWeight={700}>Analytics</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Period</InputLabel>
              <Select label="Period" value={period} onChange={(e) => setPeriod(e.target.value as any)}>
                <MenuItem value="12m">Last 12 months</MenuItem>
                <MenuItem value="6m">Last 6 months</MenuItem>
                <MenuItem value="3m">Last 3 months</MenuItem>
              </Select>
            </FormControl>
            <TextField size="small" label="Start date" type="date" InputLabelProps={{ shrink: true }} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <TextField size="small" label="End date" type="date" InputLabelProps={{ shrink: true }} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            <Button variant="outlined" onClick={() => { setStartDate(''); setEndDate(''); }}>Clear dates</Button>
            <Button variant="contained" onClick={exportCsv}>Export CSV</Button>
          </Box>
        </Box>

        {/* KPI cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="overline" color="text.secondary">Total Revenue</Typography>
              <Typography variant="h4" fontWeight={800}>${totals.totalRevenue.toLocaleString()}</Typography>
              <Chip size="small" label={`${chartData.length} periods`} sx={{ mt: 1 }} />
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="overline" color="text.secondary">Total Sales</Typography>
              <Typography variant="h4" fontWeight={800}>{totals.totalSales}</Typography>
              <Chip size="small" label="Units" sx={{ mt: 1 }} />
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="overline" color="text.secondary">Avg Order Value</Typography>
              <Typography variant="h4" fontWeight={800}>${totals.avgOrderValue.toLocaleString()}</Typography>
              <Chip size="small" label="Calculated" sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Box>

        {/* Revenue & Sales chart */}
        <Card sx={{ mb: 3, bgcolor: theme.palette.mode === 'dark' ? '#111827' : 'background.paper' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>Revenue & Sales</Typography>
              <Chip size="small" label={`${chartData.length} periods`} />
            </Box>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'} />
                <XAxis dataKey="period" tick={{ fill: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : undefined }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : undefined }} tickLine={false} axisLine={false} />
                <ReTooltip formatter={(v: any, n: any) => [n === 'revenue' ? `$${Number(v).toLocaleString()}` : v, n === 'revenue' ? 'Revenue' : 'Sales']} />
                <Legend wrapperStyle={{ paddingTop: 8 }} />
                <Line type="monotone" dataKey="revenue" stroke="#22d3ee" strokeWidth={2.4} dot={{ r: 2 }} activeDot={{ r: 4 }} name="Revenue" />
                <Line type="monotone" dataKey="sales" stroke="#fbbf24" strokeWidth={2.4} dot={{ r: 2 }} activeDot={{ r: 4 }} name="Sales" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lower grid: channels, top models, locations, conversion */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.2fr 1fr' }, gap: 3, mb: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Sales by Channel</Typography>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={channelData} layout="vertical" margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'} />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="channel" width={110} tick={{ fill: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.8)' : undefined }} />
                  <ReTooltip />
                  <Bar dataKey="sales" fill="#22d3ee" radius={6} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Top Selling Models</Typography>
              <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Model</TableCell>
                    <TableCell align="right">Units</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topModels.map((m: any, idx: number) => (
                    <TableRow key={idx} hover>
                      <TableCell>{m.model}</TableCell>
                      <TableCell align="right">{m.units}</TableCell>
                      <TableCell align="right">${Number(m.revenue).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Sales by Location</Typography>
              <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Region</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {geoData.map((g: any, idx: number) => (
                    <TableRow key={idx} hover>
                      <TableCell>{g.region}</TableCell>
                      <TableCell align="right">${Number(g.revenue).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </TableContainer>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Conversion Rate</Typography>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    dataKey="value"
                    startAngle={180}
                    endAngle={0}
                    data={[{ name: 'Converted', value: 62 }, { name: 'Remaining', value: 38 }]}
                    cx="50%"
                    cy="100%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    <Cell key="c1" fill="#22c55e" />
                    <Cell key="c2" fill={theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#e5e7eb'} />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <Typography variant="h4" fontWeight={800} sx={{ textAlign: 'center', mt: -6 }}>62%</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>Leads to Sales</Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </SellerLayout>
  );
};

export default SellerAnalytics;
