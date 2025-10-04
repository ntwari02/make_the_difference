import React, { useState } from 'react';
import { Box, Button, Typography, Card, Chip } from '@mui/material';
import { DeleteForever, Visibility, VisibilityOff } from '@mui/icons-material';

/**
 * SessionDebugger - A dev tool to view and clear session data
 * Only show this in development! Remove before production.
 */
const SessionDebugger: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  const getStorageData = () => {
    const data: any = {};
    
    // Get localStorage
    data.localStorage = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        data.localStorage[key] = localStorage.getItem(key);
      }
    }

    // Get sessionStorage
    data.sessionStorage = {};
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        data.sessionStorage[key] = sessionStorage.getItem(key);
      }
    }

    return data;
  };

  const clearAllStorage = () => {
    if (window.confirm('⚠️ Clear ALL storage data? This will log you out!')) {
      localStorage.clear();
      sessionStorage.clear();
      alert('✅ All storage cleared! Reloading page...');
      window.location.reload();
    }
  };

  const data = getStorageData();
  const hasData = Object.keys(data.localStorage).length > 0 || Object.keys(data.sessionStorage).length > 0;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 9999,
      }}
    >
      {/* Toggle Button */}
      <Button
        variant="contained"
        onClick={() => setIsVisible(!isVisible)}
        sx={{
          minWidth: 'auto',
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
          '&:hover': {
            background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
            transform: 'scale(1.05)',
          },
        }}
      >
        {isVisible ? <VisibilityOff /> : <Visibility />}
      </Button>

      {/* Debug Panel */}
      {isVisible && (
        <Card
          sx={{
            position: 'absolute',
            bottom: 70,
            right: 0,
            width: 400,
            maxHeight: 500,
            overflow: 'auto',
            p: 2,
            background: 'rgba(22, 33, 62, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(102, 126, 234, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ color: '#667eea' }}>
            🔍 Session Debugger
          </Typography>

          {/* Current User */}
          {data.localStorage.user && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ color: '#94a3b8', mb: 1 }}>
                Current User:
              </Typography>
              <Box sx={{ p: 1, background: 'rgba(0,0,0,0.3)', borderRadius: 1 }}>
                <pre style={{ margin: 0, fontSize: 11, color: '#e2e8f0', overflow: 'auto' }}>
                  {JSON.stringify(JSON.parse(data.localStorage.user), null, 2)}
                </pre>
              </Box>
            </Box>
          )}

          {/* Tokens */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ color: '#94a3b8', mb: 1 }}>
              Tokens:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {data.localStorage.access_token && (
                <Chip label="Access Token ✅" size="small" color="success" />
              )}
              {data.localStorage.refresh_token && (
                <Chip label="Refresh Token ✅" size="small" color="success" />
              )}
              {!data.localStorage.access_token && !data.localStorage.refresh_token && (
                <Chip label="No Tokens ❌" size="small" color="error" />
              )}
            </Box>
          </Box>

          {/* All Storage Keys */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ color: '#94a3b8', mb: 1 }}>
              LocalStorage Keys ({Object.keys(data.localStorage).length}):
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {Object.keys(data.localStorage).map((key) => (
                <Chip
                  key={key}
                  label={key}
                  size="small"
                  variant="outlined"
                  sx={{ color: '#cbd5e1', borderColor: '#475569' }}
                />
              ))}
            </Box>
          </Box>

          {/* Clear Button */}
          <Button
            variant="contained"
            fullWidth
            startIcon={<DeleteForever />}
            onClick={clearAllStorage}
            disabled={!hasData}
            sx={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              },
              mb: 1,
            }}
          >
            🚪 Logout & Clear All
          </Button>
          
          <Button
            variant="outlined"
            fullWidth
            onClick={() => {
              const data = getStorageData();
              console.log('🔍 Current Session Data:', data);
              alert('Session data logged to console. Check browser dev tools.');
            }}
            sx={{
              borderColor: '#667eea',
              color: '#667eea',
              '&:hover': {
                borderColor: '#5a6fd8',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
              },
            }}
          >
            📋 View Session Data
          </Button>
        </Card>
      )}
    </Box>
  );
};

export default SessionDebugger;

