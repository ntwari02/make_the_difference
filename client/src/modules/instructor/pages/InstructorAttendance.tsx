import React from 'react';
import { Box, Card, CardContent, Typography, Table, TableHead, TableRow, TableCell, TableBody, Chip, TextField, Button, Grid, InputAdornment, Select, MenuItem, FormControl, InputLabel, IconButton, Tooltip, Divider, Checkbox, TableContainer, TablePagination, LinearProgress } from '@mui/material';
import { Search, Download, Refresh, MoreVert } from '@mui/icons-material';
import InstructorLayout from '../components/layout/InstructorLayout';
import { instructorApi } from '../services/instructorApi';

const InstructorAttendance: React.FC = () => {
  const [classId, setClassId] = React.useState('');
  const [rows, setRows] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'Present' | 'Absent' | 'Late'>('all');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  const loadAttendance = async () => {
    if (!classId) return;
    setLoading(true);
    try {
      const data = await instructorApi.getAttendance(classId);
      setRows(data || []);
      setPage(0);
      setSelectedIds([]);
    } finally {
      setLoading(false);
    }
  };

  const normalizedRows = React.useMemo(() => {
    return (rows || []).map((r: any, idx: number) => ({
      id: String(r.id || r.user_id || r.learner_id || r.email || r.name || idx),
      name: r.name || r.learner_name || r.user_name || r.email || 'Unknown',
      session: r.session || r.class_date || r.occurred_at || '-',
      status: r.status || r.attendance_status || 'Present',
    }));
  }, [rows]);

  const stats = React.useMemo(() => {
    const total = normalizedRows.length;
    const present = normalizedRows.filter(r => r.status === 'Present').length;
    const absent = normalizedRows.filter(r => r.status === 'Absent').length;
    const late = normalizedRows.filter(r => r.status === 'Late').length;
    const rate = total ? Math.round((present / total) * 100) : 0;
    return { total, present, absent, late, rate };
  }, [normalizedRows]);

  const filtered = React.useMemo(() => {
    const term = search.toLowerCase().trim();
    return normalizedRows.filter(r => {
      const matchTerm = !term || `${r.name} ${r.session}`.toLowerCase().includes(term);
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchTerm && matchStatus;
    });
  }, [normalizedRows, search, statusFilter]);

  const paged = React.useMemo(() => {
    const start = page * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  const allPageSelected = paged.length > 0 && paged.every(r => selectedIds.includes(r.id));
  const somePageSelected = paged.some(r => selectedIds.includes(r.id)) && !allPageSelected;

  const toggleSelectAllPage = (checked: boolean) => {
    if (checked) {
      setSelectedIds(Array.from(new Set([...selectedIds, ...paged.map(r => r.id)])));
    } else {
      const pageSet = new Set(paged.map(r => r.id));
      setSelectedIds(selectedIds.filter(id => !pageSet.has(id)));
    }
  };

  const exportCsv = () => {
    const cols = ['Name', 'Session', 'Status'];
    const rowsCsv = filtered.map(r => [r.name, r.session, r.status].map(v => JSON.stringify(String(v))).join(','));
    const csv = [cols.join(','), ...rowsCsv].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `attendance_${classId || 'class'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <InstructorLayout>
      <Box mb={3}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box>
            <Typography variant="h5" fontWeight={700}>Attendance</Typography>
            <Typography variant="body2" color="text.secondary">Track and manage attendance for your classes</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title="Refresh">
              <span>
                <IconButton onClick={loadAttendance} disabled={!classId || loading}>
                  <Refresh />
                </IconButton>
              </span>
            </Tooltip>
            <Button variant="outlined" startIcon={<Download />} onClick={exportCsv} disabled={filtered.length === 0}>Export CSV</Button>
          </Box>
        </Box>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <TextField fullWidth size="small" label="Class ID" value={classId} onChange={(e) => setClassId(e.target.value)} />
              </Grid>
              <Grid item xs={12} md={5}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search name or session..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select label="Status" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as any); setPage(0); }}>
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="Present">Present</MenuItem>
                    <MenuItem value="Absent">Absent</MenuItem>
                    <MenuItem value="Late">Late</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} md={2}>
                <Button fullWidth variant="contained" onClick={loadAttendance} disabled={!classId || loading}>Load</Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Stats */}
        <Grid container spacing={2} mb={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600}>{stats.total}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Records</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'success.main', color: 'success.contrastText' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600}>{stats.present}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>Present</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'error.main', color: 'error.contrastText' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600}>{stats.absent}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>Absent</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600}>{stats.rate}%</Typography>
                <Typography variant="body2" color="text.secondary">Attendance Rate</Typography>
                <LinearProgress variant="determinate" value={stats.rate} sx={{ mt: 1, height: 8, borderRadius: 4 }} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Card>
        <CardContent sx={{ p: 0 }}>
          {loading && <LinearProgress />}
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={allPageSelected}
                      indeterminate={somePageSelected}
                      onChange={(e, checked) => toggleSelectAllPage(checked)}
                    />
                  </TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Session</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paged.map((r) => (
                  <TableRow key={r.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedIds.includes(r.id)}
                        onChange={(e, checked) => setSelectedIds(prev => checked ? [...prev, r.id] : prev.filter(x => x !== r.id))}
                      />
                    </TableCell>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>{r.session}</TableCell>
                    <TableCell>
                      <Chip label={r.status} color={r.status === 'Present' ? 'success' : r.status === 'Absent' ? 'error' : 'warning'} size="small" />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small">
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {!loading && paged.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="text.secondary">No records</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filtered.length}
            page={page}
            onPageChange={(e, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </CardContent>
      </Card>
    </InstructorLayout>
  );
};

export default InstructorAttendance;


