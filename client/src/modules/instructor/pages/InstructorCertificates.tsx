import React from 'react';
import { Box, Card, CardContent, Typography, Button, List, ListItem, ListItemText, TextField } from '@mui/material';
import InstructorLayout from '../components/layout/InstructorLayout';
import { instructorApi } from '../services/instructorApi';

const InstructorCertificates: React.FC = () => {
  const [certs, setCerts] = React.useState<any[]>([]);
  const [enrollmentId, setEnrollmentId] = React.useState('');

  const load = async () => {
    const data = await instructorApi.listMyCertificates();
    const normalized = Array.isArray(data) ? data : (Array.isArray((data as any)?.data) ? (data as any).data : []);
    setCerts(normalized);
  };

  React.useEffect(() => { load(); }, []);

  const handleGenerate = async () => {
    if (!enrollmentId) return;
    await instructorApi.generateCertificate(enrollmentId, {});
    setEnrollmentId('');
    await load();
  };

  return (
    <InstructorLayout>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h5" fontWeight={700}>Certificates</Typography>
        <Box display="flex" gap={1}>
          <TextField size="small" label="Enrollment ID" value={enrollmentId} onChange={(e) => setEnrollmentId(e.target.value)} />
          <Button variant="contained" onClick={handleGenerate} disabled={!enrollmentId}>Generate</Button>
        </Box>
      </Box>
      <Card>
        <CardContent>
          <List>
            {(Array.isArray(certs) ? certs : []).map((c: any, idx: number) => (
              <ListItem key={c.id || idx} divider>
                <ListItemText primary={`${c.learner_name || c.user_name || c.email} • ${c.course_title || c.course}`} secondary={`Issued: ${c.issued_at || c.date}`} />
                <Button size="small" variant="outlined" onClick={() => window.open(`/api/certificates/${c.id}/download`, '_blank')}>Download</Button>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </InstructorLayout>
  );
};

export default InstructorCertificates;


