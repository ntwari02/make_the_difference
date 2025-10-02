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
  LinearProgress,
  Tabs,
  Tab,
  useTheme,
  InputAdornment,
  Pagination,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  TrendingUp,
  People,
  PersonAdd,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

// Mock user data
const mockUsers = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    role: 'student',
    status: 'active',
    joinDate: '2024-01-15',
    lastLogin: '2024-01-22T10:30:00Z',
    avatar: '/api/placeholder/40/40',
    location: 'New York, USA',
  },
  {
    id: 2,
    firstName: 'Sarah',
    lastName: 'Wilson',
    email: 'sarah.wilson@example.com',
    phone: '+1 (555) 987-6543',
    role: 'instructor',
    status: 'active',
    joinDate: '2024-01-10',
    lastLogin: '2024-01-22T08:15:00Z',
    avatar: '/api/placeholder/40/40',
    location: 'California, USA',
  },
  {
    id: 3,
    firstName: 'Mike',
    lastName: 'Chen',
    email: 'mike.chen@example.com',
    phone: '+1 (555) 456-7890',
    role: 'buyer',
    status: 'pending',
    joinDate: '2024-01-20',
    lastLogin: 'Never',
    avatar: '/api/placeholder/40/40',
    location: 'Texas, USA',
  },
];

const ComprehensiveUserManagement: React.FC = () => {
  const theme = useTheme();
  const [users, setUsers] = useState(mockUsers);
  const [filteredUsers, setFilteredUsers] = useState(mockUsers);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(1);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

  const itemsPerPage = 10;

  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
    setPage(1);
  }, [users, searchTerm, roleFilter, statusFilter]);

  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsCreateMode(true);
    setIsDialogOpen(true);
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setIsCreateMode(false);
    setIsDialogOpen(true);
  };

  const handleDeleteUser = (userId: number) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
    setSnackbar({ open: true, message: 'User deleted successfully', severity: 'success' });
  };

  const handleToggleStatus = (userId: number) => {
    setUsers(prev => prev.map(user =>
      user.id === userId
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
    setSnackbar({ open: true, message: 'User status updated', severity: 'success' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'inactive': return 'error';
      default: return 'default';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return '#f59e0b';
      case 'instructor': return '#10b981';
      case 'student': return '#3b82f6';
      case 'seller': return '#8b5cf6';
      case 'buyer': return '#06b6d4';
      case 'dealer': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const paginatedUsers = filteredUsers.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const userStats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    pending: users.filter(u => u.status === 'pending').length,
    inactive: users.filter(u => u.status === 'inactive').length,
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
            User Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage users, roles, and permissions across the platform
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
            { title: 'Total Users', value: userStats.total, icon: <People />, color: theme.palette.primary.main },
            { title: 'Active Users', value: userStats.active, icon: <CheckCircleIcon />, color: theme.palette.success.main },
            { title: 'Pending Users', value: userStats.pending, icon: <PersonAdd />, color: theme.palette.warning.main },
            { title: 'Inactive Users', value: userStats.inactive, icon: <BlockIcon />, color: theme.palette.error.main },
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
          <CardContent>
            {/* Toolbar */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <TextField
                placeholder="Search users..."
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
                <InputLabel>Role</InputLabel>
                <Select
                  value={roleFilter}
                  label="Role"
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <MenuItem value="all">All Roles</MenuItem>
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="instructor">Instructor</MenuItem>
                  <MenuItem value="buyer">Buyer</MenuItem>
                  <MenuItem value="seller">Seller</MenuItem>
                  <MenuItem value="dealer">Dealer</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
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
                onClick={handleCreateUser}
              >
                Add User
              </Button>
            </Box>

            {/* Users Table */}
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Join Date</TableCell>
                    <TableCell>Last Login</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar src={user.avatar} sx={{ width: 40, height: 40 }}>
                            {user.firstName[0]}{user.lastName[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {user.firstName} {user.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          size="small"
                          sx={{
                            backgroundColor: `${getRoleColor(user.role)}20`,
                            color: getRoleColor(user.role),
                            fontWeight: 'bold',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          size="small"
                          color={getStatusColor(user.status) as any}
                        />
                      </TableCell>
                      <TableCell>{user.joinDate}</TableCell>
                      <TableCell>
                        {user.lastLogin === 'Never' ? 'Never' : new Date(user.lastLogin).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => handleEditUser(user)}>
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit User">
                            <IconButton size="small" onClick={() => handleEditUser(user)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={user.status === 'active' ? 'Deactivate' : 'Activate'}>
                            <IconButton size="small" onClick={() => handleToggleStatus(user.id)}>
                              <BlockIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete User">
                            <IconButton size="small" onClick={() => handleDeleteUser(user.id)}>
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={Math.ceil(filteredUsers.length / itemsPerPage)}
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

export default ComprehensiveUserManagement;
