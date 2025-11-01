import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Autocomplete,
  Stack,
  Divider,
  Paper
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ShoppingCart as BundleIcon,
  AttachMoney as PriceIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import SellerLayout from '../components/layout/SellerLayout';
import { sparePartsApi, type SparePart, type SparePartBundle } from '../services/sparePartsApi';
import toast from 'react-hot-toast';

interface BundleFormData {
  name: string;
  description: string;
  bundle_type: string;
  total_price: number;
  bundle_discount: number;
  currency: string;
  status: 'active' | 'inactive';
  target_vehicle_make?: string;
  target_vehicle_model?: string;
  target_vehicle_year_from?: number;
  target_vehicle_year_to?: number;
  installation_included: boolean;
  installation_cost: number;
  warranty_period?: number;
  items: Array<{
    spare_part_id: string;
    quantity: number;
    unit_price: number;
  }>;
}

const SellerSparePartsBundles: React.FC = () => {
  const navigate = useNavigate();
  const [bundles, setBundles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [loadingParts, setLoadingParts] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBundle, setEditingBundle] = useState<any>(null);
  const [formData, setFormData] = useState<BundleFormData>({
    name: '',
    description: '',
    bundle_type: 'maintenance',
    total_price: 0,
    bundle_discount: 0,
    currency: 'USD',
    status: 'active',
    installation_included: false,
    installation_cost: 0,
    items: []
  });
  const [selectedParts, setSelectedParts] = useState<Array<{ part: SparePart; quantity: number; unit_price: number }>>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch bundles
  useEffect(() => {
    fetchBundles();
  }, [statusFilter]);

  const fetchBundles = async () => {
    try {
      setLoading(true);
      const response = await sparePartsApi.getBundles({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        page: 1,
        limit: 100
      });
      const bundlesData = response.data || response;
      setBundles(Array.isArray(bundlesData) ? bundlesData : []);
    } catch (error: any) {
      console.error('Failed to fetch bundles:', error);
      toast.error(error?.response?.data?.message || 'Failed to load bundles');
      setBundles([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch spare parts for selection
  const fetchSpareParts = async (searchTerm: string = '') => {
    try {
      setLoadingParts(true);
      const response = await sparePartsApi.getAll({
        search: searchTerm,
        status: 'active',
        page: 1,
        limit: 100
      });
      const partsData = response.data?.spare_parts || response.spare_parts || response.data || response;
      setSpareParts(Array.isArray(partsData) ? partsData : []);
    } catch (error: any) {
      console.error('Failed to fetch spare parts:', error);
      toast.error('Failed to load spare parts');
      setSpareParts([]);
    } finally {
      setLoadingParts(false);
    }
  };

  const handleCreateBundle = () => {
    setEditingBundle(null);
    setFormData({
      name: '',
      description: '',
      bundle_type: 'maintenance',
      total_price: 0,
      bundle_discount: 0,
      currency: 'USD',
      status: 'active',
      installation_included: false,
      installation_cost: 0,
      items: []
    });
    setSelectedParts([]);
    fetchSpareParts();
    setOpenDialog(true);
  };

  const handleEditBundle = async (bundle: any) => {
    try {
      setEditingBundle(bundle);
      const bundleDetails = await sparePartsApi.getBundleById(bundle.id);
      const bundleData = bundleDetails.data || bundleDetails;
      
      // Map bundle items to selected parts
      const parts = (bundleData.items || []).map((item: any) => ({
        part: {
          id: item.spare_part_id,
          name: item.spare_part_name,
          sku: item.spare_part_sku,
          price: item.unit_price || item.spare_part_price
        } as SparePart,
        quantity: item.quantity || 1,
        unit_price: item.unit_price || item.spare_part_price || 0
      }));

      setSelectedParts(parts);
      setFormData({
        name: bundleData.name || '',
        description: bundleData.description || '',
        bundle_type: 'maintenance', // Not stored in DB, just for form
        total_price: Number(bundleData.bundle_price) || 0, // Map bundle_price to total_price for form
        bundle_discount: Number(bundleData.discount_percentage) || 0, // Map discount_percentage to bundle_discount for form
        currency: bundleData.currency || 'USD',
        status: bundleData.status || 'active',
        target_vehicle_make: bundleData.target_vehicle_make || '',
        target_vehicle_model: bundleData.target_vehicle_model || '',
        target_vehicle_year_from: bundleData.target_vehicle_year_from || undefined,
        target_vehicle_year_to: bundleData.target_vehicle_year_to || undefined,
        installation_included: bundleData.installation_included || false,
        installation_cost: bundleData.installation_cost || 0,
        warranty_period: bundleData.warranty_period || undefined,
        items: []
      });
      fetchSpareParts();
      setOpenDialog(true);
    } catch (error: any) {
      console.error('Failed to fetch bundle details:', error);
      toast.error('Failed to load bundle details');
    }
  };

  const handleDeleteBundle = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this bundle?')) {
      return;
    }

    try {
      await sparePartsApi.deleteBundle(id);
      toast.success('Bundle deleted successfully');
      fetchBundles();
    } catch (error: any) {
      console.error('Failed to delete bundle:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete bundle');
    }
  };

  const handleAddPart = (part: SparePart) => {
    if (!selectedParts.find(p => p.part.id === part.id)) {
      setSelectedParts([...selectedParts, {
        part,
        quantity: 1,
        unit_price: part.price
      }]);
    }
  };

  const handleRemovePart = (partId: string) => {
    setSelectedParts(selectedParts.filter(p => p.part.id !== partId));
  };

  const handleUpdatePartQuantity = (partId: string, quantity: number) => {
    setSelectedParts(selectedParts.map(p => 
      p.part.id === partId ? { ...p, quantity: Math.max(1, quantity) } : p
    ));
  };

  const handleUpdatePartPrice = (partId: string, price: number) => {
    setSelectedParts(selectedParts.map(p => 
      p.part.id === partId ? { ...p, unit_price: Math.max(0, price) } : p
    ));
  };

  const calculateTotalPrice = () => {
    const itemsTotal = selectedParts.reduce((sum, p) => sum + (p.unit_price * p.quantity), 0);
    const installationCost = formData.installation_included ? formData.installation_cost : 0;
    return itemsTotal + installationCost;
  };

  const calculateDiscountPrice = () => {
    const total = calculateTotalPrice();
    const discount = formData.bundle_discount || 0;
    return total * (1 - discount / 100);
  };

  const handleSaveBundle = async () => {
    if (!formData.name.trim()) {
      toast.error('Bundle name is required');
      return;
    }

    if (selectedParts.length === 0) {
      toast.error('Please add at least one spare part to the bundle');
      return;
    }

    try {
      // Map frontend field names to backend field names and remove non-existent fields
      const totalPrice = calculateTotalPrice();
      const bundleData = {
        name: formData.name,
        description: formData.description || '',
        bundle_price: totalPrice, // backend expects bundle_price, not total_price
        discount_percentage: formData.bundle_discount || null, // backend expects discount_percentage, not bundle_discount
        currency: formData.currency || 'USD',
        status: formData.status || 'active',
        items: selectedParts.map(p => ({
          spare_part_id: p.part.id,
          quantity: p.quantity
          // Note: unit_price is not stored in bundle_items table
        }))
      };

      if (editingBundle) {
        await sparePartsApi.updateBundle(editingBundle.id, bundleData);
        toast.success('Bundle updated successfully');
      } else {
        await sparePartsApi.createBundle(bundleData);
        toast.success('Bundle created successfully');
      }

      setOpenDialog(false);
      fetchBundles();
    } catch (error: any) {
      console.error('Failed to save bundle:', error);
      toast.error(error?.response?.data?.message || `Failed to ${editingBundle ? 'update' : 'create'} bundle`);
    }
  };

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

        {/* Status Filter */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status Filter</InputLabel>
            <Select
              value={statusFilter}
              label="Status Filter"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
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
                        label={bundle.status || 'active'} 
                        color={bundle.status === 'active' ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {bundle.description || 'No description'}
                    </Typography>

                    {bundle.items && bundle.items.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                          Included Parts ({bundle.items.length}):
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {bundle.items.slice(0, 3).map((item: any, index: number) => (
                            <Chip 
                              key={index} 
                              label={item.spare_part_name || item.spare_part_sku} 
                              size="small" 
                              variant="outlined" 
                            />
                          ))}
                          {bundle.items.length > 3 && (
                            <Chip label={`+${bundle.items.length - 3} more`} size="small" variant="outlined" />
                          )}
                        </Box>
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PriceIcon sx={{ fontSize: 16, color: 'success.main' }} />
                        <Typography variant="h6" fontWeight={600} color="success.main">
                          ${(Number(bundle.bundle_price) || 0).toFixed(2)}
                        </Typography>
                      </Box>
                      {(Number(bundle.discount_percentage) || 0) > 0 && (
                        <Chip 
                          label={`${Number(bundle.discount_percentage) || 0}% OFF`} 
                          color="error" 
                          size="small"
                        />
                      )}
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
        )}

        {!loading && bundles.length === 0 && (
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                {editingBundle ? 'Edit Bundle' : 'Create New Bundle'}
              </Typography>
              <IconButton size="small" onClick={() => setOpenDialog(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                label="Bundle Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                fullWidth
                required
              />
              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                fullWidth
                multiline
                rows={3}
              />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Bundle Type</InputLabel>
                    <Select
                      value={formData.bundle_type}
                      label="Bundle Type"
                      onChange={(e) => setFormData({ ...formData, bundle_type: e.target.value })}
                    >
                      <MenuItem value="maintenance">Maintenance</MenuItem>
                      <MenuItem value="repair">Repair</MenuItem>
                      <MenuItem value="upgrade">Upgrade</MenuItem>
                      <MenuItem value="custom">Custom</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={formData.status}
                      label="Status"
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Bundle Discount (%)"
                    type="number"
                    value={formData.bundle_discount}
                    onChange={(e) => setFormData({ ...formData, bundle_discount: parseFloat(e.target.value) || 0 })}
                    fullWidth
                    inputProps={{ min: 0, max: 100, step: 0.1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Installation Cost"
                    type="number"
                    value={formData.installation_cost}
                    onChange={(e) => setFormData({ ...formData, installation_cost: parseFloat(e.target.value) || 0 })}
                    fullWidth
                    disabled={!formData.installation_included}
                  />
                </Grid>
              </Grid>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.installation_included}
                    onChange={(e) => setFormData({ ...formData, installation_included: e.target.checked })}
                  />
                }
                label="Include Installation Service"
              />

              <Divider sx={{ my: 1 }} />

              {/* Spare Parts Selection */}
              <Typography variant="subtitle1" fontWeight={600}>
                Add Spare Parts
              </Typography>

              <Autocomplete
                options={spareParts}
                getOptionLabel={(option) => `${option.name} (${option.sku}) - $${option.price}`}
                loading={loadingParts}
                onOpen={() => fetchSpareParts()}
                onInputChange={(_, value) => {
                  if (value.length > 2) {
                    fetchSpareParts(value);
                  }
                }}
                onChange={(_, value) => {
                  if (value) {
                    handleAddPart(value);
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search and Add Spare Parts"
                    placeholder="Type to search..."
                  />
                )}
              />

              {selectedParts.length > 0 && (
                <Paper sx={{ p: 2, mt: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                    Selected Parts ({selectedParts.length})
                  </Typography>
                  <Stack spacing={2}>
                    {selectedParts.map((selected, index) => (
                      <Box key={selected.part.id} sx={{ p: 1.5, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Box>
                            <Typography variant="body1" fontWeight={600}>
                              {selected.part.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              SKU: {selected.part.sku}
                            </Typography>
                          </Box>
                          <IconButton size="small" color="error" onClick={() => handleRemovePart(selected.part.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                          <Grid item xs={6}>
                            <TextField
                              label="Quantity"
                              type="number"
                              size="small"
                              value={selected.quantity}
                              onChange={(e) => handleUpdatePartQuantity(selected.part.id, parseInt(e.target.value) || 1)}
                              inputProps={{ min: 1 }}
                              fullWidth
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              label="Unit Price"
                              type="number"
                              size="small"
                              value={selected.unit_price}
                              onChange={(e) => handleUpdatePartPrice(selected.part.id, parseFloat(e.target.value) || 0)}
                              inputProps={{ min: 0, step: 0.01 }}
                              fullWidth
                            />
                          </Grid>
                        </Grid>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          Subtotal: ${(selected.unit_price * selected.quantity).toFixed(2)}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2">Items Total:</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      ${calculateTotalPrice().toFixed(2)}
                    </Typography>
                  </Box>
                  {formData.bundle_discount > 0 && (
                    <>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2">Discount ({formData.bundle_discount}%):</Typography>
                        <Typography variant="body2" color="error">
                          -${(calculateTotalPrice() * formData.bundle_discount / 100).toFixed(2)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1" fontWeight={600}>Final Price:</Typography>
                        <Typography variant="h6" color="success.main" fontWeight={600}>
                          ${calculateDiscountPrice().toFixed(2)}
                        </Typography>
                      </Box>
                    </>
                  )}
                </Paper>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveBundle}>
              {editingBundle ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </SellerLayout>
  );
};

export default SellerSparePartsBundles;
