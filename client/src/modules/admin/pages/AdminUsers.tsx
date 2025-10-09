import React from 'react';
import { Box, Card, CardContent, Typography, GridLegacy as Grid, TextField, InputAdornment, Select, MenuItem, FormControl, InputLabel, Button, Table, TableHead, TableRow, TableCell, TableBody, Chip, IconButton, TableContainer, TablePagination, LinearProgress } from '@mui/material';
import { Search, Refresh } from '@mui/icons-material';
import AdminLayout from '../components/layout/AdminLayout';
import { adminApi } from '../services/adminApi';

const AdminUsers: React.FC = () => {
  const [search, setSearch] = React.useState('');
  const [role, setRole] = React.useState<string>('');
  const [status, setStatus] = React.useState<'active' | 'inactive' | 'all'>('active');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [rows, setRows] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.listUsers({ search, role: role || undefined, status: status === 'all' ? undefined : status, page: page + 1, limit: rowsPerPage, sort_by: 'created_at', sort_order: 'DESC' });
      const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setRows(data);
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
          <Typography variant="h5" fontWeight={700}>Users</Typography>
          <Typography variant="body2" color="text.secondary">Manage all platform users</Typography>
        </Box>
        <IconButton onClick={load} disabled={loading}><Refresh /></IconButton>
      </Box>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField fullWidth size="small" placeholder="Search name or email" value={search} onChange={(e) => setSearch(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><Search /></InputAdornment>) }} />
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Role</InputLabel>
                <Select label="Role" value={role} onChange={(e) => setRole(e.target.value)}>
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="instructor">Instructor</MenuItem>
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="buyer">Buyer</MenuItem>
                  <MenuItem value="seller">Seller</MenuItem>
                  <MenuItem value="dealer">Dealer</MenuItem>
                  <MenuItem value="university">University</MenuItem>
                  <MenuItem value="visa_officer">Visa Officer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value as any)}>
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
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
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Meta</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((u) => (
                  <TableRow key={u.id} hover>
                    <TableCell>{`${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell><Chip label={u.role} size="small" /></TableCell>
                    <TableCell><Chip label={u.is_active ? 'Active' : 'Inactive'} color={u.is_active ? 'success' : 'default'} size="small" /></TableCell>
                    <TableCell align="right">
                      <Typography variant="caption" color="text.secondary">Cars: {u.total_cars ?? 0} • Courses: {u.total_enrollments ?? 0} • Classes: {u.total_classes ?? 0}</Typography>
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && !loading && (
                  <TableRow><TableCell colSpan={5} align="center"><Typography variant="body2" color="text.secondary">No users</Typography></TableCell></TableRow>
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

export default AdminUsers;



