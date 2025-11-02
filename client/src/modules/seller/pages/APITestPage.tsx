import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../core/store';
import { sellerApi } from '../services/sellerApi';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Chip,
} from '@mui/material';

const APITestPage: React.FC = () => {
  const authUser = useSelector((s: RootState) => s.auth.user);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>({});
  const [error, setError] = useState<string | null>(null);

  const testAPI = async () => {
    setLoading(true);
    setError(null);
    setResults({});

    try {
      console.log('Testing API endpoints...');
      
      // Test 1: Check auth user
      const userInfo = {
        user: authUser,
        sellerId: (authUser as any)?.id || (authUser as any)?._id,
        token: localStorage.getItem('access_token')
      };
      
      // Test 2: Test categories endpoint
      let categoriesResult;
      try {
        const categories = await sellerApi.spareParts.getCategories();
        categoriesResult = { success: true, data: categories, count: categories?.length || 0 };
      } catch (err: any) {
        categoriesResult = { success: false, error: err.message, status: err.response?.status };
      }

      // Test 3: Test brands endpoint
      let brandsResult;
      try {
        const brands = await sellerApi.spareParts.getBrands();
        brandsResult = { success: true, data: brands, count: brands?.length || 0 };
      } catch (err: any) {
        brandsResult = { success: false, error: err.message, status: err.response?.status };
      }

      setResults({
        userInfo,
        categories: categoriesResult,
        brands: brandsResult
      });

    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        API Test Page
      </Typography>

      <Button 
        variant="contained" 
        onClick={testAPI} 
        disabled={loading}
        sx={{ mb: 3 }}
      >
        {loading ? <CircularProgress size={20} /> : 'Test API Endpoints'}
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {Object.keys(results).length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Test Results
            </Typography>

            {/* User Info */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                User Information
              </Typography>
              <Typography variant="body2" color="text.secondary">
                User: {results.userInfo?.user ? 'Logged in' : 'Not logged in'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Seller ID: {results.userInfo?.sellerId || 'None'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Token: {results.userInfo?.token ? 'Present' : 'Missing'}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Categories Test */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Categories Endpoint
              </Typography>
              <Chip 
                label={results.categories?.success ? 'Success' : 'Failed'} 
                color={results.categories?.success ? 'success' : 'error'}
                size="small"
                sx={{ mr: 1 }}
              />
              {results.categories?.success ? (
                <Typography variant="body2" color="text.secondary">
                  Found {results.categories.count} categories
                </Typography>
              ) : (
                <Typography variant="body2" color="error">
                  Error: {results.categories?.error} (Status: {results.categories?.status})
                </Typography>
              )}
            </Box>

            {/* Brands Test */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Brands Endpoint
              </Typography>
              <Chip 
                label={results.brands?.success ? 'Success' : 'Failed'} 
                color={results.brands?.success ? 'success' : 'error'}
                size="small"
                sx={{ mr: 1 }}
              />
              {results.brands?.success ? (
                <Typography variant="body2" color="text.secondary">
                  Found {results.brands.count} brands
                </Typography>
              ) : (
                <Typography variant="body2" color="error">
                  Error: {results.brands?.error} (Status: {results.brands?.status})
                </Typography>
              )}
            </Box>


            {/* Raw Results */}
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Raw Results
            </Typography>
            <Box sx={{ 
              backgroundColor: 'grey.100', 
              p: 2, 
              borderRadius: 1,
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              overflow: 'auto',
              maxHeight: 400
            }}>
              <pre>{JSON.stringify(results, null, 2)}</pre>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default APITestPage;
