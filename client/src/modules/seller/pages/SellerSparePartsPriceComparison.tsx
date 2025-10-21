import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
  LinearProgress,
  Tooltip
} from '@mui/material';
import {
  Compare as CompareIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import SellerLayout from '../components/layout/SellerLayout';

const SellerSparePartsPriceComparison: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
  const [priceData, setPriceData] = React.useState([
    {
      id: 1,
      partName: 'Oil Filter',
      yourPrice: 12.99,
      competitorPrices: [
        { name: 'AutoZone', price: 15.99 },
        { name: 'Advance Auto', price: 14.50 },
        { name: 'NAPA', price: 16.25 }
      ],
      marketAvg: 15.58,
      yourRank: 1,
      savings: 2.59
    },
    {
      id: 2,
      partName: 'Brake Pads',
      yourPrice: 45.99,
      competitorPrices: [
        { name: 'AutoZone', price: 42.99 },
        { name: 'Advance Auto', price: 48.50 },
        { name: 'NAPA', price: 52.25 }
      ],
      marketAvg: 47.91,
      yourRank: 2,
      savings: -2.00
    },
    {
      id: 3,
      partName: 'Air Filter',
      yourPrice: 8.99,
      competitorPrices: [
        { name: 'AutoZone', price: 12.99 },
        { name: 'Advance Auto', price: 11.50 },
        { name: 'NAPA', price: 13.25 }
      ],
      marketAvg: 12.58,
      yourRank: 1,
      savings: 3.59
    }
  ]);

  const handleRefreshPrices = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  const getPriceStatus = (savings: number) => {
    if (savings > 0) return { color: 'success', icon: <CheckCircleIcon />, text: 'Competitive' };
    if (savings > -2) return { color: 'warning', icon: <WarningIcon />, text: 'Close' };
    return { color: 'error', icon: <WarningIcon />, text: 'Overpriced' };
  };

  return (
    <SellerLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CompareIcon sx={{ fontSize: 32, color: 'secondary.main' }} />
            <Typography variant="h4" fontWeight={600}>
              Price Comparison
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefreshPrices}
            disabled={loading}
            sx={{ px: 3 }}
          >
            Refresh Prices
          </Button>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          Compare your prices with competitors to stay competitive in the market. Data is updated daily.
        </Alert>

        {loading && <LinearProgress sx={{ mb: 3 }} />}

        <Grid container spacing={8} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CheckCircleIcon sx={{ color: 'success.main' }} />
                  <Typography variant="h6" fontWeight={600}>
                    Competitive Items
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={700} color="success.main">
                  {priceData.filter(item => item.savings > 0).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Items priced below market average
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <WarningIcon sx={{ color: 'warning.main' }} />
                  <Typography variant="h6" fontWeight={600}>
                    Close Pricing
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={700} color="warning.main">
                  {priceData.filter(item => item.savings <= 0 && item.savings > -2).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Items within 2% of market average
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <WarningIcon sx={{ color: 'error.main' }} />
                  <Typography variant="h6" fontWeight={600}>
                    Overpriced
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={700} color="error.main">
                  {priceData.filter(item => item.savings <= -2).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Items above market average
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Price Comparison Details
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Part Name</TableCell>
                    <TableCell align="right">Your Price</TableCell>
                    <TableCell align="right">Market Avg</TableCell>
                    <TableCell align="right">Savings</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Rank</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {priceData.map((item) => {
                    const status = getPriceStatus(item.savings);
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {item.partName}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="subtitle2" fontWeight={600}>
                            ${item.yourPrice}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            ${item.marketAvg.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                            {item.savings > 0 ? (
                              <TrendingDownIcon sx={{ color: 'success.main', fontSize: 16 }} />
                            ) : (
                              <TrendingUpIcon sx={{ color: 'error.main', fontSize: 16 }} />
                            )}
                            <Typography 
                              variant="body2" 
                              color={item.savings > 0 ? 'success.main' : 'error.main'}
                              fontWeight={600}
                            >
                              ${Math.abs(item.savings).toFixed(2)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            icon={status.icon}
                            label={status.text}
                            color={status.color as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={`#${item.yourRank}`}
                            color={item.yourRank === 1 ? 'success' : item.yourRank === 2 ? 'warning' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="View Competitor Details">
                            <IconButton size="small">
                              <CompareIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Pricing Recommendations
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Alert severity="success" icon={<CheckCircleIcon />}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Oil Filter & Air Filter
                  </Typography>
                  <Typography variant="body2">
                    Your prices are competitive. Consider maintaining current pricing.
                  </Typography>
                </Alert>
              </Grid>
              <Grid item xs={12} md={6}>
                <Alert severity="warning" icon={<WarningIcon />}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Brake Pads
                  </Typography>
                  <Typography variant="body2">
                    Consider reducing price by $2-3 to improve competitiveness.
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </SellerLayout>
  );
};

export default SellerSparePartsPriceComparison;
