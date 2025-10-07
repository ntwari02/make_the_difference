import React from 'react';
import { Box, Card, CardContent, Typography, List, ListItem, ListItemText, Chip } from '@mui/material';
import InstructorLayout from '../components/layout/InstructorLayout';

const InstructorMessages: React.FC = () => {
  const conversations = [
    { from: 'Alice Johnson', subject: 'Question about assignment', unread: true },
    { from: 'Bob Smith', subject: 'Course enrollment issue', unread: false },
  ];

  return (
    <InstructorLayout>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={700}>Messages</Typography>
      </Box>
      <Card>
        <CardContent>
          <List>
            {conversations.map((c) => (
              <ListItem key={c.from} divider>
                <ListItemText primary={c.from} secondary={c.subject} />
                {c.unread && <Chip label="Unread" color="primary" size="small" />}
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </InstructorLayout>
  );
};

export default InstructorMessages;


