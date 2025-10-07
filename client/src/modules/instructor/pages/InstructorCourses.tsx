import React, { useState, useMemo } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Grid, CircularProgress, Chip, Avatar, IconButton,
  TextField, InputAdornment, ToggleButtonGroup, ToggleButton, Menu, MenuItem, Divider,
  ListItemIcon, ListItemText, Tooltip, LinearProgress, Badge, Dialog, DialogTitle,
  DialogContent, DialogActions, Rating, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, useTheme, alpha
} from '@mui/material';
import {
  Search as SearchIcon, FilterList as FilterIcon, Add as AddIcon, MoreVert as MoreIcon,
  Edit as EditIcon, Delete as DeleteIcon, Visibility as ViewIcon, School as CourseIcon,
  Group as StudentsIcon, Star as StarIcon, TrendingUp as TrendingIcon, Schedule as ScheduleIcon,
  AttachMoney as RevenueIcon, Assessment as AnalyticsIcon, Download as DownloadIcon,
  Share as ShareIcon, ContentCopy as CopyIcon, PlayArrow as PlayIcon, Pause as PauseIcon,
  CheckCircle as PublishedIcon, Schedule as DraftIcon, Warning as WarningIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../core/store';
import { fetchInstructorCourses } from '../store/instructorSlice';
import InstructorLayout from '../components/layout/InstructorLayout';

const InstructorCourses: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { courses, isLoading } = useSelector((s: RootState) => s.instructor);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'students' | 'rating' | 'revenue'>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  React.useEffect(() => {
    dispatch(fetchInstructorCourses() as any);
  }, [dispatch]);

  // Mock data for enhanced UI
  const mockCourses = [
    {
      id: '1',
      title: 'Complete React Development Course',
      description: 'Master React from basics to advanced concepts with hands-on projects',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1200&auto=format&fit=crop',
      students: 1240,
      rating: 4.8,
      revenue: 15600,
      status: 'published',
      progress: 85,
      duration: '12 hours',
      lessons: 45,
      lastUpdated: '2024-01-15',
      category: 'Web Development',
      tags: ['React', 'JavaScript', 'Frontend']
    },
    {
      id: '2',
      title: 'Advanced JavaScript Patterns',
      description: 'Deep dive into advanced JavaScript concepts and design patterns',
      thumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?q=80&w=1200&auto=format&fit=crop',
      students: 890,
      rating: 4.6,
      revenue: 11200,
      status: 'published',
      progress: 92,
      duration: '8 hours',
      lessons: 32,
      lastUpdated: '2024-01-10',
      category: 'Programming',
      tags: ['JavaScript', 'Patterns', 'Advanced']
    },
    {
      id: '3',
      title: 'Node.js Backend Development',
      description: 'Build scalable backend applications with Node.js and Express',
      thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?q=80&w=1200&auto=format&fit=crop',
      students: 650,
      rating: 4.7,
      revenue: 8900,
      status: 'draft',
      progress: 45,
      duration: '10 hours',
      lessons: 28,
      lastUpdated: '2024-01-12',
      category: 'Backend Development',
      tags: ['Node.js', 'Express', 'Backend']
    },
    {
      id: '4',
      title: 'Python Data Science Fundamentals',
      description: 'Learn data analysis and visualization with Python',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop',
      students: 2100,
      rating: 4.9,
      revenue: 28400,
      status: 'published',
      progress: 78,
      duration: '15 hours',
      lessons: 52,
      lastUpdated: '2024-01-08',
      category: 'Data Science',
      tags: ['Python', 'Data Science', 'Analytics']
    }
  ];

  const displayCourses = courses && courses.length > 0 ? courses : mockCourses;

  const filteredCourses = useMemo(() => {
    let filtered = displayCourses.filter(course =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (statusFilter !== 'all') {
      filtered = filtered.filter(course => course.status === statusFilter);
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'students':
          return (b.students || 0) - (a.students || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'revenue':
          return (b.revenue || 0) - (a.revenue || 0);
        default:
          return new Date(b.lastUpdated || '').getTime() - new Date(a.lastUpdated || '').getTime();
      }
    });
  }, [displayCourses, searchTerm, statusFilter, sortBy]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, course: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedCourse(course);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCourse(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <PublishedIcon color="success" />;
      case 'draft':
        return <DraftIcon color="warning" />;
      case 'archived':
        return <WarningIcon color="error" />;
      default:
        return <DraftIcon color="disabled" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'draft':
        return 'warning';
      case 'archived':
        return 'error';
      default:
        return 'default';
    }
  };

  const CourseCard: React.FC<{ course: any }> = ({ course }) => (
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
      <Box sx={{ position: 'relative' }}>
        <Box
          component="img"
          src={course.thumbnail}
          alt={course.title}
          sx={{
            width: '100%',
            height: 200,
            objectFit: 'cover',
          }}
        />
        <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 1 }}>
          <Chip 
            icon={getStatusIcon(course.status)} 
            label={course.status} 
            size="small" 
            color={getStatusColor(course.status) as any}
            sx={{ backdropFilter: 'blur(10px)', bgcolor: alpha(theme.palette.background.paper, 0.8) }}
          />
          <IconButton
            size="small"
            onClick={(e) => handleMenuOpen(e, course)}
            sx={{ 
              bgcolor: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(10px)',
              '&:hover': { bgcolor: alpha(theme.palette.background.paper, 0.9) }
            }}
          >
            <MoreIcon />
          </IconButton>
        </Box>
        <Box sx={{ position: 'absolute', bottom: 8, left: 8, right: 8 }}>
          <LinearProgress 
            variant="determinate" 
            value={course.progress} 
            sx={{ 
              height: 6, 
              borderRadius: 3,
              bgcolor: alpha(theme.palette.common.white, 0.3),
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
              }
            }} 
          />
          <Typography variant="caption" sx={{ color: 'white', mt: 0.5, display: 'block' }}>
            {course.progress}% Complete
          </Typography>
        </Box>
      </Box>
      
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" fontWeight={600} gutterBottom sx={{ lineHeight: 1.3 }}>
          {course.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
          {course.description}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Chip size="small" label={course.category} color="primary" variant="outlined" />
          {course.tags?.slice(0, 2).map((tag: string) => (
            <Chip key={tag} size="small" label={tag} variant="outlined" />
          ))}
        </Box>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <StudentsIcon fontSize="small" color="action" />
            <Typography variant="body2">{course.students?.toLocaleString()}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <StarIcon fontSize="small" color="warning" />
            <Typography variant="body2">{course.rating}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ScheduleIcon fontSize="small" color="action" />
            <Typography variant="body2">{course.duration}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <RevenueIcon fontSize="small" color="success" />
            <Typography variant="body2">${course.revenue?.toLocaleString()}</Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="outlined" 
            size="small" 
            startIcon={<EditIcon />}
            sx={{ flexGrow: 1 }}
          >
            Edit
          </Button>
          <Button 
            variant="contained" 
            size="small" 
            startIcon={<AnalyticsIcon />}
            onClick={() => setAnalyticsOpen(true)}
          >
            Analytics
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <InstructorLayout>
      {/* Header Section */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={700}>Course Management</Typography>
            <Typography variant="body2" color="text.secondary">
              Manage and track your course performance
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            sx={{ px: 3 }}
          >
            Create New Course
          </Button>
        </Box>

        {/* Stats Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
          <Card sx={{ borderRadius: 1 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="overline" color="text.secondary">Total Courses</Typography>
                  <Typography variant="h4" fontWeight={800}>{displayCourses.length}</Typography>
                  <Chip size="small" color="primary" label="All courses" sx={{ mt: 1 }} />
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main', width: 44, height: 44 }}>
                  <CourseIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ borderRadius: 1 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="overline" color="text.secondary">Total Students</Typography>
                  <Typography variant="h4" fontWeight={800}>
                    {displayCourses.reduce((sum, c) => sum + (c.students || 0), 0).toLocaleString()}
                  </Typography>
                  <Chip size="small" color="success" label="Enrolled" sx={{ mt: 1 }} />
                </Box>
                <Avatar sx={{ bgcolor: 'success.main', width: 44, height: 44 }}>
                  <StudentsIcon />
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
                    {(displayCourses.reduce((sum, c) => sum + (c.rating || 0), 0) / displayCourses.length).toFixed(1)}
                  </Typography>
                  <Chip size="small" color="warning" label="Quality" sx={{ mt: 1 }} />
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main', width: 44, height: 44 }}>
                  <StarIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ borderRadius: 1 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="overline" color="text.secondary">Total Revenue</Typography>
                  <Typography variant="h4" fontWeight={800}>
                    ${displayCourses.reduce((sum, c) => sum + (c.revenue || 0), 0).toLocaleString()}
                  </Typography>
                  <Chip size="small" color="info" label="Earnings" sx={{ mt: 1 }} />
                </Box>
                <Avatar sx={{ bgcolor: 'info.main', width: 44, height: 44 }}>
                  <RevenueIcon />
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
                  placeholder="Search courses..."
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
                  <ToggleButton value="published">Published</ToggleButton>
                  <ToggleButton value="draft">Draft</ToggleButton>
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
                  <ToggleButton value="students">Students</ToggleButton>
                  <ToggleButton value="rating">Rating</ToggleButton>
                  <ToggleButton value="revenue">Revenue</ToggleButton>
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
                </ToggleButtonGroup>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      {/* Courses Grid */}
      {isLoading ? (
        <Box display="grid" placeItems="center" py={6}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' } }}>
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </Box>
      )}

      {/* Course Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{ sx: { minWidth: 200 } }}
      >
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Edit Course</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon><ViewIcon fontSize="small" /></ListItemIcon>
          <ListItemText>View Course</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon><AnalyticsIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Analytics</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon><ShareIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Share Course</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon><CopyIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Delete Course</ListItemText>
        </MenuItem>
      </Menu>

      {/* Analytics Dialog */}
      <Dialog open={analyticsOpen} onClose={() => setAnalyticsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Course Analytics</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Detailed analytics for your course performance will be displayed here.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAnalyticsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </InstructorLayout>
  );
};

export default InstructorCourses;


