import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { PageContainer } from '../../../../shared/components/layout/Containers';

const VisaOfficerDashboard: React.FC = () => {
  return (
    <PageContainer maxWidth="xl">
      <Card>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            🛂 Visa Officer Dashboard
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Process visa applications, manage workflows, and track approvals
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Coming soon with application processing and workflow management
          </Typography>
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default VisaOfficerDashboard;
