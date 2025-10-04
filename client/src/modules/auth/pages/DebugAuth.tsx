import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Button, Chip, Alert, LinearProgress, Divider } from '@mui/material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../../core/store';
import { redirectToDashboard } from '../../../core/utils/roleRedirect';

const DebugAuth: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, error } = useSelector((state: RootState) => state.auth);
  const [refreshCount, setRefreshCount] = useState(0);

  // Auto-refresh every 3 seconds to catch real-time changes
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshCount(prev => prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const localStorageUser = localStorage.getItem('user') || localStorage.getItem('user_data');
  const parsedLSUser = localStorageUser ? JSON.parse(localStorageUser) : null;

  const testDealerLogin = async () => {
    console.log('🧪 Testing dealer login...');
    try {
      const response = await fetch(['http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: 'dealer@example.com',
          password: 'password',
          remember_me: true
        }),
      });

      const data = await response.json();
      console.log('🎯 Login response:', data);
      
      if (response.ok) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('user_data', JSON.stringify(data.user));
        localStorage.setItem('user', JSON.stringify(data.user));
        console.log('✅ Test login successful - role:', data.user.role);
      } else {
        console.error('❌ Login failed:', data);
      }
    } catch (error) {
      console.error('❌ Login error:', error);
    }
  };

  const clearAllStorage = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1000, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom color="error">
        🔧 Debug Auth ({refreshCount > 0 && `${refreshCount} refreshes`})
      </Typography>

      <Alert severity="warning" sx={{ mb: 3 }}>
        This debug page refreshes every 3 seconds. Use the test buttons to diagnose issue.
        {isLoading && <LinearProgress sx={{ mt: 1 }} />}
      </Alert>

      {/* Redux vs LocalStorage Comparison */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🎯 Role Detection Analysis
          </Typography>

          <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', my: 2 }}>
            <Box>
              <Typography variant="body2" fontWeight="bold">Redux Role:</Typography>
              <Chip 
                label={user?.role || 'None'} 
                color={user?.role === 'dealer' ? 'success' : user?.role === 'buyer' ? 'warning' : 'default'}
                sx={{ mt: 1 }}
              />
            </Box>

            <Box>
              <Typography variant="body2" fontWeight="bold">Storage Role:</Typography>
              <Chip 
                label={parsedLSUser?.role || 'None'} 
                color={parsedLSUser?.role === 'dealer' ? 'success' : parsedLSUser?.role === 'buyer' ? 'warning' : 'default'}
                sx={{ mt: 1 }}
              />
            </Box>

            <Box>
              <Typography variant="body2" fontWeight="bold">Expected:</Typography>
              <Chip label="dealer" color="success" sx={{ mt: 1 }} />
            </Box>
          </Box>

          {/* Issue Detection */}
          {parsedLSUser?.role === 'buyer' && (
            <Alert severity="error" sx={{ mb: 2 }}>
              ❌ <strong>ISSUE FOUND:</strong> User has 'buyer' role instead of 'dealer'. 
              The backend API or database has incorrect user role data.
            </Alert>
          )}

          {parsedLSUser?.role === 'dealer' && (
            <Alert severity="success" sx={{ mb: 2 }}>
              ✅ <strong>CORRECT:</strong> User has 'dealer' role. Frontend should redirect to dealer dashboard.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Detailed Data */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Redux Store Data
            </Typography>
            <Typography variant="body2">
              <strong>Is Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}
            </Typography>
            <Typography variant="body2">
              <strong>Is Loading:</strong> {isLoading ? '⏳ Yes' : '✅ No'}
            </Typography>
            <Typography variant="body2">
              <strong>Error:</strong> {error || '✅ None'}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
              {user ? JSON.stringify(user, null, 2) : 'No user data'}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              LocalStorage Data
            </Typography>
            <Typography variant="body2">
              <strong>Access Token:</strong> {localStorage.getItem('access_token') ? '✅ Present' : '❌ Missing'}
            </Typography>
            <Typography variant="body2">
              <strong>Refresh Token:</strong> {localStorage.getItem('refresh_token') ? '✅ Present' : '❌ Missing'}
            </Typography>
            <Typography variant="body2">
              <strong>User Data:</strong> {localStorage.getItem('user_data') ? '✅ Present' : '❌ Missing'}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
              {parsedLSUser ? JSON.stringify(parsedLSUser, null, 2) : 'No user data'}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Test Actions */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🔬 Test Actions
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="success"
              onClick={testDealerLogin}
            >
              🧪 Test Dealer Login API
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                if (parsedLSUser) {
                  console.log('🎯 Testing redirect with storage user:', parsedLSUser);
                  redirectToDashboard(parsedLSUser, navigate);
                }
              }}
              disabled={!parsedLSUser}
            >
              🎯 Test Storage Redirect
            </Button>

            <Button
              variant="outlined"
              onClick={() => {
                if (user) {
                  console.log('🎯 Testing redirect with Redux user:', user);
                  redirectToDashboard(user, navigate);
                }
              }}
              disabled={!user}
            >
              🎯 Test Redux Redirect
            </Button>

            <Button
              variant="outlined"
              color="info"
              onClick={() => window.location.reload()}
            >
              🔄 Refresh Page
            </Button>

            <Button
              variant="outlined"
              color="error"
              onClick={clearAllStorage}
            >
              🗑️ Clear All Storage
            </Button>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              💡 <strong>Quick Test:</strong> Click "Test Dealer Login API" to see if role is correct from backend.
              If role comes back as 'buyer', fix the user record in database.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DebugAuth;