import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  Button,
  Collapse,
} from '@mui/material';
import {
  Notifications,
  NotificationsActive,
  Schedule,
  Warning,
  Info,
  CheckCircle,
  Close,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';

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

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.isRead).length);
  }, [notifications]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment': return <Schedule />;
      case 'reminder': return <NotificationsActive />;
      case 'warning': return <Warning />;
      case 'info': return <Info />;
      default: return <Notifications />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'appointment': return 'primary';
      case 'reminder': return 'warning';
      case 'warning': return 'error';
      case 'info': return 'info';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const formatNotificationTime = (timestamp: string) => {
    const date = parseISO(timestamp);
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isTomorrow(date)) {
      return 'Tomorrow';
    } else {
      return format(date, 'MMM d');
    }
  };

  const unreadNotifications = notifications.filter(n => !n.isRead);
  const recentNotifications = notifications.slice(0, 5);

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Notification Bell */}
      <IconButton
        onClick={() => setIsExpanded(!isExpanded)}
        sx={{ position: 'relative' }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <Notifications />
        </Badge>
      </IconButton>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              zIndex: 1000,
              minWidth: 350,
              maxWidth: 400,
            }}
          >
            <Card sx={{ boxShadow: 3, maxHeight: 500, overflow: 'hidden' }}>
              <CardContent sx={{ p: 0 }}>
                {/* Header */}
                <Box
                  sx={{
                    p: 2,
                    borderBottom: 1,
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography variant="h6" fontWeight={600}>
                    Notifications
                  </Typography>
                  <Box display="flex" gap={1}>
                    {unreadCount > 0 && (
                      <Button
                        size="small"
                        onClick={onMarkAllAsRead}
                        sx={{ textTransform: 'none' }}
                      >
                        Mark all read
                      </Button>
                    )}
                    <IconButton size="small" onClick={() => setIsExpanded(false)}>
                      <Close />
                    </IconButton>
                  </Box>
                </Box>

                {/* Notifications List */}
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {recentNotifications.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <Notifications sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        No notifications
                      </Typography>
                    </Box>
                  ) : (
                    <List sx={{ p: 0 }}>
                      {recentNotifications.map((notification, index) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <ListItem
                            sx={{
                              bgcolor: notification.isRead ? 'transparent' : 'primary.50',
                              borderLeft: notification.isRead ? 'none' : 3,
                              borderLeftColor: 'primary.main',
                              '&:hover': {
                                bgcolor: 'action.hover',
                              },
                            }}
                            onClick={() => !notification.isRead && onMarkAsRead(notification.id)}
                          >
                            <ListItemIcon>
                              <Box
                                sx={{
                                  color: getNotificationColor(notification.type),
                                  opacity: notification.isRead ? 0.6 : 1,
                                }}
                              >
                                {getNotificationIcon(notification.type)}
                              </Box>
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Typography
                                    variant="body2"
                                    fontWeight={notification.isRead ? 400 : 600}
                                  >
                                    {notification.title}
                                  </Typography>
                                  <Chip
                                    label={notification.priority}
                                    size="small"
                                    color={getPriorityColor(notification.priority) as any}
                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                  />
                                </Box>
                              }
                              secondary={
                                <Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ opacity: notification.isRead ? 0.6 : 1 }}
                                  >
                                    {notification.message}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ display: 'block', mt: 0.5 }}
                                  >
                                    {formatNotificationTime(notification.timestamp)}
                                  </Typography>
                                </Box>
                              }
                            />
                            <Box display="flex" alignItems="center" gap={1}>
                              {!notification.isRead && (
                                <Box
                                  sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    bgcolor: 'primary.main',
                                  }}
                                />
                              )}
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteNotification(notification.id);
                                }}
                              >
                                <Close fontSize="small" />
                              </IconButton>
                            </Box>
                          </ListItem>
                          {index < recentNotifications.length - 1 && <Divider />}
                        </motion.div>
                      ))}
                    </List>
                  )}
                </Box>

                {/* Footer */}
                {notifications.length > 5 && (
                  <Box
                    sx={{
                      p: 2,
                      borderTop: 1,
                      borderColor: 'divider',
                      textAlign: 'center',
                    }}
                  >
                    <Button size="small" sx={{ textTransform: 'none' }}>
                      View all notifications
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default NotificationCenter;
