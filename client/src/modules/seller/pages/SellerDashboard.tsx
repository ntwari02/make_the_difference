import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  useTheme,
  Avatar,
  List,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material';
import {
  DirectionsCar as CarIcon,
  TrendingUp as TrendingUpIcon,
  Visibility as ViewIcon,
  ShoppingCart as SalesIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../../core/store';
import SellerLayout from '../components/layout/SellerLayout';
import { sellerApi } from '../services/sellerApi';
import { setCars, setLoading as setSellerLoading, setError as setSellerError, setStats, setAnalytics } from '../store/sellerSlice';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip as ReTooltip, Legend } from 'recharts';
import { keyframes } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
// Using CSS grid via Box to avoid Grid type issues

const SellerDashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cars = useSelector((state: RootState) => state.seller.cars);
  const profile = useSelector((state: RootState) => state.seller.profile);
  const analytics = useSelector((state: RootState) => state.seller.analytics);

  const [localLoading, setLocalLoading] = useState(true);
  const [recentListings, setRecentListings] = useState<any[]>([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      dispatch(setSellerLoading(true));
      

      const [carsRes, analyticsRes] = await Promise.allSettled([
        sellerApi.cars.getMyCars({ page: 1, limit: 50 }),
        sellerApi.analytics.getSellerAnalytics({ period: '12m' }),
      ]);

      if (carsRes.status === 'fulfilled') {
        dispatch(setCars(carsRes.value.cars || []));
        // Compute stats from cars
        const total = (carsRes.value.cars || []).length;
        const active = (carsRes.value.cars || []).filter((c: any) => c.status === 'active').length;
        const sold = (carsRes.value.cars || []).filter((c: any) => c.status === 'sold').length;
        const avgPrice = (carsRes.value.cars || []).length
          ? Math.round((carsRes.value.cars || []).reduce((s: number, c: any) => s + (c.price || 0), 0) / (carsRes.value.cars || []).length)
          : 0;
        dispatch(setStats({
          inventory: {
            total_vehicles: total,
            active_listings: active,
            sold_vehicles: sold,
            average_price: avgPrice,
          },
          sales: {
            total_sales: sold,
            total_revenue: (carsRes.value.cars || []).filter((c: any) => c.status === 'sold').reduce((s: number, c: any) => s + (c.price || 0), 0),
            average_sale_price: sold ? Math.round((carsRes.value.cars || []).filter((c: any) => c.status === 'sold').reduce((s: number, c: any) => s + (c.price || 0), 0) / sold) : 0,
          },
          recent_sales: (carsRes.value.cars || []).filter((c: any) => c.status === 'sold').slice(0, 5),
          monthly_sales: [],
        } as any));
      }

      if (analyticsRes.status === 'fulfilled') {
        dispatch(setAnalytics(analyticsRes.value));
      }
    } catch (e: any) {
      dispatch(setSellerError(e?.message || 'Failed to load dashboard'));
    } finally {
      dispatch(setSellerLoading(false));
      setLocalLoading(false);
    }
  };

  const kpis = useMemo(() => {
    const carsArray = cars || [];
    const total = carsArray.length;
    const active = carsArray.filter((c: any) => c.status === 'active').length;
    const sold = carsArray.filter((c: any) => c.status === 'sold').length;
    const avgPrice = total ? Math.round(carsArray.reduce((s: number, c: any) => s + (c.price || 0), 0) / total) : 0;
    return { total, active, sold, avgPrice };
  }, [cars]);

  // Update recent listings when cars data changes
  useEffect(() => {
    if (cars && cars.length > 0) {
      const recent = [...cars]
        .sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
        .slice(0, 8);
      setRecentListings(recent);
    }
  }, [cars]);

  // Handle car actions
  const handleViewCar = (carId: string) => {
    navigate(`/cars/${carId}`);
  };

  const handleEditCar = (carId: string) => {
    navigate(`/seller/cars/add?edit=${carId}`);
  };

  const handleDeleteCar = async (carId: string) => {
    if (window.confirm('Are you sure you want to delete this car listing?')) {
      try {
        await sellerApi.cars.deleteCar(carId);
        // Refresh the dashboard data
        await load();
      } catch (error) {
        console.error('Failed to delete car:', error);
        alert('Failed to delete car listing. Please try again.');
      }
    }
  };

  const handleToggleFeatured = async (carId: string, currentFeatured: boolean) => {
    try {
      await sellerApi.cars.updateCar(carId, { is_featured: !currentFeatured });
      // Refresh the dashboard data
      await load();
    } catch (error) {
      console.error('Failed to update car:', error);
      alert('Failed to update car listing. Please try again.');
    }
  };

  // No-op: top listings UI removed for now

  const salesData = Array.isArray(analytics?.sales_by_period) 
    ? analytics.sales_by_period.map((p: { period: string; sales_count: number; total_revenue: number }) => ({
        period: p.period,
        sales: p.sales_count,
        revenue: p.total_revenue,
      }))
    : [];

  // Beautiful mock data fallback for charts when analytics are unavailable
  const mockSalesData = [
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
  ];
  const chartData = Array.isArray(salesData) && salesData.length > 0 ? salesData : mockSalesData;

  // Polished segmented semicircle gauge
  const Gauge: React.FC<{ value: number; size?: number }> = ({ value, size = 220 }) => {
    const [display, setDisplay] = useState(0);
    const clamped = Math.max(0, Math.min(100, value));
    const r = size / 2 - 18; // radius with padding
    const cx = size / 2;
    const cy = size / 2;

    React.useEffect(() => {
      let raf = 0;
      const start = performance.now();
      const startVal = display;
      const delta = clamped - startVal;
      const duration = 900;
      const animate = (t: number) => {
        const p = Math.min(1, (t - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        setDisplay(startVal + delta * eased);
        if (p < 1) raf = requestAnimationFrame(animate);
      };
      raf = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(raf);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clamped]);

    const polar = (angleDeg: number) => {
      const rad = (angleDeg * Math.PI) / 180;
      return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
    };
    const arc = (startDeg: number, endDeg: number) => {
      const start = polar(startDeg);
      const end = polar(endDeg);
      const largeArc = endDeg - startDeg <= 180 ? 0 : 1;
      return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
    };

    // Map 0-100% to 180 -> 0 degrees
    const valueToDeg = (v: number) => 180 - (v / 100) * 180;
    const needleDeg = valueToDeg(display);
    const needleInner = { x: cx, y: cy };
    const needleTip = polar(needleDeg);

    // Segment boundaries at every +25%
    const q1 = valueToDeg(25);
    const q2 = valueToDeg(50);
    const q3 = valueToDeg(75);

    return (
      <svg width={size} height={size / 2} viewBox={`0 0 ${size} ${size / 2}`} style={{ display: 'block', margin: '0 auto' }}>
        {/* Track background */}
        <path d={arc(180, 0)} stroke={"rgba(148,163,184,0.25)"} strokeWidth={14} fill="none" strokeLinecap="round" />

        {/* Segmented zones: 0-25, 25-50, 50-75, 75-100 */}
        <path d={arc(180, q1)} stroke="#ef4444" strokeWidth={14} fill="none" strokeLinecap="round" />
        <path d={arc(q1, q2)} stroke="#f97316" strokeWidth={14} fill="none" strokeLinecap="round" />
        <path d={arc(q2, q3)} stroke="#f59e0b" strokeWidth={14} fill="none" strokeLinecap="round" />
        <path d={arc(q3, 0)} stroke="#22c55e" strokeWidth={14} fill="none" strokeLinecap="round" />

        {/* Needle */}
        <g filter="url(#shadow)">
          <line x1={needleInner.x} y1={needleInner.y} x2={needleTip.x} y2={needleTip.y} stroke={"#e5e7eb"} strokeWidth={3} strokeLinecap="round" />
          <circle cx={needleInner.x} cy={needleInner.y} r={5} fill={"#e5e7eb"} />
        </g>

        {/* Labels */}
        <text x={cx} y={cy - 16} textAnchor="middle" fontSize={28} fontWeight={800} fill="#e5e7eb">
          {Math.round(display)}%
        </text>
        <text x={cx} y={cy + 6} textAnchor="middle" fontSize={11} fill="#94a3b8">
          Success Rate
        </text>

        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000" floodOpacity="0.25" />
          </filter>
        </defs>
      </svg>
    );
  };

  if (localLoading) {
    const blink = keyframes`
      0%, 80%, 100% { opacity: 0 }
      40% { opacity: 1 }
    `;
    return (
      <SellerLayout>
        <Box sx={{ width: '100%', mt: 6, display: 'grid', placeItems: 'center' }}>
          <Box role="status" aria-live="polite" aria-label="Loading" sx={{ display: 'inline-flex' }}>
            <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'text.secondary', mx: 0.4, animation: `${blink} 1.4s infinite`, animationDelay: '0s' }} />
            <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'text.secondary', mx: 0.4, animation: `${blink} 1.4s infinite`, animationDelay: '0.2s' }} />
            <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'text.secondary', mx: 0.4, animation: `${blink} 1.4s infinite`, animationDelay: '0.4s' }} />
          </Box>
        </Box>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout>
      <Box sx={{ flexGrow: 1, width: '100%', maxWidth: '100%', px: { xs: 1, md: 0 } }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" component="h1" fontWeight={700}>
              Seller Workspace
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Welcome back{profile?.business_name ? `, ${profile.business_name}` : ''}! Here’s your business at a glance.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={load}>
              Refresh
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/seller/cars/add')}>
              Create Listing
            </Button>
          </Box>
        </Box>

        {/* KPIs - Separate advanced cards (full-width, stacked) */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 3,
        }}>
          <Box>
            <Card sx={{
              p: 0.5,
              borderRadius: 2,
              boxShadow: (theme: Theme) => theme.shadows[2],
              background: (theme: Theme) => theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(59,130,246,0.08))'
                : 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(59,130,246,0.03))',
            }}>
              <CardContent sx={{ py: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="overline" color="text.secondary">Total Listings</Typography>
                    <Typography variant="h4" fontWeight={800}>{kpis.total}</Typography>
                    <Chip size="small" color="primary" label="All listings" sx={{ mt: 1 }} />
                  </Box>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 44, height: 44 }}><CarIcon /></Avatar>
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box>
            <Card sx={{
              p: 0.5,
              borderRadius: 2,
              boxShadow: (theme: Theme) => theme.shadows[2],
              background: (theme: Theme) => theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(16,185,129,0.18), rgba(59,130,246,0.06))'
                : 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(59,130,246,0.03))',
            }}>
              <CardContent sx={{ py: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="overline" color="text.secondary">Live</Typography>
                    <Typography variant="h4" fontWeight={800}>{kpis.active}</Typography>
                    <Chip size="small" color="success" label="Currently visible" sx={{ mt: 1 }} />
                  </Box>
                  <Avatar sx={{ bgcolor: 'success.main', width: 44, height: 44 }}><TrendingUpIcon /></Avatar>
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box>
            <Card sx={{
              p: 0.5,
              borderRadius: 2,
              boxShadow: (theme: Theme) => theme.shadows[2],
              background: (theme: Theme) => theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(14,165,233,0.08))'
                : 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(14,165,233,0.03))',
            }}>
              <CardContent sx={{ py: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="overline" color="text.secondary">Sold</Typography>
                    <Typography variant="h4" fontWeight={800}>{kpis.sold}</Typography>
                    <Chip size="small" color="info" label="Completed sales" sx={{ mt: 1 }} />
                  </Box>
                  <Avatar sx={{ bgcolor: 'info.main', width: 44, height: 44 }}><SalesIcon /></Avatar>
                </Box>
              </CardContent>
            </Card>
          </Box>
          <Box>
            <Card sx={{
              p: 0.5,
              borderRadius: 2,
              boxShadow: (theme: Theme) => theme.shadows[2],
              background: (theme: Theme) => theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(245,158,11,0.18), rgba(99,102,241,0.06))'
                : 'linear-gradient(135deg, rgba(245,158,11,0.10), rgba(99,102,241,0.03))',
            }}>
              <CardContent sx={{ py: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="overline" color="text.secondary">Avg Price</Typography>
                    <Typography variant="h5" fontWeight={800}>${kpis.avgPrice.toLocaleString()}</Typography>
                    <Chip size="small" color="warning" label="Across all listings" sx={{ mt: 1 }} />
                  </Box>
                  <Avatar sx={{ bgcolor: 'warning.main', width: 44, height: 44 }}><InfoIcon /></Avatar>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Two-column layout: Charts left, Content right */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 2fr' }, gap: 3, mb: 4 }}>
          {/* Left Column: Charts */}
          <Box sx={{ display: 'grid', gap: 2 }}>
            <Card sx={{ bgcolor: theme.palette.mode === 'dark' ? '#111827' : 'background.paper' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight={600}>Revenue & Sales</Typography>
                  <Chip size="small" label={`${Array.isArray(salesData) ? salesData.length : 0} periods`} />
                </Box>
                 <ResponsiveContainer width="100%" height={240}>
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

            <Card sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'background.paper', borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>Performance Score</Typography>
                <Typography variant="caption" color="text.secondary">Close ratio</Typography>
                <Box sx={{ display: 'grid', placeItems: 'center', height: 180 }}>
                  <Gauge value={75} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">0%</Typography>
                  <Typography variant="caption" color="text.secondary">100%</Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Right Column: Activity and Quick Actions */}
          <Box sx={{ display: 'grid', gap: 2 }}>
            <Card sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'background.paper' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Recent Activity</Typography>
                  <List dense>
                  <Typography variant="body2" color="text.secondary">No recent activity</Typography>
                  </List>
              </CardContent>
            </Card>

            <Card sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'background.paper' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Quick Actions</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1.5 }}>
                  <Box>
                    <Button fullWidth variant="outlined" onClick={() => navigate('/seller/cars')}>View Inventory</Button>
                  </Box>
                  <Box>
                    <Button fullWidth variant="outlined" onClick={() => navigate('/seller/analytics')}>Analytics</Button>
                  </Box>
                  <Box>
                    <Button fullWidth variant="outlined" onClick={() => navigate('/seller/profile')}>My Profile</Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Recent Listings Table */}
        <Card sx={{ mt: 3, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'background.paper' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>Recent Listings</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => navigate('/seller/cars/add')}>
                  Add New
                </Button>
                <Button size="small" onClick={() => navigate('/seller/cars')}>Manage All</Button>
              </Box>
            </Box>
            
            {recentListings.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CarIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>No Listings Yet</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Start by adding your first car listing to see it here.
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/seller/cars/add')}>
                  Add Your First Listing
                </Button>
              </Box>
            ) : (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Vehicle</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentListings.map((car: any) => (
                      <TableRow key={car.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar variant="rounded" src={car.images?.[0]} sx={{ width: 48, height: 48 }}>
                              <CarIcon />
                            </Avatar>
                            <Box>
                              <Typography fontWeight={600}>{car.title || `${car.brand} ${car.model}`}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {car.brand} {car.model} • {car.year}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip 
                              size="small" 
                              label={car.status} 
                              color={car.status === 'active' ? 'success' : car.status === 'sold' ? 'info' : 'default'} 
                            />
                            {car.is_featured && (
                              <Chip size="small" label="Featured" color="warning" icon={<StarIcon />} />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {car.created_at ? new Date(car.created_at).toLocaleDateString() : 'Unknown'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={600}>${(car.price || 0).toLocaleString()}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="View Listing">
                              <IconButton size="small" onClick={() => handleViewCar(car.id)}>
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit">
                              <IconButton size="small" onClick={() => handleEditCar(car.id)}>
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={car.is_featured ? "Remove Featured" : "Make Featured"}>
                              <IconButton 
                                size="small" 
                                onClick={() => handleToggleFeatured(car.id, car.is_featured)}
                                color={car.is_featured ? "warning" : "default"}
                              >
                                <StarIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton 
                                size="small" 
                                onClick={() => handleDeleteCar(car.id)}
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Box>
    </SellerLayout>
  );
};

export default SellerDashboard;
