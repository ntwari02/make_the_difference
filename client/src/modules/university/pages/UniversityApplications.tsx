import React from 'react';
import { Box, Card, CardContent, Typography, Table, TableHead, TableRow, TableCell, TableBody, Chip, TextField, Button } from '@mui/material';
import UniversityLayout from '../components/layout/UniversityLayout';
import { universityApi } from '../services/universityApi';

const UniversityApplications: React.FC = () => {
  const [scholarshipId, setScholarshipId] = React.useState('');
  const [rows, setRows] = React.useState<any[]>([]);

  const load = async () => {
    if (!scholarshipId) return;
    const data = await universityApi.listApplications(scholarshipId);
    const normalized = Array.isArray(data) ? data : (Array.isArray((data as any)?.data) ? (data as any).data : []);
    setRows(normalized);
  };

  const updateStatus = async (id: string, status: string) => {
    await universityApi.updateApplicationStatus(id, status);
    await load();
  };

  return (
    <UniversityLayout>
      <Box mb={3} display="flex" alignItems="center" gap={2}>
        <Typography variant="h5" fontWeight={700} sx={{ flexGrow: 1 }}>Applications</Typography>
        <TextField size="small" label="Scholarship ID" value={scholarshipId} onChange={(e) => setScholarshipId(e.target.value)} />
        <Button variant="contained" onClick={load} disabled={!scholarshipId}>Load</Button>
      </Box>
      <Card>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Applicant</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r: any) => (
                <TableRow key={r.id}>
                  <TableCell>{r.applicant_name || r.email}</TableCell>
                  <TableCell>{r.created_at || r.submitted_at}</TableCell>
                  <TableCell>
                    <Chip label={r.status} color={r.status === 'approved' ? 'success' : r.status === 'rejected' ? 'error' : 'warning'} size="small" />
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => updateStatus(r.id, 'approved')}>Approve</Button>
                    <Button size="small" color="error" onClick={() => updateStatus(r.id, 'rejected')}>Reject</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </UniversityLayout>
  );
};

export default UniversityApplications;



