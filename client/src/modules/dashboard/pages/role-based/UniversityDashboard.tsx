import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { PageContainer } from '../../../../shared/components/layout/Containers';

const UniversityDashboard: React.FC = () => {
  return (
    <PageContainer maxWidth="xl">
      <Card>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            🎓 University Dashboard
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Manage scholarships, track applications, and analyze student success
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Coming soon with scholarship management and AI-powered matching
          </Typography>
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default UniversityDashboard;
