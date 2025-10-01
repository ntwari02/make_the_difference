import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';

const AdminLayout: React.FC = () => {
  return (
    <Box sx={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <Outlet />
    </Box>
  );
};

export default AdminLayout;
