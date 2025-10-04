import React from 'react';
import { Button, Box, Typography } from '@mui/material';
import { Dashboard as DashboardIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../core/store';

/**
 * Component to navigate to dealer dashboard
 * Only shows if user has dealer or admin role
 */
const DealerDashboardLink: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  // Only show for dealer or admin roles
  if (!user || (user.role !== 'dealer' && user.role !== 'admin')) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Button
        variant="contained"
        startIcon={<DashboardIcon />}
        onClick={() => navigate('/dealer/dashboard')}
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #5a6fd8 0%, #6a3f8f 100%)',
          },
        }}
      >
        Go to Dashboard
      </Button>
      <Typography variant="caption" color="text.secondary">
        Access your dealer portal
      </Typography>
    </Box>
  );
};

export default DealerDashboardLink;

