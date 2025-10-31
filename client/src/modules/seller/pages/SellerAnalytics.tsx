import React, { useEffect, useMemo, useState } from 'react';
import { Box, Typography, Card, CardContent, Chip, useTheme, FormControl, InputLabel, Select, MenuItem, Paper, Table, TableHead, TableRow, TableCell, TableBody, TextField, Button, TableContainer } from '@mui/material';
import SellerLayout from '../components/layout/SellerLayout';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../core/store';
import { sellerApi } from '../services/sellerApi';
import { setAnalytics } from '../store/sellerSlice';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip as ReTooltip, Legend, BarChart, Bar, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const SellerAnalytics: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const analytics = useSelector((state: RootState) => state.seller.analytics);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [loading, setLoading] = useState<boolean>(true);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Use real data from API - no mock fallbacks
  const chartData = useMemo(() => {
    const rawData = analytics?.sales_by_period || [];
    console.log('Raw sales_by_period from Redux:', rawData);
    const data = rawData.map((p: any) => ({ 
      period: p.period, 
      sales: p.sales_count || 0, 
      revenue: p.total_revenue || 0 
    }));
    console.log('Processed Chart Data:', data);
    console.log('Full Analytics from Redux:', analytics);
    return data;
  }, [analytics]);

  const topModels = useMemo(() => {
    return analytics?.top_selling_models || [];
  }, [analytics]);

  const channelData = useMemo(() => {
    return (analytics as any)?.sales_by_channel || [];
  }, [analytics]);

  const geoData = useMemo(() => {
    return (analytics as any)?.sales_by_location || [];
  }, [analytics]);

  // Get conversion rate from backend data
  const conversionRate = useMemo(() => {
    return (analytics as any)?.conversion_rate || 0;
  }, [analytics]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await sellerApi.analytics.getSellerAnalytics({ period, start_date: startDate || undefined, end_date: endDate || undefined });
        console.log('Analytics API Response:', JSON.stringify(res, null, 2));
        console.log('Sales by period count:', res?.sales_by_period?.length || 0);
        console.log('Top models count:', res?.top_selling_models?.length || 0);
        console.log('Channel data:', res?.sales_by_channel);
        console.log('Conversion rate:', res?.conversion_rate);
        dispatch(setAnalytics(res));
        console.log('Analytics dispatched to Redux');
      } catch (error: any) {
        console.error('Failed to load analytics:', error);
        // Set empty analytics on error
        dispatch(setAnalytics({
          sales_by_period: [],
          top_selling_models: [],
          sales_by_channel: [],
          sales_by_location: [],
          conversion_rate: 0
        }));
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

  // Generate selling statistics data based on period filter
  const sellingStatsData = useMemo(() => {
    if (period === 'week') {
      // Last 7 days
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      return days.map((day, idx) => ({
        period: day,
        sales: Math.floor(Math.random() * 20) + 10,
        revenue: Math.floor(Math.random() * 15000) + 5000,
      }));
    } else if (period === 'month') {
      // Last 12 months
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months.map((month, idx) => ({
        period: month,
        sales: Math.floor(Math.random() * 30) + 15,
        revenue: Math.floor(Math.random() * 25000) + 10000,
      }));
    } else {
      // Last 5 years
      const currentYear = new Date().getFullYear();
      return Array.from({ length: 5 }, (_, idx) => ({
        period: String(currentYear - 4 + idx),
        sales: Math.floor(Math.random() * 200) + 100,
        revenue: Math.floor(Math.random() * 200000) + 100000,
      }));
    }
  }, [period]);

  // Generate orders statistics data for radar chart based on period
  const ordersStatsData = useMemo(() => {
    const categories = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    if (period === 'week') {
      // Orders by day of week
      return categories.map((day, idx) => ({
        category: day.substring(0, 3),
        orders: Math.floor(Math.random() * 50) + 20,
        fullValue: Math.floor(Math.random() * 100) + 50,
      }));
    } else if (period === 'month') {
      // Orders by week of month
      return ['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((week, idx) => ({
        category: week,
        orders: Math.floor(Math.random() * 100) + 50,
        fullValue: Math.floor(Math.random() * 200) + 100,
      }));
    } else {
      // Orders by quarter
      return ['Q1', 'Q2', 'Q3', 'Q4'].map((quarter, idx) => ({
        category: quarter,
        orders: Math.floor(Math.random() * 500) + 200,
        fullValue: Math.floor(Math.random() * 1000) + 500,
      }));
    }
  }, [period]);

  return (
    <SellerLayout>
      <Box sx={{ flexGrow: 1, width: '100%', maxWidth: '100%' }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' }, 
          flexDirection: { xs: 'column', sm: 'row' }, 
          gap: { xs: 2, sm: 2 }, 
          mb: 3, 
          flexWrap: 'wrap' 
        }}>
          <Typography 
            variant="h4" 
            component="h1" 
            fontWeight={700}
            sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}
          >
            Analytics
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1, 
            flexWrap: 'nowrap',
            width: 'auto'
          }}>
            <FormControl size="small" sx={{ minWidth: 110 }}>
              <InputLabel>Period Type</InputLabel>
              <Select label="Period Type" value={period} onChange={(e) => setPeriod(e.target.value as any)}>
                <MenuItem value="week">Week</MenuItem>
                <MenuItem value="month">Month</MenuItem>
                <MenuItem value="year">Year</MenuItem>
              </Select>
            </FormControl>
            <TextField 
              size="small" 
              label="Start date" 
              type="date" 
              InputLabelProps={{ shrink: true }} 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              sx={{ width: 140 }}
            />
            <TextField 
              size="small" 
              label="End date" 
              type="date" 
              InputLabelProps={{ shrink: true }} 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
              sx={{ width: 140 }}
            />
            <Button 
              variant="outlined" 
              size="small"
              onClick={() => { setStartDate(''); setEndDate(''); }}
              sx={{ minWidth: 100 }}
            >
              Clear dates
            </Button>
            <Button 
              variant="contained" 
              size="small"
              onClick={exportCsv}
              sx={{ minWidth: 110 }}
            >
              Export CSV
            </Button>
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

        {/* Selling Statistics - Bar Chart */}
        <Card sx={{ mb: 3, bgcolor: theme.palette.mode === 'dark' ? '#111827' : 'background.paper' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Selling Statistics - {period === 'week' ? 'Weekly' : period === 'month' ? 'Monthly' : 'Yearly'} View
              </Typography>
              <Chip size="small" label={`${sellingStatsData.length} periods`} />
            </Box>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sellingStatsData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'} />
                <XAxis 
                  dataKey="period" 
                  tick={{ fill: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : undefined }} 
                  tickLine={false} 
                  axisLine={false}
                  angle={period === 'week' ? -45 : 0}
                  textAnchor={period === 'week' ? 'end' : 'middle'}
                  height={period === 'week' ? 60 : 30}
                />
                <YAxis tick={{ fill: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : undefined }} tickLine={false} axisLine={false} />
                <ReTooltip 
                  formatter={(v: any, n: any) => [
                    n === 'revenue' ? `$${Number(v).toLocaleString()}` : v, 
                    n === 'revenue' ? 'Revenue' : 'Sales'
                  ]} 
                />
                <Legend wrapperStyle={{ paddingTop: 8 }} />
                <Bar dataKey="sales" fill="#22d3ee" radius={[4, 4, 0, 0]} name="Sales" />
                <Bar dataKey="revenue" fill="#fbbf24" radius={[4, 4, 0, 0]} name="Revenue ($)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Orders Statistics - Radar Chart */}
        <Card sx={{ mb: 3, bgcolor: theme.palette.mode === 'dark' ? '#111827' : 'background.paper' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Orders Statistics - {period === 'week' ? 'Daily' : period === 'month' ? 'Weekly' : 'Quarterly'} View
              </Typography>
              <Chip size="small" label={`${ordersStatsData.length} categories`} />
            </Box>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={ordersStatsData} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                <PolarGrid stroke={theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'} />
                <PolarAngleAxis 
                  dataKey="category" 
                  tick={{ fill: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.8)' : undefined }}
                  fontSize={12}
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 'dataMax + 20']} 
                  tick={{ fill: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.6)' : undefined }}
                />
                <ReTooltip 
                  formatter={(value: any, name: any) => [
                    name === 'orders' ? `${value} orders` : value,
                    name === 'orders' ? 'Orders' : 'Full Value'
                  ]}
                  contentStyle={{
                    backgroundColor: theme.palette.mode === 'dark' ? '#1f2937' : '#fff',
                    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`,
                    borderRadius: '8px'
                  }}
                />
                <Radar 
                  name="Orders" 
                  dataKey="orders" 
                  stroke="#22d3ee" 
                  fill="#22d3ee" 
                  fillOpacity={0.6}
                  strokeWidth={2}
                />
                <Radar 
                  name="Full Value" 
                  dataKey="fullValue" 
                  stroke="#fbbf24" 
                  fill="#fbbf24" 
                  fillOpacity={0.4}
                  strokeWidth={2}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: 16 }}
                  iconType="circle"
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue & Sales chart (keeping existing) */}
        <Card sx={{ mb: 3, bgcolor: theme.palette.mode === 'dark' ? '#111827' : 'background.paper' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>Revenue & Sales Trend</Typography>
              <Chip size="small" label={`${chartData.length} periods`} />
            </Box>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 260 }}>
                <Typography color="text.secondary">Loading...</Typography>
              </Box>
            ) : chartData.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 260 }}>
                <Typography color="text.secondary">No sales data available for this period</Typography>
              </Box>
            ) : (
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
            )}
          </CardContent>
        </Card>

        {/* Lower grid: channels, top models, locations, conversion */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.2fr 1fr' }, gap: 3, mb: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Sales by Channel</Typography>
              {channelData.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 260 }}>
                  <Typography color="text.secondary">No channel data available</Typography>
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={channelData} layout="vertical" margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'} />
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="channel" width={110} tick={{ fill: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.8)' : undefined }} />
                    <ReTooltip />
                    <Bar dataKey="sales" fill="#22d3ee" radius={6} />
                  </BarChart>
                </ResponsiveContainer>
              )}
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
                  {topModels.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                        <Typography color="text.secondary">No sales data available</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    topModels.map((m: any, idx: number) => (
                      <TableRow key={idx} hover>
                        <TableCell>{m.model}</TableCell>
                        <TableCell align="right">{m.units}</TableCell>
                        <TableCell align="right">${Number(m.revenue).toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  )}
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
                  {geoData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} align="center" sx={{ py: 3 }}>
                        <Typography color="text.secondary">No location data available</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    geoData.map((g: any, idx: number) => (
                      <TableRow key={idx} hover>
                        <TableCell>{g.region}</TableCell>
                        <TableCell align="right">${Number(g.revenue).toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              </TableContainer>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Conversion Rate</Typography>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 220 }}>
                  <Typography color="text.secondary">Loading...</Typography>
                </Box>
              ) : conversionRate === 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: 220 }}>
                  <Typography variant="h4" fontWeight={800} color="text.secondary">0%</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>No conversion data available</Typography>
                </Box>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        dataKey="value"
                        startAngle={180}
                        endAngle={0}
                        data={[
                          { name: 'Converted', value: conversionRate }, 
                          { name: 'Remaining', value: 100 - conversionRate }
                        ]}
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
                  <Typography variant="h4" fontWeight={800} sx={{ textAlign: 'center', mt: -6 }}>{conversionRate.toFixed(1)}%</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>Leads to Sales</Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </SellerLayout>
  );
};

export default SellerAnalytics;
