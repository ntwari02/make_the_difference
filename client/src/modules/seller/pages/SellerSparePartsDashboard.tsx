import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Badge,
  Tooltip,
  Alert,
  LinearProgress,
  Stack,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Fab,
  CircularProgress,
  Menu,
  ListItemIcon,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Analytics as AnalyticsIcon,
  ShoppingCart as BundleIcon,
  Compare as CompareIcon,
  Notifications as NotificationsIcon,
  AttachMoney as MoneyIcon,
  Star as StarIcon,
  GetApp as ExportIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Share as ShareIcon,
  Archive as ArchiveIcon,
  Restore as RestoreIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import SellerLayout from '../components/layout/SellerLayout';
import { sellerApi } from '../services/sellerApi';
import toast from 'react-hot-toast';
import { isRateLimitError, getRetryAfterSeconds } from '../../../utils/apiRetry';
import { getImageUrl } from '../../../shared/utils/imageUtils';


interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`spare-parts-tabpanel-${index}`}
      aria-labelledby={`spare-parts-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const SellerSparePartsDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState(0);
  const [spareParts, setSpareParts] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total_parts: 0,
    active_parts: 0,
    low_stock_items: 0,
    out_of_stock_items: 0,
    total_inventory_value: 0,
    monthly_sales: 0,
    avg_price: 0,
    top_category: '',
    top_brand: '',
    growth_rate: 0,
    profit_margin: 0
  });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Per-card menus will manage their own anchors; no global menu state
  const [viewOpen, setViewOpen] = useState(false);
  const [viewPart, setViewPart] = useState<any | null>(null);
  
  // Global menu state for table actions
  const [tableMenuAnchor, setTableMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedPart, setSelectedPart] = useState<any | null>(null);

  // Fetch spare parts data
  const fetchSpareParts = async () => {
    try {
      setRefreshing(true);
      setError(null);
      
      // Fetch all data in parallel to minimize API calls
      const [partsResponse, categoriesResponse, brandsResponse] = await Promise.all([
        sellerApi.spareParts.getAll({ 
          limit: 50 
        }),
        sellerApi.spareParts.getCategories(),
        sellerApi.spareParts.getBrands()
      ]);
      
      const parts = partsResponse.data || [];
      const categories = categoriesResponse.data || [];
      const brands = brandsResponse.data || [];
      
      // Create lookup maps for better performance
      const categoryMap = new Map(categories.map((cat: any) => [cat.id, cat]));
      const brandMap = new Map(brands.map((brand: any) => [brand.id, brand]));
      
      // Helper to parse JSON safely
      const safeParseArray = (val: any): string[] => {
        if (Array.isArray(val)) return val;
        if (typeof val === 'string') {
          try {
            const parsed = JSON.parse(val);
            return Array.isArray(parsed) ? parsed : [];
          } catch (_) {
            return [];
          }
        }
        return [];
      };

      // Process parts with enhanced data
      const partsWithDetails = parts.map((part: any) => {
        const category = categoryMap.get(part.category_id) || { id: part.category_id, name: 'Unknown Category' };
        const brand = brandMap.get(part.brand_id) || { id: part.brand_id, name: 'Unknown Brand' };
        const parsedImages = safeParseArray(part.images);
        const images = parsedImages.length > 0
          ? parsedImages
          : (part.image_url ? [part.image_url] : ['https://via.placeholder.com/800x600?text=Spare+Part']);

        return {
          ...part,
          category,
          brand,
          // Add mock fields for compatibility
          rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5-5.0
          review_count: Math.floor(Math.random() * 200) + 50, // Random review count
          images,
          discount: Math.random() > 0.7 ? Math.floor(Math.random() * 25) + 5 : 0, // Random discount
          featured: Math.random() > 0.8,
          trending: Math.random() > 0.7
        };
      });
      
      setSpareParts(partsWithDetails);
      
      // Calculate stats
      const totalParts = partsWithDetails.length;
      const activeParts = partsWithDetails.filter((part: any) => part.status === 'active').length;
      const lowStockItems = partsWithDetails.filter((part: any) => part.quantity_available <= part.reorder_point).length;
      const outOfStockItems = partsWithDetails.filter((part: any) => part.quantity_available === 0).length;
      const totalInventoryValue = partsWithDetails.reduce((sum: number, part: any) => sum + (part.price * part.quantity_available), 0);
      const avgPrice = totalParts > 0 ? totalInventoryValue / totalParts : 0;
      
      // Find top category and brand
      const categoryCounts: { [key: string]: number } = {};
      const brandCounts: { [key: string]: number } = {};
      
      partsWithDetails.forEach((part: any) => {
        categoryCounts[part.category.name] = (categoryCounts[part.category.name] || 0) + 1;
        brandCounts[part.brand.name] = (brandCounts[part.brand.name] || 0) + 1;
      });
      
      const topCategory = Object.keys(categoryCounts).reduce((a, b) => categoryCounts[a] > categoryCounts[b] ? a : b, '');
      const topBrand = Object.keys(brandCounts).reduce((a, b) => brandCounts[a] > brandCounts[b] ? a : b, '');
      
      setStats({
        total_parts: totalParts,
        active_parts: activeParts,
        low_stock_items: lowStockItems,
        out_of_stock_items: outOfStockItems,
        total_inventory_value: totalInventoryValue,
        monthly_sales: totalInventoryValue * 0.3, // Mock monthly sales
        avg_price: avgPrice,
        top_category: topCategory,
        top_brand: topBrand,
        growth_rate: 12.5, // Mock growth rate
        profit_margin: 35.2 // Mock profit margin
      });
      
      // Generate mock notifications based on real data
      const mockNotifications = [];
      if (lowStockItems > 0) {
        mockNotifications.push({
          id: 'low_stock',
          type: 'low_stock',
          title: 'Low Stock Alert',
          message: `${lowStockItems} item(s) are running low on stock`,
          time: '2 hours ago',
          unread: true,
          priority: 'high'
        });
      }
      if (outOfStockItems > 0) {
        mockNotifications.push({
          id: 'out_of_stock',
          type: 'out_of_stock',
          title: 'Out of Stock Alert',
          message: `${outOfStockItems} item(s) are out of stock`,
          time: '1 hour ago',
          unread: true,
          priority: 'high'
        });
      }
      mockNotifications.push({
        id: 'new_order',
        type: 'new_order',
        title: 'New Order',
        message: 'Order #12345 for Front Brake Pads Set',
        time: '6 hours ago',
        unread: false,
        priority: 'low'
      });
      
      setNotifications(mockNotifications);
      
      // Show success message only when manually refreshing
      if (refreshing) {
        toast.success('Spare parts data refreshed successfully!');
      }
      
    } catch (error: any) {
      console.error('Error fetching spare parts:', error);
      
      let errorMessage = error?.response?.data?.message || 'Failed to fetch spare parts data';
      let isRetryable = false;
      
      if (isRateLimitError(error)) {
        const retryAfter = getRetryAfterSeconds(error);
        errorMessage = retryAfter 
          ? `Too many requests. Please wait ${retryAfter} seconds before trying again.`
          : 'Too many requests. Please wait a moment before trying again.';
        isRetryable = true;
        
        toast.error(errorMessage, {
          duration: 5000,
          icon: '⏳'
        });
      } else {
        errorMessage = error.message || errorMessage;
        toast.error(errorMessage);
      }
      
      setError(errorMessage);
      
      // If it's a retryable error, show a retry button
      if (isRetryable) {
        setTimeout(() => {
          toast((t) => (
            <div>
              <div>{errorMessage}</div>
              <button 
                onClick={() => {
                  toast.dismiss(t.id);
                  fetchSpareParts();
                }}
                style={{
                  marginTop: '8px',
                  padding: '4px 8px',
                  backgroundColor: '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Retry Now
              </button>
            </div>
          ), {
            duration: 10000,
            id: 'rate-limit-retry'
          });
        }, 2000);
      }
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSpareParts();
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleCreatePart = () => {
    navigate('/seller/spare-parts/add');
  };

  const handleEditPart = (part: any) => {
    navigate(`/seller/spare-parts/${part.id}/edit`);
  };

  const handleRestockPart = async (part: any) => {
    const input = window.prompt(`Add how many units to stock for "${part.name}"?`, '10');
    if (input == null) return;
    const qty = Number(input);
    if (!Number.isFinite(qty) || qty <= 0) {
      toast.error('Please enter a valid positive number');
      return;
    }
    try {
      await sellerApi.spareParts.restock(part.id, { quantity_added: qty });
      toast.success(`Added ${qty} unit(s) to stock`);
      await fetchSpareParts();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to restock');
    }
  };

  const handleViewPart = (part: any) => {
    setViewPart(part);
    setViewOpen(true);
  };
  const handleCloseView = () => {
    setViewOpen(false);
    setViewPart(null);
  };

  // No global menu actions; handled per-card

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getStatusColor = (quantity: number, reorderPoint: number) => {
    if (quantity === 0) return 'error';
    if (quantity <= reorderPoint) return 'warning';
    return 'success';
  };

  const getStatusText = (quantity: number, reorderPoint: number) => {
    if (quantity === 0) return 'Out of Stock';
    if (quantity <= reorderPoint) return 'Low Stock';
    return 'In Stock';
  };

  // Filter spare parts based on search and status
  const filteredSpareParts = spareParts.filter(part => {
    const matchesSearch = part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         part.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         part.brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         part.category.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && part.status === 'active') ||
                         (statusFilter === 'low_stock' && part.quantity_available <= part.reorder_point) ||
                         (statusFilter === 'out_of_stock' && part.quantity_available === 0);
    
    return matchesSearch && matchesStatus;
  });

  const StatCard: React.FC<{ 
    title: string; 
    value: string | number; 
    icon: React.ReactNode; 
    color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
    trend?: number;
    subtitle?: string;
  }> = ({ title, value, icon, color, trend, subtitle }) => (
    <Card sx={{ 
      height: '100%',
      transition: 'all 0.3s ease-in-out',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
      }
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ 
            color: `${color}.main`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s ease-in-out',
            '&:hover': {
              transform: 'scale(1.1)'
            }
          }}>
            {icon}
          </Box>
        </Box>
        
        {trend !== undefined && (
          <Typography variant="h6" fontWeight={600} color={trend > 0 ? 'success.main' : 'error.main'} gutterBottom>
            {trend > 0 ? '+' : ''}{trend}%
          </Typography>
        )}
        
        <Typography variant="h4" fontWeight={700} gutterBottom>
          {value}
        </Typography>
        
        <Typography variant="body1" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const QuickActionCard: React.FC<{ 
    title: string; 
    description: string; 
    icon: React.ReactNode; 
    color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
    onClick: () => void;
  }> = ({ title, description, icon, color, onClick }) => (
    <Card sx={{ 
      height: '100%', 
      cursor: 'pointer',
      transition: 'all 0.3s ease-in-out',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
      }
    }} onClick={onClick}>
      <CardContent sx={{ textAlign: 'center', p: 3 }}>
        <Box sx={{ 
          color: `${color}.main`,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.1)'
          }
        }}>
          {icon}
        </Box>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );

  const PartCard: React.FC<{ part: any }> = ({ part }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const onOpenMenu = (e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      setAnchorEl(e.currentTarget);
    };

    const onCloseMenu = () => setAnchorEl(null);

    const onAction = async (action: string) => {
      try {
        switch (action) {
          case 'view':
            handleViewPart(part);
            break;
          case 'edit':
            navigate(`/seller/spare-parts/${part.id}/edit`);
            break;
          case 'copy':
            await navigator.clipboard.writeText(part.sku);
            toast.success('SKU copied to clipboard');
            break;
          case 'share':
            await navigator.clipboard.writeText(`${window.location.origin}/seller/spare-parts/${part.id}`);
            toast.success('Share link copied to clipboard');
            break;
          case 'archive':
            await sellerApi.spareParts.update(part.id, { status: 'inactive' });
            toast.success('Part archived');
            await fetchSpareParts();
            break;
          case 'restore':
            await sellerApi.spareParts.update(part.id, { status: 'active' });
            toast.success('Part restored');
            await fetchSpareParts();
            break;
          case 'delete':
            if (window.confirm(`Are you sure you want to delete "${part.name}"?`)) {
              await sellerApi.spareParts.delete(part.id);
              toast.success('Part deleted');
              await fetchSpareParts();
            }
            break;
          case 'restock':
            await handleRestockPart(part);
            break;
        }
      } catch (error: any) {
        toast.error(error?.response?.data?.message || `Failed to ${action} part`);
      } finally {
        onCloseMenu();
      }
    };

    return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      transition: 'all 0.3s ease-in-out',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
      }
    }}>
      <Box sx={{ position: 'relative' }}>
        <Box
          component="img"
          src={getImageUrl(part.images[0])}
          alt={part.name}
          sx={{
            width: '100%',
            height: 200,
            objectFit: 'cover'
          }}
        />
        
        {/* Status Badge */}
        <Box sx={{ position: 'absolute', top: 12, left: 12 }}>
          <Chip
            label={getStatusText(part.quantity_available, part.reorder_point)}
            size="small"
            color={getStatusColor(part.quantity_available, part.reorder_point)}
          />
        </Box>

        {/* Discount Badge */}
        {part.discount > 0 && (
          <Box sx={{ 
            position: 'absolute', 
            top: 12, 
            right: 12,
            backgroundColor: 'error.main',
            color: 'white',
            borderRadius: 1,
            px: 1,
            py: 0.5,
            fontWeight: 600,
            fontSize: '0.75rem'
          }}>
            -{part.discount}%
          </Box>
        )}

        {/* Action Menu */}
        <Box sx={{ position: 'absolute', top: 12, right: part.discount > 0 ? 60 : 12 }}>
          <IconButton 
            size="small" 
            sx={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
            onClick={onOpenMenu}
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={onCloseMenu}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            MenuListProps={{ dense: true }}
            slotProps={{ 
              paper: { 
                sx: { 
                  minWidth: 220, 
                  mt: 0.5,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  border: '1px solid rgba(0,0,0,0.1)'
                } 
              } 
            }}
            disableScrollLock={true}
          >
            <MenuItem onClick={() => onAction('view')}>
              <ListItemIcon>
                <ViewIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>View Details</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => onAction('edit')}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit Part</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => onAction('restock')}>
              <ListItemIcon>
                <InventoryIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Restock</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => onAction('copy')}>
              <ListItemIcon>
                <CopyIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Copy SKU</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => onAction('share')}>
              <ListItemIcon>
                <ShareIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Share Link</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => onAction(part.status === 'active' ? 'archive' : 'restore')}>
              <ListItemIcon>
                {part.status === 'active' ? <ArchiveIcon fontSize="small" /> : <RestoreIcon fontSize="small" />}
              </ListItemIcon>
              <ListItemText>{part.status === 'active' ? 'Archive' : 'Restore'}</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => onAction('delete')} sx={{ color: 'error.main' }}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Delete</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
        {/* Brand */}
        <Typography variant="caption" color="text.secondary" fontWeight={500} gutterBottom>
          {part.brand.name}
        </Typography>

        {/* Title */}
        <Typography variant="h6" fontWeight={600} gutterBottom sx={{ 
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          lineHeight: 1.3,
          mb: 1
        }}>
          {part.name}
        </Typography>

        {/* Description */}
        <Typography variant="body2" color="text.secondary" sx={{ 
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          mb: 2,
          lineHeight: 1.4
        }}>
          {part.description}
        </Typography>

        {/* SKU and Rating */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="caption" color="text.secondary">
            SKU: {part.sku}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <StarIcon sx={{ fontSize: 16, color: 'warning.main' }} />
            <Typography variant="caption" fontWeight={600}>
              {part.rating} ({part.review_count})
            </Typography>
          </Box>
        </Box>

        {/* Price */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Typography variant="h6" color="primary" fontWeight={700}>
            {formatPrice(part.price)}
          </Typography>
          {part.discount > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
              {formatPrice(part.price / (1 - part.discount / 100))}
            </Typography>
          )}
        </Box>

        {/* Stock and Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Stock: {part.quantity_available}
            </Typography>
            {part.quantity_available <= part.reorder_point && (
              <LinearProgress 
                variant="determinate" 
                value={(part.quantity_available / part.reorder_point) * 100}
                color="warning"
                sx={{ mt: 0.5, height: 4, borderRadius: 2 }}
              />
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="View Details">
              <IconButton 
                size="small" 
                onClick={() => handleViewPart(part)}
                color="primary"
              >
                <ViewIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton 
                size="small" 
                onClick={() => handleEditPart(part)}
                color="success"
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </CardContent>
    </Card>
    );
  };

  // (Global dropdown removed; per-card menus are used instead)

  // Remove loading state completely - hot reload like cars
  // if (loading) {
  //   return (
  //     <SellerLayout>
  //       <Box sx={{ flexGrow: 1, p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
  //         <Box sx={{ textAlign: 'center' }}>
  //           <CircularProgress size={60} sx={{ mb: 2 }} />
  //           <Typography variant="h6" color="text.secondary">
  //             Loading spare parts data...
  //           </Typography>
  //         </Box>
  //       </Box>
  //     </SellerLayout>
  //   );
  // }

  // Show error state
  if (error) {
    const isRateLimit = error.includes('Too many requests');
    
    return (
      <SellerLayout>
        <Box sx={{ flexGrow: 1, p: 3 }}>
          <Alert 
            severity={isRateLimit ? "warning" : "error"} 
            sx={{ mb: 3 }}
            action={
              <Button 
                variant="outlined" 
                onClick={fetchSpareParts}
                sx={{ ml: 2 }}
              >
                {isRateLimit ? 'Retry' : 'Retry'}
              </Button>
            }
          >
            <Typography variant="h6" gutterBottom>
              {isRateLimit ? 'Rate Limit Exceeded' : 'Error Loading Data'}
            </Typography>
            <Typography variant="body2" gutterBottom>
              {error}
            </Typography>
            {isRateLimit && (
              <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                💡 Tip: Try refreshing the page or wait a few moments before retrying.
              </Typography>
            )}
          </Alert>
        </Box>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout>
      <Box sx={{ flexGrow: 1, p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Spare Parts Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your spare parts inventory, pricing, and analytics
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<AnalyticsIcon />}
              onClick={() => navigate('/seller/spare-parts/analytics')}
            >
              Analytics
            </Button>
            <Button
              variant="outlined"
              startIcon={refreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
              onClick={fetchSpareParts}
              disabled={refreshing}
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreatePart}
            >
              Add Spare Part
            </Button>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 3, 
          mb: 4 
        }}>
          <StatCard
            title="Total Parts"
            value={stats.total_parts}
            icon={<InventoryIcon sx={{ fontSize: 20 }} />}
            color="primary"
            trend={12}
          />
          <StatCard
            title="Active Parts"
            value={stats.active_parts}
            icon={<CheckCircleIcon sx={{ fontSize: 20 }} />}
            color="success"
            trend={8}
          />
          <StatCard
            title="Low Stock Items"
            value={stats.low_stock_items}
            icon={<WarningIcon sx={{ fontSize: 20 }} />}
            color="warning"
            trend={-3}
          />
          <StatCard
            title="Inventory Value"
            value={formatPrice(stats.total_inventory_value)}
            icon={<MoneyIcon sx={{ fontSize: 20 }} />}
            color="info"
            trend={15}
            subtitle="Total worth"
          />
        </Box>

        {/* Quick Actions */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
              Quick Actions
            </Typography>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: 3 
            }}>
              <QuickActionCard
                title="Manage Bundles"
                description="Create and manage spare part bundles"
                icon={<BundleIcon sx={{ fontSize: 20 }} />}
                color="primary"
                onClick={() => navigate('/seller/spare-parts/bundles')}
              />
              <QuickActionCard
                title="Price Comparison"
                description="Compare prices with competitors"
                icon={<CompareIcon sx={{ fontSize: 20 }} />}
                color="secondary"
                onClick={() => navigate('/seller/spare-parts/price-comparison')}
              />
              <QuickActionCard
                title="Inventory Management"
                description="Track stock levels and reorders"
                icon={<InventoryIcon sx={{ fontSize: 20 }} />}
                color="success"
                onClick={() => navigate('/seller/spare-parts/inventory')}
              />
              <QuickActionCard
                title="Export Data"
                description="Export inventory and sales data"
                icon={<ExportIcon sx={{ fontSize: 20 }} />}
                color="warning"
                onClick={() => navigate('/seller/spare-parts/export')}
              />
            </Box>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              aria-label="spare parts tabs"
              variant="fullWidth"
              sx={{ width: '100%' }}
            >
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <InventoryIcon />
                    <span>All Parts</span>
                    <Badge badgeContent={spareParts.length} color="primary" />
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarningIcon />
                    <span>Low Stock</span>
                    <Badge badgeContent={stats.low_stock_items} color="warning" />
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUpIcon />
                    <span>Top Sellers</span>
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <NotificationsIcon />
                    <span>Notifications</span>
                    <Badge badgeContent={notifications.filter(n => n.unread).length} color="error" />
                  </Box>
                } 
              />
            </Tabs>
          </Box>

          {/* All Parts Tab */}
          <TabPanel value={activeTab} index={0}>
            {/* Filters and Search */}
            <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap', alignItems: 'center' }}>
              <TextField
                placeholder="Search parts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 300 }}
              />
              
              <FormControl sx={{ minWidth: 140 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="low_stock">Low Stock</MenuItem>
                  <MenuItem value="out_of_stock">Out of Stock</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
              >
                More Filters
              </Button>
            </Box>

            {/* Parts Grid */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
              gap: 3 
            }}>
              {filteredSpareParts.map((part) => (
                <PartCard part={part} key={part.id} />
              ))}
            </Box>

            {filteredSpareParts.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <InventoryIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h5" color="text.secondary" gutterBottom>
                  No spare parts found
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Try adjusting your search criteria or add your first spare part
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />} 
                  onClick={handleCreatePart}
                >
                  Add Spare Part
                </Button>
              </Box>
            )}
          </TabPanel>

          {/* Low Stock Tab */}
          <TabPanel value={activeTab} index={1}>
            <Box sx={{ mb: 3 }}>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Low Stock Alert
                </Typography>
                <Typography variant="body2">
                  The following items are running low on stock and may need to be reordered soon.
                </Typography>
              </Alert>
            </Box>

            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
              gap: 3 
            }}>
              {spareParts.filter(part => part.quantity_available <= part.reorder_point).map((part) => (
                <Card key={part.id} sx={{ border: '2px solid', borderColor: 'warning.main' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          {part.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          SKU: {part.sku}
                        </Typography>
                      </Box>
                      <WarningIcon color="warning" sx={{ fontSize: 32 }} />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Current Stock: {part.quantity_available} units
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Reorder Point: {part.reorder_point} units
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={(part.quantity_available / part.reorder_point) * 100}
                        color="warning"
                        sx={{ mt: 1, height: 6, borderRadius: 3 }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button 
                        size="small" 
                        variant="contained" 
                        startIcon={<AddIcon />}
                        color="warning"
                      >
                        Reorder Now
                      </Button>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        startIcon={<InventoryIcon />}
                        onClick={() => handleRestockPart(part)}
                      >
                        Update Stock
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </TabPanel>

          {/* Top Sellers Tab */}
          <TabPanel value={activeTab} index={2}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Top Performing Spare Parts
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Based on sales volume, ratings, and customer reviews
            </Typography>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Rank</TableCell>
                    <TableCell>Part Name</TableCell>
                    <TableCell>Brand</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Rating</TableCell>
                    <TableCell>Stock</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {spareParts
                    .sort((a, b) => b.rating - a.rating)
                    .map((part, index) => (
                    <TableRow key={part.id}>
                      <TableCell>
                        <Chip 
                          label={`#${index + 1}`} 
                          color={index < 3 ? 'primary' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {part.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          SKU: {part.sku}
                        </Typography>
                      </TableCell>
                      <TableCell>{part.brand.name}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {formatPrice(part.price)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <StarIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                          <Typography variant="body2">
                            {part.rating} ({part.review_count})
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {part.quantity_available}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton size="small" color="primary" onClick={() => handleViewPart(part)}>
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton size="small" color="success" onClick={() => handleEditPart(part)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="More Actions">
                            <IconButton 
                              size="small" 
                              onClick={(e) => {
                                e.stopPropagation();
                                setTableMenuAnchor(e.currentTarget);
                                setSelectedPart(part);
                              }}
                            >
                              <MoreVertIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Global Table Actions Menu */}
          <Menu
            anchorEl={tableMenuAnchor}
            open={Boolean(tableMenuAnchor)}
            onClose={() => {
              setTableMenuAnchor(null);
              setSelectedPart(null);
            }}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            MenuListProps={{ dense: true }}
            slotProps={{ 
              paper: { 
                sx: { 
                  minWidth: 220, 
                  mt: 0.5,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  border: '1px solid rgba(0,0,0,0.1)'
                } 
              } 
            }}
            disableScrollLock={true}
          >
            <MenuItem onClick={() => {
              if (selectedPart) handleViewPart(selectedPart);
              setTableMenuAnchor(null);
              setSelectedPart(null);
            }}>
              <ListItemIcon>
                <ViewIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>View Details</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => {
              if (selectedPart) handleEditPart(selectedPart);
              setTableMenuAnchor(null);
              setSelectedPart(null);
            }}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit Part</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => {
              if (selectedPart) handleRestockPart(selectedPart);
              setTableMenuAnchor(null);
              setSelectedPart(null);
            }}>
              <ListItemIcon>
                <InventoryIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Restock</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => {
              if (selectedPart) {
                navigator.clipboard.writeText(selectedPart.sku);
                toast.success('SKU copied to clipboard');
              }
              setTableMenuAnchor(null);
              setSelectedPart(null);
            }}>
              <ListItemIcon>
                <CopyIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Copy SKU</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => {
              if (selectedPart) {
                sellerApi.spareParts.update(selectedPart.id, { 
                  status: selectedPart.status === 'active' ? 'inactive' : 'active' 
                });
                toast.success(`Part ${selectedPart.status === 'active' ? 'archived' : 'restored'}`);
                fetchSpareParts();
              }
              setTableMenuAnchor(null);
              setSelectedPart(null);
            }} sx={{ color: 'warning.main' }}>
              <ListItemIcon>
                {selectedPart?.status === 'active' ? <ArchiveIcon fontSize="small" /> : <RestoreIcon fontSize="small" />}
              </ListItemIcon>
              <ListItemText>{selectedPart?.status === 'active' ? 'Archive' : 'Restore'}</ListItemText>
            </MenuItem>
          </Menu>

          {/* Notifications Tab */}
          <TabPanel value={activeTab} index={3}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Recent Notifications
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Stay updated with important alerts and updates about your spare parts
            </Typography>

            <Stack spacing={2}>
              {notifications.map((notification) => (
                <Card key={notification.id} sx={{ 
                  borderLeft: notification.unread ? '4px solid' : 'none',
                  borderLeftColor: notification.unread ? 'primary.main' : 'transparent'
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          {notification.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {notification.time}
                        </Typography>
                      </Box>
                      {notification.unread && (
                        <Chip 
                          label="New" 
                          size="small" 
                          color="primary"
                        />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </TabPanel>
        </Card>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="add"
          onClick={handleCreatePart}
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32
          }}
        >
          <AddIcon />
        </Fab>
        
        {/* per-card menus are rendered within each card */}

        {/* Quick View Dialog */}
        <Dialog open={viewOpen} onClose={handleCloseView} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <ViewIcon color="primary" />
              {viewPart?.name || 'Spare Part Details'}
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            {viewPart ? (
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  SKU: {viewPart.sku}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {viewPart.description}
                </Typography>
                
                {/* Image Preview */}
                {viewPart.images && viewPart.images.length > 0 && (
                  <Box sx={{ mt: 2, mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Images</Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {viewPart.images.slice(0, 3).map((image: string, index: number) => (
                        <Box
                          key={index}
                          component="img"
                          src={getImageUrl(image)}
                          alt={`${viewPart.name} ${index + 1}`}
                          sx={{
                            width: 100,
                            height: 100,
                            objectFit: 'cover',
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'divider'
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Category</Typography>
                    <Typography variant="body2">{viewPart.category?.name || viewPart.category_name}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Brand</Typography>
                    <Typography variant="body2">{viewPart.brand?.name || viewPart.brand_name}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Price</Typography>
                    <Typography variant="body2">{formatPrice(Number(viewPart.price) || 0)}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Stock</Typography>
                    <Typography variant="body2">{viewPart.quantity_available}</Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Status</Typography>
                    <Chip 
                      label={viewPart.status === 'active' ? 'Active' : 'Inactive'} 
                      color={viewPart.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Reorder Point</Typography>
                    <Typography variant="body2">{viewPart.reorder_point || 'Not set'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Created</Typography>
                    <Typography variant="body2">
                      {viewPart.created_at ? new Date(viewPart.created_at).toLocaleDateString() : 'Unknown'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseView}>Close</Button>
            {viewPart && (
              <Button variant="contained" onClick={() => navigate(`/seller/spare-parts/${viewPart.id}/edit`)}>
                Edit Part
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Box>
    </SellerLayout>
  );
};

export default SellerSparePartsDashboard;