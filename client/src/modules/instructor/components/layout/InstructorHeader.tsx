import React from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton, Avatar, useTheme } from '@mui/material';
import { Notifications as NotificationsIcon, DarkMode as DarkModeIcon, LightMode as LightModeIcon } from '@mui/icons-material';
import { useThemeMode } from '../../../../core/theme/ThemeProvider';

const InstructorHeader: React.FC = () => {
  const theme = useTheme();
  const { mode, toggleColorMode } = useThemeMode();
  const isDark = mode === 'dark';

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        borderBottom: (t) => `1px solid ${t.palette.divider}`,
        zIndex: theme.zIndex.drawer + 1,
        bgcolor: theme.palette.mode === 'dark' ? '#16213e' : '#ffffff',
        color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary,
      }}
    >
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Instructor Portal
        </Typography>
        <Box>
          <IconButton
            onClick={toggleColorMode}
            sx={{ mr: 1, color: theme.palette.mode === 'dark' ? '#ffffff' : theme.palette.text.primary }}
            aria-label="Toggle color mode"
          >
            {isDark ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
          <IconButton color="inherit" aria-label="Notifications">
            <NotificationsIcon />
          </IconButton>
          <IconButton color="inherit" aria-label="Profile">
            <Avatar sx={{ width: 32, height: 32 }} />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default InstructorHeader;


