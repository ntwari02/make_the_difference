import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  GridLegacy as Grid,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Tooltip,
  Tabs,
  Tab
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Edit as EditIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import SellerLayout from '../components/layout/SellerLayout';
import { sparePartsApi } from '../services/sparePartsApi';
import toast from 'react-hot-toast';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  currency: string;
  quantity_available: number;
  reorder_point: number;
  max_stock_level: number;
  last_restocked_at: string | null;
  last_sold_at: string | null;
  status: string;
  stock_status: 'good' | 'low' | 'out';
}

const SellerSparePartsInventory: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [openRestockDialog, setOpenRestockDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [restockingItem, setRestockingItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState({
    quantity_available: 0,
    reorder_point: 0,
    max_stock_level: 0
  });
  const [restockQuantity, setRestockQuantity] = useState(0);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    filterInventory();
  }, [tabValue, inventory]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await sparePartsApi.getAllInventory();
      if (response.success && response.data) {
        setInventory(response.data);
      } else {
        setInventory([]);
      }
    } catch (error: any) {
      console.error('Failed to fetch inventory:', error);
      toast.error(error?.response?.data?.message || 'Failed to load inventory');
      setInventory([]);
    } finally {
      setLoading(false);
    }
  };

  const filterInventory = () => {
    let filtered = [...inventory];
    
    switch (tabValue) {
      case 1: // Low Stock
        filtered = inventory.filter(item => item.stock_status === 'low');
        break;
      case 2: // Out of Stock
        filtered = inventory.filter(item => item.stock_status === 'out');
        break;
      case 0: // All
      default:
        filtered = inventory;
        break;
    }
    
    setFilteredInventory(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchInventory();
    setRefreshing(false);
    toast.success('Inventory refreshed');
  };

  const handleEditStock = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      quantity_available: item.quantity_available,
      reorder_point: item.reorder_point || 0,
      max_stock_level: item.max_stock_level || 0
    });
    setOpenDialog(true);
  };

  const handleRestock = (item: InventoryItem) => {
    setRestockingItem(item);
    setRestockQuantity(0);
    setOpenRestockDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
    setFormData({
      quantity_available: 0,
      reorder_point: 0,
      max_stock_level: 0
    });
  };

  const handleCloseRestockDialog = () => {
    setOpenRestockDialog(false);
    setRestockingItem(null);
    setRestockQuantity(0);
  };

  const handleUpdateStock = async () => {
    if (!editingItem) return;

    if (formData.quantity_available < 0) {
      toast.error('Quantity cannot be negative');
      return;
    }

    try {
      setUpdating(true);
      await sparePartsApi.updateStock(editingItem.id, {
        quantity_available: formData.quantity_available,
        reorder_point: formData.reorder_point || undefined,
        max_stock_level: formData.max_stock_level || undefined
      });
      
      toast.success('Stock updated successfully');
      handleCloseDialog();
      fetchInventory();
    } catch (error: any) {
      console.error('Failed to update stock:', error);
      toast.error(error?.response?.data?.message || 'Failed to update stock');
    } finally {
      setUpdating(false);
    }
  };

  const handleRestockItem = async () => {
    if (!restockingItem || restockQuantity <= 0) {
      toast.error('Please enter a valid quantity to add');
      return;
    }

    try {
      setUpdating(true);
      await sparePartsApi.restockItem(restockingItem.id, restockQuantity);
      
      toast.success(`Successfully added ${restockQuantity} units to stock`);
      handleCloseRestockDialog();
      fetchInventory();
    } catch (error: any) {
      console.error('Failed to restock item:', error);
      toast.error(error?.response?.data?.message || 'Failed to restock item');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'success';
      case 'low': return 'warning';
      case 'out': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string): React.ReactElement | undefined => {
    switch (status) {
      case 'good': return <CheckCircleIcon />;
      case 'low': return <WarningIcon />;
      case 'out': return <WarningIcon />;
      default: return undefined;
    }
  };

  const getInventoryStats = () => {
    const totalItems = inventory.length;
    const lowStock = inventory.filter(item => item.stock_status === 'low').length;
    const outOfStock = inventory.filter(item => item.stock_status === 'out').length;
    const totalValue = inventory.reduce((sum, item) => 
      sum + (item.quantity_available * Number(item.price)), 0);
    
    return { totalItems, lowStock, outOfStock, totalValue };
  };

  const stats = getInventoryStats();

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
            <InventoryIcon sx={{ fontSize: 32, color: 'success.main' }} />
            <Typography variant="h4" fontWeight={600}>
              Inventory Management
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={refreshing}
            sx={{ px: 3 }}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          Track stock levels, set reorder points, and manage your spare parts inventory efficiently.
        </Alert>

        {refreshing && <LinearProgress sx={{ mb: 3 }} />}

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <InventoryIcon sx={{ color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight={600}>
                    Total Items
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={700} color="primary.main">
                  {stats.totalItems}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active inventory items
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <WarningIcon sx={{ color: 'warning.main' }} />
                  <Typography variant="h6" fontWeight={600}>
                    Low Stock
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={700} color="warning.main">
                  {stats.lowStock}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Items below reorder point
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <WarningIcon sx={{ color: 'error.main' }} />
                  <Typography variant="h6" fontWeight={600}>
                    Out of Stock
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={700} color="error.main">
                  {stats.outOfStock}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Items needing restock
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <TrendingUpIcon sx={{ color: 'success.main' }} />
                  <Typography variant="h6" fontWeight={600}>
                    Total Value
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={700} color="success.main">
                  ${stats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Current inventory value
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Inventory Table */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Inventory Overview
              </Typography>
            </Box>

            <Tabs value={tabValue} onChange={(_e, newValue) => setTabValue(newValue)} sx={{ mb: 2 }}>
              <Tab label={`All (${inventory.length})`} />
              <Tab label={`Low Stock (${stats.lowStock})`} />
              <Tab label={`Out of Stock (${stats.outOfStock})`} />
            </Tabs>

            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Item Name</TableCell>
                    <TableCell>SKU</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Current Stock</TableCell>
                    <TableCell align="right">Reorder Point</TableCell>
                    <TableCell align="right">Max Stock</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell>Last Restocked</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredInventory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          {tabValue === 0 
                            ? 'No inventory items found. Add spare parts to start tracking inventory.' 
                            : tabValue === 1
                            ? 'No low stock items'
                            : 'No out of stock items'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInventory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {item.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {item.sku}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={600}>
                            ${Number(item.price).toFixed(2)} {item.currency}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography 
                            variant="subtitle2" 
                            fontWeight={600}
                            color={item.stock_status === 'out' ? 'error.main' : item.stock_status === 'low' ? 'warning.main' : 'text.primary'}
                          >
                            {item.quantity_available}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {item.reorder_point || 0}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {item.max_stock_level || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            icon={getStatusIcon(item.stock_status)}
                            label={item.stock_status.toUpperCase()}
                            color={getStatusColor(item.stock_status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {item.last_restocked_at 
                              ? new Date(item.last_restocked_at).toLocaleDateString() 
                              : 'Never'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                            <Tooltip title="Edit Stock">
                              <IconButton 
                                size="small" 
                                onClick={() => handleEditStock(item)}
                                color="primary"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Restock">
                              <IconButton 
                                size="small" 
                                onClick={() => handleRestock(item)}
                                color="success"
                              >
                                <AddIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Alerts */}
        {(stats.lowStock > 0 || stats.outOfStock > 0) && (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Inventory Alerts
              </Typography>
              <Grid container spacing={2}>
                {inventory.filter(item => item.stock_status === 'out').map((item) => (
                  <Grid item xs={12} md={6} key={item.id}>
                    <Alert severity="error" icon={<WarningIcon />}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {item.name} - OUT OF STOCK
                      </Typography>
                      <Typography variant="body2">
                        Immediate restock required. {item.last_restocked_at ? `Last restocked: ${new Date(item.last_restocked_at).toLocaleDateString()}` : 'Never restocked'}
                      </Typography>
                    </Alert>
                  </Grid>
                ))}
                {inventory.filter(item => item.stock_status === 'low').map((item) => (
                  <Grid item xs={12} md={6} key={item.id}>
                    <Alert severity="warning" icon={<WarningIcon />}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {item.name} - LOW STOCK
                      </Typography>
                      <Typography variant="body2">
                        Only {item.quantity_available} units left. Reorder point: {item.reorder_point}
                      </Typography>
                    </Alert>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Update Stock Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            Update Stock - {editingItem?.name}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                label="Current Stock"
                type="number"
                value={formData.quantity_available}
                onChange={(e) => setFormData({ ...formData, quantity_available: Number(e.target.value) })}
                fullWidth
                required
                inputProps={{ min: 0 }}
              />
              <TextField
                label="Reorder Point"
                type="number"
                value={formData.reorder_point}
                onChange={(e) => setFormData({ ...formData, reorder_point: Number(e.target.value) })}
                fullWidth
                helperText="Stock level at which to trigger reorder"
                inputProps={{ min: 0 }}
              />
              <TextField
                label="Max Stock Level"
                type="number"
                value={formData.max_stock_level}
                onChange={(e) => setFormData({ ...formData, max_stock_level: Number(e.target.value) })}
                fullWidth
                helperText="Maximum stock level for this item"
                inputProps={{ min: 0 }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleUpdateStock}
              disabled={updating || formData.quantity_available < 0}
            >
              {updating ? 'Updating...' : 'Update Stock'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Restock Dialog */}
        <Dialog open={openRestockDialog} onClose={handleCloseRestockDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            Restock Item - {restockingItem?.name}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <Alert severity="info">
                Current stock: {restockingItem?.quantity_available || 0} units
                {restockingItem && restockQuantity > 0 && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    New stock after restock: {restockingItem.quantity_available + restockQuantity} units
                  </Typography>
                )}
              </Alert>
              <TextField
                label="Quantity to Add"
                type="number"
                value={restockQuantity}
                onChange={(e) => setRestockQuantity(Number(e.target.value))}
                fullWidth
                required
                inputProps={{ min: 1, step: 1 }}
                helperText="Enter the number of units to add to current stock"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseRestockDialog}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleRestockItem}
              disabled={updating || restockQuantity <= 0}
              color="success"
            >
              {updating ? 'Restocking...' : 'Restock'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </SellerLayout>
  );
};

export default SellerSparePartsInventory;
