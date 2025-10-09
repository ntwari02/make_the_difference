import React from 'react';
import { Box, Card, CardContent, Typography, GridLegacy as Grid, TextField, InputAdornment, Select, MenuItem, FormControl, InputLabel, Button, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, TablePagination, LinearProgress } from '@mui/material';
import { Search, Refresh } from '@mui/icons-material';
import AdminLayout from '../components/layout/AdminLayout';
import { adminApi } from '../services/adminApi';

const AdminAudit: React.FC = () => {
  const [search, setSearch] = React.useState('');
  const [action, setAction] = React.useState<string>('');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [rows, setRows] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAuditLogs({ action_type: action || undefined, page: page + 1, limit: rowsPerPage });
      const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setRows(search ? data.filter((r: any) => JSON.stringify(r).toLowerCase().includes(search.toLowerCase())) : data);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { load(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage]);

  const submitFilters = () => { setPage(0); load(); };

  return (
    <AdminLayout>
      <Box mb={2} display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h5" fontWeight={700}>Audit Logs</Typography>
          <Typography variant="body2" color="text.secondary">Recent admin actions</Typography>
        </Box>
        <Button startIcon={<Refresh />} onClick={load} disabled={loading}>Refresh</Button>
      </Box>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField fullWidth size="small" placeholder="Search logs..." value={search} onChange={(e) => setSearch(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><Search /></InputAdornment>) }} />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Action</InputLabel>
                <Select label="Action" value={action} onChange={(e) => setAction(e.target.value)}>
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="create_user">Create User</MenuItem>
                  <MenuItem value="update_user">Update User</MenuItem>
                  <MenuItem value="update_user_status">Update User Status</MenuItem>
                  <MenuItem value="moderate_content">Moderate Content</MenuItem>
                  <MenuItem value="remove_content">Remove Content</MenuItem>
                  <MenuItem value="toggle_maintenance_mode">Toggle Maintenance</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button fullWidth variant="contained" onClick={submitFilters} disabled={loading}>Apply</Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 0 }}>
          {loading && <LinearProgress />}
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Admin</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Details</TableCell>
                  <TableCell>At</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id} hover>
                    <TableCell>{`${r.first_name || ''} ${r.last_name || ''}`.trim() || r.email}</TableCell>
                    <TableCell>{r.action}</TableCell>
                    <TableCell>{typeof r.details === 'string' ? r.details : JSON.stringify(r.details)}</TableCell>
                    <TableCell>{r.created_at}</TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && !loading && (
                  <TableRow><TableCell colSpan={4} align="center"><Typography variant="body2" color="text.secondary">No logs</Typography></TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination component="div" count={1000} page={page} onPageChange={(e, p) => setPage(p)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[10, 25, 50]} />
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminAudit;



