import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
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
  Stack,
  Tooltip,
  Alert,
  Snackbar,
  Grid,
  Tabs,
  Tab,
  useTheme,
  InputAdornment,
  Pagination,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  School as SchoolIcon,
  DirectionsCar as CarIcon,
  AccountBalance as ScholarshipIcon,
  Security as VisaIcon,
  CheckCircle as ApprovedIcon,
  Warning as PendingIcon,
  Error as RejectedIcon,
  Star as FeaturedIcon,
  TrendingUp as TrendingIcon,
  MonetizationOn as MoneyIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

// Mock data for different content types
const mockCourses = [
  {
    id: 1,
    title: 'Advanced React Development',
    instructor: 'Sarah Wilson',
    category: 'Programming',
    price: 299,
    enrollments: 1250,
    rating: 4.8,
    status: 'published',
    featured: true,
    createdDate: '2024-01-15',
    thumbnail: '/api/placeholder/60/40',
  },
  {
    id: 2,
    title: 'Digital Marketing Mastery',
    instructor: 'John Smith',
    category: 'Marketing',
    price: 199,
    enrollments: 850,
    rating: 4.6,
    status: 'published',
    featured: false,
    createdDate: '2024-01-10',
    thumbnail: '/api/placeholder/60/40',
  },
  {
    id: 3,
    title: 'Data Science Fundamentals',
    instructor: 'Emily Chen',
    category: 'Data Science',
    price: 399,
    enrollments: 650,
    rating: 4.9,
    status: 'draft',
    featured: true,
    createdDate: '2024-01-20',
    thumbnail: '/api/placeholder/60/40',
  },
];

const mockCars = [
  {
    id: 1,
    title: '2023 Tesla Model S',
    seller: 'AutoMax Dealers',
    category: 'Electric',
    price: 89900,
    year: 2023,
    mileage: 5000,
    status: 'active',
    featured: true,
    views: 2500,
    createdDate: '2024-01-18',
    thumbnail: '/api/placeholder/60/40',
  },
  {
    id: 2,
    title: '2022 BMW X5',
    seller: 'Premium Motors',
    category: 'SUV',
    price: 65000,
    year: 2022,
    mileage: 15000,
    status: 'active',
    featured: false,
    views: 1800,
    createdDate: '2024-01-16',
    thumbnail: '/api/placeholder/60/40',
  },
  {
    id: 3,
    title: '2021 Honda Civic',
    seller: 'City Auto',
    category: 'Sedan',
    price: 22000,
    year: 2021,
    mileage: 25000,
    status: 'pending',
    featured: false,
    views: 950,
    createdDate: '2024-01-22',
    thumbnail: '/api/placeholder/60/40',
  },
];

const mockScholarships = [
  {
    id: 1,
    title: 'Merit Excellence Scholarship',
    provider: 'Tech University',
    amount: 25000,
    deadline: '2024-03-15',
    applicants: 450,
    status: 'active',
    category: 'Merit-based',
    createdDate: '2024-01-10',
  },
  {
    id: 2,
    title: 'STEM Innovation Grant',
    provider: 'Innovation Foundation',
    amount: 15000,
    deadline: '2024-04-01',
    applicants: 280,
    status: 'active',
    category: 'STEM',
    createdDate: '2024-01-12',
  },
  {
    id: 3,
    title: 'Community Service Award',
    provider: 'Community College',
    amount: 5000,
    deadline: '2024-02-28',
    applicants: 125,
    status: 'draft',
    category: 'Community Service',
    createdDate: '2024-01-20',
  },
];

const ComprehensiveContentManagement: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);

  // Data states
  const [courses, setCourses] = useState(mockCourses);
  const [cars, setCars] = useState(mockCars);
  const [scholarships, setScholarships] = useState(mockScholarships);

  const itemsPerPage = 10;

  const getCurrentData = () => {
    switch (activeTab) {
      case 0: return courses;
      case 1: return cars;
      case 2: return scholarships;
      default: return [];
    }
  };

  const getFilteredData = () => {
    let data = getCurrentData();

    if (searchTerm) {
      data = data.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.instructor && item.instructor.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.seller && item.seller.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.provider && item.provider.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      data = data.filter(item => item.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      data = data.filter(item => item.category === categoryFilter);
    }

    return data;
  };

  const paginatedData = getFilteredData().slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleCreate = () => {
    setSelectedItem(null);
    setIsCreateMode(true);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setIsCreateMode(false);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    const updateFunction = activeTab === 0 ? setCourses : activeTab === 1 ? setCars : setScholarships;
    updateFunction((prev: any) => prev.filter((item: any) => item.id !== id));
    setSnackbar({ open: true, message: 'Item deleted successfully', severity: 'success' });
  };

  const handleToggleStatus = (id: number) => {
    const updateFunction = activeTab === 0 ? setCourses : activeTab === 1 ? setCars : setScholarships;
    updateFunction((prev: any) => prev.map((item: any) =>
      item.id === id
        ? { ...item, status: item.status === 'active' || item.status === 'published' ? 'draft' : 'active' }
        : item
    ));
    setSnackbar({ open: true, message: 'Status updated successfully', severity: 'success' });
  };

  const handleToggleFeatured = (id: number) => {
    const updateFunction = activeTab === 0 ? setCourses : activeTab === 1 ? setCars : setScholarships;
    updateFunction((prev: any) => prev.map((item: any) =>
      item.id === id ? { ...item, featured: !item.featured } : item
    ));
    setSnackbar({ open: true, message: 'Featured status updated', severity: 'success' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'published': return 'success';
      case 'pending': return 'warning';
      case 'draft': return 'info';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'published': return <ApprovedIcon />;
      case 'pending': return <PendingIcon />;
      case 'draft': return <EditIcon />;
      case 'rejected': return <RejectedIcon />;
      default: return null;
    }
  };

  const getTabIcon = (index: number) => {
    switch (index) {
      case 0: return <SchoolIcon />;
      case 1: return <CarIcon />;
      case 2: return <ScholarshipIcon />;
      default: return null;
    }
  };

  const getStats = () => {
    const data = getCurrentData();
    return {
      total: data.length,
      active: data.filter(item => item.status === 'active' || item.status === 'published').length,
      pending: data.filter(item => item.status === 'pending').length,
      draft: data.filter(item => item.status === 'draft').length,
      featured: data.filter(item => item.featured).length,
    };
  };

  const stats = getStats();

  const renderTableHeaders = () => {
    switch (activeTab) {
      case 0: // Courses
        return (
          <TableRow>
            <TableCell>Course</TableCell>
            <TableCell>Instructor</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Enrollments</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        );
      case 1: // Cars
        return (
          <TableRow>
            <TableCell>Vehicle</TableCell>
            <TableCell>Seller</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Year/Mileage</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        );
      case 2: // Scholarships
        return (
          <TableRow>
            <TableCell>Scholarship</TableCell>
            <TableCell>Provider</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Deadline</TableCell>
            <TableCell>Applicants</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        );
      default:
        return null;
    }
  };

  const renderTableRow = (item: any, index: number) => {
    switch (activeTab) {
      case 0: // Courses
        return (
          <motion.tr
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <TableCell>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar src={item.thumbnail} variant="rounded" sx={{ width: 60, height: 40 }}>
                  <SchoolIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {item.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Rating: {item.rating} ⭐
                  </Typography>
                </Box>
              </Box>
            </TableCell>
            <TableCell>{item.instructor}</TableCell>
            <TableCell>
              <Chip label={item.category} size="small" variant="outlined" />
            </TableCell>
            <TableCell>${item.price}</TableCell>
            <TableCell>{item.enrollments.toLocaleString()}</TableCell>
            <TableCell>
              <Box display="flex" alignItems="center" gap={1}>
                <Chip
                  icon={getStatusIcon(item.status)}
                  label={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  size="small"
                  color={getStatusColor(item.status) as any}
                />
                {item.featured && <FeaturedIcon color="warning" fontSize="small" />}
              </Box>
            </TableCell>
            <TableCell>
              <Stack direction="row" spacing={1}>
                <Tooltip title="View">
                  <IconButton size="small" onClick={() => handleEdit(item)}>
                    <VisibilityIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Edit">
                  <IconButton size="small" onClick={() => handleEdit(item)}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Toggle Featured">
                  <IconButton size="small" onClick={() => handleToggleFeatured(item.id)}>
                    <FeaturedIcon color={item.featured ? 'warning' : 'disabled'} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton size="small" onClick={() => handleDelete(item.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </TableCell>
          </motion.tr>
        );
      case 1: // Cars
        return (
          <motion.tr
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <TableCell>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar src={item.thumbnail} variant="rounded" sx={{ width: 60, height: 40 }}>
                  <CarIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {item.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Views: {item.views.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </TableCell>
            <TableCell>{item.seller}</TableCell>
            <TableCell>
              <Chip label={item.category} size="small" variant="outlined" />
            </TableCell>
            <TableCell>${item.price.toLocaleString()}</TableCell>
            <TableCell>
              <Typography variant="body2">
                {item.year} • {item.mileage.toLocaleString()} mi
              </Typography>
            </TableCell>
            <TableCell>
              <Box display="flex" alignItems="center" gap={1}>
                <Chip
                  icon={getStatusIcon(item.status)}
                  label={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  size="small"
                  color={getStatusColor(item.status) as any}
                />
                {item.featured && <FeaturedIcon color="warning" fontSize="small" />}
              </Box>
            </TableCell>
            <TableCell>
              <Stack direction="row" spacing={1}>
                <Tooltip title="View">
                  <IconButton size="small" onClick={() => handleEdit(item)}>
                    <VisibilityIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Edit">
                  <IconButton size="small" onClick={() => handleEdit(item)}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Toggle Featured">
                  <IconButton size="small" onClick={() => handleToggleFeatured(item.id)}>
                    <FeaturedIcon color={item.featured ? 'warning' : 'disabled'} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton size="small" onClick={() => handleDelete(item.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </TableCell>
          </motion.tr>
        );
      case 2: // Scholarships
        return (
          <motion.tr
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <TableCell>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">
                  {item.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.category}
                </Typography>
              </Box>
            </TableCell>
            <TableCell>{item.provider}</TableCell>
            <TableCell>${item.amount.toLocaleString()}</TableCell>
            <TableCell>{item.deadline}</TableCell>
            <TableCell>{item.applicants}</TableCell>
            <TableCell>
              <Chip
                icon={getStatusIcon(item.status)}
                label={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                size="small"
                color={getStatusColor(item.status) as any}
              />
            </TableCell>
            <TableCell>
              <Stack direction="row" spacing={1}>
                <Tooltip title="View">
                  <IconButton size="small" onClick={() => handleEdit(item)}>
                    <VisibilityIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Edit">
                  <IconButton size="small" onClick={() => handleEdit(item)}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton size="small" onClick={() => handleDelete(item.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </TableCell>
          </motion.tr>
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Content Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage courses, car listings, scholarships, and other platform content
          </Typography>
        </Box>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { title: 'Total Items', value: stats.total, icon: getTabIcon(activeTab), color: theme.palette.primary.main },
            { title: 'Active/Published', value: stats.active, icon: <ApprovedIcon />, color: theme.palette.success.main },
            { title: 'Pending', value: stats.pending, icon: <PendingIcon />, color: theme.palette.warning.main },
            { title: 'Featured', value: stats.featured, icon: <FeaturedIcon />, color: theme.palette.info.main },
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={stat.title}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          backgroundColor: `${stat.color}20`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: stat.color,
                        }}
                      >
                        {stat.icon}
                      </Box>
                      <Box>
                        <Typography variant="h4" fontWeight="bold" color={stat.color}>
                          {stat.value}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {stat.title}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card>
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
              <Tab icon={<SchoolIcon />} label="Courses" />
              <Tab icon={<CarIcon />} label="Car Listings" />
              <Tab icon={<ScholarshipIcon />} label="Scholarships" />
            </Tabs>
          </Box>

          <CardContent>
            {/* Toolbar */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <TextField
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 250 }}
              />
              
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="published">Published</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                </Select>
              </FormControl>

              <Box sx={{ flexGrow: 1 }} />

              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => setSnackbar({ open: true, message: 'Export started', severity: 'info' })}
              >
                Export
              </Button>

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreate}
              >
                Add {activeTab === 0 ? 'Course' : activeTab === 1 ? 'Car' : 'Scholarship'}
              </Button>
            </Box>

            {/* Content Table */}
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  {renderTableHeaders()}
                </TableHead>
                <TableBody>
                  {paginatedData.map((item, index) => renderTableRow(item, index))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={Math.ceil(getFilteredData().length / itemsPerPage)}
                page={page}
                onChange={(_, newPage) => setPage(newPage)}
                color="primary"
              />
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ComprehensiveContentManagement;
