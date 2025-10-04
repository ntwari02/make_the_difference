import React, { useState } from 'react';
import {
  Box,
  GridLegacy as Grid,
  Card,
  CardContent,
  Typography,
  Button,
  useTheme,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Badge,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Divider,
  Paper,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Search as SearchIcon,
  Send as SendIcon,
  AttachFile as AttachIcon,
  MoreVert as MoreIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Delete as DeleteIcon,
  Archive as ArchiveIcon,
  Reply as ReplyIcon,
  Forward as ForwardIcon,
  Inbox as InboxIcon,
  Send as SentIcon,
  Drafts as DraftsIcon,
  Label as LabelIcon,
  DirectionsCar as CarIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DealerLayout from '../components/layout/DealerLayout';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  sender: {
    name: string;
    email: string;
    avatar?: string;
  };
  subject: string;
  preview: string;
  message: string;
  timestamp: string;
  read: boolean;
  starred: boolean;
  labels: string[];
  vehicleId?: string;
  vehicleName?: string;
  attachments?: string[];
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
};

const DealerMessages: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  // Mock messages data
  const mockMessages: Message[] = [
    {
      id: '1',
      sender: {
        name: 'John Smith',
        email: 'john.smith@email.com',
        avatar: 'https://i.pravatar.cc/150?img=12',
      },
      subject: 'Inquiry about 2023 Tesla Model 3',
      preview: 'Hi, I\'m interested in the Tesla Model 3 you have listed. Is it still available?',
      message: 'Hi, I\'m interested in the Tesla Model 3 you have listed. Is it still available? I would like to schedule a test drive if possible. Can you tell me more about the warranty and financing options? Also, does it have the full self-driving package?',
      timestamp: '2 hours ago',
      read: false,
      starred: true,
      labels: ['inquiry', 'urgent'],
      vehicleId: '1',
      vehicleName: '2023 Tesla Model 3',
    },
    {
      id: '2',
      sender: {
        name: 'Sarah Johnson',
        email: 'sarah.j@email.com',
        avatar: 'https://i.pravatar.cc/150?img=5',
      },
      subject: 'Test drive schedule - BMW X5',
      preview: 'Thank you for your response. I would like to confirm the test drive appointment...',
      message: 'Thank you for your response. I would like to confirm the test drive appointment for Saturday at 2 PM. Please let me know if you need any additional information from me. Looking forward to seeing the vehicle.',
      timestamp: '5 hours ago',
      read: false,
      starred: false,
      labels: ['test-drive'],
      vehicleId: '2',
      vehicleName: '2024 BMW X5',
    },
    {
      id: '3',
      sender: {
        name: 'Michael Chen',
        email: 'michael.chen@email.com',
        avatar: 'https://i.pravatar.cc/150?img=8',
      },
      subject: 'Question about Toyota Camry pricing',
      preview: 'Is the price negotiable? Also, does it come with any extended warranty?',
      message: 'Is the price negotiable? Also, does it come with any extended warranty? I saw similar models in the area and wanted to compare. Can you provide the complete service history?',
      timestamp: '1 day ago',
      read: true,
      starred: false,
      labels: ['inquiry'],
      vehicleId: '3',
      vehicleName: '2022 Toyota Camry',
    },
    {
      id: '4',
      sender: {
        name: 'Emily Davis',
        email: 'emily.davis@email.com',
        avatar: 'https://i.pravatar.cc/150?img=9',
      },
      subject: 'Trade-in valuation request',
      preview: 'I have a 2019 Honda Accord that I would like to trade in. Can you provide a quote?',
      message: 'I have a 2019 Honda Accord that I would like to trade in. Can you provide a quote? It has 45,000 miles and is in excellent condition with full service records. I\'m interested in the Mercedes C-Class you have listed.',
      timestamp: '1 day ago',
      read: true,
      starred: true,
      labels: ['trade-in'],
      vehicleId: '4',
      vehicleName: '2021 Mercedes-Benz C-Class',
    },
    {
      id: '5',
      sender: {
        name: 'David Wilson',
        email: 'david.w@email.com',
        avatar: 'https://i.pravatar.cc/150?img=11',
      },
      subject: 'Financing options inquiry',
      preview: 'What financing options do you offer? My credit score is around 720...',
      message: 'What financing options do you offer? My credit score is around 720 and I can put down 20% as a down payment. I\'m interested in a 5-year loan term. Can you provide some rate estimates?',
      timestamp: '2 days ago',
      read: true,
      starred: false,
      labels: ['financing'],
    },
    {
      id: '6',
      sender: {
        name: 'Lisa Anderson',
        email: 'lisa.a@email.com',
        avatar: 'https://i.pravatar.cc/150?img=10',
      },
      subject: 'Vehicle inspection report',
      preview: 'Can you provide a detailed inspection report for the Honda Civic?',
      message: 'Can you provide a detailed inspection report for the Honda Civic? I would also like to know if I can have my mechanic inspect it before purchase. What would be a convenient time for that?',
      timestamp: '3 days ago',
      read: true,
      starred: false,
      labels: ['inquiry'],
      vehicleId: '5',
      vehicleName: '2023 Honda Civic Type R',
    },
  ];

  const [messages, setMessages] = useState(mockMessages);

  const filteredMessages = messages.filter((message) => {
    const matchesSearch =
      message.sender.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.preview.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab =
      (tabValue === 0 && !message.read) || // Unread
      (tabValue === 1) || // All
      (tabValue === 2 && message.starred); // Starred

    return matchesSearch && matchesTab;
  });

  const unreadCount = messages.filter((m) => !m.read).length;
  const starredCount = messages.filter((m) => m.starred).length;

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
    // Mark as read
    setMessages(messages.map((m) => (m.id === message.id ? { ...m, read: true } : m)));
  };

  const handleStarToggle = (messageId: string) => {
    setMessages(
      messages.map((m) => (m.id === messageId ? { ...m, starred: !m.starred } : m))
    );
  };

  const handleReply = () => {
    if (replyText.trim()) {
      toast.success('Reply sent successfully!');
      setReplyText('');
    }
  };

  const handleDelete = (messageId: string) => {
    setMessages(messages.filter((m) => m.id !== messageId));
    if (selectedMessage?.id === messageId) {
      setSelectedMessage(null);
    }
    toast.success('Message deleted');
  };

  const handleArchive = (messageId: string) => {
    setMessages(messages.filter((m) => m.id !== messageId));
    if (selectedMessage?.id === messageId) {
      setSelectedMessage(null);
    }
    toast.success('Message archived');
  };

  const getLabelColor = (label: string) => {
    switch (label) {
      case 'urgent':
        return 'error';
      case 'inquiry':
        return 'primary';
      case 'test-drive':
        return 'success';
      case 'trade-in':
        return 'warning';
      case 'financing':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <DealerLayout>
      <Box sx={{ width: '100%', maxWidth: '100%', m: 0, p: 0 }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Messages
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage customer inquiries and communications
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={() => setComposeOpen(true)}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            }}
          >
            Compose
          </Button>
        </Box>

        {/* Stats */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                    <InboxIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {unreadCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Unread Messages
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'warning.main', width: 48, height: 48 }}>
                    <StarIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      {starredCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Starred
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'success.main', width: 48, height: 48 }}>
                    <ReplyIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight={700}>
                      2.5h
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Response Time
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Main Content */}
        <Grid container spacing={3}>
          {/* Messages List */}
          <Grid item xs={12} md={5}>
            <Card>
              <CardContent>
                {/* Search and Tabs */}
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />

                <Tabs
                  value={tabValue}
                  onChange={(_, newValue) => setTabValue(newValue)}
                  variant="fullWidth"
                  sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
                >
                  <Tab
                    label={
                      <Badge badgeContent={unreadCount} color="error">
                        <Typography variant="body2">Unread</Typography>
                      </Badge>
                    }
                  />
                  <Tab label="All" />
                  <Tab
                    label={
                      <Badge badgeContent={starredCount} color="warning">
                        <Typography variant="body2">Starred</Typography>
                      </Badge>
                    }
                  />
                </Tabs>

                {/* Messages List */}
                <List sx={{ maxHeight: 600, overflow: 'auto' }}>
                  {filteredMessages.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <InboxIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="body1" color="text.secondary">
                        No messages found
                      </Typography>
                    </Box>
                  ) : (
                    filteredMessages.map((message) => (
                      <React.Fragment key={message.id}>
                        <ListItem
                          button
                          selected={selectedMessage?.id === message.id}
                          onClick={() => handleMessageClick(message)}
                          sx={{
                            borderRadius: 1,
                            mb: 0.5,
                            bgcolor: message.read ? 'transparent' : 'action.hover',
                            '&.Mui-selected': {
                              bgcolor: 'primary.light',
                              '&:hover': {
                                bgcolor: 'primary.light',
                              },
                            },
                          }}
                        >
                          <ListItemAvatar>
                            <Badge
                              variant="dot"
                              color="primary"
                              invisible={message.read}
                              overlap="circular"
                            >
                              <Avatar src={message.sender.avatar}>{message.sender.name[0]}</Avatar>
                            </Badge>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Typography
                                  variant="body2"
                                  fontWeight={message.read ? 400 : 600}
                                  noWrap
                                  sx={{ flex: 1 }}
                                >
                                  {message.sender.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {message.timestamp}
                                </Typography>
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography
                                  variant="body2"
                                  fontWeight={message.read ? 400 : 600}
                                  noWrap
                                  sx={{ mb: 0.5 }}
                                >
                                  {message.subject}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" noWrap>
                                  {message.preview}
                                </Typography>
                                {message.labels.length > 0 && (
                                  <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                                    {message.labels.map((label) => (
                                      <Chip
                                        key={label}
                                        label={label}
                                        size="small"
                                        color={getLabelColor(label) as any}
                                        sx={{ height: 20, fontSize: '0.7rem' }}
                                      />
                                    ))}
                                  </Box>
                                )}
                              </Box>
                            }
                          />
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStarToggle(message.id);
                            }}
                          >
                            {message.starred ? (
                              <StarIcon sx={{ color: 'warning.main' }} />
                            ) : (
                              <StarBorderIcon />
                            )}
                          </IconButton>
                        </ListItem>
                        <Divider variant="inset" component="li" />
                      </React.Fragment>
                    ))
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Message Details */}
          <Grid item xs={12} md={7}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                {selectedMessage ? (
                  <Box>
                    {/* Message Header */}
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h5" fontWeight={700} gutterBottom>
                            {selectedMessage.subject}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {selectedMessage.labels.map((label) => (
                              <Chip
                                key={label}
                                label={label}
                                size="small"
                                color={getLabelColor(label) as any}
                              />
                            ))}
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton size="small" onClick={() => handleStarToggle(selectedMessage.id)}>
                            {selectedMessage.starred ? (
                              <StarIcon sx={{ color: 'warning.main' }} />
                            ) : (
                              <StarBorderIcon />
                            )}
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => setMenuAnchorEl(e.currentTarget)}
                          >
                            <MoreIcon />
                          </IconButton>
                        </Box>
                      </Box>

                      {/* Sender Info */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar src={selectedMessage.sender.avatar} sx={{ width: 48, height: 48 }}>
                          {selectedMessage.sender.name[0]}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" fontWeight={600}>
                            {selectedMessage.sender.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {selectedMessage.sender.email}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="caption" color="text.secondary">
                            <ScheduleIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                            {selectedMessage.timestamp}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Vehicle Info */}
                      {selectedMessage.vehicleName && (
                        <Paper
                          sx={{
                            p: 2,
                            bgcolor: 'primary.light',
                            borderLeft: `4px solid ${theme.palette.primary.main}`,
                            mb: 2,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CarIcon color="primary" />
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Regarding:
                              </Typography>
                              <Typography variant="body2" fontWeight={600}>
                                {selectedMessage.vehicleName}
                              </Typography>
                            </Box>
                            <Button
                              size="small"
                              onClick={() => navigate(`/dealer/vehicles/${selectedMessage.vehicleId}`)}
                              sx={{ ml: 'auto' }}
                            >
                              View Vehicle
                            </Button>
                          </Box>
                        </Paper>
                      )}
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    {/* Message Content */}
                    <Box sx={{ mb: 3, minHeight: 200 }}>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                        {selectedMessage.message}
                      </Typography>
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    {/* Reply Section */}
                    <Box>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Reply
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={6}
                        placeholder="Type your reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        sx={{ mb: 2 }}
                      />
                      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
                        <Button startIcon={<AttachIcon />} variant="outlined">
                          Attach
                        </Button>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button variant="outlined">Save Draft</Button>
                          <Button
                            variant="contained"
                            startIcon={<SendIcon />}
                            onClick={handleReply}
                            disabled={!replyText.trim()}
                            sx={{
                              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                            }}
                          >
                            Send Reply
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      py: 8,
                    }}
                  >
                    <InboxIcon sx={{ fontSize: 96, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No message selected
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Select a message from the list to view its contents
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Message Actions Menu */}
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={() => setMenuAnchorEl(null)}
        >
          <MenuItem
            onClick={() => {
              if (selectedMessage) handleArchive(selectedMessage.id);
              setMenuAnchorEl(null);
            }}
          >
            <ArchiveIcon sx={{ mr: 1 }} fontSize="small" />
            Archive
          </MenuItem>
          <MenuItem onClick={() => setMenuAnchorEl(null)}>
            <ForwardIcon sx={{ mr: 1 }} fontSize="small" />
            Forward
          </MenuItem>
          <MenuItem onClick={() => setMenuAnchorEl(null)}>
            <LabelIcon sx={{ mr: 1 }} fontSize="small" />
            Add Label
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              if (selectedMessage) handleDelete(selectedMessage.id);
              setMenuAnchorEl(null);
            }}
            sx={{ color: 'error.main' }}
          >
            <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
            Delete
          </MenuItem>
        </Menu>

        {/* Compose Dialog */}
        <Dialog open={composeOpen} onClose={() => setComposeOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>New Message</DialogTitle>
          <DialogContent>
            <TextField fullWidth label="To" sx={{ mb: 2, mt: 1 }} />
            <TextField fullWidth label="Subject" sx={{ mb: 2 }} />
            <TextField fullWidth multiline rows={10} placeholder="Type your message..." />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setComposeOpen(false)}>Cancel</Button>
            <Button startIcon={<AttachIcon />} variant="outlined">
              Attach
            </Button>
            <Button
              variant="contained"
              startIcon={<SendIcon />}
              onClick={() => {
                toast.success('Message sent!');
                setComposeOpen(false);
              }}
            >
              Send
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DealerLayout>
  );
};

export default DealerMessages;

