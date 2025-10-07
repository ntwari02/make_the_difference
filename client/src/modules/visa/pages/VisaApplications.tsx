import React from 'react';
import { Box, Card, CardContent, Typography, Table, TableHead, TableRow, TableCell, TableBody, Chip } from '@mui/material';
import VisaLayout from '../components/layout/VisaLayout';
import { visaApi } from '../services/visaApi';

const VisaApplications: React.FC = () => {
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
        <Typography variant="h5" fontWeight={700}>Applications</Typography>
      </Box>
      <Card>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Applicant</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Submitted</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r: any) => (
                <TableRow key={r.id}>
                  <TableCell>{r.applicant || r.applicant_name || r.email}</TableCell>
                  <TableCell>
                    <Chip label={r.status} color={r.status === 'approved' ? 'success' : r.status === 'rejected' ? 'error' : 'warning'} size="small" />
                  </TableCell>
                  <TableCell>{r.submitted_at || r.created_at}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </VisaLayout>
  );
};

export default VisaApplications;


