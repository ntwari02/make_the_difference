import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { PageContainer } from '../../../../shared/components/layout/Containers';

const AdvertiserDashboard: React.FC = () => {
  return (
    <PageContainer maxWidth="xl">
      <Card>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            📢 Advertiser Dashboard
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Manage ad campaigns, track performance, and optimize targeting
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Coming soon with campaign management and AI-powered targeting
          </Typography>
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default AdvertiserDashboard;
