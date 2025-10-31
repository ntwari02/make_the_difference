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
  const [stats, setStats] = useState<any>(null);

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
        const [analyticsRes, statsRes] = await Promise.all([
          sellerApi.analytics.getSellerAnalytics({ period, start_date: startDate || undefined, end_date: endDate || undefined }),
          sellerApi.orders.stats().catch(() => null),
        ]);
        console.log('Analytics API Response:', JSON.stringify(analyticsRes, null, 2));
        console.log('Sales by period count:', analyticsRes?.sales_by_period?.length || 0);
        console.log('Top models count:', analyticsRes?.top_selling_models?.length || 0);
        console.log('Channel data:', analyticsRes?.sales_by_channel);
        console.log('Conversion rate:', analyticsRes?.conversion_rate);
        // If analytics is missing series data, derive from recent orders as a fallback
        let enriched = analyticsRes as any;
        if (!Array.isArray(analyticsRes?.sales_by_period) || analyticsRes.sales_by_period.length === 0
            || !Array.isArray(analyticsRes?.top_selling_models) || !Array.isArray(analyticsRes?.sales_by_channel) || !Array.isArray(analyticsRes?.sales_by_location)) {
          try {
            const ordersResp = await sellerApi.orders.listMy({ page: 1, limit: 500 });
            const orders = Array.isArray((ordersResp as any)?.orders) ? (ordersResp as any).orders : [];
            const groups: Record<string, { sales_count: number; total_revenue: number }> = {};
            const modelGroups: Record<string, { units: number; revenue: number }> = {};
            const upsert = (key: string, amount: number) => {
              if (!groups[key]) groups[key] = { sales_count: 0, total_revenue: 0 };
              groups[key].sales_count += 1;
              groups[key].total_revenue += Number(amount || 0);
            };
            for (const o of orders) {
              const dt = new Date(o.created_at || Date.now());
              if (period === 'week') {
                const day = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][dt.getDay()];
                upsert(day, o.total_amount);
              } else if (period === 'month') {
                const wk = `Week ${Math.ceil(dt.getDate() / 7)}`;
                upsert(wk, o.total_amount);
              } else {
                const mon = dt.toLocaleString('en', { month: 'short' });
                upsert(mon, o.total_amount);
              }

              // Aggregate top models/products by first item name
              const item = (o.items || [])[0] || {};
              const modelName = item.item_name || item.name || 'Unknown Model';
              if (!modelGroups[modelName]) modelGroups[modelName] = { units: 0, revenue: 0 };
              modelGroups[modelName].units += Number(item.quantity || 1);
              modelGroups[modelName].revenue += Number(o.total_amount || 0);
            }
            const labels = period === 'week'
              ? ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
              : period === 'month'
              ? ['Week 1','Week 2','Week 3','Week 4','Week 5']
              : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            const sales_by_period = labels.map(label => ({
              period: label,
              sales_count: groups[label]?.sales_count || 0,
              total_revenue: groups[label]?.total_revenue || 0,
            }));
            const top_selling_models = Object.entries(modelGroups)
              .map(([model, v]) => ({ model, units: v.units, revenue: v.revenue }))
              .sort((a, b) => b.units - a.units)
              .slice(0, 10);
            let sales_by_channel = [{ channel: 'Marketplace', sales: orders.length }];
            let totalRevenue = orders.reduce((s: number, o: any) => s + Number(o.total_amount || 0), 0);
            let sales_by_location = [{ region: 'Online', revenue: totalRevenue }];
            if (orders.length === 0 && statsRes) {
              // fallback to stats if orders list is empty (e.g., pagination/permissions)
              sales_by_channel = [{ channel: 'Marketplace', sales: Number(statsRes.total_orders || 0) }];
              totalRevenue = Number(statsRes.total_revenue || 0);
              sales_by_location = [{ region: 'Online', revenue: totalRevenue }];
            }
            const conversion_rate = (() => {
              const t = Number(statsRes?.total_orders || 0);
              const c = Number(statsRes?.completed_orders || 0);
              return t ? Math.min(100, Math.max(0, (c / t) * 100)) : 0;
            })();
            enriched = { 
              ...analyticsRes, 
              sales_by_period: analyticsRes?.sales_by_period?.length ? analyticsRes.sales_by_period : sales_by_period,
              top_selling_models: analyticsRes?.top_selling_models || top_selling_models,
              sales_by_channel: analyticsRes?.sales_by_channel || sales_by_channel,
              sales_by_location: analyticsRes?.sales_by_location || sales_by_location,
              conversion_rate: (analyticsRes as any)?.conversion_rate ?? conversion_rate,
            } as any;
          } catch (e) {
            // keep original analyticsRes if orders fetch fails
          }
        }
        dispatch(setAnalytics(enriched));
        if (statsRes) setStats(statsRes);
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
    // Prefer backend stats (same as dashboard) when available
    const statRevenue = Number(stats?.total_revenue) || 0;
    const statOrders = Number(stats?.total_orders) || 0;
    const fallbackRevenue = chartData.reduce((s, p) => s + (p.revenue || 0), 0);
    const fallbackSales = chartData.reduce((s, p) => s + (p.sales || 0), 0);
    const totalRevenue = statRevenue || fallbackRevenue;
    const totalSales = statOrders || fallbackSales;
    const avgOrderValue = totalSales ? Math.round(totalRevenue / totalSales) : 0;
    return { totalRevenue, totalSales, avgOrderValue };
  }, [chartData, stats]);

  // Selling statistics: use real API chart data
  const sellingStatsData = useMemo(() => {
    return chartData;
  }, [chartData]);

  // Orders radar: map from real chart data
  const ordersStatsData = useMemo(() => {
    return chartData.map((p: any) => ({ category: p.period, orders: p.sales, fullValue: (p.revenue || 0) / 1000 }));
  }, [chartData]);

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
