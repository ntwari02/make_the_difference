import React, { useState } from 'react';
import {
  Box,
  GridLegacy as Grid,
  Card,
  CardContent,
  Typography,
  Button,
  useTheme,
  Avatar,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  AvatarGroup,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  Groups as TeamIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DealerLayout from '../components/layout/DealerLayout';
import toast from 'react-hot-toast';

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'sales' | 'support';
  avatar?: string;
  isActive: boolean;
  joinedDate: string;
  permissions: {
    manageVehicles: boolean;
    manageTeam: boolean;
    viewAnalytics: boolean;
    respondMessages: boolean;
    manageReviews: boolean;
  };
  performance?: {
    salesThisMonth: number;
    totalSales: number;
    rating: number;
  };
}

const DealerTeam: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Mock team data
  const mockTeam: TeamMember[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@dealership.com',
      phone: '+1 (555) 123-4567',
      role: 'admin',
      avatar: 'https://i.pravatar.cc/150?img=12',
      isActive: true,
      joinedDate: '2023-01-15',
      permissions: {
        manageVehicles: true,
        manageTeam: true,
        viewAnalytics: true,
        respondMessages: true,
        manageReviews: true,
      },
      performance: {
        salesThisMonth: 8,
        totalSales: 156,
        rating: 4.9,
      },
    },
    {
      id: '2',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.j@dealership.com',
      phone: '+1 (555) 234-5678',
      role: 'manager',
      avatar: 'https://i.pravatar.cc/150?img=5',
      isActive: true,
      joinedDate: '2023-03-20',
      permissions: {
        manageVehicles: true,
        manageTeam: false,
        viewAnalytics: true,
        respondMessages: true,
        manageReviews: true,
      },
      performance: {
        salesThisMonth: 12,
        totalSales: 98,
        rating: 4.8,
      },
    },
    {
      id: '3',
      firstName: 'Michael',
      lastName: 'Chen',
      email: 'michael.chen@dealership.com',
      phone: '+1 (555) 345-6789',
      role: 'sales',
      avatar: 'https://i.pravatar.cc/150?img=8',
      isActive: true,
      joinedDate: '2023-06-10',
      permissions: {
        manageVehicles: true,
        manageTeam: false,
        viewAnalytics: false,
        respondMessages: true,
        manageReviews: false,
      },
      performance: {
        salesThisMonth: 15,
        totalSales: 67,
        rating: 4.7,
      },
    },
    {
      id: '4',
      firstName: 'Emily',
      lastName: 'Davis',
      email: 'emily.davis@dealership.com',
      phone: '+1 (555) 456-7890',
      role: 'sales',
      avatar: 'https://i.pravatar.cc/150?img=9',
      isActive: true,
      joinedDate: '2023-07-25',
      permissions: {
        manageVehicles: true,
        manageTeam: false,
        viewAnalytics: false,
        respondMessages: true,
        manageReviews: false,
      },
      performance: {
        salesThisMonth: 10,
        totalSales: 45,
        rating: 4.6,
      },
    },
    {
      id: '5',
      firstName: 'David',
      lastName: 'Wilson',
      email: 'david.w@dealership.com',
      phone: '+1 (555) 567-8901',
      role: 'support',
      avatar: 'https://i.pravatar.cc/150?img=11',
      isActive: false,
      joinedDate: '2023-02-14',
      permissions: {
        manageVehicles: false,
        manageTeam: false,
        viewAnalytics: false,
        respondMessages: true,
        manageReviews: true,
      },
    },
  ];

  const [teamMembers, setTeamMembers] = useState(mockTeam);

  const activeMembers = teamMembers.filter((m) => m.isActive).length;
  const totalSales = teamMembers.reduce((sum, m) => sum + (m.performance?.salesThisMonth || 0), 0);

  const filteredMembers = teamMembers.filter((member) => {
    const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
    return (
      fullName.includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'manager':
        return 'primary';
      case 'sales':
        return 'success';
      case 'support':
        return 'info';
      default:
        return 'default';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <AdminIcon />;
      case 'manager':
      case 'sales':
        return <PersonIcon />;
      case 'support':
        return <TeamIcon />;
      default:
        return <PersonIcon />;
    }
  };

  const handleDelete = () => {
    if (selectedMember) {
      setTeamMembers(teamMembers.filter((m) => m.id !== selectedMember.id));
      toast.success('Team member removed');
      setDeleteDialogOpen(false);
      setSelectedMember(null);
    }
  };

  const handleAddMember = () => {
    toast.success('Team member added successfully!');
    setAddDialogOpen(false);
  };

  const handleEditMember = () => {
    toast.success('Team member updated successfully!');
    setEditDialogOpen(false);
  };

  return (
    <DealerLayout>
      <Box sx={{ width: '100%', maxWidth: '100%', m: 0, p: 0 }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Team Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your dealership staff and permissions
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddDialogOpen(true)}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            }}
          >
            Add Team Member
          </Button>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                    <TeamIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {teamMembers.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Members
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                    <ActiveIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {activeMembers}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Members
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56 }}>
                    <TrendingUpIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {totalSales}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Sales This Month
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <AvatarGroup max={4} sx={{ justifyContent: 'flex-start' }}>
                    {teamMembers.slice(0, 4).map((member) => (
                      <Avatar key={member.id} src={member.avatar} sx={{ width: 40, height: 40 }}>
                        {member.firstName[0]}
                      </Avatar>
                    ))}
                  </AvatarGroup>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Team Members
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Team Table */}
        <Card>
          <CardContent>
            {/* Search Bar */}
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search team members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Team Members Table */}
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Member</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Performance</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                        <TeamIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                          No team members found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMembers.map((member) => (
                      <TableRow key={member.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar src={member.avatar} sx={{ width: 48, height: 48 }}>
                              {member.firstName[0]}{member.lastName[0]}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {member.firstName} {member.lastName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Joined {new Date(member.joinedDate).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Chip
                            icon={getRoleIcon(member.role)}
                            label={member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                            size="small"
                            color={getRoleColor(member.role) as any}
                          />
                        </TableCell>

                        <TableCell>
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                              <EmailIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="caption">{member.email}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="caption">{member.phone}</Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        <TableCell>
                          {member.performance ? (
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {member.performance.salesThisMonth} sales
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Total: {member.performance.totalSales} | Rating: {member.performance.rating}⭐
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              N/A
                            </Typography>
                          )}
                        </TableCell>

                        <TableCell>
                          <Chip
                            icon={member.isActive ? <ActiveIcon /> : <InactiveIcon />}
                            label={member.isActive ? 'Active' : 'Inactive'}
                            size="small"
                            color={member.isActive ? 'success' : 'default'}
                          />
                        </TableCell>

                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              setMenuAnchorEl(e.currentTarget);
                              setSelectedMember(member);
                            }}
                          >
                            <MoreIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Actions Menu */}
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={() => setMenuAnchorEl(null)}
        >
          <MenuItem
            onClick={() => {
              setEditDialogOpen(true);
              setMenuAnchorEl(null);
            }}
          >
            <EditIcon sx={{ mr: 1 }} fontSize="small" />
            Edit Member
          </MenuItem>
          <MenuItem
            onClick={() => {
              setMenuAnchorEl(null);
              toast.info('Permissions dialog would open');
            }}
          >
            <AdminIcon sx={{ mr: 1 }} fontSize="small" />
            Manage Permissions
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              setDeleteDialogOpen(true);
              setMenuAnchorEl(null);
            }}
            sx={{ color: 'error.main' }}
          >
            <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
            Remove Member
          </MenuItem>
        </Menu>

        {/* Add Member Dialog */}
        <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={6}>
                <TextField fullWidth label="First Name" required />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Last Name" required />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Email" type="email" required />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Phone" />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Role</InputLabel>
                  <Select label="Role" defaultValue="sales">
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="manager">Manager</MenuItem>
                    <MenuItem value="sales">Sales</MenuItem>
                    <MenuItem value="support">Support</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Permissions
                  </Typography>
                </Divider>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel control={<Switch defaultChecked />} label="Manage Vehicles" />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel control={<Switch />} label="Manage Team" />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel control={<Switch />} label="View Analytics" />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel control={<Switch defaultChecked />} label="Respond to Messages" />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel control={<Switch />} label="Manage Reviews" />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleAddMember}>
              Add Member
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Member Dialog */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Team Member</DialogTitle>
          <DialogContent>
            {selectedMember && (
              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                <Grid item xs={6}>
                  <TextField fullWidth label="First Name" defaultValue={selectedMember.firstName} />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth label="Last Name" defaultValue={selectedMember.lastName} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Email" type="email" defaultValue={selectedMember.email} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Phone" defaultValue={selectedMember.phone} />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Role</InputLabel>
                    <Select label="Role" defaultValue={selectedMember.role}>
                      <MenuItem value="admin">Admin</MenuItem>
                      <MenuItem value="manager">Manager</MenuItem>
                      <MenuItem value="sales">Sales</MenuItem>
                      <MenuItem value="support">Support</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={<Switch defaultChecked={selectedMember.isActive} />}
                    label="Active Status"
                  />
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleEditMember}>
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Remove Team Member</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to remove{' '}
              <strong>
                {selectedMember?.firstName} {selectedMember?.lastName}
              </strong>{' '}
              from your team? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDelete} color="error" variant="contained">
              Remove
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DealerLayout>
  );
};

export default DealerTeam;

