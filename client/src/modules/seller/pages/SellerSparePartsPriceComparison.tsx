import React, { useState, useEffect } from 'react';
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
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress
} from '@mui/material';
import {
  Compare as CompareIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import SellerLayout from '../components/layout/SellerLayout';
import { sparePartsApi } from '../services/sparePartsApi';
import toast from 'react-hot-toast';

interface PriceComparisonData {
  id: string;
  name: string;
  sku: string;
  our_price: number;
  our_currency: string;
  avg_competitor_price: number | null;
  min_competitor_price: number | null;
  max_competitor_price: number | null;
  competitor_count: number;
  savings: number;
  savings_percentage: number;
  rank: number | null;
  competitors: Array<{
    id?: string;
    competitor_name: string;
    competitor_url: string | null;
    competitor_price: number;
    competitor_currency: string | null;
    price_difference: number | null;
    price_difference_percentage: number | null;
    last_checked_at: string | null;
  }>;
}

const SellerSparePartsPriceComparison: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [priceData, setPriceData] = useState<PriceComparisonData[]>([]);
  const [selectedPart, setSelectedPart] = useState<PriceComparisonData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addingComparison, setAddingComparison] = useState(false);
  const [editingComparison, setEditingComparison] = useState<any>(null);
  const [deletingComparison, setDeletingComparison] = useState<string | null>(null);
  const [newComparison, setNewComparison] = useState({
    competitor_name: '',
    competitor_url: '',
    competitor_price: '',
    competitor_currency: 'USD'
  });

  useEffect(() => {
    fetchPriceComparisons();
  }, []);

  const fetchPriceComparisons = async () => {
    try {
      setLoading(true);
      const response = await sparePartsApi.getAllPriceComparisons();
      if (response.success && response.data) {
        setPriceData(response.data);
      } else {
        setPriceData([]);
      }
    } catch (error: any) {
      console.error('Failed to fetch price comparisons:', error);
      toast.error(error?.response?.data?.message || 'Failed to load price comparisons');
      setPriceData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshPrices = async () => {
    setRefreshing(true);
    await fetchPriceComparisons();
    setRefreshing(false);
    toast.success('Price comparisons refreshed');
  };

  const handleOpenDialog = (part: PriceComparisonData) => {
    setSelectedPart(part);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedPart(null);
    setEditingComparison(null);
    setDeletingComparison(null);
    setNewComparison({
      competitor_name: '',
      competitor_url: '',
      competitor_price: '',
      competitor_currency: 'USD'
    });
  };

  const handleAddComparison = async () => {
    if (!selectedPart || !newComparison.competitor_name || !newComparison.competitor_price) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setAddingComparison(true);
      const response = await sparePartsApi.addPriceComparison(selectedPart.id, {
        competitor_name: newComparison.competitor_name,
        competitor_url: newComparison.competitor_url || undefined,
        competitor_price: Number(newComparison.competitor_price),
        competitor_currency: newComparison.competitor_currency
      });
      
      toast.success('Price comparison added successfully');
      
      // Fetch the updated comparison to get the ID
      const updatedComparisons = await sparePartsApi.getPriceComparison(selectedPart.id);
      if (updatedComparisons.success && updatedComparisons.data) {
        const newCompetitor = updatedComparisons.data.find((c: any) => 
          c.competitor_name === newComparison.competitor_name &&
          c.competitor_price === Number(newComparison.competitor_price)
        );
        
        if (selectedPart && newCompetitor) {
          const updatedCompetitors = [...selectedPart.competitors, newCompetitor];
          const avgPrice = updatedCompetitors.reduce((sum, c) => sum + Number(c.competitor_price), 0) / updatedCompetitors.length;
          const savings = avgPrice - Number(selectedPart.our_price);
          
          // Recalculate rank
          const sortedCompetitors = updatedCompetitors
            .map(c => Number(c.competitor_price))
            .sort((a, b) => a - b);
          
          const ourPrice = Number(selectedPart.our_price);
          let rank = sortedCompetitors.length + 1;
          
          for (let i = 0; i < sortedCompetitors.length; i++) {
            if (ourPrice <= sortedCompetitors[i]) {
              rank = i + 1;
              break;
            }
          }
          
          const updatedPart = {
            ...selectedPart,
            competitors: updatedCompetitors,
            competitor_count: updatedCompetitors.length,
            avg_competitor_price: avgPrice,
            savings,
            rank
          };
          setSelectedPart(updatedPart);
          
          // Also update the main priceData
          setPriceData(prevData => prevData.map(part => {
            if (part.id === selectedPart.id) {
              return {
                ...part,
                competitors: updatedCompetitors,
                competitor_count: updatedCompetitors.length,
                avg_competitor_price: avgPrice,
                savings,
                rank
              };
            }
            return part;
          }));
        }
      }
      
      setNewComparison({
        competitor_name: '',
        competitor_url: '',
        competitor_price: '',
        competitor_currency: 'USD'
      });
      
      // Optionally fetch to ensure everything is in sync
      fetchPriceComparisons();
    } catch (error: any) {
      console.error('Failed to add price comparison:', error);
      toast.error(error?.response?.data?.message || 'Failed to add price comparison');
    } finally {
      setAddingComparison(false);
    }
  };

  const handleEditComparison = (comparison: any) => {
    setEditingComparison(comparison);
    setNewComparison({
      competitor_name: comparison.competitor_name,
      competitor_url: comparison.competitor_url || '',
      competitor_price: String(comparison.competitor_price),
      competitor_currency: comparison.competitor_currency || 'USD'
    });
  };

  const handleCancelEdit = () => {
    setEditingComparison(null);
    setNewComparison({
      competitor_name: '',
      competitor_url: '',
      competitor_price: '',
      competitor_currency: 'USD'
    });
  };

  const handleUpdateComparison = async () => {
    if (!editingComparison || !newComparison.competitor_name || !newComparison.competitor_price) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setAddingComparison(true);
      await sparePartsApi.updatePriceComparison(editingComparison.id, {
        competitor_name: newComparison.competitor_name,
        competitor_url: newComparison.competitor_url || undefined,
        competitor_price: Number(newComparison.competitor_price),
        competitor_currency: newComparison.competitor_currency
      });
      toast.success('Price comparison updated successfully');
      
      // Update the selectedPart state to reflect the changes immediately
      if (selectedPart) {
        const updatedCompetitors = selectedPart.competitors.map(comp => {
          if (comp.id === editingComparison.id) {
            return {
              ...comp,
              competitor_name: newComparison.competitor_name,
              competitor_url: newComparison.competitor_url || null,
              competitor_price: Number(newComparison.competitor_price),
              competitor_currency: newComparison.competitor_currency,
              last_checked_at: new Date().toISOString()
            };
          }
          return comp;
        });
        
        const avgPrice = updatedCompetitors.reduce((sum, c) => sum + Number(c.competitor_price), 0) / updatedCompetitors.length;
        const savings = avgPrice - Number(selectedPart.our_price);
        
        // Recalculate rank
        const sortedCompetitors = updatedCompetitors
          .map(c => Number(c.competitor_price))
          .sort((a, b) => a - b);
        
        const ourPrice = Number(selectedPart.our_price);
        let rank = sortedCompetitors.length + 1;
        
        for (let i = 0; i < sortedCompetitors.length; i++) {
          if (ourPrice <= sortedCompetitors[i]) {
            rank = i + 1;
            break;
          }
        }
        
        const updatedPart = {
          ...selectedPart,
          competitors: updatedCompetitors,
          avg_competitor_price: avgPrice,
          savings,
          rank
        };
        setSelectedPart(updatedPart);
      }
      
      // Also update the main priceData
      setPriceData(prevData => prevData.map(part => {
        if (part.id === selectedPart?.id) {
          const updatedCompetitors = part.competitors.map(comp => {
            if (comp.id === editingComparison.id) {
              return {
                ...comp,
                competitor_name: newComparison.competitor_name,
                competitor_url: newComparison.competitor_url || null,
                competitor_price: Number(newComparison.competitor_price),
                competitor_currency: newComparison.competitor_currency
              };
            }
            return comp;
          });
          
          const avgPrice = updatedCompetitors.reduce((sum, c) => sum + Number(c.competitor_price), 0) / updatedCompetitors.length;
          const savings = avgPrice - Number(part.our_price);
          
          const sortedCompetitors = updatedCompetitors
            .map(c => Number(c.competitor_price))
            .sort((a, b) => a - b);
          
          const ourPrice = Number(part.our_price);
          let rank = sortedCompetitors.length + 1;
          
          for (let i = 0; i < sortedCompetitors.length; i++) {
            if (ourPrice <= sortedCompetitors[i]) {
              rank = i + 1;
              break;
            }
          }
          
          return {
            ...part,
            competitors: updatedCompetitors,
            avg_competitor_price: avgPrice,
            savings,
            rank
          };
        }
        return part;
      }));
      
      handleCancelEdit();
      // Optionally fetch to ensure everything is in sync
      fetchPriceComparisons();
    } catch (error: any) {
      console.error('Failed to update price comparison:', error);
      toast.error(error?.response?.data?.message || 'Failed to update price comparison');
    } finally {
      setAddingComparison(false);
    }
  };

  const handleDeleteComparison = async (comparisonId: string) => {
    if (!window.confirm('Are you sure you want to delete this price comparison?')) {
      return;
    }

    try {
      setDeletingComparison(comparisonId);
      await sparePartsApi.deletePriceComparison(comparisonId);
      toast.success('Price comparison deleted successfully');
      
      // Update the selectedPart state to remove the deleted competitor immediately
      if (selectedPart) {
        const updatedCompetitors = selectedPart.competitors.filter(comp => comp.id !== comparisonId);
        const updatedPart = {
          ...selectedPart,
          competitors: updatedCompetitors,
          competitor_count: updatedCompetitors.length,
          // Recalculate averages if there are remaining competitors
          avg_competitor_price: updatedCompetitors.length > 0 
            ? updatedCompetitors.reduce((sum, c) => sum + Number(c.competitor_price), 0) / updatedCompetitors.length
            : null,
          savings: updatedCompetitors.length > 0
            ? (updatedCompetitors.reduce((sum, c) => sum + Number(c.competitor_price), 0) / updatedCompetitors.length) - Number(selectedPart.our_price)
            : 0,
          rank: updatedCompetitors.length > 0 ? selectedPart.rank : null
        };
        setSelectedPart(updatedPart);
      }
      
      // Also update the main priceData to reflect the change
      setPriceData(prevData => prevData.map(part => {
        if (part.id === selectedPart?.id) {
          const updatedCompetitors = part.competitors.filter(comp => comp.id !== comparisonId);
          const avgPrice = updatedCompetitors.length > 0 
            ? updatedCompetitors.reduce((sum, c) => sum + Number(c.competitor_price), 0) / updatedCompetitors.length
            : null;
          const savings = avgPrice ? avgPrice - Number(part.our_price) : 0;
          
          // Recalculate rank
          let rank = null;
          if (avgPrice && updatedCompetitors.length > 0) {
            const sortedCompetitors = updatedCompetitors
              .map(c => Number(c.competitor_price))
              .sort((a, b) => a - b);
            
            const ourPrice = Number(part.our_price);
            rank = sortedCompetitors.length + 1;
            
            for (let i = 0; i < sortedCompetitors.length; i++) {
              if (ourPrice <= sortedCompetitors[i]) {
                rank = i + 1;
                break;
              }
            }
          }
          
          return {
            ...part,
            competitors: updatedCompetitors,
            competitor_count: updatedCompetitors.length,
            avg_competitor_price: avgPrice,
            savings,
            rank
          };
        }
        return part;
      }));
      
      // Optionally fetch to ensure everything is in sync, but this will happen in background
      fetchPriceComparisons();
    } catch (error: any) {
      console.error('Failed to delete price comparison:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete price comparison');
    } finally {
      setDeletingComparison(null);
    }
  };

  const getPriceStatus = (savings: number) => {
    if (savings > 0) return { color: 'success' as const, icon: <CheckCircleIcon />, text: 'Competitive' };
    if (savings > -2) return { color: 'warning' as const, icon: <WarningIcon />, text: 'Close' };
    return { color: 'error' as const, icon: <WarningIcon />, text: 'Overpriced' };
  };

  const partsWithComparisons = priceData.filter(p => p.competitor_count > 0);
  const competitiveItems = partsWithComparisons.filter(p => p.savings > 0);
  const closePricing = partsWithComparisons.filter(p => p.savings <= 0 && p.savings > -2);
  const overpriced = partsWithComparisons.filter(p => p.savings <= -2);
  
  // Show all spare parts (with or without comparisons)
  const allParts = priceData;

  if (loading) {
    return (
      <SellerLayout>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              onClick={() => navigate(-1)}
              sx={{ mr: 1 }}
              aria-label="go back"
            >
              <ArrowBackIcon />
            </IconButton>
            <CompareIcon sx={{ fontSize: 32, color: 'secondary.main' }} />
            <Typography variant="h4" fontWeight={600}>
              Price Comparison
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefreshPrices}
            disabled={refreshing}
            sx={{ px: 3 }}
          >
            {refreshing ? 'Refreshing...' : 'Refresh Prices'}
          </Button>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          Compare your prices with competitors to stay competitive in the market. 
          {allParts.length === 0 
            ? ' No spare parts available. Add spare parts first.' 
            : partsWithComparisons.length === 0 
              ? ' Click the compare icon next to any part to add competitor prices.' 
              : ''}
        </Alert>

        {refreshing && <LinearProgress sx={{ mb: 3 }} />}

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
                  {competitiveItems.length}
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
                  {closePricing.length}
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
                  {overpriced.length}
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
                  {allParts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No spare parts available. Add spare parts first to track price comparisons.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    allParts.map((item) => {
                      const hasComparisons = item.competitor_count > 0;
                      const status = hasComparisons ? getPriceStatus(item.savings) : null;
                      const marketAvg = item.avg_competitor_price || 0;
                      return (
                        <TableRow key={item.id} sx={{ bgcolor: hasComparisons ? 'transparent' : 'grey.50' }}>
                          <TableCell>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {item.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              SKU: {item.sku}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="subtitle2" fontWeight={600}>
                              ${Number(item.our_price).toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            {hasComparisons ? (
                              <>
                                <Typography variant="body2">
                                  ${Number(marketAvg).toFixed(2)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {item.competitor_count} competitor{item.competitor_count !== 1 ? 's' : ''}
                                </Typography>
                              </>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                No data
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {hasComparisons ? (
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
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                -
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            {hasComparisons ? (
                              <Chip
                                icon={status?.icon}
                                label={status?.text}
                                color={status?.color}
                                size="small"
                              />
                            ) : (
                              <Chip
                                label="No Data"
                                size="small"
                                variant="outlined"
                                color="default"
                              />
                            )}
                          </TableCell>
                          <TableCell align="center">
                            {hasComparisons && item.rank ? (
                              <Chip
                                label={`#${item.rank}`}
                                color={item.rank === 1 ? 'success' : item.rank === 2 ? 'warning' : 'error'}
                                size="small"
                              />
                            ) : (
                              <Typography variant="caption" color="text.secondary">-</Typography>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title={hasComparisons ? "View/Add Competitor Details" : "Add Competitor Price"}>
                              <IconButton 
                                size="small"
                                onClick={() => handleOpenDialog(item)}
                                color={hasComparisons ? "default" : "primary"}
                              >
                                <CompareIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {overpriced.length > 0 && (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Pricing Recommendations
              </Typography>
              <Grid container spacing={2}>
                {overpriced.slice(0, 3).map((item) => {
                  const recommendedPrice = Number(item.avg_competitor_price) - (Number(item.avg_competitor_price) * 0.05);
                  const reduction = Number(item.our_price) - recommendedPrice;
                  return (
                    <Grid item xs={12} md={6} key={item.id}>
                      <Alert severity="warning" icon={<WarningIcon />}>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {item.name}
                        </Typography>
                        <Typography variant="body2">
                          Consider reducing price by ${reduction.toFixed(2)} to improve competitiveness. Recommended price: ${recommendedPrice.toFixed(2)}
                        </Typography>
                      </Alert>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Dialog for viewing/adding competitor prices */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                {selectedPart?.name} - Competitor Prices
              </Typography>
              <IconButton onClick={handleCloseDialog} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            {selectedPart && (
              <>
                <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Your Price
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    ${Number(selectedPart.our_price).toFixed(2)} {selectedPart.our_currency}
                  </Typography>
                  {selectedPart.avg_competitor_price && (
                    <>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
                        Market Average
                      </Typography>
                      <Typography variant="body1">
                        ${Number(selectedPart.avg_competitor_price).toFixed(2)}
                      </Typography>
                    </>
                  )}
                </Box>

                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                  Competitor Prices
                </Typography>

                {selectedPart.competitors && selectedPart.competitors.length > 0 ? (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Competitor</TableCell>
                          <TableCell align="right">Price</TableCell>
                          <TableCell align="right">Difference</TableCell>
                          <TableCell>Last Checked</TableCell>
                          <TableCell align="center">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedPart.competitors.map((comp, idx) => {
                          const compId = comp.id || `temp-${idx}`;
                          const isEditing = editingComparison?.id === compId;
                          const isDeleting = deletingComparison === compId;
                          
                          if (isEditing) {
                            return (
                              <TableRow key={compId} sx={{ bgcolor: 'action.hover' }}>
                                <TableCell colSpan={5}>
                                  <Box sx={{ p: 2 }}>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                                      Edit Competitor Price
                                    </Typography>
                                    <Grid container spacing={2}>
                                      <Grid item xs={12} sm={6}>
                                        <TextField
                                          fullWidth
                                          size="small"
                                          label="Competitor Name"
                                          value={newComparison.competitor_name}
                                          onChange={(e) => setNewComparison({ ...newComparison, competitor_name: e.target.value })}
                                          required
                                        />
                                      </Grid>
                                      <Grid item xs={12} sm={6}>
                                        <TextField
                                          fullWidth
                                          size="small"
                                          label="Price"
                                          type="number"
                                          value={newComparison.competitor_price}
                                          onChange={(e) => setNewComparison({ ...newComparison, competitor_price: e.target.value })}
                                          required
                                          inputProps={{ step: '0.01', min: '0' }}
                                        />
                                      </Grid>
                                      <Grid item xs={12} sm={6}>
                                        <TextField
                                          fullWidth
                                          size="small"
                                          label="URL (Optional)"
                                          value={newComparison.competitor_url}
                                          onChange={(e) => setNewComparison({ ...newComparison, competitor_url: e.target.value })}
                                        />
                                      </Grid>
                                      <Grid item xs={12} sm={6}>
                                        <TextField
                                          fullWidth
                                          size="small"
                                          label="Currency"
                                          value={newComparison.competitor_currency}
                                          onChange={(e) => setNewComparison({ ...newComparison, competitor_currency: e.target.value })}
                                          select
                                          SelectProps={{ native: true }}
                                        >
                                          <option value="USD">USD</option>
                                          <option value="EUR">EUR</option>
                                          <option value="GBP">GBP</option>
                                        </TextField>
                                      </Grid>
                                      <Grid item xs={12}>
                                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                          <Button size="small" onClick={handleCancelEdit}>
                                            Cancel
                                          </Button>
                                          <Button
                                            size="small"
                                            variant="contained"
                                            onClick={handleUpdateComparison}
                                            disabled={addingComparison || !newComparison.competitor_name || !newComparison.competitor_price}
                                          >
                                            {addingComparison ? 'Saving...' : 'Save'}
                                          </Button>
                                        </Box>
                                      </Grid>
                                    </Grid>
                                  </Box>
                                </TableCell>
                              </TableRow>
                            );
                          }
                          
                          return (
                            <TableRow key={compId}>
                              <TableCell>
                                {comp.competitor_url ? (
                                  <a href={comp.competitor_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                    {comp.competitor_name}
                                  </a>
                                ) : (
                                  comp.competitor_name
                                )}
                              </TableCell>
                              <TableCell align="right">
                                ${Number(comp.competitor_price).toFixed(2)} {comp.competitor_currency || 'USD'}
                              </TableCell>
                              <TableCell align="right">
                                <Typography 
                                  variant="body2"
                                  color={Number(comp.competitor_price) > Number(selectedPart.our_price) ? 'success.main' : 'error.main'}
                                >
                                  ${(Number(comp.competitor_price) - Number(selectedPart.our_price)).toFixed(2)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                {comp.last_checked_at ? new Date(comp.last_checked_at).toLocaleDateString() : '-'}
                              </TableCell>
                              <TableCell align="center">
                                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                  <Tooltip title="Edit">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleEditComparison({ ...comp, id: compId })}
                                      disabled={isDeleting}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete">
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() => comp.id && handleDeleteComparison(comp.id)}
                                      disabled={isDeleting}
                                    >
                                      {isDeleting ? <CircularProgress size={16} /> : <DeleteIcon fontSize="small" />}
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    No competitor prices added yet.
                  </Typography>
                )}

                {!editingComparison && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                      Add New Competitor Price
                    </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Competitor Name"
                        value={newComparison.competitor_name}
                        onChange={(e) => setNewComparison({ ...newComparison, competitor_name: e.target.value })}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Price"
                        type="number"
                        value={newComparison.competitor_price}
                        onChange={(e) => setNewComparison({ ...newComparison, competitor_price: e.target.value })}
                        required
                        inputProps={{ step: '0.01', min: '0' }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="URL (Optional)"
                        value={newComparison.competitor_url}
                        onChange={(e) => setNewComparison({ ...newComparison, competitor_url: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Currency"
                        value={newComparison.competitor_currency}
                        onChange={(e) => setNewComparison({ ...newComparison, competitor_currency: e.target.value })}
                        select
                        SelectProps={{ native: true }}
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                      </TextField>
                    </Grid>
                  </Grid>
                  </Box>
                )}
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Close</Button>
            {!editingComparison && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddComparison}
                disabled={addingComparison || !newComparison.competitor_name || !newComparison.competitor_price}
              >
                {addingComparison ? 'Adding...' : 'Add Comparison'}
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Box>
    </SellerLayout>
  );
};

export default SellerSparePartsPriceComparison;
