import React from 'react';
import { Box, Card, CardContent, Typography, GridLegacy as Grid, useTheme } from '@mui/material';
import UniversityLayout from '../components/layout/UniversityLayout';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { getTooltipProps, getGridProps, getXAxisProps, getYAxisProps, getLegendStyle } from '../../../shared/charts/rechartsTheme';

const UniversityAnalytics: React.FC = () => {
  const theme = useTheme();

  // Mock analytics data
  const monthly = [
    { month: 'Jan', submitted: 120, approved: 40, awardRate: 33 },
    { month: 'Feb', submitted: 150, approved: 55, awardRate: 37 },
    { month: 'Mar', submitted: 140, approved: 52, awardRate: 37 },
    { month: 'Apr', submitted: 180, approved: 70, awardRate: 39 },
    { month: 'May', submitted: 200, approved: 85, awardRate: 42 },
    { month: 'Jun', submitted: 210, approved: 92, awardRate: 44 },
  ];

  return (
    <UniversityLayout>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={700}>Analytics</Typography>
        <Typography variant="body2" color="text.secondary">Scholarship and applications overview</Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, border: (t) => `1px solid ${t.palette.divider}` }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Monthly Submissions vs Approvals</Typography>
              <Box height={320}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthly}>
                    <defs>
                      <linearGradient id="submittedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={theme.palette.primary.main} stopOpacity={0.85} />
                        <stop offset="100%" stopColor={theme.palette.primary.main} stopOpacity={0.3} />
                      </linearGradient>
                      <linearGradient id="approvedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={theme.palette.success.main} stopOpacity={0.85} />
                        <stop offset="100%" stopColor={theme.palette.success.main} stopOpacity={0.3} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid {...getGridProps(theme)} />
                    <XAxis dataKey="month" {...getXAxisProps(theme)} />
                    <YAxis {...getYAxisProps(theme)} />
                    <Tooltip {...getTooltipProps(theme)} />
                    <Legend wrapperStyle={getLegendStyle(theme)} />
                    <Bar dataKey="submitted" name="Submitted" fill="url(#submittedGradient)" radius={[8,8,0,0]} maxBarSize={48} />
                    <Bar dataKey="approved" name="Approved" fill="url(#approvedGradient)" radius={[8,8,0,0]} maxBarSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, border: (t) => `1px solid ${t.palette.divider}` }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Award Rate Trend</Typography>
              <Box height={320}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthly}>
                    <CartesianGrid {...getGridProps(theme)} />
                    <XAxis dataKey="month" {...getXAxisProps(theme)} />
                    <YAxis {...getYAxisProps(theme)} />
                    <Tooltip {...getTooltipProps(theme)} />
                    <Legend wrapperStyle={getLegendStyle(theme)} />
                    <Line type="monotone" dataKey="awardRate" name="Award Rate %" stroke={theme.palette.info.main} strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </UniversityLayout>
  );
};

export default UniversityAnalytics;


