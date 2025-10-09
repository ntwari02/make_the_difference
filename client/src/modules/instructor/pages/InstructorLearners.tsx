import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  Grid,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Button,
  Tooltip,
  Divider,
  Checkbox,
  Avatar,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination
} from '@mui/material';
import { Search, FilterList, Sort, Download, Refresh, MoreVert, Info as InfoIcon } from '@mui/icons-material';
import InstructorLayout from '../components/layout/InstructorLayout';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../core/store';
import { fetchLearners } from '../store/instructorSlice';

const InstructorLearners: React.FC = () => {
  const dispatch = useDispatch();
  const { learners, isLoading } = useSelector((s: RootState) => s.instructor);

  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'Active' | 'Behind' | 'Completed'>('all');
  const [sortBy, setSortBy] = React.useState<'name' | 'progress' | 'status'>('name');
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [page, setPage] = React.useState(1);
  const rowsPerPage = 8;
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [selectedLearner, setSelectedLearner] = React.useState<any | null>(null);

  React.useEffect(() => {
    dispatch(fetchLearners() as any);
  }, [dispatch]);

  const safeLearners = React.useMemo(() => (learners || []) as any[], [learners]);

  const filtered = React.useMemo(() => {
    const term = search.toLowerCase().trim();
    return safeLearners
      .filter((l) => {
        const matchesTerm = !term || `${l.name || l.full_name || ''} ${l.email || ''}`.toLowerCase().includes(term);
        const status = (l.status || 'Active') as 'Active' | 'Behind' | 'Completed';
        const matchesStatus = statusFilter === 'all' || status === statusFilter;
        return matchesTerm && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          const an = (a.name || a.full_name || a.email || '').toLowerCase();
          const bn = (b.name || b.full_name || b.email || '').toLowerCase();
          return an.localeCompare(bn);
        }
        if (sortBy === 'progress') {
          return (b.progress ?? 0) - (a.progress ?? 0);
        }
        // status
        const order = { Completed: 0, Active: 1, Behind: 2 } as Record<string, number>;
        return (order[a.status || 'Active'] ?? 99) - (order[b.status || 'Active'] ?? 99);
      });
  }, [safeLearners, search, statusFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paged = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page]);

  const stats = React.useMemo(() => {
    const total = safeLearners.length;
    const active = safeLearners.filter((l) => (l.status || 'Active') === 'Active').length;
    const behind = safeLearners.filter((l) => (l.status || 'Active') === 'Behind').length;
    const completed = safeLearners.filter((l) => (l.status || 'Active') === 'Completed').length;
    const avgProgress = Math.round(
      safeLearners.reduce((acc, l) => acc + (l.progress ?? 0), 0) / (total || 1)
    );
    return { total, active, behind, completed, avgProgress };
  }, [safeLearners]);

  const toggleSelectAllPaged = (checked: boolean) => {
    if (checked) {
      setSelectedIds(Array.from(new Set([...selectedIds, ...paged.map((l) => String(l.id || l.email || l.name))])));
    } else {
      const pagedIds = new Set(paged.map((l) => String(l.id || l.email || l.name)));
      setSelectedIds(selectedIds.filter((id) => !pagedIds.has(id)));
    }
  };

  const toggleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));
  };

  const handleExportCsv = () => {
    const cols = ['Name', 'Email', 'Status', 'Progress'];
    const rows = filtered.map((l) => [
      JSON.stringify(l.name || l.full_name || ''),
      JSON.stringify(l.email || ''),
      JSON.stringify(l.status || 'Active'),
      JSON.stringify(String(l.progress ?? '0'))
    ].join(','));
    const csv = [cols.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'learners.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const openDetails = (learner: any) => {
    setSelectedLearner(learner);
    setDetailsOpen(true);
  };

  return (
    <InstructorLayout>
      <Box mb={3}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box>
            <Typography variant="h5" fontWeight={700}>Learners</Typography>
            <Typography variant="body2" color="text.secondary">Manage your learners, progress, and communications</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title="Refresh">
              <IconButton onClick={() => dispatch(fetchLearners() as any)}>
                <Refresh />
              </IconButton>
            </Tooltip>
            <Button variant="outlined" startIcon={<Download />} onClick={handleExportCsv}>Export CSV</Button>
          </Box>
        </Box>

        {/* Controls */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select label="Status" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as any); setPage(1); }}>
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Behind">Behind</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Sort By</InputLabel>
                  <Select label="Sort By" value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
                    <MenuItem value="name">Name</MenuItem>
                    <MenuItem value="progress">Progress</MenuItem>
                    <MenuItem value="status">Status</MenuItem>
                  </Select>
                </FormControl>
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
                <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Learners</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'success.main', color: 'success.contrastText' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600}>{stats.completed}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>Completed</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'warning.main', color: 'warning.contrastText' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600}>{stats.behind}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>Behind</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600}>{stats.avgProgress}%</Typography>
                <Typography variant="body2" color="text.secondary">Avg Progress</Typography>
                <LinearProgress variant="determinate" value={stats.avgProgress} sx={{ mt: 1, height: 8, borderRadius: 4 }} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Card>
        <CardContent>
          {isLoading ? (
            <Box display="grid" placeItems="center" py={4}><CircularProgress /></Box>
          ) : (
            <>
              {/* Bulk actions */}
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Checkbox
                      checked={paged.every((l) => selectedIds.includes(String(l.id || l.email || l.name))) && paged.length > 0}
                      indeterminate={paged.some((l) => selectedIds.includes(String(l.id || l.email || l.name))) && !paged.every((l) => selectedIds.includes(String(l.id || l.email || l.name)))}
                      onChange={(e, checked) => toggleSelectAllPaged(checked)}
                    />
                    <Typography variant="body2">Select page</Typography>
                  </Box>
                  {selectedIds.length > 0 && (
                    <>
                      <Divider orientation="vertical" flexItem />
                      <Button size="small" variant="outlined">Message ({selectedIds.length})</Button>
                      <Button size="small" variant="outlined">Mark Completed</Button>
                      <Button size="small" variant="outlined" color="warning">Mark Behind</Button>
                    </>
                  )}
                </Box>
                <Typography variant="caption" color="text.secondary">{filtered.length} results</Typography>
              </Box>

              <List>
                {paged.map((l: any) => {
                  const id = String(l.id || l.email || l.name);
                  const status = (l.status || 'Active') as 'Active' | 'Behind' | 'Completed';
                  const progress = l.progress ?? 0;
                  return (
                    <ListItem key={id} divider secondaryAction={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip label={status} color={status === 'Completed' ? 'success' : status === 'Behind' ? 'warning' : 'primary'} size="small" />
                        <Tooltip title="Details">
                          <IconButton edge="end" onClick={() => openDetails(l)}>
                            <InfoIcon />
                          </IconButton>
                        </Tooltip>
                        <IconButton edge="end">
                          <MoreVert />
                        </IconButton>
                      </Box>
                    }>
                      <Checkbox
                        checked={selectedIds.includes(id)}
                        onChange={(e, checked) => toggleSelect(id, checked)}
                        sx={{ mr: 1 }}
                      />
                      <Avatar sx={{ mr: 2 }}>{(l.name || l.full_name || 'U').toString().charAt(0)}</Avatar>
                      <ListItemText
                        primary={l.name || l.full_name || l.email}
                        secondary={
                          <Box>
                            <Typography variant="caption" color="text.secondary">{l.email || 'N/A'}</Typography>
                            <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                              <LinearProgress variant="determinate" value={progress} sx={{ flexGrow: 1, height: 6, borderRadius: 3 }} />
                              <Typography variant="caption" color="text.secondary">{progress}%</Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                  );
                })}
              </List>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box display="flex" justifyContent="flex-end" mt={2}>
                  <Pagination count={totalPages} page={page} onChange={(e, p) => setPage(p)} color="primary" />
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Learner Details</DialogTitle>
        <DialogContent>
          {selectedLearner && (
            <Box>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Avatar sx={{ width: 40, height: 40 }}>
                  {(selectedLearner.name || selectedLearner.full_name || 'U').toString().charAt(0)}
                </Avatar>
                <Box>
                  <Typography fontWeight={600}>{selectedLearner.name || selectedLearner.full_name || selectedLearner.email}</Typography>
                  <Typography variant="body2" color="text.secondary">{selectedLearner.email || 'N/A'}</Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="subtitle2" gutterBottom>Status</Typography>
                <Chip label={selectedLearner.status || 'Active'} color={(selectedLearner.status || 'Active') === 'Completed' ? 'success' : (selectedLearner.status || 'Active') === 'Behind' ? 'warning' : 'primary'} />
              </Box>
              <Box mt={2}>
                <Typography variant="subtitle2" gutterBottom>Progress</Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <LinearProgress variant="determinate" value={selectedLearner.progress ?? 0} sx={{ flexGrow: 1, height: 8, borderRadius: 4 }} />
                  <Typography variant="body2">{selectedLearner.progress ?? 0}%</Typography>
                </Box>
              </Box>
              <Box mt={2}>
                <Typography variant="subtitle2" gutterBottom>Notes</Typography>
                <Typography variant="body2" color="text.secondary">No notes yet.</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
          <Button variant="contained">Message</Button>
        </DialogActions>
      </Dialog>
    </InstructorLayout>
  );
};

export default InstructorLearners;


