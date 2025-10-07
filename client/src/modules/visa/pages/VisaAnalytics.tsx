import React from 'react';
import { Box, Card, CardContent, Typography, GridLegacy as Grid, useTheme } from '@mui/material';
import VisaLayout from '../components/layout/VisaLayout';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, BarChart, Bar } from 'recharts';
import { getTooltipProps, getGridProps, getXAxisProps, getYAxisProps, getLegendStyle } from '../../../shared/charts/rechartsTheme';

const VisaAnalytics: React.FC = () => {
  const theme = useTheme();
  const monthly = [
    { month: 'Jan', submitted: 80, approved: 30, rate: 38 },
    { month: 'Feb', submitted: 95, approved: 40, rate: 42 },
    { month: 'Mar', submitted: 110, approved: 45, rate: 41 },
    { month: 'Apr', submitted: 120, approved: 55, rate: 46 },
    { month: 'May', submitted: 140, approved: 60, rate: 43 },
    { month: 'Jun', submitted: 150, approved: 62, rate: 41 },
  ];

  return (
    <VisaLayout>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={700}>Analytics</Typography>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, border: (t) => `1px solid ${t.palette.divider}` }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Submissions vs Approvals</Typography>
              <Box height={320}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthly}>
                    <CartesianGrid {...getGridProps(theme)} />
                    <XAxis dataKey="month" {...getXAxisProps(theme)} />
                    <YAxis {...getYAxisProps(theme)} />
                    <Tooltip {...getTooltipProps(theme)} />
                    <Legend wrapperStyle={getLegendStyle(theme)} />
                    <Bar dataKey="submitted" name="Submitted" fill={theme.palette.primary.main} radius={[8,8,0,0]} maxBarSize={48} />
                    <Bar dataKey="approved" name="Approved" fill={theme.palette.success.main} radius={[8,8,0,0]} maxBarSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, border: (t) => `1px solid ${t.palette.divider}` }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Approval Rate Trend</Typography>
              <Box height={320}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthly}>
                    <CartesianGrid {...getGridProps(theme)} />
                    <XAxis dataKey="month" {...getXAxisProps(theme)} />
                    <YAxis {...getYAxisProps(theme)} />
                    <Tooltip {...getTooltipProps(theme)} />
                    <Legend wrapperStyle={getLegendStyle(theme)} />
                    <Line type="monotone" dataKey="rate" name="Rate %" stroke={theme.palette.info.main} strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </VisaLayout>
  );
};

export default VisaAnalytics;


