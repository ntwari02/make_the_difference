import React from 'react';
import { Box, Card, CardContent, Typography, List, ListItem, ListItemText } from '@mui/material';
import InstructorLayout from '../components/layout/InstructorLayout';

const InstructorStudents: React.FC = () => {
  const students = [
    { name: 'Alice Johnson', course: 'React Fundamentals' },
    { name: 'Bob Smith', course: 'Node.js API Design' },
    { name: 'Carol Davis', course: 'TypeScript Essentials' },
  ];

  return (
    <InstructorLayout>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={700}>Students</Typography>
      </Box>
      <Card>
        <CardContent>
          <List>
            {students.map((s) => (
              <ListItem key={s.name} divider>
                <ListItemText primary={s.name} secondary={s.course} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </InstructorLayout>
  );
};

export default InstructorStudents;


