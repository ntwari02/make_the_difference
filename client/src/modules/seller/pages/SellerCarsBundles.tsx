import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DirectionsCar as CarIcon,
  AttachMoney as PriceIcon,
  Group as BundleIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import SellerLayout from '../components/layout/SellerLayout';

const SellerCarsBundles: React.FC = () => {
  const [bundles, setBundles] = React.useState([
    {
      id: 1,
      name: 'Luxury Sedan Package',
      description: 'Premium luxury sedan with extended warranty',
      cars: ['2020 BMW 3 Series', '2019 Mercedes C-Class'],
      price: 45000,
      discount: 10,
      status: 'active',
      views: 45,
      inquiries: 8
    },
    {
      id: 2,
      name: 'Family SUV Bundle',
      description: 'Perfect family vehicles with safety features',
      cars: ['2021 Toyota Highlander', '2020 Honda Pilot'],
      price: 38000,
      discount: 15,
      status: 'active',
      views: 32,
      inquiries: 5
    },
    {
      id: 3,
      name: 'Economy Car Deal',
      description: 'Budget-friendly reliable vehicles',
      cars: ['2022 Toyota Corolla', '2021 Honda Civic'],
      price: 22000,
      discount: 20,
      status: 'inactive',
      views: 28,
      inquiries: 3
    }
  ]);

  const [openDialog, setOpenDialog] = React.useState(false);
  const [editingBundle, setEditingBundle] = React.useState<any>(null);

  const handleCreateBundle = () => {
    setEditingBundle(null);
    setOpenDialog(true);
  };

  const handleEditBundle = (bundle: any) => {
    setEditingBundle(bundle);
    setOpenDialog(true);
  };

  const handleDeleteBundle = (id: number) => {
    setBundles(bundles.filter(bundle => bundle.id !== id));
  };

  const handleSaveBundle = (bundleData: any) => {
    if (editingBundle) {
      setBundles(bundles.map(bundle => 
        bundle.id === editingBundle.id ? { ...bundle, ...bundleData } : bundle
      ));
    } else {
      const newBundle = {
        ...bundleData,
        id: Math.max(...bundles.map(b => b.id)) + 1,
        status: 'active',
        views: 0,
        inquiries: 0
      };
      setBundles([...bundles, newBundle]);
    }
    setOpenDialog(false);
  };

  return (
    <SellerLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <BundleIcon sx={{ fontSize: 32, color: 'primary.main' }} />
            <Typography variant="h4" fontWeight={600}>
              Car Bundles
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateBundle}
            sx={{ px: 3 }}
          >
            Create Bundle
          </Button>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          Create and manage car bundles to offer customers discounted packages and increase sales volume.
        </Alert>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <BundleIcon sx={{ color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight={600}>
                    Total Bundles
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={700} color="primary.main">
                  {bundles.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active bundles
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <VisibilityIcon sx={{ color: 'info.main' }} />
                  <Typography variant="h6" fontWeight={600}>
                    Total Views
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={700} color="info.main">
                  {bundles.reduce((sum, bundle) => sum + bundle.views, 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Bundle page views
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <PriceIcon sx={{ color: 'success.main' }} />
                  <Typography variant="h6" fontWeight={600}>
                    Avg Discount
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={700} color="success.main">
                  {Math.round(bundles.reduce((sum, bundle) => sum + bundle.discount, 0) / bundles.length)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Average savings
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CarIcon sx={{ color: 'warning.main' }} />
                  <Typography variant="h6" fontWeight={600}>
                    Total Inquiries
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={700} color="warning.main">
                  {bundles.reduce((sum, bundle) => sum + bundle.inquiries, 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Customer inquiries
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Bundles Table */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Bundle Management
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Bundle Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="center">Cars</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="center">Discount</TableCell>
                    <TableCell align="center">Views</TableCell>
                    <TableCell align="center">Inquiries</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bundles.map((bundle) => (
                    <TableRow key={bundle.id}>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {bundle.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {bundle.description}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {bundle.cars.length} cars
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="subtitle2" fontWeight={600}>
                          ${bundle.price.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={`${bundle.discount}% OFF`} 
                          color="error" 
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {bundle.views}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {bundle.inquiries}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={bundle.status} 
                          color={bundle.status === 'active' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton 
                          size="small" 
                          onClick={() => handleEditBundle(bundle)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteBundle(bundle.id)}
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

        {/* Bundle Cards Grid */}
        <Grid container spacing={3} sx={{ mt: 3 }}>
          {bundles.map((bundle) => (
            <Grid item xs={12} md={6} lg={4} key={bundle.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" fontWeight={600}>
                      {bundle.name}
                    </Typography>
                    <Chip 
                      label={bundle.status} 
                      color={bundle.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {bundle.description}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                      Included Cars:
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {bundle.cars.map((car, index) => (
                        <Chip key={index} label={car} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PriceIcon sx={{ fontSize: 16, color: 'success.main' }} />
                      <Typography variant="h6" fontWeight={600} color="success.main">
                        ${bundle.price.toLocaleString()}
                      </Typography>
                    </Box>
                    <Chip 
                      label={`${bundle.discount}% OFF`} 
                      color="error" 
                      size="small"
                    />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <VisibilityIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {bundle.views}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CarIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {bundle.inquiries}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>

                <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleEditBundle(bundle)}
                    sx={{ flex: 1 }}
                  >
                    Edit
                  </Button>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteBundle(bundle.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {bundles.length === 0 && (
          <Card sx={{ p: 4, textAlign: 'center' }}>
            <BundleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No bundles created yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create your first car bundle to start offering discounted packages to customers.
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateBundle}>
              Create Your First Bundle
            </Button>
          </Card>
        )}

        {/* Create/Edit Bundle Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingBundle ? 'Edit Bundle' : 'Create New Bundle'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                label="Bundle Name"
                defaultValue={editingBundle?.name || ''}
                fullWidth
                required
              />
              <TextField
                label="Description"
                defaultValue={editingBundle?.description || ''}
                fullWidth
                multiline
                rows={3}
              />
              <TextField
                label="Price"
                type="number"
                defaultValue={editingBundle?.price || ''}
                fullWidth
                required
              />
              <TextField
                label="Discount (%)"
                type="number"
                defaultValue={editingBundle?.discount || ''}
                fullWidth
                required
              />
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select defaultValue={editingBundle?.status || 'active'}>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={() => handleSaveBundle({})}>
              {editingBundle ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </SellerLayout>
  );
};

export default SellerCarsBundles;
