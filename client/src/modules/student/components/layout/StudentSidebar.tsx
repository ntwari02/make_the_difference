import React from 'react';
import { Drawer, List, ListItemButton, ListItemText, useTheme, ListItemIcon, Divider } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import FavoriteIcon from '@mui/icons-material/Favorite';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import MessageIcon from '@mui/icons-material/Message';
import SettingsIcon from '@mui/icons-material/Settings';

interface Props { open: boolean; onClose: () => void; drawerWidth: number; collapsedWidth: number }

const StudentSidebar: React.FC<Props> = ({ open, onClose, drawerWidth }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const items = [
    { label: 'Dashboard', path: '/student/dashboard', icon: <DashboardIcon /> },
    { label: 'My Courses', path: '/student/courses', icon: <LibraryBooksIcon /> },
    { label: 'Favorites', path: '/student/favorites', icon: <FavoriteIcon /> },
    { divider: true },
    { label: 'Live Classes', path: '/student/live-classes', icon: <LeaderboardIcon /> },
    { label: 'Payments', path: '/student/payments', icon: <LeaderboardIcon /> },
    { label: 'Certificates', path: '/student/certificates', icon: <EmojiEventsIcon /> },
    { label: 'Subscriptions', path: '/student/subscriptions', icon: <LeaderboardIcon /> },
    { label: 'Progress', path: '/student/progress', icon: <LeaderboardIcon /> },
    { label: 'Messages', path: '/student/messages', icon: <MessageIcon /> },
    { divider: true },
    { label: 'Settings', path: '/student/settings', icon: <SettingsIcon /> },
  ] as const;

  return (
    <Drawer
      variant="permanent"
      open
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          top: '64px',
          borderRight: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      <List>
        {items.map((it, idx) => it && (it as any).divider ? (
          <Divider key={`d-${idx}`} sx={{ my: 1 }} />
        ) : (
          <ListItemButton key={(it as any).path} selected={location.pathname === (it as any).path} onClick={() => navigate((it as any).path)}>
            { (it as any).icon ? <ListItemIcon>{(it as any).icon}</ListItemIcon> : null }
            <ListItemText primary={(it as any).label} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
};

export default StudentSidebar;


