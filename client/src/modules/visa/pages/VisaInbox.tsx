import React from 'react';
import { Box, Card, CardContent, Typography, List, ListItem, ListItemText, Avatar, ListItemAvatar } from '@mui/material';
import VisaLayout from '../components/layout/VisaLayout';
import { visaApi } from '../services/visaApi';

const VisaInbox: React.FC = () => {
  const [msgs, setMsgs] = React.useState<any[]>([]);
  React.useEffect(() => { visaApi.listInbox().then(setMsgs); }, []);

  return (
    <VisaLayout>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={700}>Inbox</Typography>
      </Box>
      <Card>
        <CardContent>
          <List>
            {msgs.map((m) => (
              <ListItem key={m.id} divider>
                <ListItemAvatar>
                  <Avatar>{(m.from || 'U').toString().charAt(0)}</Avatar>
                </ListItemAvatar>
                <ListItemText primary={m.subject} secondary={`${m.from} • ${m.received_at}`} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </VisaLayout>
  );
};

export default VisaInbox;



