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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Badge
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DirectionsCar as CarIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  Visibility as VisibilityIcon,
  Favorite as FavoriteIcon,
  Message as MessageIcon,
  AttachMoney as PriceIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import SellerLayout from '../components/layout/SellerLayout';

const SellerCarsInventory: React.FC = () => {
  const [inventory, setInventory] = React.useState([
    {
      id: 1,
      title: '2020 Toyota Camry',
      brand: 'Toyota',
      model: 'Camry',
      year: 2020,
      price: 25000,
      mileage: 35000,
      status: 'active',
      views: 145,
      favorites: 12,
      messages: 8,
      daysListed: 15,
      lastUpdated: '2025-10-21',
      images: ['https://via.placeholder.com/300x200?text=Toyota+Camry']
    },
    {
      id: 2,
      title: '2019 Honda Accord',
      brand: 'Honda',
      model: 'Accord',
      year: 2019,
      price: 22000,
      mileage: 42000,
      status: 'active',
      views: 132,
      favorites: 10,
      messages: 6,
      daysListed: 22,
      lastUpdated: '2025-10-20',
      images: ['https://via.placeholder.com/300x200?text=Honda+Accord']
    },
    {
      id: 3,
      title: '2021 BMW 3 Series',
      brand: 'BMW',
      model: '3 Series',
      year: 2021,
      price: 35000,
      mileage: 18000,
      status: 'pending',
      views: 98,
      favorites: 15,
      messages: 12,
      daysListed: 8,
      lastUpdated: '2025-10-19',
      images: ['https://via.placeholder.com/300x200?text=BMW+3+Series']
    },
    {
      id: 4,
      title: '2020 Ford F-150',
      brand: 'Ford',
      model: 'F-150',
      year: 2020,
      price: 32000,
      mileage: 28000,
      status: 'sold',
      views: 89,
      favorites: 7,
      messages: 4,
      daysListed: 45,
      lastUpdated: '2025-10-18',
      images: ['https://via.placeholder.com/300x200?text=Ford+F150']
    }
  ]);

  const [openDialog, setOpenDialog] = React.useState(false);
  const [editingCar, setEditingCar] = React.useState<any>(null);

  const handleEditCar = (car: any) => {
    setEditingCar(car);
    setOpenDialog(true);
  };

  const handleDeleteCar = (id: number) => {
    setInventory(inventory.filter(car => car.id !== id));
  };

  const handleUpdateCar = (carData: any) => {
    setInventory(inventory.map(car => 
      car.id === editingCar.id 
        ? { ...car, ...carData, lastUpdated: new Date().toISOString().split('T')[0] }
        : car
    ));
    setOpenDialog(false);
  };

  const getInventoryStats = () => {
    const totalCars = inventory.length;
    const activeCars = inventory.filter(car => car.status === 'active').length;
    const pendingCars = inventory.filter(car => car.status === 'pending').length;
    const soldCars = inventory.filter(car => car.status === 'sold').length;
    const totalValue = inventory.reduce((sum, car) => sum + car.price, 0);
    const avgDaysListed = inventory.reduce((sum, car) => sum + car.daysListed, 0) / totalCars;
    
    return { totalCars, activeCars, pendingCars, soldCars, totalValue, avgDaysListed };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'sold': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleIcon />;
      case 'pending': return <WarningIcon />;
      case 'sold': return <CheckCircleIcon />;
      default: return null;
    }
  };

  const stats = getInventoryStats();

  return (
    <SellerLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CarIcon sx={{ fontSize: 32, color: 'success.main' }} />
            <Typography variant="h4" fontWeight={600}>
              Car Inventory Management
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ px: 3 }}
          >
            Add New Car
          </Button>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          Manage your car inventory, track performance metrics, and monitor listing status across all platforms.
        </Alert>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={2}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CarIcon sx={{ color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight={600}>
                    Total Cars
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={700} color="primary.main">
                  {stats.totalCars}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  All listings
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={2}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CheckCircleIcon sx={{ color: 'success.main' }} />
                  <Typography variant="h6" fontWeight={600}>
                    Active
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={700} color="success.main">
                  {stats.activeCars}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Currently listed
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={2}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <WarningIcon sx={{ color: 'warning.main' }} />
                  <Typography variant="h6" fontWeight={600}>
                    Pending
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={700} color="warning.main">
                  {stats.pendingCars}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Awaiting approval
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={2}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CheckCircleIcon sx={{ color: 'info.main' }} />
                  <Typography variant="h6" fontWeight={600}>
                    Sold
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={700} color="info.main">
                  {stats.soldCars}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Recently sold
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={2}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <PriceIcon sx={{ color: 'success.main' }} />
                  <Typography variant="h6" fontWeight={600}>
                    Total Value
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={700} color="success.main">
                  ${(stats.totalValue / 1000).toFixed(0)}k
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Inventory value
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={2}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CalendarIcon sx={{ color: 'secondary.main' }} />
                  <Typography variant="h6" fontWeight={600}>
                    Avg Days
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={700} color="secondary.main">
                  {stats.avgDaysListed.toFixed(0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Days listed
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
                    <TableCell>Car</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Mileage</TableCell>
                    <TableCell align="right">Days Listed</TableCell>
                    <TableCell align="right">Views</TableCell>
                    <TableCell align="right">Favorites</TableCell>
                    <TableCell align="right">Messages</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Last Updated</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inventory.map((car) => (
                    <TableRow key={car.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            src={car.images[0]}
                            sx={{ width: 50, height: 50 }}
                            variant="rounded"
                          />
                          <Box>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {car.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {car.brand} {car.model} • {car.year}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="subtitle2" fontWeight={600}>
                          ${car.price.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {car.mileage.toLocaleString()} mi
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {car.daysListed} days
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                          <VisibilityIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {car.views}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                          <FavoriteIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {car.favorites}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                          <MessageIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {car.messages}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          icon={getStatusIcon(car.status)}
                          label={car.status.toUpperCase()}
                          color={getStatusColor(car.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" color="text.secondary">
                          {car.lastUpdated}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton 
                          size="small" 
                          onClick={() => handleEditCar(car)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteCar(car.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Performance Insights */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Performance Insights
            </Typography>
            <Grid container spacing={2}>
              {inventory.filter(car => car.status === 'active').map((car) => (
                <Grid item xs={12} md={6} key={car.id}>
                  <Alert 
                    severity={car.views > 100 ? 'success' : car.views > 50 ? 'warning' : 'error'}
                    icon={<CarIcon />}
                  >
                    <Typography variant="subtitle2" fontWeight={600}>
                      {car.title}
                    </Typography>
                    <Typography variant="body2">
                      {car.views > 100 
                        ? `High performance: ${car.views} views, ${car.favorites} favorites`
                        : car.views > 50 
                        ? `Moderate performance: ${car.views} views, consider price adjustment`
                        : `Low performance: ${car.views} views, needs optimization`
                      }
                    </Typography>
                  </Alert>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Edit Car Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            Edit Car - {editingCar?.title}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                label="Title"
                defaultValue={editingCar?.title || ''}
                fullWidth
                required
              />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Price"
                    type="number"
                    defaultValue={editingCar?.price || 0}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Mileage"
                    type="number"
                    defaultValue={editingCar?.mileage || 0}
                    fullWidth
                    required
                  />
                </Grid>
              </Grid>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select defaultValue={editingCar?.status || 'active'}>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="sold">Sold</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={() => handleUpdateCar({})}
            >
              Update Car
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </SellerLayout>
  );
};

export default SellerCarsInventory;
