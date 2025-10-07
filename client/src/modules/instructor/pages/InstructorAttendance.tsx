import React from 'react';
import { Box, Card, CardContent, Typography, Table, TableHead, TableRow, TableCell, TableBody, Chip, TextField, Button } from '@mui/material';
import InstructorLayout from '../components/layout/InstructorLayout';
import { instructorApi } from '../services/instructorApi';

const InstructorAttendance: React.FC = () => {
  const [classId, setClassId] = React.useState('');
  const [rows, setRows] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  const loadAttendance = async () => {
    if (!classId) return;
    setLoading(true);
    try {
      const data = await instructorApi.getAttendance(classId);
      setRows(data || []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <InstructorLayout>
      <Box mb={3} display="flex" alignItems="center" gap={2}>
        <Typography variant="h5" fontWeight={700} sx={{ flexGrow: 1 }}>Attendance</Typography>
        <TextField size="small" label="Class ID" value={classId} onChange={(e) => setClassId(e.target.value)} />
        <Button variant="contained" onClick={loadAttendance} disabled={!classId || loading}>Load</Button>
      </Box>
      <Card>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Session</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.name}>
                  <TableCell>{r.name || r.learner_name || r.user_name}</TableCell>
                  <TableCell>{r.session || r.class_date || r.occurred_at}</TableCell>
                  <TableCell>
                    <Chip label={r.status || r.attendance_status} color={(r.status || r.attendance_status) === 'Present' ? 'success' : (r.status || r.attendance_status) === 'Absent' ? 'error' : 'warning'} size="small" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </InstructorLayout>
  );
};

export default InstructorAttendance;


