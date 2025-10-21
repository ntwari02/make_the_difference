import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Avatar,
  Tooltip,
  Alert,
  Divider,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Visibility as VisibilityIcon,
  ShoppingCart as ShoppingCartIcon,
  AttachMoney as MoneyIcon,
  Inventory as InventoryIcon,
  Star as StarIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Assessment as AssessmentIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Timeline as TimelineIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip as ReTooltip, Legend, ReferenceLine, Cell, Brush } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import SellerLayout from '../components/layout/SellerLayout';
import type { RootState } from '../../../../core/store';
import { sparePartsApi } from '../services/sparePartsApi';


interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const SellerSparePartsAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState('6m');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Analytics data state
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [salesTrends, setSalesTrends] = useState<any[]>([]);
  const [categoryAnalysis, setCategoryAnalysis] = useState<any[]>([]);
  const [topSellingParts, setTopSellingParts] = useState<any[]>([]);
  const [inventoryAlerts, setInventoryAlerts] = useState<any[]>([]);
  
  // Chart control states
  const [chartViewMode, setChartViewMode] = useState<'stacked' | 'grouped'>('stacked');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['partsCreated', 'inventoryValue', 'avgPrice']);
  const [showTrendLine, setShowTrendLine] = useState(false);
  const [chartAnimation, setChartAnimation] = useState(true);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [
        overviewResponse,
        metricsResponse,
        trendsResponse,
        categoriesResponse,
        topSellingResponse,
        alertsResponse
      ] = await Promise.all([
        sparePartsApi.getAnalyticsOverview(timeRange),
        sparePartsApi.getPerformanceMetrics(timeRange),
        sparePartsApi.getSalesTrends(timeRange),
        sparePartsApi.getCategoryAnalysis(timeRange),
        sparePartsApi.getTopSellingParts(timeRange, 10),
        sparePartsApi.getInventoryAlerts()
      ]);

      // Safely set data with fallbacks
      setAnalyticsData(overviewResponse?.data || null);
      setPerformanceMetrics(metricsResponse?.data || null);
      setSalesTrends(Array.isArray(trendsResponse?.data) ? trendsResponse.data : []);
      setCategoryAnalysis(Array.isArray(categoriesResponse?.data) ? categoriesResponse.data : []);
      setTopSellingParts(Array.isArray(topSellingResponse?.data) ? topSellingResponse.data : []);
      setInventoryAlerts(Array.isArray(alertsResponse?.data) ? alertsResponse.data : []);
      
    } catch (error: any) {
      console.error('Error fetching analytics data:', error);
      setError(error.response?.data?.message || 'Failed to load analytics data');
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalyticsData();
    setRefreshing(false);
    toast.success('Analytics data refreshed');
  };

  const handleTimeRangeChange = (newTimeRange: string) => {
    setTimeRange(newTimeRange);
  };

  // Chart control handlers
  const handleMetricToggle = (metric: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metric) 
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    );
  };

  const handleChartExport = () => {
    const data = getBarChartData();
    const csvContent = [
      ['Month', 'Parts Created', 'Inventory Value ($)', 'Avg Price ($)', 'Growth %'],
      ...data.map(d => [
        d.month,
        d.partsCreated,
        d.inventoryValue,
        d.avgPrice,
        d.partsGrowth
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-trends-${timeRange}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Chart data exported successfully!');
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  // Helper function to safely parse images
  const getFirstImage = (images: any) => {
    try {
      if (!images) return undefined;
      if (typeof images === 'string') {
        const parsed = JSON.parse(images);
        return Array.isArray(parsed) ? parsed[0] : parsed;
      }
      if (Array.isArray(images)) {
        return images[0];
      }
      return images;
    } catch (e) {
      // If JSON parsing fails, return the original value if it's a string
      return typeof images === 'string' ? images : undefined;
    }
  };

  // Enhanced helper function for bar chart data with advanced calculations
  const getBarChartData = () => {
    if (!salesTrends || salesTrends.length === 0) {
      return [];
    }

    // Calculate additional metrics
    const dataWithCalculations = salesTrends.map((trend, index) => {
      const prevTrend = index > 0 ? salesTrends[index - 1] : null;
      
      // Calculate growth rates
      const partsGrowth = prevTrend && prevTrend.partsCreated > 0 
        ? ((trend.partsCreated - prevTrend.partsCreated) / prevTrend.partsCreated) * 100 
        : 0;
      
      const valueGrowth = prevTrend && prevTrend.inventoryValue > 0 
        ? ((trend.inventoryValue - prevTrend.inventoryValue) / prevTrend.inventoryValue) * 100 
        : 0;

      return {
        month: trend.month,
        monthShort: trend.month.split('-')[1], // Extract month number
        partsCreated: trend.partsCreated || 0,
        inventoryValue: Math.round(trend.inventoryValue || 0),
        avgPrice: Math.round(trend.avgOrderValue || 0),
        orders: trend.orders || 0,
        partsGrowth: Math.round(partsGrowth),
        valueGrowth: Math.round(valueGrowth),
        // Add trend indicators
        isPeakMonth: trend.partsCreated === Math.max(...salesTrends.map(t => t.partsCreated || 0)),
        isLowMonth: trend.partsCreated === Math.min(...salesTrends.map(t => t.partsCreated || 0)),
        // Add cumulative data
        cumulativeParts: salesTrends.slice(0, index + 1).reduce((sum, t) => sum + (t.partsCreated || 0), 0),
        cumulativeValue: salesTrends.slice(0, index + 1).reduce((sum, t) => sum + (t.inventoryValue || 0), 0)
      };
    });

    return dataWithCalculations;
  };

  // Calculate trend line data
  const getTrendLineData = () => {
    const data = getBarChartData();
    if (data.length < 2) return [];

    // Simple linear regression for parts created trend
    const n = data.length;
    const sumX = data.reduce((sum, _, i) => sum + i, 0);
    const sumY = data.reduce((sum, d) => sum + d.partsCreated, 0);
    const sumXY = data.reduce((sum, d, i) => sum + i * d.partsCreated, 0);
    const sumXX = data.reduce((sum, _, i) => sum + i * i, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return data.map((d, i) => ({
      month: d.month,
      trendValue: Math.round(slope * i + intercept)
    }));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  // Custom tooltip component for individual bar values
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const entry = payload[0]; // Get only the hovered bar's data
      
      // For stacked bars, we need to get the original data value
      let displayValue = entry.value;
      
      // In stacked mode, Recharts gives us cumulative values
      // We need to find the original data to get the actual segment value
      if (chartViewMode === 'stacked') {
        const originalData = getBarChartData().find(item => item.month === label);
        if (originalData) {
          // Get the actual value for this specific metric
          switch (entry.dataKey) {
            case 'partsCreated':
              displayValue = originalData.partsCreated;
              break;
            case 'inventoryValue':
              displayValue = originalData.inventoryValue;
              break;
            case 'avgPrice':
              displayValue = originalData.avgPrice;
              break;
            case 'cumulativeParts':
              displayValue = originalData.cumulativeParts;
              break;
            default:
              displayValue = entry.value;
          }
        }
      }
      
      return (
        <Card sx={{ 
          p: 2, 
          boxShadow: 3,
          border: '1px solid',
          borderColor: 'divider',
          minWidth: 150
        }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            {label}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Box 
              sx={{ 
                width: 12, 
                height: 12, 
                backgroundColor: entry.color,
                borderRadius: '2px'
              }} 
            />
            <Typography variant="body2" fontWeight={600}>
              {entry.name}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {entry.name.includes('$') ? `$${displayValue.toLocaleString()}` : displayValue.toLocaleString()}
          </Typography>
        </Card>
      );
    }
    return null;
  };

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    change: number;
    icon: React.ReactNode;
    color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
    subtitle?: string;
  }> = ({ title, value, change, icon, color, subtitle }) => (
    <Card sx={{ 
      height: '100%',
      transition: 'all 0.3s ease-in-out',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
      }
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ 
            color: `${color}.main`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'scale(1.1)'
            }
          }}>
            {icon}
          </Box>
        </Box>
        
        <Typography variant="h6" fontWeight={600} color={change > 0 ? 'success.main' : 'error.main'} gutterBottom>
          {formatPercentage(change)}
        </Typography>
        
        <Typography variant="h4" fontWeight={700} gutterBottom>
          {value}
        </Typography>
        
        <Typography variant="body1" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  return (
    <SellerLayout>
      <Box sx={{ flexGrow: 1, p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Spare Parts Analytics
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Comprehensive insights into your spare parts business performance
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                label="Time Range"
                onChange={(e) => handleTimeRangeChange(e.target.value)}
              >
                <MenuItem value="1m">Last Month</MenuItem>
                <MenuItem value="3m">Last 3 Months</MenuItem>
                <MenuItem value="6m">Last 6 Months</MenuItem>
                <MenuItem value="1y">Last Year</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => toast.success('Export started')}
            >
              Export Report
            </Button>
          </Box>
        </Box>

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress size={60} />
          </Box>
        )}

        {/* Error State */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Key Metrics */}
        {!loading && performanceMetrics && (
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: 3, 
            mb: 4 
          }}>
            <MetricCard
              title="Inventory Value"
              value={formatCurrency(performanceMetrics.totalRevenue)}
              change={performanceMetrics.revenueGrowth}
              icon={<MoneyIcon sx={{ fontSize: 20 }} />}
              color="success"
              subtitle={`Potential revenue from inventory`}
            />
            <MetricCard
              title="Total Parts"
              value={performanceMetrics.totalOrders}
              change={performanceMetrics.ordersGrowth}
              icon={<ShoppingCartIcon sx={{ fontSize: 20 }} />}
              color="primary"
              subtitle={`Parts in inventory`}
            />
            <MetricCard
              title="Avg Part Price"
              value={formatCurrency(performanceMetrics.avgOrderValue)}
              change={performanceMetrics.avgOrderValueGrowth}
              icon={<AssessmentIcon sx={{ fontSize: 20 }} />}
              color="info"
              subtitle="Average price per part"
            />
            <MetricCard
              title="Customer Rating"
              value={performanceMetrics.customerSatisfaction > 0 ? `${performanceMetrics.customerSatisfaction.toFixed(1)}` : 'No ratings yet'}
              change={0}
              icon={<StarIcon sx={{ fontSize: 20 }} />}
              color="warning"
              subtitle="Average rating"
            />
          </Box>
        )}

        {/* No Data State */}
        {!loading && !performanceMetrics && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body1">
              No analytics data available yet. Start by adding some spare parts to see your analytics dashboard.
            </Typography>
            <Button 
              variant="contained" 
              sx={{ mt: 2 }}
              onClick={() => navigate('/seller/spare-parts/add')}
            >
              Add Your First Spare Part
            </Button>
          </Alert>
        )}

        {/* Main Analytics Tabs */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="analytics tabs">
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TimelineIcon />
                    <span>Inventory Trends</span>
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BarChartIcon />
                    <span>Top Parts</span>
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PieChartIcon />
                    <span>Category Analysis</span>
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <InventoryIcon />
                    <span>Inventory Insights</span>
                  </Box>
                } 
              />
            </Tabs>
          </Box>

          {/* Sales Trends Tab */}
          <TabPanel value={activeTab} index={0}>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr',
              gap: 3 
            }}>
              <Card sx={{
                border: 'none',
                boxShadow: 'none',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                }
              }}>
                <CardContent>
                  {/* Chart Header with Controls */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" fontWeight={600}>
                      Advanced Inventory Trends Analysis
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Button
                        size="small"
                        variant={chartViewMode === 'grouped' ? 'contained' : 'outlined'}
                        onClick={() => setChartViewMode('grouped')}
                      >
                        Grouped
                      </Button>
                      <Button
                        size="small"
                        variant={chartViewMode === 'stacked' ? 'contained' : 'outlined'}
                        onClick={() => setChartViewMode('stacked')}
                      >
                        Stacked
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={handleChartExport}
                      >
                        Export
                      </Button>
                    </Box>
                  </Box>

                  {/* Chart Controls */}
                  <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel>Metrics</InputLabel>
                      <Select
                        multiple
                        value={selectedMetrics}
                        label="Metrics"
                        onChange={(e) => setSelectedMetrics(e.target.value as string[])}
                        renderValue={(selected) => `${selected.length} selected`}
                      >
                        <MenuItem value="partsCreated">Parts Created</MenuItem>
                        <MenuItem value="inventoryValue">Inventory Value</MenuItem>
                        <MenuItem value="avgPrice">Avg Price</MenuItem>
                        <MenuItem value="cumulativeParts">Cumulative Parts</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={showTrendLine}
                          onChange={(e) => setShowTrendLine(e.target.checked)}
                        />
                      }
                      label="Trend Line"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={chartAnimation}
                          onChange={(e) => setChartAnimation(e.target.checked)}
                        />
                      }
                      label="Animation"
                    />
                  </Box>

                  {/* Advanced Chart */}
                  <Box sx={{ height: 500, width: '100%', border: 'none', outline: 'none' }}>
                    {getBarChartData().length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%" style={{ border: 'none' }}>
                        <BarChart 
                          data={getBarChartData()} 
                          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                          layout={chartViewMode === 'stacked' ? 'horizontal' : 'vertical'}
                          style={{ border: 'none' }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" strokeWidth={0.5} />
                          <XAxis 
                            dataKey="month" 
                            tick={{ fontSize: 11 }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            interval={0}
                          />
                          <YAxis 
                            yAxisId="left"
                            orientation="left"
                            tick={{ fontSize: 11 }}
                            tickFormatter={(value) => value.toLocaleString()}
                            domain={[0, 'dataMax + 10']}
                          />
                          <YAxis 
                            yAxisId="right"
                            orientation="right"
                            tick={{ fontSize: 11 }}
                            tickFormatter={(value) => `$${value.toLocaleString()}`}
                            domain={[0, 'dataMax + 1000']}
                          />
                          
                          {/* Trend Line */}
                          {showTrendLine && (
                            <ReferenceLine 
                              yAxisId="left"
                              y={getTrendLineData()[getTrendLineData().length - 1]?.trendValue || 0}
                              stroke="#ff6b6b"
                              strokeDasharray="5 5"
                              label={{ value: "Trend", position: "topRight" }}
                            />
                          )}

                          <ReTooltip content={<CustomTooltip />} />
                          <Legend />
                          
                          {/* Dynamic Bars based on selected metrics */}
                          {selectedMetrics.includes('partsCreated') && (
                            <Bar 
                              yAxisId="left"
                              dataKey="partsCreated" 
                              fill="#8884d8" 
                              name="Parts Created"
                              radius={[2, 2, 0, 0]}
                              animationDuration={chartAnimation ? 1000 : 0}
                            />
                          )}
                          {selectedMetrics.includes('inventoryValue') && (
                            <Bar 
                              yAxisId="right"
                              dataKey="inventoryValue" 
                              fill="#82ca9d" 
                              name="Inventory Value ($)"
                              radius={[2, 2, 0, 0]}
                              animationDuration={chartAnimation ? 1000 : 0}
                            />
                          )}
                          {selectedMetrics.includes('avgPrice') && (
                            <Bar 
                              yAxisId="right"
                              dataKey="avgPrice" 
                              fill="#ffc658" 
                              name="Avg Price ($)"
                              radius={[2, 2, 0, 0]}
                              animationDuration={chartAnimation ? 1000 : 0}
                            />
                          )}
                          {selectedMetrics.includes('cumulativeParts') && (
                            <Bar 
                              yAxisId="left"
                              dataKey="cumulativeParts" 
                              fill="#ff9f43" 
                              name="Cumulative Parts"
                              radius={[2, 2, 0, 0]}
                              animationDuration={chartAnimation ? 1000 : 0}
                            />
                          )}

                          {/* Brush for data zooming */}
                          <Brush 
                            dataKey="month" 
                            height={30}
                            stroke="#8884d8"
                            fill="#f8f9fa"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        backgroundColor: 'grey.50', 
                        borderRadius: 2,
                        border: '2px dashed',
                        borderColor: 'grey.300'
                      }}>
                        <Typography variant="body1" color="text.secondary">
                          No inventory trends data available for the selected time period
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  {salesTrends.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Recent Activity:
                      </Typography>
                      {salesTrends.slice(-3).map((trend, index) => (
                        <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">{trend.month}</Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {trend.partsCreated} parts added
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          </TabPanel>

          {/* Product Performance Tab */}
          <TabPanel value={activeTab} index={1}>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr',
              gap: 3 
            }}>
              <Card sx={{
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                }
              }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Top Selling Parts
                  </Typography>
                  <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Product</TableCell>
                          <TableCell align="right">Sales</TableCell>
                          <TableCell align="right">Revenue</TableCell>
                          <TableCell align="right">Growth</TableCell>
                          <TableCell align="right">Rating</TableCell>
                          <TableCell align="center">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {topSellingParts && topSellingParts.length > 0 ? topSellingParts.map((part) => (
                          <TableRow key={part.id} sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar
                                  src={getFirstImage(part.images)}
                                  sx={{ width: 40, height: 40 }}
                                />
                                <Box>
                                  <Typography variant="body1" fontWeight={600}>
                                    {part.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    SKU: {part.sku}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body1" fontWeight={600}>
                                {part.totalSold}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body1" fontWeight={600}>
                                {formatCurrency(part.totalRevenue)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Chip
                                label={formatPercentage(part.growth)}
                                size="small"
                                color={part.growth > 0 ? 'success' : 'error'}
                                icon={part.growth > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <StarIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                                <Typography variant="body2">
                                  {part.rating?.toFixed(1) || 'N/A'}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <Button 
                                size="small" 
                                variant="outlined"
                                onClick={() => navigate(`/seller/spare-parts/${part.id}/edit`)}
                                sx={{
                                  transition: 'all 0.2s ease-in-out',
                                  '&:hover': {
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                  }
                                }}
                              >
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        )) : (
                          <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                {topSellingParts === null ? 'Loading...' : 'No spare parts found for the selected time period'}
                              </Typography>
                              {topSellingParts !== null && (
                                <Button 
                                  variant="outlined" 
                                  size="small"
                                  onClick={() => navigate('/seller/spare-parts/add')}
                                  sx={{ mt: 1 }}
                                >
                                  Add Spare Parts
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Box>
          </TabPanel>

          {/* Category Analysis Tab */}
          <TabPanel value={activeTab} index={2}>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 3 
            }}>
              <Card sx={{
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                }
              }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Sales by Category
                  </Typography>
                  <Box sx={{ 
                    height: 300, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    backgroundColor: 'grey.50', 
                    borderRadius: 2,
                    border: '2px dashed',
                    borderColor: 'grey.300'
                  }}>
                    <Typography variant="body1" color="text.secondary">
                      🥧 Pie chart visualization would go here
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
              
              <Card sx={{
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                }
              }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Category Performance
                  </Typography>
                  <Stack spacing={2}>
                    {categoryAnalysis.length > 0 ? categoryAnalysis.map((category, index) => (
                      <Box key={index}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body1" fontWeight={600}>
                            {category.name}
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {category.percentage.toFixed(1)}%
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={category.percentage} 
                          sx={{ 
                            height: 8, 
                            borderRadius: 4,
                            backgroundColor: 'grey.200',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: category.color,
                              borderRadius: 4,
                            }
                          }}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            {category.totalParts} parts
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatCurrency(category.totalSales)} sales
                          </Typography>
                        </Box>
                      </Box>
                    )) : (
                      <Box sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          No category data available for the selected time period
                        </Typography>
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={() => navigate('/seller/spare-parts/add')}
                        >
                          Add Spare Parts
                        </Button>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          </TabPanel>

          {/* Inventory Insights Tab */}
          <TabPanel value={activeTab} index={3}>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 3 
            }}>
              <Card sx={{
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                }
              }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Inventory Alerts
                  </Typography>
                  <Stack spacing={2}>
                    {inventoryAlerts.length > 0 ? inventoryAlerts.map((alert) => (
                      <Alert 
                        key={alert.id}
                        severity={getSeverityColor(alert.severity)}
                        sx={{ mb: 1 }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                          <Box>
                            <Typography variant="body1" fontWeight={600}>
                              {alert.part}
                            </Typography>
                            <Typography variant="caption">
                              SKU: {alert.sku} • Current: {alert.current} • Reorder: {alert.reorder}
                            </Typography>
                          </Box>
                          <Button 
                            size="small" 
                            variant="outlined"
                            onClick={() => navigate(`/seller/spare-parts/${alert.id}/edit`)}
                          >
                            Reorder
                          </Button>
                        </Box>
                      </Alert>
                    )) : (
                      <Alert severity="success">
                        <Typography variant="body2">
                          All inventory levels are healthy! No reorder alerts at this time.
                        </Typography>
                      </Alert>
                    )}
                  </Stack>
                </CardContent>
              </Card>
              
              <Card sx={{
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                }
              }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Inventory Metrics
                  </Typography>
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Inventory Turnover Rate
                      </Typography>
                      <Typography variant="h4" fontWeight={700} color="primary">
                        {performanceMetrics?.inventoryTurnover?.toFixed(1) || 'N/A'}x
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Times per year
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Customer Satisfaction
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h4" fontWeight={700} color="success.main">
                          {performanceMetrics?.customerSatisfaction > 0 ? performanceMetrics.customerSatisfaction.toFixed(1) : 'No ratings'}
                        </Typography>
                        {performanceMetrics?.customerSatisfaction > 0 && (
                          <Box sx={{ display: 'flex' }}>
                            {[...Array(5)].map((_, i) => (
                              <StarIcon 
                                key={i} 
                                sx={{ 
                                  fontSize: 20, 
                                  color: i < Math.floor(performanceMetrics.customerSatisfaction) ? 'warning.main' : 'grey.300' 
                                }} 
                              />
                            ))}
                          </Box>
                        )}
                      </Box>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Return Rate
                      </Typography>
                      <Typography variant="h4" fontWeight={700} color="error.main">
                        {performanceMetrics?.returnRate?.toFixed(1) || 'N/A'}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Of total orders
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          </TabPanel>
        </Card>
      </Box>
    </SellerLayout>
  );
};

export default SellerSparePartsAnalytics;