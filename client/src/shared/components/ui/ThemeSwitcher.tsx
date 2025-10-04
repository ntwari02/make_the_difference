import React from 'react';
import { IconButton, Tooltip, Box } from '@mui/material';
import { DarkMode, LightMode } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import toast from 'react-hot-toast';
import { useThemeMode } from '../../../core/theme/ThemeProvider';

interface ThemeSwitcherProps {
  size?: 'small' | 'medium' | 'large';
  position?: 'fixed' | 'static' | 'absolute';
  showLabel?: boolean;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ 
  size = 'medium', 
  position = 'fixed',
  showLabel = false 
}) => {
  const theme = useTheme();
  const { mode, toggleColorMode } = useThemeMode();
  const isDark = mode === 'dark';

  const toggleTheme = () => {
    toggleColorMode();
    toast.success(`Switched to ${isDark ? 'light' : 'dark'} mode`);
  };

  const Icon = isDark ? LightMode : DarkMode;
  const tooltipText = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';

  const buttonStyles = {
    fontSize: size === 'small' ? 20 : size === 'medium' ? 24 : 28,
  };

  const containerStyles = position === 'fixed' ? {
    position: 'fixed',
    top: 20,
    right: 20,
    zIndex: 1000,
  } : {};

  return (
    <Box sx={containerStyles}>
      <Tooltip title={tooltipText} arrow>
        <IconButton
          onClick={toggleTheme}
          sx={{
            bgcolor: 'background.paper',
            border: `2px solid ${theme.palette.text.secondary}`,
            '&:hover': {
              bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              transform: 'scale(1.1)',
            },
            transition: 'all 0.3s ease',
            boxShadow: theme.shadows[4],
          }}
        >
          <Icon sx={buttonStyles} />
        </IconButton>
      </Tooltip>
      {showLabel && (
        <Box sx={{ 
          mt: 1, 
          fontSize: '0.75rem', 
          textAlign: 'center',
          color: 'text.secondary' 
        }}>
          {isDark ? 'Light' : 'Dark'} Mode
        </Box>
      )}
    </Box>
  );
};

export default ThemeSwitcher;
