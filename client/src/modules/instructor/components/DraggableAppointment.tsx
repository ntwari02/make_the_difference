import React from 'react';
import { motion } from 'framer-motion';
import { Paper, Typography, Box, Chip, IconButton } from '@mui/material';
import { DragIndicator, VideoCall, Phone, LocationOn } from '@mui/icons-material';

interface DraggableAppointmentProps {
  appointment: {
    id: string;
    student: {
      name: string;
      avatar?: string;
    };
    timeSlot: {
      startTime: string;
      endTime: string;
    };
    status: 'confirmed' | 'pending' | 'cancelled';
    meetingType: 'video' | 'phone' | 'in-person';
    notes: string;
  };
  onDragStart?: (appointment: any) => void;
  onDragEnd?: (appointment: any) => void;
  onClick?: () => void;
}

const DraggableAppointment: React.FC<DraggableAppointmentProps> = ({
  appointment,
  onDragStart,
  onDragEnd,
  onClick
}) => {
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
      default: return <VideoCall fontSize="small" />;
    }
  };

  return (
    <motion.div
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.1}
      onDragStart={() => onDragStart?.(appointment)}
      onDragEnd={() => onDragEnd?.(appointment)}
      whileDrag={{ scale: 1.05, zIndex: 1000 }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Paper
        sx={{
          p: 2,
          mb: 1,
          cursor: 'grab',
          border: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          '&:hover': {
            bgcolor: 'action.hover',
            transform: 'translateY(-2px)',
            boxShadow: 2
          },
          '&:active': {
            cursor: 'grabbing'
          }
        }}
        onClick={onClick}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <DragIndicator sx={{ color: 'text.secondary', cursor: 'grab' }} />
            <Box>
              <Typography variant="body2" fontWeight={600}>
                {appointment.student.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {appointment.timeSlot.startTime} - {appointment.timeSlot.endTime}
              </Typography>
            </Box>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            {getMeetingTypeIcon(appointment.meetingType)}
            <Chip
              label={appointment.status}
              size="small"
              color={getStatusColor(appointment.status) as any}
            />
          </Box>
        </Box>
      </Paper>
    </motion.div>
  );
};

export default DraggableAppointment;
