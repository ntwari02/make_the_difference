import React from 'react';
import { Box, Card, CardContent, Typography, Table, TableHead, TableRow, TableCell, TableBody, Chip, LinearProgress, Button, Stepper, Step, StepLabel } from '@mui/material';
import VisaLayout from '../components/layout/VisaLayout';
import { visaApi } from '../services/visaApi';

const statusProgress: Record<string, number> = {
  draft: 10,
  submitted: 25,
  in_review: 50,
  additional_docs: 65,
  approved: 100,
  rejected: 100,
};

const statusColor: Record<string, 'default' | 'primary' | 'warning' | 'success' | 'error' | 'info'> = {
  draft: 'default',
  submitted: 'primary',
  in_review: 'info',
  additional_docs: 'warning',
  approved: 'success',
  rejected: 'error',
};

const VisaMyApplications: React.FC = () => {
  const [rows, setRows] = React.useState<any[]>([]);

  const load = async () => {
    const data = await visaApi.listApplicationsMy();
    const normalized = Array.isArray(data) ? data : (Array.isArray((data as any)?.data) ? (data as any).data : []);
    setRows(normalized);
  };

  React.useEffect(() => { load(); }, []);

  return (
    <VisaLayout>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={700}>My Applications</Typography>
        <Typography variant="body2" color="text.secondary">Track your visa application status</Typography>
      </Box>
      <Card>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Service</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Progress</TableCell>
                <TableCell>Submitted</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r: any) => {
                const statusKey = (r.status || '').toLowerCase();
                const progress = statusProgress[statusKey] ?? 0;
                const color = statusColor[statusKey] ?? 'default';
                return (
                  <TableRow key={r.id}>
                    <TableCell>{r.service_title || r.service || 'Visa Service'}</TableCell>
                    <TableCell><Chip label={r.status || 'unknown'} color={color} size="small" /></TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box flex={1}><LinearProgress variant="determinate" value={progress} /></Box>
                        <Typography variant="caption" color="text.secondary">{progress}%</Typography>
                      </Box>
                      <Box mt={1}>
                        <Stepper activeStep={['draft','submitted','in_review','additional_docs','approved','rejected'].indexOf(statusKey)} alternativeLabel>
                          {['Submitted','In Review','Docs','Decision'].map((label) => (
                            <Step key={label}>
                              <StepLabel>{label}</StepLabel>
                            </Step>
                          ))}
                        </Stepper>
                      </Box>
                    </TableCell>
                    <TableCell>{r.submitted_at || r.created_at || '-'}</TableCell>
                    <TableCell align="right">
                      <Button size="small" variant="outlined" onClick={() => window.location.assign(`/visa/applications/${r.id}`)}>View</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </VisaLayout>
  );
};

export default VisaMyApplications;


