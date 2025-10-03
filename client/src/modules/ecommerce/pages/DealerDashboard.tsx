import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  DirectionsCar,
  AttachMoney,
  Visibility,
  QuestionAnswer,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

// KPI Card Component
interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  color: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, change, changeLabel, icon, color }) => {
  const isPositive = change && change > 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        sx={{
          background: 'linear-gradient(135deg, #2d3561 0%, #1f2544 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 3,
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)',
          },
          transition: 'all 0.3s ease',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Icon */}
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${color}20, ${color}40)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
              color: color,
            }}
          >
            {icon}
          </Box>

          {/* Title */}
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              mb: 1,
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            {title}
          </Typography>

          {/* Value */}
          <Typography
            variant="h3"
            sx={{
              color: '#fff',
              fontWeight: 700,
              mb: 1,
              fontSize: { xs: '2rem', md: '2.5rem' },
            }}
          >
            {value}
          </Typography>

          {/* Change Indicator */}
          {change !== undefined && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {isPositive ? (
                <TrendingUp sx={{ color: '#10b981', fontSize: 20 }} />
              ) : (
                <TrendingDown sx={{ color: '#ef4444', fontSize: 20 }} />
              )}
              <Typography
                variant="body2"
                sx={{
                  color: isPositive ? '#10b981' : '#ef4444',
                  fontWeight: 600,
                }}
              >
                {change > 0 ? '+' : ''}{change}%
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'rgba(255, 255, 255, 0.5)', ml: 0.5 }}
              >
                {changeLabel || 'vs last month'}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Stats Card Component
interface StatsCardProps {
  title: string;
  items: { label: string; value: string | number }[];
}

const StatsCard: React.FC<StatsCardProps> = ({ title, items }) => {
  return (
    <Card
      sx={{
        background: 'linear-gradient(135deg, #2d3561 0%, #1f2544 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 3,
        height: '100%',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography
          variant="h6"
          sx={{ color: '#fff', mb: 3, fontWeight: 600 }}
        >
          {title}
        </Typography>
        {items.map((item, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
              pb: 2,
              borderBottom: index < items.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
            >
              {item.label}
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: '#fff', fontWeight: 600 }}
            >
              {item.value}
            </Typography>
          </Box>
        ))}
      </CardContent>
    </Card>
  );
};

// Vehicle Performance Card
const VehiclePerformanceCard: React.FC = () => {
  const vehicles = [
    { name: 'Toyota Camry 2023', views: 1234, inquiries: 45, percentage: 85 },
    { name: 'Honda Accord 2022', views: 987, inquiries: 32, percentage: 72 },
    { name: 'BMW X5 2023', views: 756, inquiries: 28, percentage: 65 },
    { name: 'Mercedes C-Class', views: 654, inquiries: 21, percentage: 58 },
    { name: 'Audi A4 2022', views: 543, inquiries: 18, percentage: 45 },
  ];

  return (
    <Card
      sx={{
        background: 'linear-gradient(135deg, #2d3561 0%, #1f2544 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 3,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography
          variant="h6"
          sx={{ color: '#fff', mb: 3, fontWeight: 600 }}
        >
          Top Performing Listings
        </Typography>
        {vehicles.map((vehicle, index) => (
          <Box key={index} sx={{ mb: 3 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1,
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: '#fff', fontWeight: 500 }}
              >
                {vehicle.name}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
              >
                {vehicle.views} views • {vehicle.inquiries} inquiries
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={vehicle.percentage}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: 4,
                },
              }}
            />
          </Box>
        ))}
      </CardContent>
    </Card>
  );
};

const DealerDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        }}
      >
        <Typography sx={{ color: '#fff' }}>Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              color: '#fff',
              fontWeight: 700,
              mb: 1,
            }}
          >
            Dealer Dashboard
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            Welcome back! Here's what's happening with your listings today.
          </Typography>
        </Box>

        {/* KPI Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Total Listings"
              value={24}
              change={8}
              changeLabel="vs last month"
              icon={<DirectionsCar sx={{ fontSize: 28 }} />}
              color="#3b82f6"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Sales This Month"
              value="$45.2K"
              change={12.5}
              changeLabel="vs last month"
              icon={<AttachMoney sx={{ fontSize: 28 }} />}
              color="#10b981"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Total Views"
              value="12.4K"
              change={-2.3}
              changeLabel="vs last week"
              icon={<Visibility sx={{ fontSize: 28 }} />}
              color="#f59e0b"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KPICard
              title="Inquiries"
              value={156}
              change={18.2}
              changeLabel="vs last week"
              icon={<QuestionAnswer sx={{ fontSize: 28 }} />}
              color="#8b5cf6"
            />
          </Grid>
        </Grid>

        {/* Middle Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <VehiclePerformanceCard />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatsCard
              title="Listing Status"
              items={[
                { label: 'Active', value: 18 },
                { label: 'Pending', value: 4 },
                { label: 'Sold', value: 2 },
                { label: 'Expired', value: 3 },
              ]}
            />
          </Grid>
        </Grid>

        {/* Bottom Section */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <StatsCard
              title="Vehicle Types"
              items={[
                { label: 'Sedans', value: 12 },
                { label: 'SUVs', value: 8 },
                { label: 'Trucks', value: 3 },
                { label: 'Luxury', value: 1 },
              ]}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <StatsCard
              title="This Month"
              items={[
                { label: 'Revenue', value: '$45,200' },
                { label: 'Avg. Sale Price', value: '$22,600' },
                { label: 'Conversion Rate', value: '12.5%' },
                { label: 'Avg. Days Listed', value: '18 days' },
              ]}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default DealerDashboard;

