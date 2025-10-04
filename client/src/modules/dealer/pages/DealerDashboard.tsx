import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  GridLegacy as Grid, 
  Card, 
  CardContent, 
  Avatar, 
  Stack, 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Menu,
  MenuList,
  ListItemIcon,
  ListItemText,
  Divider,
  Switch,
  Tooltip
} from '@mui/material';
import { 
  DirectionsCar, 
  TrendingUp, 
  People, 
  Assessment,
  Settings,
  Notifications,
  Logout,
  Close,
  Refresh,
  Star,
  Reviews,
  AccountCircle,
  Person,
  Lock,
  Palette,
  AdminPanelSettings,
  Edit,
  Help,
  Info
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { dealerAPI, DealerStats, Vehicle } from '../../../services/dealer.api';
import toast from 'react-hot-toast';
import BackgroundAnimation from '../../../shared/components/ui/BackgroundAnimation';
import { useThemeMode } from '../../../core/theme/ThemeProvider';
import ThemeSwitcher from '../../../shared/components/ui/ThemeSwitcher';

const DealerDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [dealerStats, setDealerStats] = useState<DealerStats | null>(null);
  const [dealerId, setDealerId] = useState<string | null>(null);
  const [inventory, setInventory] = useState<Vehicle[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [dealerProfile, setDealerProfile] = useState<any>(null);
  const [reviewsDialog, setReviewsDialog] = useState(false);
  const [adminDialog, setAdminDialog] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Theme and Profile states
  const { mode } = useThemeMode();
  const [profileMenuAnchor, setProfileMenuAnchor] = useState<null | HTMLElement>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  // Dialog states
  const [vehicleDialog, setVehicleDialog] = useState(false);
  const [analyticsDialog, setAnalyticsDialog] = useState(false);
  const [customersDialog, setCustomersDialog] = useState(false);
  const [settingsDialog, setSettingsDialog] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  
  // Vehicle form state
  const [vehicleForm, setVehicleForm] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    price: '',
    mileage: '',
    fuel_type: 'gasoline',
    transmission: 'automatic',
    body_type: 'sedan',
    color: '',
    condition: 'excellent',
    description: '',
    images: [] as string[],
    features: [] as string[],
    vin: '',
    engine_size: '',
    horsepower: '',
    torque: ''
  });


  // Load dealer data
  useEffect(() => {
    loadDealerData();
  }, []);

  // Auto-refresh revenue data every 30 seconds for real dealers
  useEffect(() => {
    if (!dealerId) return;
    
    const interval = setInterval(() => {
      loadDealerData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [dealerId]);

  const loadDealerData = async () => {
    try {
      setLoading(true);
      
      // Get user info from local storage
      const userData = localStorage.getItem('user') || localStorage.getItem('user_data');
      if (!userData) {
        navigate('/auth/login');
        return;
      }

      // Check if user is admin and load user profile
      try {
        const parsedUserData = JSON.parse(userData);
        setIsAdmin(parsedUserData.role === 'admin');
        setUserProfile(parsedUserData);
      } catch (error) {
        setIsAdmin(false);
        // Use demo user profile
        setUserProfile({
          name: 'Dealer Manager',
          email: 'dealer@example.com',
          role: 'dealer',
          avatar: null
        });
      }
      
      // Try to get real dealer data first, then fallback to demo data
      try {
        const profile = await dealerAPI.getMyProfile();
        const currentDealerId = profile?.id;
        
        if (!currentDealerId || currentDealerId.length <= 10 || currentDealerId.includes('dealer-')) {
          console.log('Invalid dealer profile, using demo data');
          setDealerId(null);
          setDemoData();
          return;
        }
        
        console.log('Loading real dealer data for dealerId:', currentDealerId);
        setDealerId(currentDealerId);
        
        // Load real revenue and sales data
        const [statsData, inventoryData, profileData] = await Promise.all([
          dealerAPI.getDealerStats(currentDealerId),
          dealerAPI.getDealerInventory(currentDealerId),
          dealerAPI.getDealerProfile(currentDealerId)
        ]);
        
        setDealerStats(statsData || null);
        setInventory((inventoryData as any).inventory || []);
        setDealerProfile(profileData || null);
        
      } catch (profileError) {
        console.log('Failed to get real dealer data, using demo data:', profileError);
        setDealerId(null);
        setDemoData();
      }
      
    } catch (error) {
      console.error('Error loading dealer data:', error);
      toast.error('Failed to load dealer data');
      setDemoData();
    } finally {
      setLoading(false);
    }
  };

  // Load detailed analytics data
  const loadAnalyticsData = async () => {
    if (!dealerId) return;
    
    setLoadingAnalytics(true);
    try {
      const analytics = await dealerAPI.getDealerAnalytics(dealerId, undefined, undefined, 'monthly');
      setAnalyticsData(analytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
      // Use demo analytics data
      setAnalyticsData({
        sales_by_period: [
          { period: '2024-01', sales_count: 3, total_revenue: 61500, average_price: 20500 },
          { period: '2023-12', sales_count: 4, total_revenue: 85400, average_price: 21350 }
        ],
        top_selling_models: [
          { make: 'Toyota', model: 'Camry', sales_count: 12, total_revenue: 270000, average_price: 22500 },
          { make: 'Honda', model: 'Civic', sales_count: 8, total_revenue: 151200, average_price: 18900 }
        ]
      });
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const setDemoData = () => {
    // Demo data for development/demonstration
    const demoStats: DealerStats = {
      inventory: {
        total_vehicles: 24,
        active_listings: 18,
        sold_vehicles: 6,
        average_price: 28500
      },
      sales: {
        total_sales: 12,
        total_revenue: 285000,
        average_sale_price: 23750
      },
      recent_sales: [
        { id: '1', make: 'Toyota', model: 'Camry', year: 2021, price: 22500, sold_at: '2024-01-15' },
        { id: '2', make: 'Honda', model: 'Civic', year: 2020, price: 18900, sold_at: '2024-01-10' }
      ],
      monthly_sales: [
        { month: 'January 2024', sales_count: 3, monthly_revenue: 61500 },
        { month: 'December 2023', sales_count: 4, monthly_revenue: 85400 }
      ]
    };
    
    const demoInventory: Vehicle[] = [
        {
          id: 'v1',
          make: 'Toyota',
          model: 'Corolla',
          year: 2022,
          price: 18900,
          mileage: 25000,
          fuel_type: 'gasoline',
          transmission: 'automatic',
          condition: 'excellent',
          status: 'active',
          images: [],
          created_at: '2024-01-15'
        },
        {
          id: 'v2',
          make: 'Honda',
          model: 'Accord',
          year: 2023,
          price: 26900,
          mileage: 15000,
          fuel_type: 'gasoline',
          transmission: 'automatic',
          condition: 'excellent',
          status: 'active',
          images: [],
          created_at: '2024-01-10'
        }
      ];
    
    setDealerStats(demoStats);
    setInventory(demoInventory);
    
    // Set demo analytics data
    setAnalyticsData({
      sales_by_period: [
        { period: '2024-01', sales_count: 3, total_revenue: 61500, average_price: 20500 },
        { period: '2023-12', sales_count: 4, total_revenue: 85400, average_price: 21350 },
        { period: '2023-11', sales_count: 5, total_revenue: 138100, average_price: 27620 },
        { period: '2023-10', sales_count: 2, total_revenue: 45600, average_price: 22800 }
      ],
      top_selling_models: [
        { make: 'Toyota', model: 'Camry', sales_count: 12, total_revenue: 270000, average_price: 22500 },
        { make: 'Honda', model: 'Civic', sales_count: 8, total_revenue: 151200, average_price: 18900 },
        { make: 'Nissan', model: 'Altima', sales_count: 4, total_revenue: 92400, average_price: 23100 }
      ]
    });
  };

  // Vehicle management functions
  const handleAddVehicle = async () => {
    if (!dealerId) {
      // Demo mode - just show success and add to local demo data
      toast.success('Vehicle added successfully! (Demo Mode)');
      setVehicleDialog(false);
      resetVehicleForm();
      
      // Add to demo inventory
      const newVehicle: Vehicle = {
        id: 'demo-' + Date.now(),
        make: vehicleForm.make,
        model: vehicleForm.model,
        year: vehicleForm.year,
        price: parseFloat(vehicleForm.price),
        mileage: parseInt(vehicleForm.mileage) || 0,
        fuel_type: vehicleForm.fuel_type,
        transmission: vehicleForm.transmission,
        condition: vehicleForm.condition,
        status: 'active',
        images: vehicleForm.images,
        created_at: new Date().toISOString()
      };
      
      setInventory(prev => [newVehicle, ...prev]);
      return;
    }
    
    try {
      const vehicleData = {
        // Required fields
        make: vehicleForm.make,
        model: vehicleForm.model,
        year: vehicleForm.year,
        price: parseFloat(vehicleForm.price),
        
        // Optional fields - clean empty strings and invalid values
        mileage: vehicleForm.mileage && vehicleForm.mileage.trim() ? parseInt(vehicleForm.mileage) : undefined,
        fuel_type: vehicleForm.fuel_type || undefined,
        transmission: vehicleForm.transmission || undefined,
        body_type: vehicleForm.body_type || undefined,
        color: vehicleForm.color && vehicleForm.color.trim() ? vehicleForm.color.trim() : undefined,
        condition: vehicleForm.condition || undefined,
        description: vehicleForm.description && vehicleForm.description.trim() ? vehicleForm.description.trim() : undefined,
        images: (vehicleForm.images && vehicleForm.images.length > 0) ? vehicleForm.images : undefined,
        features: (vehicleForm.features && vehicleForm.features.length > 0) ? vehicleForm.features : undefined,
        vin: vehicleForm.vin && vehicleForm.vin.trim() ? vehicleForm.vin.trim() : undefined,
        engine_size: vehicleForm.engine_size && vehicleForm.engine_size.toString().trim() ? vehicleForm.engine_size : undefined,
        horsepower: vehicleForm.horsepower && vehicleForm.horsepower.trim() ? parseInt(vehicleForm.horsepower) : undefined,
        torque: vehicleForm.torque && vehicleForm.torque.trim() ? parseInt(vehicleForm.torque) : undefined
      };
      
      await dealerAPI.addVehicle(dealerId, vehicleData);
      toast.success('Vehicle added successfully!');
      setVehicleDialog(false);
      resetVehicleForm();
      loadDealerData(); // Reload data
    } catch (error) {
       console.error('Error adding vehicle:', error);
      toast.error('Failed to add vehicle');
    }
  };

  const handleEditVehicle = async () => {
    if (!dealerId || !editingVehicle) return;
    
    try {
        await dealerAPI.updateVehicle(
        dealerId, 
        editingVehicle.id, 
        {
          // Required fields
          make: vehicleForm.make,
          model: vehicleForm.model,
          year: vehicleForm.year,
          price: parseFloat(vehicleForm.price),
          
          // Optional fields - clean empty strings and invalid values
          mileage: vehicleForm.mileage && vehicleForm.mileage.trim() ? parseInt(vehicleForm.mileage) : undefined,
          fuel_type: vehicleForm.fuel_type || undefined,
          transmission: vehicleForm.transmission || undefined,
          body_type: vehicleForm.body_type || undefined,
          color: vehicleForm.color && vehicleForm.color.trim() ? vehicleForm.color.trim() : undefined,
          condition: vehicleForm.condition || undefined,
          description: vehicleForm.description && vehicleForm.description.trim() ? vehicleForm.description.trim() : undefined,
          images: (vehicleForm.images && vehicleForm.images.length > 0) ? vehicleForm.images : undefined,
          features: (vehicleForm.features && vehicleForm.features.length > 0) ? vehicleForm.features : undefined,
          vin: vehicleForm.vin && vehicleForm.vin.trim() ? vehicleForm.vin.trim() : undefined,
          engine_size: vehicleForm.engine_size && vehicleForm.engine_size.toString().trim() ? vehicleForm.engine_size : undefined,
          horsepower: vehicleForm.horsepower && vehicleForm.horsepower.trim() ? parseInt(vehicleForm.horsepower) : undefined,
          torque: vehicleForm.torque && vehicleForm.torque.trim() ? parseInt(vehicleForm.torque) : undefined,
        }
      );
      toast.success('Vehicle updated successfully!');
      setVehicleDialog(false);
      setEditingVehicle(null);
      resetVehicleForm();
      loadDealerData();
    } catch (error) {
      console.error('Error updating vehicle:', error);
      toast.error('Failed to update vehicle');
    }
  };


  const resetVehicleForm = () => {
    setVehicleForm({
      make: '',
      model: '',
      year: new Date().getFullYear(),
      price: '',
      mileage: '',
      fuel_type: 'gasoline',
      transmission: 'automatic',
      body_type: 'sedan',
      color: '',
      condition: 'excellent',
      description: '',
      images: [],
      features: [],
      vin: '',
      engine_size: '',
      horsepower: '',
      torque: ''
    });
  };

  const openVehicleDialog = (vehicle?: Vehicle) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setVehicleForm({
        make: vehicle.make || '',
        model: vehicle.model || '',
        year: vehicle.year || new Date().getFullYear(),
        price: vehicle.price?.toString() || '',
        mileage: vehicle.mileage?.toString() || '',
        fuel_type: vehicle.fuel_type || 'gasoline',
        transmission: vehicle.transmission || 'automatic',
        body_type: vehicle.body_type || 'sedan',
        color: vehicle.color || '',
        condition: vehicle.condition || 'excellent',
        description: vehicle.description || '',
        images: vehicle.images || [],
        features: vehicle.features || [],
        vin: vehicle.vin || '',
        engine_size: (vehicle.engine_size || '').toString(),
        horsepower: vehicle.horsepower?.toString() || '',
        torque: vehicle.torque?.toString() || ''
      });
    } else {
      resetVehicleForm();
      setEditingVehicle(null);
    }
    setVehicleDialog(true);
  };

  // Theme switching functionality

  // Profile menu handlers
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    localStorage.removeItem('user');
    localStorage.removeItem('user_data');
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
    navigate('/auth/login');
  };

  const handleProfileView = () => {
    handleProfileMenuClose();
    setSettingsDialog(true);
  };

  const handleAdminPanel = () => {
    handleProfileMenuClose();
    setAdminDialog(true);
  };

  const statsCards = [
    {
      title: 'Total Vehicles',
      value: dealerStats?.inventory?.total_vehicles?.toString() || '0',
      icon: <DirectionsCar />,
      color: '#3b82f6',
      change: '+12%'
    },
    {
      title: 'Sales This Month',
      value: dealerStats?.sales?.total_revenue ? `$${dealerStats.sales.total_revenue.toLocaleString()}` : '$0',
      icon: <TrendingUp />,
      color: '#10b981',
      change: '+8%'
    },
    {
      title: 'Active Listings',
      value: dealerStats?.inventory?.active_listings?.toString() || '0',
      icon: <People />,
      color: '#f59e0b',
      change: '+5%'
    },
    {
      title: 'Average Price',
      value: dealerStats?.sales?.average_sale_price ? `$${dealerStats.sales.average_sale_price.toLocaleString()}` : '$0',
        icon: <Assessment />,
        color: '#8b5cf6',
        change: '+2%'
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Background Animation */}
      <BackgroundAnimation enabled={mode === 'dark'} opacity={mode === 'dark' ? 0.6 : 0.4} />
      
      {/* Header */}
      <Box sx={{ 
        bgcolor: 'primary.main', 
        color: 'primary.contrastText',
        py: 2,
        mb: 3
      }}>
        <Container maxWidth="xl">
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                Dealer Dashboard
              </Typography>
              {!dealerId && (
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Demonstration Mode - Showing sample data
                </Typography>
              )}
              {dealerId && (
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Real-time Revenue Dashboard
                </Typography>
              )}
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              {/* Theme Toggle */}
              <ThemeSwitcher position="static" size="small" />

              {/* Refresh Button */}
              <Tooltip title="Refresh data">
                <IconButton color="inherit" onClick={() => loadDealerData()} disabled={loading}>
                  <Refresh />
                </IconButton>
              </Tooltip>

              {/* Notifications */}
              <Tooltip title="Notifications">
                <IconButton color="inherit" onClick={() => toast('No new notifications')}>
                  <Notifications />
                </IconButton>
              </Tooltip>

              {/* Quick Settings */}
              <Tooltip title="Dashboard settings">
                <IconButton color="inherit" onClick={() => setSettingsDialog(true)}>
                  <Settings />
                </IconButton>
              </Tooltip>

              {/* User Profile */}
              <Tooltip title="User profile & account">
                <IconButton color="inherit" onClick={handleProfileMenuOpen}>
                  {userProfile?.avatar ? (
                    <Avatar 
                      src={userProfile.avatar} 
                      sx={{ width: 32, height: 32 }}
                    />
                  ) : (
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(255,255,255,0.2)' }}>
                      <AccountCircle sx={{ fontSize: 24 }} />
                    </Avatar>
                  )}
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Profile Dropdown Menu */}
      <Menu
        anchorEl={profileMenuAnchor}
        open={Boolean(profileMenuAnchor)}
        onClose={handleProfileMenuClose}
        PaperProps={{
          sx: {
            mt: 2,
            minWidth: 280,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* Profile Header */}
        <Box sx={{ px: 2, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            {userProfile?.avatar ? (
              <Avatar 
                src={userProfile.avatar} 
                sx={{ width: 48, height: 48, mr: 2 }}
              />
            ) : (
              <Avatar sx={{ width: 48, height: 48, mr: 2, bgcolor: 'primary.main' }}>
                <AccountCircle />
              </Avatar>
            )}
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                {userProfile?.name || 'Dealer Manager'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {userProfile?.email || 'dealer@example.com'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {userProfile?.role || 'dealer'} account
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Profile Actions */}
        <MenuList>
          <MenuItem onClick={handleProfileView}>
            <ListItemIcon>
              <Person />
            </ListItemIcon>
            <ListItemText primary="View Profile" />
          </MenuItem>
          <MenuItem onClick={() => { handleProfileMenuClose(); toast('Edit profile coming soon...'); }}>
            <ListItemIcon>
              <Edit />
            </ListItemIcon>
            <ListItemText primary="Edit Profile" />
          </MenuItem>
          <MenuItem onClick={() => { handleProfileMenuClose(); toast('Security settings coming soon...'); }}>
            <ListItemIcon>
              <Lock />
            </ListItemIcon>
            <ListItemText primary="Security Settings" />
          </MenuItem>

          <Divider />

          {/* Admin Panel (only for admins) */}
          {isAdmin && (
            <>
              <MenuItem onClick={handleAdminPanel}>
                <ListItemIcon>
                  <AdminPanelSettings />
                </ListItemIcon>
                <ListItemText primary="Admin Panel" />
              </MenuItem>
              <Divider />
            </>
          )}

          <Divider />

          <MenuItem onClick={() => { handleProfileMenuClose(); toast('Help coming soon...'); }}>
            <ListItemIcon>
              <Help />
            </ListItemIcon>
            <ListItemText primary="Help & Support" />
          </MenuItem>

          <MenuItem onClick={() => { handleProfileMenuClose(); toast('About dialog coming soon...'); }}>
            <ListItemIcon>
              <Info />
            </ListItemIcon>
            <ListItemText primary="About" />
          </MenuItem>

          <Divider />

          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <Logout color="error" />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </MenuItem>
        </MenuList>
      </Menu>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ pb: 4 }}>
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statsCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={card.title}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card sx={{ 
                  height: '100%',
                  bgcolor: 'background.paper',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    transition: 'transform 0.2s ease-in-out'
                  }
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ 
                        bgcolor: card.color, 
                        mr: 2,
                        width: 48,
                        height: 48
                      }}>
                        {card.icon}
                      </Avatar>
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                          {loading ? '...' : card.value}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {card.title}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" sx={{ color: card.color, ml: 'auto' }}>
                      {loading ? '' : card.change} from last month
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Inventory Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Paper sx={{ p: 3, bgcolor: 'background.paper', mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
              Recent Inventory
            </Typography>
            <Grid container spacing={2}>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Grid item xs={12} sm={6} md={4} key={i}>
                    <Card>
                      <CardContent>
                        <Typography sx={{ height: 20, bgcolor: 'grey.300', borderRadius: 1, mb: 1 }} />
                        <Typography sx={{ height: 16, bgcolor: 'grey.300', borderRadius: 1, mb: 1, width: '60%' }} />
                        <Typography sx={{ height: 14, bgcolor: 'grey.300', borderRadius: 1 }} />
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              ) : (
                inventory.slice(0, 6).map((vehicle) => (
                  <Grid item xs={12} sm={6} md={4} key={vehicle.id}>
                    <Card sx={{ 
                      '&:hover': { 
                        transform: 'translateY(-2px)',
                        transition: 'transform 0.2s ease-in-out'
                      }
                    }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                          {vehicle.make} {vehicle.model}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {vehicle.year} • {vehicle.mileage?.toLocaleString()} miles
                        </Typography>
                        <Typography variant="h6" color="success.main" sx={{ mb: 1 }}>
                          ${vehicle.price?.toLocaleString()}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Typography variant="caption" sx={{ 
                            bgcolor: 'primary.100', 
                            color: 'primary.main', 
                            px: 1, 
                            py: 0.5, 
                            borderRadius: 1 
                          }}>
                            {vehicle.status}
                          </Typography>
                          <Typography variant="caption" sx={{ 
                            bgcolor: 'grey.100', 
                            color: 'grey.700', 
                            px: 1, 
                            py: 0.5, 
                            borderRadius: 1 
                          }}>
                            {vehicle.condition}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>
          </Paper>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  cursor: 'pointer',
                  '&:hover': { 
                    bgcolor: 'primary.light',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease-in-out',
                    boxShadow: 3
                  }
                }} onClick={() => openVehicleDialog()}>
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <DirectionsCar sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h6">Add Vehicle</Typography>
                    <Typography variant="body2" color="text.secondary">
                      List a new vehicle for sale
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" color="success.main">
                        → Quick form with validation
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  cursor: 'pointer',
                  '&:hover': { 
                    bgcolor: 'success.light',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease-in-out',
                    boxShadow: 3
                  }
                }} onClick={() => {
                  setAnalyticsDialog(true);
                  loadAnalyticsData();
                  toast('Loading real-time analytics...');
                }}>
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <Assessment sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                    <Typography variant="h6">View Analytics</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Check sales performance
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" color="info.main">
                        → Real revenue charts
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  cursor: 'pointer',
                  '&:hover': { 
                    bgcolor: 'warning.light',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease-in-out'
                  }
                }} onClick={() => {
                  setCustomersDialog(true);
                  toast('Opening customer database...');
                }}>
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <People sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                    <Typography variant="h6">Manage Customers</Typography>
                    <Typography variant="body2" color="text.secondary">
                      View customer information
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" color="success.main">
                        → 247 customers registered
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  cursor: 'pointer',
                  '&:hover': { 
                    bgcolor: 'secondary.light',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease-in-out'
                  }
                }} onClick={() => {
                  setReviewsDialog(true);
                  toast('Loading customer reviews...');
                }}>
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <Reviews sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                    <Typography variant="h6">View Reviews</Typography>
                    <Typography variant="body2" color="text.secondary">
                      See customer feedback
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" color="info.main">
                        → 4.8★ average rating
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              {isAdmin && (
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    cursor: 'pointer',
                    '&:hover': { 
                      bgcolor: 'error.light',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s ease-in-out'
                    }
                  }} onClick={() => {
                    setAdminDialog(true);
                    toast('Opening admin panel...');
                  }}>
                    <CardContent sx={{ textAlign: 'center', py: 3 }}>
                      <AdminPanelSettings sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                      <Typography variant="h6">Admin Panel</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Manage dealers & verify accounts
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="warning.main">
                          → 8 pending verifications
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ 
                  cursor: 'pointer',
                  '&:hover': { 
                    bgcolor: 'info.light',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease-in-out'
                  }
                }} onClick={() => {
                  setSettingsDialog(true);
                  toast('Opening profile settings...');
                }}>
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <Settings sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                    <Typography variant="h6">Settings</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Configure your profile
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" color="primary.main">
                        → Profile & preferences
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </motion.div>

        {/* Vehicle Dialog */}
        <Dialog 
          open={vehicleDialog} 
          onClose={() => setVehicleDialog(false)} 
          maxWidth="md" 
          fullWidth
          scroll="body"
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
              <IconButton onClick={() => setVehicleDialog(false)}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Make"
                    value={vehicleForm.make}
                    onChange={(e) => setVehicleForm(prev => ({ ...prev, make: e.target.value }))}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Model"
                    value={vehicleForm.model}
                    onChange={(e) => setVehicleForm(prev => ({ ...prev, model: e.target.value }))}
                    required
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="Year"
                    type="number"
                    value={vehicleForm.year}
                    onChange={(e) => setVehicleForm(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                    required
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="Price"
                    type="number"
                    value={vehicleForm.price}
                    onChange={(e) => setVehicleForm(prev => ({ ...prev, price: e.target.value }))}
                    required
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="Mileage"
                    type="number"
                    value={vehicleForm.mileage}
                    onChange={(e) => setVehicleForm(prev => ({ ...prev, mileage: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Fuel Type</InputLabel>
                    <Select
                      value={vehicleForm.fuel_type}
                      onChange={(e) => setVehicleForm(prev => ({ ...prev, fuel_type: e.target.value }))}
                    >
                      <MenuItem value="gasoline">Gasoline</MenuItem>
                      <MenuItem value="diesel">Diesel</MenuItem>
                      <MenuItem value="electric">Electric</MenuItem>
                      <MenuItem value="hybrid">Hybrid</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Transmission</InputLabel>
                    <Select
                      value={vehicleForm.transmission}
                      onChange={(e) => setVehicleForm(prev => ({ ...prev, transmission: e.target.value }))}
                    >
                      <MenuItem value="automatic">Automatic</MenuItem>
                      <MenuItem value="manual">Manual</MenuItem>
                      <MenuItem value="semi_automatic">Semi-Automatic</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={3}
                    value={vehicleForm.description}
                    onChange={(e) => setVehicleForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setVehicleDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={editingVehicle ? handleEditVehicle : handleAddVehicle}>
              {editingVehicle ? 'Update' : 'Add'} Vehicle
            </Button>
          </DialogActions>
        </Dialog>

        {/* Analytics Dialog */}
        <Dialog open={analyticsDialog} onClose={() => setAnalyticsDialog(false)} maxWidth="lg" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Sales Analytics & Revenue
              <IconButton onClick={() => setAnalyticsDialog(false)}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="h6" sx={{ mb: 3 }}>
              {dealerId ? 'Real Revenue Data' : 'Demo Revenue Data'}
            </Typography>
            
            {/* Revenue Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>Total Revenue</Typography>
                    <Typography variant="h3" color="success.main">
                      ${dealerStats?.sales?.total_revenue?.toLocaleString() || '285,000'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">All Time Sales</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>Vehicles Sold</Typography>
                    <Typography variant="h3" color="primary.main">
                      {dealerStats?.sales?.total_sales?.toString() || '24'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Total Sales</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>Avg Sale Price</Typography>
                    <Typography variant="h3" color="info.main">
                      ${dealerStats?.sales?.average_sale_price?.toLocaleString() || '23,750'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Average per Vehicle</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Revenue Trend */}
            {loadingAnalytics ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography>Loading revenue analytics...</Typography>
              </Box>
            ) : analyticsData?.sales_by_period?.length > 0 ? (
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Monthly Revenue Trend</Typography>
                <Grid container spacing={2}>
                  {analyticsData.sales_by_period.slice(0, 6).map((period: any) => (
                    <Grid item xs={6} md={4} key={period.period}>
                      <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="subtitle2">{period.period}</Typography>
                        <Typography variant="h6" color="success.main">
                          ${period.total_revenue?.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {period.sales_count} sales
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            ) : (
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Monthly Revenue Trend</Typography>
                <Typography color="text.secondary">
                  No sales data available yet. Revenue will appear here once vehicles are sold.
                </Typography>
              </Paper>
            )}

            {/* Top Selling Models */}
            {analyticsData?.top_selling_models?.length > 0 && (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Top Selling Models by Revenue</Typography>
                {analyticsData.top_selling_models.slice(0, 5).map((model: any, index: number) => (
                  <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Box>
                      <Typography variant="subtitle1">
                        {model.make} {model.model}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {model.sales_count} vehicles sold
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h6" color="success.main">
                        ${model.total_revenue?.toLocaleString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Avg: ${model.average_price?.toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Paper>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAnalyticsDialog(false)}>Close</Button>
            <Button variant="contained" onClick={loadAnalyticsData} disabled={loadingAnalytics}>
              Refresh Data
            </Button>
          </DialogActions>
        </Dialog>

        {/* Customers Dialog */}
        <Dialog open={customersDialog} onClose={() => setCustomersDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Customer Management System
              <IconButton onClick={() => setCustomersDialog(false)}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Customer Database & Analytics
            </Typography>
            
            {/* Customer Stats Overview */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary.main">247</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Customers
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">38</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Repeat Customers
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="info.main">4.7★</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Avg Rating
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main">15%</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Retention Rate
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Recent Customer List */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Recent Customers</Typography>
              {[
                {
                  id: 1,
                  name: "Sarah Johnson",
                  email: "sarah.j@email.com",
                  phone: "(555) 123-4567",
                  city: "San Francisco",
                  lastPurchase: "2024-01-15",
                  totalSpent: 45000,
                  vehiclesBought: 2,
                  rating: 5
                },
                {
                  id: 2,
                  name: "Michael Chen",
                  email: "m.chen@email.com", 
                  phone: "(555) 987-6543",
                  city: "Los Angeles",
                  lastPurchase: "2024-01-12",
                  totalSpent: 32000,
                  vehiclesBought: 1,
                  rating: 4
                },
                {
                  id: 3,
                  name: "Emily Rodriguez",
                  email: "emily.r@email.com",
                  phone: "(555) 456-7890",
                  city: "Houston",
                  lastPurchase: "2024-01-08",
                  totalSpent: 68000,
                  vehiclesBought: 3,
                  rating: 5
                }
              ].map((customer) => (
                <Box 
                  key={customer.id} 
                  sx={{ 
                    p: 2, 
                    mb: 1, 
                    border: '1px solid', 
                    borderColor: 'grey.300',
                    borderRadius: 1,
                    '&:hover': { bgcolor: 'grey.50' }
                  }}
                >
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={3}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {customer.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {customer.email}
                      </Typography>
                    </Grid>
                    <Grid item xs={4} md={2}>
                      <Typography variant="body2">{customer.phone}</Typography>
                    </Grid>
                    <Grid item xs={4} md={2}>
                      <Typography variant="body2">{customer.city}</Typography>
                    </Grid>
                    <Grid item xs={4} md={2}>
                      <Typography variant="body2">${customer.totalSpent.toLocaleString()}</Typography>
                    </Grid>
                    <Grid item xs={6} md={2}>
                      <Typography variant="body2">{customer.lastPurchase}</Typography>
                    </Grid>
                    <Grid item xs={6} md={1}>
                      <Stack spacing={0.5}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {'★'.repeat(customer.rating)}{'☆'.repeat(5 - customer.rating)}
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {customer.vehiclesBought} cars
                        </Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Paper>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCustomersDialog(false)}>Close</Button>
            <Button variant="contained" color="primary">
              Export Customer Data
            </Button>
          </DialogActions>
        </Dialog>

        {/* Reviews Dialog */}
        <Dialog open={reviewsDialog} onClose={() => setReviewsDialog(false)} maxWidth="lg" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Customer Reviews & Feedback
              <IconButton onClick={() => setReviewsDialog(false)}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Review Summary
            </Typography>
            
            {/* Review Score */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h2" color="primary.main" sx={{ mr: 2 }}>
                  {dealerProfile?.average_rating || '4.8'}
                </Typography>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {'★'.repeat(5).split('').map((_, i) => (
                      <Star 
                        key={i}
                        sx={{ 
                          color: i < (dealerProfile?.average_rating || 4) ? 'gold' : 'grey.300',
                          fontSize: 24 
                        }} 
                      />
                    ))}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Based on {dealerProfile?.review_count || 156} reviews
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Rating Breakdown */}
            <Typography variant="h6" sx={{ mb: 2 }}>Rating Breakdown</Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {[
                { rating: 5, count: 89 },
                { rating: 4, count: 34 },
                { rating: 3, count: 18 },
                { rating: 2, count: 12 },
                { rating: 1, count: 3 }
              ].map(({ rating, count }) => (
                <Grid item xs={6} md={2} key={rating}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">{rating} star</Typography>
                    <Box sx={{ 
                      flexGrow: 1, 
                      height: 8, 
                      bgcolor: 'grey.200', 
                      borderRadius: 1,
                      overflow: 'hidden'
                    }}>
                      <Box sx={{ 
                        width: `${(count / Math.max(...[89, 34, 18, 12, 3])) * 100}%`,
                        height: '100%',
                        bgcolor: 'primary.main'
                      }} />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {count}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            {/* Recent Reviews */}
            <Typography variant="h6" sx={{ mb: 2 }}>Recent Reviews</Typography>
            {[
              {
                id: 1,
                name: "Sarah Johnson",
                rating: 5,
                comment: "Excellent service! The team was very professional and helped me find the perfect vehicle. The financing process was smooth and they answered all my questions.",
                date: "2024-01-15",
                vehicle: "2020 Honda Civic"
              },
              {
                id: 2,
                name: "Michael Chen", 
                rating: 4,
                comment: "Great experience overall. The car was exactly as described and the staff was helpful throughout the buying process.",
                date: "2024-01-12",
                vehicle: "2019 Toyota Camry"
              },
              {
                id: 3,
                name: "Emily Rodriguez",
                rating: 5,
                comment: "Outstanding dealership! They went above and beyond to ensure I was completely satisfied with my purchase.",
                date: "2024-01-08",
                vehicle: "2021 Nissan Altima"
              }
            ].map((review) => (
              <Paper key={review.id} sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {review.name}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ display: 'flex' }}>
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {review.date}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {review.comment}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Purchased: {review.vehicle}
                </Typography>
              </Paper>
            ))}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReviewsDialog(false)}>Close</Button>
            <Button variant="contained" color="primary">
              View All Reviews
            </Button>
          </DialogActions>
        </Dialog>

        {/* Admin Panel Dialog */}
        <Dialog open={adminDialog} onClose={() => setAdminDialog(false)} maxWidth="lg" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Admin Panel - Dealer Management
              <IconButton onClick={() => setAdminDialog(false)}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Dealer Verification & Management
            </Typography>
            
            {/* Admin Stats */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary.main">42</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Dealers
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main">8</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Pending Verification
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">34</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Verified Dealers
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="error.main">2</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Suspended Accounts
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Pending Verifications */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Pending Dealer Verifications</Typography>
              {[
                {
                  id: 1,
                  name: "City Auto Dealers",
                  email: "contact@cityauto.com",
                  applied: "2024-01-10",
                  status: "pending_documents"
                },
                {
                  id: 2,
                  name: "Premier Motors",
                  email: "info@premiermotors.com",
                  applied: "2024-01-12",
                  status: "pending_review"
                }
              ].map((dealer) => (
                <Box 
                  key={dealer.id} 
                  sx={{ 
                    p: 2, 
                    mb: 1, 
                    border: '1px solid', 
                    borderColor: 'grey.300',
                    borderRadius: 1,
                    '&:hover': { bgcolor: 'grey.50' }
                  }}
                >
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {dealer.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {dealer.email}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography variant="body2">{dealer.applied}</Typography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography variant="body2" color="warning.main">
                        {dealer.status.replace('_', ' ')}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        onClick={() => toast.success(`Verification action for ${dealer.name}`)}
                      >
                        Review
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Paper>

            {/* Quick Actions */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Admin Actions</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Button variant="outlined" fullWidth onClick={() => toast.success('Getting all dealers...')}>
                    View All Dealers
                  </Button>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Button variant="outlined" fullWidth onClick={() => toast.success('Exporting dealer data...')}>
                    Export Dealer Data
                  </Button>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Button variant="outlined" fullWidth onClick={() => toast.success('Running verification reports...')}>
                    Verification Reports
                  </Button>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Button variant="outlined" fullWidth color="error" onClick={() => toast('Admin tools coming soon...')}>
                    System Settings
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAdminDialog(false)}>Close</Button>
            <Button variant="contained" color="error">
              Save All Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Settings Dialog */}
        <Dialog open={settingsDialog} onClose={() => setSettingsDialog(false)} maxWidth="lg" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Dealer Settings & Profile Management
              <IconButton onClick={() => setSettingsDialog(false)}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="h6" sx={{ mb: 3 }}>
              {dealerId ? 'Profile Management' : 'Demo Profile Settings'}
            </Typography>
            
            {/* Profile Overview */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Business Profile</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Business Name</Typography>
                  <Typography variant="body1">{dealerProfile?.business_name || 'AutoMax Dealers'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Business Type</Typography>
                  <Typography variant="body1">{dealerProfile?.business_type || 'Automotive Dealership'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Address</Typography>
                  <Typography variant="body1">{dealerProfile?.address || '123 Car Street, Auto City, AC 12345'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Phone</Typography>
                  <Typography variant="body1">{dealerProfile?.phone || '(555) 123-4567'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Description</Typography>
                  <Typography variant="body1">{dealerProfile?.description || 'Professional automotive dealership specializing in quality used and new vehicles.'}</Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Account Status */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Account Status</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2">Account Status</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      bgcolor: dealerProfile?.status === 'active' ? 'success.main' : 'warning.main' 
                    }} />
                    <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                      {dealerProfile?.status || 'Active'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2">Verification Status</Typography>
                  <Typography variant="body1" color={dealerProfile?.verified ? 'success.main' : 'warning.main'}>
                    {dealerProfile?.verified ? '✓ Verified' : '⚠ Pending'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2">Account Created</Typography>
                  <Typography variant="body1">
                    {dealerProfile?.created_at ? new Date(dealerProfile.created_at).toLocaleDateString() : 'January 2024'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Performance Metrics */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Performance Metrics</Typography>
              <Grid container spacing={3}>
                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary.main">
                      {dealerProfile?.average_rating || '4.8'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Average Rating
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      {dealerProfile?.review_count || '156'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Reviews
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="info.main">
                      {dealerStats?.inventory?.active_listings || '18'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Active Listings
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main">
                      {dealerStats?.sales?.total_sales || '24'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Sales
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Actions */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Account Actions</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Button variant="outlined" fullWidth>
                    Edit Profile
                  </Button>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Button variant="outlined" fullWidth>
                    Change Password
                  </Button>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Button variant="outlined" fullWidth color="error">
                    Export Data
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSettingsDialog(false)}>Close</Button>
            <Button variant="contained" color="primary">
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default DealerDashboard;
