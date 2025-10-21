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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import SellerLayout from '../components/layout/SellerLayout';

const SellerSparePartsInventory: React.FC = () => {
  const [inventory, setInventory] = React.useState([
    {
      id: 1,
      name: 'Oil Filter',
      sku: 'OF-001',
      currentStock: 45,
      reorderPoint: 20,
      maxStock: 100,
      lastRestocked: '2025-10-15',
      status: 'good'
    },
    {
      id: 2,
      name: 'Brake Pads',
      sku: 'BP-002',
      currentStock: 8,
      reorderPoint: 15,
      maxStock: 50,
      lastRestocked: '2025-10-10',
      status: 'low'
    },
    {
      id: 3,
      name: 'Air Filter',
      sku: 'AF-003',
      currentStock: 0,
      reorderPoint: 10,
      maxStock: 30,
      lastRestocked: '2025-09-20',
      status: 'out'
    },
    {
      id: 4,
      name: 'Spark Plugs',
      sku: 'SP-004',
      currentStock: 25,
      reorderPoint: 12,
      maxStock: 40,
      lastRestocked: '2025-10-18',
      status: 'good'
    }
  ]);

  const [openDialog, setOpenDialog] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<any>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'success';
      case 'low': return 'warning';
      case 'out': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircleIcon />;
      case 'low': return <WarningIcon />;
      case 'out': return <WarningIcon />;
      default: return null;
    }
  };

  const handleEditStock = (item: any) => {
    setEditingItem(item);
    setOpenDialog(true);
  };

  const handleUpdateStock = (newStock: number) => {
    setInventory(inventory.map(item => 
      item.id === editingItem.id 
        ? { ...item, currentStock: newStock, lastRestocked: new Date().toISOString().split('T')[0] }
        : item
    ));
    setOpenDialog(false);
  };

  const getInventoryStats = () => {
    const totalItems = inventory.length;
    const lowStock = inventory.filter(item => item.status === 'low').length;
    const outOfStock = inventory.filter(item => item.status === 'out').length;
    const totalValue = inventory.reduce((sum, item) => sum + (item.currentStock * 25), 0); // Assuming $25 avg price
    
    return { totalItems, lowStock, outOfStock, totalValue };
  };

  const stats = getInventoryStats();

  return (
    <SellerLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <InventoryIcon sx={{ fontSize: 32, color: 'success.main' }} />
            <Typography variant="h4" fontWeight={600}>
              Inventory Management
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ px: 3 }}
          >
            Add New Item
          </Button>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          Track stock levels, set reorder points, and manage your spare parts inventory efficiently.
        </Alert>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
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
          <Grid item xs={12} md={3}>
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
          <Grid item xs={12} md={3}>
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
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <TrendingUpIcon sx={{ color: 'success.main' }} />
                  <Typography variant="h6" fontWeight={600}>
                    Total Value
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={700} color="success.main">
                  ${stats.totalValue.toLocaleString()}
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
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Inventory Overview
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Item Name</TableCell>
                    <TableCell>SKU</TableCell>
                    <TableCell align="right">Current Stock</TableCell>
                    <TableCell align="right">Reorder Point</TableCell>
                    <TableCell align="right">Max Stock</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Last Restocked</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inventory.map((item) => (
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
                        <Typography variant="subtitle2" fontWeight={600}>
                          {item.currentStock}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {item.reorderPoint}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {item.maxStock}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          icon={getStatusIcon(item.status)}
                          label={item.status.toUpperCase()}
                          color={getStatusColor(item.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" color="text.secondary">
                          {item.lastRestocked}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton 
                          size="small" 
                          onClick={() => handleEditStock(item)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
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
                {inventory.filter(item => item.status === 'out').map((item) => (
                  <Grid item xs={12} md={6} key={item.id}>
                    <Alert severity="error" icon={<WarningIcon />}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {item.name} - OUT OF STOCK
                      </Typography>
                      <Typography variant="body2">
                        Immediate restock required. Last restocked: {item.lastRestocked}
                      </Typography>
                    </Alert>
                  </Grid>
                ))}
                {inventory.filter(item => item.status === 'low').map((item) => (
                  <Grid item xs={12} md={6} key={item.id}>
                    <Alert severity="warning" icon={<WarningIcon />}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {item.name} - LOW STOCK
                      </Typography>
                      <Typography variant="body2">
                        Only {item.currentStock} units left. Reorder point: {item.reorderPoint}
                      </Typography>
                    </Alert>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Update Stock Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Update Stock - {editingItem?.name}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                label="Current Stock"
                type="number"
                defaultValue={editingItem?.currentStock || 0}
                fullWidth
                required
                onChange={(e) => {
                  const newStock = parseInt(e.target.value);
                  if (newStock >= 0) {
                    setEditingItem({ ...editingItem, currentStock: newStock });
                  }
                }}
              />
              <TextField
                label="Reorder Point"
                type="number"
                defaultValue={editingItem?.reorderPoint || 0}
                fullWidth
                required
              />
              <TextField
                label="Max Stock"
                type="number"
                defaultValue={editingItem?.maxStock || 0}
                fullWidth
                required
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={() => handleUpdateStock(editingItem?.currentStock || 0)}
            >
              Update Stock
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </SellerLayout>
  );
};

export default SellerSparePartsInventory;
