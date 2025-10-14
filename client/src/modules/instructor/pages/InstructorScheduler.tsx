import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Paper,
  Tooltip,
  Badge,
  Switch,
  FormControlLabel,
  Alert,
  LinearProgress,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
} from '@mui/material';
import {
  CalendarMonth,
  Schedule,
  Add,
  Edit,
  Delete,
  Visibility,
  VisibilityOff,
  Today,
  Event,
  Person,
  VideoCall,
  Phone,
  LocationOn,
  Notifications,
  Analytics,
  FilterList,
  Search,
  Refresh,
  MoreVert,
  CheckCircle,
  Cancel,
  Warning,
  Info,
  AccessTime,
  DateRange,
  Group,
  Settings,
  Download,
  Upload,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addDays, subDays, isToday, isPast, isFuture, parseISO, startOfMonth, endOfMonth, isSameMonth, addMonths, subMonths } from 'date-fns';
import InstructorLayout from '../components/layout/InstructorLayout';
import DraggableAppointment from '../components/DraggableAppointment';
import NotificationCenter from '../components/NotificationCenter';
import SchedulerAnalytics from '../components/SchedulerAnalytics';

// Types
interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  isBooked: boolean;
  studentName?: string;
  studentEmail?: string;
  meetingType?: 'video' | 'phone' | 'in-person';
  notes?: string;
}

interface Availability {
  id: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  maxBookings: number;
  currentBookings: number;
}

interface Appointment {
  id: string;
  date: string;
  timeSlot: TimeSlot;
  student: {
    name: string;
    email: string;
    avatar?: string;
  };
  status: 'confirmed' | 'pending' | 'cancelled';
  meetingType: 'video' | 'phone' | 'in-person';
  notes: string;
  createdAt: string;
}

interface Notification {
  id: string;
  type: 'appointment' | 'reminder' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  appointmentId?: string;
  priority: 'low' | 'medium' | 'high';
}

const InstructorScheduler: React.FC = () => {
  // State management
  const [currentView, setCurrentView] = useState<'month' | 'week' | 'day'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddAvailability, setShowAddAvailability] = useState(false);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'pending' | 'cancelled'>('all');
  const [schedulesByDate, setSchedulesByDate] = useState<Record<string, { id: string; title?: string; startTime: string; endTime: string }[]>>({});
  const [availForm, setAvailForm] = useState<{ date: string; startTime: string; endTime: string; title: string; dayOfWeek?: number; recurring?: boolean; maxBookings?: number }>({
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '10:00',
    title: ''
  });
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'appointment',
      title: 'New Appointment Request',
      message: 'John Doe requested a math tutoring session for tomorrow at 2:00 PM',
      timestamp: new Date().toISOString(),
      isRead: false,
      appointmentId: '1',
      priority: 'medium'
    },
    {
      id: '2',
      type: 'reminder',
      title: 'Upcoming Appointment',
      message: 'You have an appointment with Jane Smith in 30 minutes',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      isRead: false,
      appointmentId: '2',
      priority: 'high'
    },
    {
      id: '3',
      type: 'warning',
      title: 'Schedule Conflict',
      message: 'Two appointments are scheduled at the same time',
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      isRead: true,
      priority: 'high'
    }
  ]);

  // Mock data - in real app, this would come from API
  const [availabilities, setAvailabilities] = useState<Availability[]>([
    { id: '1', dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isRecurring: true, maxBookings: 8, currentBookings: 3 },
    { id: '2', dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isRecurring: true, maxBookings: 8, currentBookings: 5 },
    { id: '3', dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isRecurring: true, maxBookings: 8, currentBookings: 2 },
    { id: '4', dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isRecurring: true, maxBookings: 8, currentBookings: 6 },
    { id: '5', dayOfWeek: 5, startTime: '09:00', endTime: '15:00', isRecurring: true, maxBookings: 6, currentBookings: 4 },
  ]);

  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: '1',
      date: format(new Date(), 'yyyy-MM-dd'),
      timeSlot: {
        id: '1',
        startTime: '10:00',
        endTime: '11:00',
        isAvailable: false,
        isBooked: true,
        studentName: 'John Doe',
        studentEmail: 'john@example.com',
        meetingType: 'video',
        notes: 'Math tutoring session'
      },
      student: {
        name: 'John Doe',
        email: 'john@example.com',
        avatar: 'https://i.pravatar.cc/150?img=1'
      },
      status: 'confirmed',
      meetingType: 'video',
      notes: 'Math tutoring session',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
      timeSlot: {
        id: '2',
        startTime: '14:00',
        endTime: '15:00',
        isAvailable: false,
        isBooked: true,
        studentName: 'Jane Smith',
        studentEmail: 'jane@example.com',
        meetingType: 'phone',
        notes: 'Physics consultation'
      },
      student: {
        name: 'Jane Smith',
        email: 'jane@example.com',
        avatar: 'https://i.pravatar.cc/150?img=2'
      },
      status: 'pending',
      meetingType: 'phone',
      notes: 'Physics consultation',
      createdAt: new Date().toISOString()
    }
  ]);

  // Calendar helpers
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const timeSlots = useMemo(() => {
    const slots: TimeSlot[] = [];
    for (let hour = 9; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const endHour = minute === 30 ? hour + 1 : hour;
        const endMinute = minute === 30 ? 0 : 30;
        const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
        
        const existingAppointment = appointments.find(apt => 
          apt.date === format(selectedDate, 'yyyy-MM-dd') && 
          apt.timeSlot.startTime === startTime
        );

        slots.push({
          id: `${hour}-${minute}`,
          startTime,
          endTime,
          isAvailable: !existingAppointment,
          isBooked: !!existingAppointment,
          ...existingAppointment?.timeSlot
        });
      }
    }
    return slots;
  }, [selectedDate, appointments]);

  // Event handlers
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const handleViewChange = (view: 'month' | 'week' | 'day') => {
    setCurrentView(view);
  };

  const handleAddAvailability = () => {
    setShowAddAvailability(true);
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentDetails(true);
  };

  // Notification handlers
  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const handleDeleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  // Analytics data
  const analyticsData = {
    totalAppointments: appointments.length,
    confirmedAppointments: appointments.filter(apt => apt.status === 'confirmed').length,
    pendingAppointments: appointments.filter(apt => apt.status === 'pending').length,
    cancelledAppointments: appointments.filter(apt => apt.status === 'cancelled').length,
    averageBookingRate: Math.round((availabilities.reduce((sum, av) => sum + av.currentBookings, 0) / availabilities.reduce((sum, av) => sum + av.maxBookings, 0)) * 100),
    peakHours: [
      { hour: '09:00', bookings: 8 },
      { hour: '10:00', bookings: 12 },
      { hour: '11:00', bookings: 15 },
      { hour: '14:00', bookings: 18 },
      { hour: '15:00', bookings: 14 },
      { hour: '16:00', bookings: 10 },
    ],
    weeklyTrend: [
      { day: 'Monday', appointments: 8 },
      { day: 'Tuesday', appointments: 12 },
      { day: 'Wednesday', appointments: 10 },
      { day: 'Thursday', appointments: 15 },
      { day: 'Friday', appointments: 6 },
      { day: 'Saturday', appointments: 3 },
      { day: 'Sunday', appointments: 1 },
    ],
    topStudents: [
      { name: 'John Doe', appointments: 8 },
      { name: 'Jane Smith', appointments: 6 },
      { name: 'Mike Johnson', appointments: 4 },
      { name: 'Sarah Wilson', appointments: 3 },
    ],
    meetingTypeDistribution: [
      { type: 'video', count: 15, percentage: 60 },
      { type: 'phone', count: 7, percentage: 28 },
      { type: 'in-person', count: 3, percentage: 12 },
    ],
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => apt.date === format(date, 'yyyy-MM-dd'));
  };

  const getSchedulesForDate = (date: Date) => {
    const key = format(date, 'yyyy-MM-dd');
    return schedulesByDate[key] || [];
  };

  const openAvailabilityForDate = (date: Date) => {
    setSelectedDate(date);
    setAvailForm({
      date: format(date, 'yyyy-MM-dd'),
      startTime: '09:00',
      endTime: '10:00',
      title: ''
    });
    setShowAddAvailability(true);
  };

  const saveAvailability = () => {
    const key = availForm.date;
    setSchedulesByDate(prev => {
      const nextForDay = [...(prev[key] || []), { id: Math.random().toString(36).slice(2), title: availForm.title, startTime: availForm.startTime, endTime: availForm.endTime }];
      return { ...prev, [key]: nextForDay };
    });
    setShowAddAvailability(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getMeetingTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <VideoCall fontSize="small" />;
      case 'phone': return <Phone fontSize="small" />;
      case 'in-person': return <LocationOn fontSize="small" />;
      default: return <Event fontSize="small" />;
    }
  };

  const filteredAppointments = useMemo(() => {
    let filtered = appointments;
    
    if (searchQuery) {
      filtered = filtered.filter(apt => 
        apt.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.notes.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(apt => apt.status === filterStatus);
    }
    
    return filtered;
  }, [appointments, searchQuery, filterStatus]);

  return (
    <InstructorLayout>
      <Box sx={{ mt: 2, pl: 2, pr: 0 }}>

        {/* Calendar View */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} md={8} sx={{ display: 'flex' }}>
              <Card elevation={0} square sx={{ borderRadius: 0, height: '100%', width: '100%' }}>
                <CardContent sx={{ p: 0 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Typography variant="h6" fontWeight={600}>
                      {format(currentDate, 'MMMM yyyy')}
                    </Typography>
                    <Box display="flex" gap={1}>
                      <IconButton onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                        <DateRange />
                      </IconButton>
                      <IconButton onClick={() => setCurrentDate(new Date())}>
                        <Today />
                      </IconButton>
                      <IconButton onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                        <DateRange />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box>
                    <Box sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                      gap: 1,
                      mb: 1
                    }}>
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                        <Box key={day} sx={{ px: 1 }}>
                          <Typography variant="body2" fontWeight={600} textAlign="center">
                            {day}
                          </Typography>
                        </Box>
                      ))}
                    </Box>

                    {currentView === 'month' ? (
                      <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                        gap: 1
                      }}>
                        {monthDays.map((day) => {
                          const isSelected = isSameDay(day, selectedDate);
                          const isCurrentDay = isToday(day);
                          const inMonth = isSameMonth(day, currentDate);
                          const daySchedules = getSchedulesForDate(day);
                          return (
                            <Box key={day.toISOString()}>
                              <Paper
                                sx={{
                                  p: 1,
                                  minHeight: 110,
                                  cursor: 'pointer',
                                  border: isSelected ? 2 : 1,
                                  borderColor: isSelected ? 'primary.main' : 'divider',
                                  bgcolor: isCurrentDay ? 'primary.50' : 'background.paper',
                                  opacity: inMonth ? 1 : 0.6,
                                  '&:hover': { bgcolor: 'action.hover' }
                                }}
                                onClick={() => {
                                  setSelectedDate(day);
                                  openAvailabilityForDate(day);
                                }}
                              >
                                <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                                  <Typography
                                    variant="body2"
                                    fontWeight={isCurrentDay ? 600 : 400}
                                    color={isCurrentDay ? 'primary.main' : 'text.primary'}
                                  >
                                    {format(day, 'd')}
                                  </Typography>
                                  <IconButton size="small" onClick={(e) => { e.stopPropagation(); openAvailabilityForDate(day); }}>
                                    <Add fontSize="small" />
                                  </IconButton>
                                </Box>
                                {daySchedules.map((sc) => (
                                  <Chip
                                    key={sc.id}
                                    label={`${sc.title || 'Availability'} (${sc.startTime} - ${sc.endTime})`}
                                    size="small"
                                    color="success"
                                    sx={{
                                      fontSize: '0.7rem', height: 20, mb: 0.5, display: 'block', width: '100%',
                                      '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' }
                                    }}
                                  />
                                ))}
                                {getAppointmentsForDate(day).map((apt) => (
                                  <Chip
                                    key={apt.id}
                                    label={`${apt.timeSlot.startTime} - ${apt.student.name}`}
                                    size="small"
                                    color={getStatusColor(apt.status) as any}
                                    sx={{ fontSize: '0.7rem', height: 20, mb: 0.5, display: 'block', width: '100%' }}
                                    onClick={(e) => { e.stopPropagation(); handleAppointmentClick(apt); }}
                                  />
                                ))}
                              </Paper>
                            </Box>
                          );
                        })}
                      </Box>
                    ) : null}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
              <Card sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1, overflow: 'auto' }}>
                  <Typography variant="h6" fontWeight={600} mb={1}>Overview</Typography>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Chip label={`Confirmed: ${appointments.filter(a => a.status === 'confirmed').length}`} color="success" />
                    <Chip label={`Pending: ${appointments.filter(a => a.status === 'pending').length}`} color="warning" />
                    <Chip label={`Cancelled: ${appointments.filter(a => a.status === 'cancelled').length}`} color="error" />
      </Box>

                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    {format(selectedDate, 'EEEE, MMM d')} schedules
                  </Typography>
                  <List dense>
                    {getSchedulesForDate(selectedDate).length === 0 && getAppointmentsForDate(selectedDate).length === 0 && (
                      <ListItem>
                        <ListItemText primary="No schedules yet" secondary="Click a day to add one" />
                      </ListItem>
                    )}
                    {getSchedulesForDate(selectedDate).map((sc) => (
                      <ListItem key={sc.id}>
                        <ListItemText primary={`${sc.startTime} - ${sc.endTime}`} secondary={sc.title || 'Availability'} />
                      </ListItem>
                    ))}
                    {getAppointmentsForDate(selectedDate).map((apt) => (
                      <ListItem key={apt.id} button onClick={() => handleAppointmentClick(apt)}>
                        <ListItemText primary={`${apt.timeSlot.startTime} - ${apt.student.name}`} secondary={apt.status} />
                      </ListItem>
                    ))}
                  </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
        </motion.div>
        
        {/* Add Availability Dialog */}
        <Dialog open={showAddAvailability} onClose={() => setShowAddAvailability(false)} maxWidth="sm" fullWidth>
          <DialogTitle component="div"><Typography component="h2" variant="h6">Add Schedule</Typography></DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Date"
                    type="date"
                    value={availForm.date}
                    onChange={(e) => setAvailForm((p) => ({ ...p, date: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Start Time"
                    type="time"
                    value={availForm.startTime}
                    onChange={(e) => setAvailForm((p) => ({ ...p, startTime: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="End Time"
                    type="time"
                    value={availForm.endTime}
                    onChange={(e) => setAvailForm((p) => ({ ...p, endTime: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Title (optional)"
                    placeholder="e.g. Office Hours"
                    value={availForm.title}
                    onChange={(e) => setAvailForm((p) => ({ ...p, title: e.target.value }))}
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowAddAvailability(false)}>Cancel</Button>
            <Button variant="contained" onClick={saveAvailability}>
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Appointment Details Dialog */}
        <Dialog open={showAppointmentDetails} onClose={() => setShowAppointmentDetails(false)} maxWidth="sm" fullWidth>
          {selectedAppointment && (
            <>
              <DialogTitle component="div">
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar src={selectedAppointment.student.avatar}>
                    {selectedAppointment.student.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography component="h2" variant="h6">{selectedAppointment.student.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedAppointment.student.email}
                    </Typography>
                  </Box>
                </Box>
              </DialogTitle>
              <DialogContent>
                <Box sx={{ pt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>Appointment Details</Typography>
                      <Box display="flex" alignItems="center" gap={2} mb={2}>
                        <AccessTime />
                        <Typography>
                          {format(parseISO(selectedAppointment.date), 'EEEE, MMMM d, yyyy')} at {selectedAppointment.timeSlot.startTime}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={2} mb={2}>
                        {getMeetingTypeIcon(selectedAppointment.meetingType)}
                        <Typography>
                          {selectedAppointment.meetingType.charAt(0).toUpperCase() + selectedAppointment.meetingType.slice(1)} Meeting
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={2} mb={2}>
                        <Chip
                          label={selectedAppointment.status}
                          color={getStatusColor(selectedAppointment.status) as any}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>Notes</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedAppointment.notes || 'No notes provided'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setShowAppointmentDetails(false)}>Close</Button>
                <Button variant="contained" color="error">
                  Cancel Appointment
                </Button>
                <Button variant="contained">
                  Reschedule
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Analytics Dialog */}
        <Dialog open={showAnalytics} onClose={() => setShowAnalytics(false)} maxWidth="lg" fullWidth>
          <DialogTitle component="div"><Typography component="h2" variant="h6">Schedule Analytics</Typography></DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            <SchedulerAnalytics 
              data={analyticsData}
              dateRange={{
                start: startOfWeek(currentDate),
                end: endOfWeek(currentDate)
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowAnalytics(false)}>Close</Button>
            <Button variant="contained" startIcon={<Download />}>
              Export Data
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </InstructorLayout>
  );
};

export default InstructorScheduler;


