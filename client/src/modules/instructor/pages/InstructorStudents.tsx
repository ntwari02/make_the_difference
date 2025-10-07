import React, { useState, useMemo } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Grid, CircularProgress, Chip, Avatar, IconButton,
  TextField, InputAdornment, ToggleButtonGroup, ToggleButton, Menu, MenuItem, Divider,
  ListItemIcon, ListItemText, Tooltip, LinearProgress, Badge, Dialog, DialogTitle,
  DialogContent, DialogActions, Rating, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, useTheme, alpha, List, ListItem, ListItemAvatar
} from '@mui/material';
import {
  Search as SearchIcon, FilterList as FilterIcon, Add as AddIcon, MoreVert as MoreIcon,
  Edit as EditIcon, Delete as DeleteIcon, Visibility as ViewIcon, Person as StudentIcon,
  Group as GroupIcon, Star as StarIcon, TrendingUp as TrendingIcon, Schedule as ScheduleIcon,
  AttachMoney as RevenueIcon, Assessment as AnalyticsIcon, Download as DownloadIcon,
  Share as ShareIcon, ContentCopy as CopyIcon, PlayArrow as PlayIcon, Pause as PauseIcon,
  CheckCircle as ActiveIcon, CheckCircle, Schedule as InactiveIcon, Warning as WarningIcon,
  Email as EmailIcon, Phone as PhoneIcon, LocationOn as LocationIcon,
  School as CourseIcon, Assignment as AssignmentIcon, Grade as GradeIcon,
  Message as MessageIcon, VideoCall as VideoCallIcon, Block as BlockIcon
} from '@mui/icons-material';
import InstructorLayout from '../components/layout/InstructorLayout';

const InstructorStudents: React.FC = () => {
  const theme = useTheme();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'graduated'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'progress' | 'rating'>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Mock data for enhanced UI
  const mockStudents = [
    {
      id: '1',
      name: 'Alice Johnson',
      email: 'alice.johnson@email.com',
      phone: '+1 (555) 123-4567',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=1200&auto=format&fit=crop',
      course: 'Complete React Development Course',
      progress: 85,
      rating: 4.8,
      status: 'active',
      enrollmentDate: '2024-01-15',
      lastActive: '2024-01-20',
      assignmentsCompleted: 12,
      totalAssignments: 15,
      location: 'New York, NY',
      grade: 'A',
      notes: 'Excellent student, very engaged'
    },
    {
      id: '2',
      name: 'Bob Smith',
      email: 'bob.smith@email.com',
      phone: '+1 (555) 234-5678',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1200&auto=format&fit=crop',
      course: 'Advanced JavaScript Patterns',
      progress: 92,
      rating: 4.6,
      status: 'active',
      enrollmentDate: '2024-01-10',
      lastActive: '2024-01-19',
      assignmentsCompleted: 8,
      totalAssignments: 10,
      location: 'Los Angeles, CA',
      grade: 'A+',
      notes: 'Quick learner, asks great questions'
    },
    {
      id: '3',
      name: 'Carol Davis',
      email: 'carol.davis@email.com',
      phone: '+1 (555) 345-6789',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1200&auto=format&fit=crop',
      course: 'Node.js Backend Development',
      progress: 45,
      rating: 4.7,
      status: 'active',
      enrollmentDate: '2024-01-12',
      lastActive: '2024-01-18',
      assignmentsCompleted: 5,
      totalAssignments: 12,
      location: 'Chicago, IL',
      grade: 'B+',
      notes: 'Needs more practice with async concepts'
    },
    {
      id: '4',
      name: 'David Wilson',
      email: 'david.wilson@email.com',
      phone: '+1 (555) 456-7890',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1200&auto=format&fit=crop',
      course: 'Python Data Science Fundamentals',
      progress: 100,
      rating: 4.9,
      status: 'graduated',
      enrollmentDate: '2023-12-01',
      lastActive: '2024-01-15',
      assignmentsCompleted: 20,
      totalAssignments: 20,
      location: 'Seattle, WA',
      grade: 'A+',
      notes: 'Outstanding performance, recommended for advanced courses'
    },
    {
      id: '5',
      name: 'Emma Brown',
      email: 'emma.brown@email.com',
      phone: '+1 (555) 567-8901',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1200&auto=format&fit=crop',
      course: 'Complete React Development Course',
      progress: 30,
      rating: 4.2,
      status: 'inactive',
      enrollmentDate: '2024-01-05',
      lastActive: '2024-01-10',
      assignmentsCompleted: 3,
      totalAssignments: 15,
      location: 'Miami, FL',
      grade: 'B',
      notes: 'Hasn\'t been active recently, may need follow-up'
    }
  ];

  const filteredStudents = useMemo(() => {
    let filtered = mockStudents.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.course.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (statusFilter !== 'all') {
      filtered = filtered.filter(student => student.status === statusFilter);
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'progress':
          return (b.progress || 0) - (a.progress || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return new Date(b.lastActive || '').getTime() - new Date(a.lastActive || '').getTime();
      }
    });
  }, [searchTerm, statusFilter, sortBy]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, student: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedStudent(student);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedStudent(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <ActiveIcon color="success" />;
      case 'inactive':
        return <InactiveIcon color="warning" />;
      case 'graduated':
        return <CheckCircle color="info" />;
      default:
        return <InactiveIcon color="disabled" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'graduated':
        return 'info';
      default:
        return 'default';
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'success';
      case 'B+':
      case 'B':
        return 'warning';
      case 'C+':
      case 'C':
        return 'error';
      default:
        return 'default';
    }
  };

  const StudentCard: React.FC<{ student: any }> = ({ student }) => (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar 
              src={student.avatar} 
              sx={{ width: 56, height: 56 }}
            >
              {student.name.split(' ').map((n: string) => n[0]).join('')}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600}>{student.name}</Typography>
              <Typography variant="body2" color="text.secondary">{student.email}</Typography>
            </Box>
          </Box>
          <IconButton
            size="small"
            onClick={(e) => handleMenuOpen(e, student)}
          >
            <MoreIcon />
          </IconButton>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>Course Progress</Typography>
          <LinearProgress 
            variant="determinate" 
            value={student.progress} 
            sx={{ height: 8, borderRadius: 4, mb: 1 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" fontWeight={600}>{student.progress}% Complete</Typography>
            <Chip 
              size="small" 
              label={student.grade} 
              color={getGradeColor(student.grade) as any}
            />
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <StarIcon fontSize="small" color="warning" />
            <Typography variant="body2">{student.rating}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AssignmentIcon fontSize="small" color="action" />
            <Typography variant="body2">{student.assignmentsCompleted}/{student.totalAssignments}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ScheduleIcon fontSize="small" color="action" />
            <Typography variant="body2">{student.lastActive}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LocationIcon fontSize="small" color="action" />
            <Typography variant="body2" noWrap>{student.location}</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Chip 
            icon={getStatusIcon(student.status)} 
            label={student.status} 
            size="small" 
            color={getStatusColor(student.status) as any}
          />
          <Chip size="small" label={student.course} variant="outlined" />
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="outlined" 
            size="small" 
            startIcon={<MessageIcon />}
            sx={{ flexGrow: 1 }}
          >
            Message
          </Button>
          <Button 
            variant="contained" 
            size="small" 
            startIcon={<ViewIcon />}
            onClick={() => setDetailsOpen(true)}
          >
            View Details
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  const StudentTable: React.FC = () => (
    <TableContainer component={Paper} sx={{ borderRadius: 1 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Student</TableCell>
            <TableCell>Course</TableCell>
            <TableCell>Progress</TableCell>
            <TableCell>Grade</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Last Active</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredStudents.map((student) => (
            <TableRow key={student.id} hover>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar src={student.avatar} sx={{ width: 40, height: 40 }}>
                    {student.name.split(' ').map((n: string) => n[0]).join('')}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>{student.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{student.email}</Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{student.course}</Typography>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={student.progress} 
                    sx={{ width: 60, height: 6 }}
                  />
                  <Typography variant="body2">{student.progress}%</Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Chip 
                  size="small" 
                  label={student.grade} 
                  color={getGradeColor(student.grade) as any}
                />
              </TableCell>
              <TableCell>
                <Chip 
                  icon={getStatusIcon(student.status)} 
                  label={student.status} 
                  size="small" 
                  color={getStatusColor(student.status) as any}
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2">{student.lastActive}</Typography>
              </TableCell>
              <TableCell align="right">
                <IconButton size="small" onClick={(e) => handleMenuOpen(e, student)}>
                  <MoreIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <InstructorLayout>
      {/* Header Section */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={700}>Student Management</Typography>
            <Typography variant="body2" color="text.secondary">
              Track and manage your students' progress and performance
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            sx={{ px: 3 }}
          >
            Add Student
          </Button>
        </Box>

        {/* Stats Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
          <Card sx={{ borderRadius: 1 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="overline" color="text.secondary">Total Students</Typography>
                  <Typography variant="h4" fontWeight={800}>{mockStudents.length}</Typography>
                  <Chip size="small" color="primary" label="All students" sx={{ mt: 1 }} />
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main', width: 44, height: 44 }}>
                  <GroupIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ borderRadius: 1 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="overline" color="text.secondary">Active Students</Typography>
                  <Typography variant="h4" fontWeight={800}>
                    {mockStudents.filter(s => s.status === 'active').length}
                  </Typography>
                  <Chip size="small" color="success" label="Currently enrolled" sx={{ mt: 1 }} />
                </Box>
                <Avatar sx={{ bgcolor: 'success.main', width: 44, height: 44 }}>
                  <ActiveIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ borderRadius: 1 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="overline" color="text.secondary">Avg Progress</Typography>
                  <Typography variant="h4" fontWeight={800}>
                    {Math.round(mockStudents.reduce((sum, s) => sum + s.progress, 0) / mockStudents.length)}%
                  </Typography>
                  <Chip size="small" color="warning" label="Completion rate" sx={{ mt: 1 }} />
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main', width: 44, height: 44 }}>
                  <TrendingIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ borderRadius: 1 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="overline" color="text.secondary">Avg Rating</Typography>
                  <Typography variant="h4" fontWeight={800}>
                    {(mockStudents.reduce((sum, s) => sum + s.rating, 0) / mockStudents.length).toFixed(1)}
                  </Typography>
                  <Chip size="small" color="info" label="Student satisfaction" sx={{ mt: 1 }} />
                </Box>
                <Avatar sx={{ bgcolor: 'info.main', width: 44, height: 44 }}>
                  <StarIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Filters and Search */}
        <Card sx={{ borderRadius: 1, mb: 3 }}>
          <CardContent sx={{ p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <ToggleButtonGroup
                  value={statusFilter}
                  exclusive
                  onChange={(_, value) => value && setStatusFilter(value)}
                  size="small"
                  fullWidth
                >
                  <ToggleButton value="all">All</ToggleButton>
                  <ToggleButton value="active">Active</ToggleButton>
                  <ToggleButton value="inactive">Inactive</ToggleButton>
                  <ToggleButton value="graduated">Graduated</ToggleButton>
                </ToggleButtonGroup>
              </Grid>
              <Grid item xs={12} md={3}>
                <ToggleButtonGroup
                  value={sortBy}
                  exclusive
                  onChange={(_, value) => value && setSortBy(value)}
                  size="small"
                  fullWidth
                >
                  <ToggleButton value="recent">Recent</ToggleButton>
                  <ToggleButton value="name">Name</ToggleButton>
                  <ToggleButton value="progress">Progress</ToggleButton>
                  <ToggleButton value="rating">Rating</ToggleButton>
                </ToggleButtonGroup>
              </Grid>
              <Grid item xs={12} md={2}>
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(_, value) => value && setViewMode(value)}
                  size="small"
                  fullWidth
                >
                  <ToggleButton value="grid">Grid</ToggleButton>
                  <ToggleButton value="list">List</ToggleButton>
                  <ToggleButton value="table">Table</ToggleButton>
                </ToggleButtonGroup>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      {/* Students Display */}
      {viewMode === 'table' ? (
        <StudentTable />
      ) : viewMode === 'list' ? (
        <Card sx={{ borderRadius: 1 }}>
          <CardContent>
            <List>
              {filteredStudents.map((student) => (
                <ListItem key={student.id} divider>
                  <ListItemAvatar>
                    <Avatar src={student.avatar}>
                      {student.name.split(' ').map((n: string) => n[0]).join('')}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={student.name}
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                        <Typography variant="body2">{student.course}</Typography>
                        <Chip 
                          icon={getStatusIcon(student.status)} 
                          label={student.status} 
                          size="small" 
                          color={getStatusColor(student.status) as any}
                        />
                        <Typography variant="body2">{student.progress}% Complete</Typography>
                      </Box>
                    }
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, student)}>
                      <MoreIcon />
                    </IconButton>
                  </Box>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' } }}>
          {filteredStudents.map((student) => (
            <StudentCard key={student.id} student={student} />
          ))}
        </Box>
      )}

      {/* Student Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{ sx: { minWidth: 200 } }}
      >
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon><ViewIcon fontSize="small" /></ListItemIcon>
          <ListItemText>View Profile</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon><MessageIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Send Message</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon><VideoCallIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Schedule Call</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon><AnalyticsIcon fontSize="small" /></ListItemIcon>
          <ListItemText>View Progress</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon><EmailIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Send Email</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <ListItemIcon><BlockIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Block Student</ListItemText>
        </MenuItem>
      </Menu>

      {/* Student Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Student Details</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Detailed student information and progress analytics will be displayed here.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </InstructorLayout>
  );
};

export default InstructorStudents;


