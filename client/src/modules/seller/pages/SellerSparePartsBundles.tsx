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
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ShoppingCart as BundleIcon,
  AttachMoney as PriceIcon
} from '@mui/icons-material';
import SellerLayout from '../components/layout/SellerLayout';

const SellerSparePartsBundles: React.FC = () => {
  const [bundles, setBundles] = React.useState([
    {
      id: 1,
      name: 'Engine Maintenance Kit',
      description: 'Complete engine maintenance bundle',
      parts: ['Oil Filter', 'Air Filter', 'Spark Plugs'],
      price: 89.99,
      discount: 15,
      status: 'active'
    },
    {
      id: 2,
      name: 'Brake System Bundle',
      description: 'Full brake system replacement parts',
      parts: ['Brake Pads', 'Brake Discs', 'Brake Fluid'],
      price: 149.99,
      discount: 20,
      status: 'active'
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
        status: 'active'
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
              Manage Bundles
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
          Create and manage spare part bundles to offer customers discounted packages and increase sales.
        </Alert>

        <Grid container spacing={3}>
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
                      Included Parts:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {bundle.parts.map((part, index) => (
                        <Chip key={index} label={part} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PriceIcon sx={{ fontSize: 16, color: 'success.main' }} />
                      <Typography variant="h6" fontWeight={600} color="success.main">
                        ${bundle.price}
                      </Typography>
                    </Box>
                    <Chip 
                      label={`${bundle.discount}% OFF`} 
                      color="error" 
                      size="small"
                    />
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
              Create your first bundle to start offering discounted packages to customers.
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

export default SellerSparePartsBundles;
