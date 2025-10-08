import React from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip as MuiTooltip,
  Pagination,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
  Drawer,
  Divider,
  Menu,
  Collapse,
  LinearProgress,
} from '@mui/material';
import { Search as SearchIcon, FilterList as FilterIcon, FileDownload as FileDownloadIcon, Visibility as VisibilityIcon, Check as ApproveIcon, Close as RejectIcon, Refresh as RefreshIcon, ViewKanban as ViewKanbanIcon, TableRows as TableRowsIcon } from '@mui/icons-material';
import VisaLayout from '../components/layout/VisaLayout';
import { visaApi } from '../services/visaApi';

const VisaApplications: React.FC = () => {
  const role = useSelector((state: any) => state?.auth?.user?.role);
  const isOfficer = role === 'admin' || role === 'visa_officer' || role === 'moderator' || role === 'staff';
  const [rows, setRows] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [query, setQuery] = React.useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = React.useState<string>('');
  const [status, setStatus] = React.useState<string>('');
  const [country, setCountry] = React.useState<string>('');
  const [sortBy, setSortBy] = React.useState<string>('recent');
  const [page, setPage] = React.useState<number>(1);
  const pageSize = 10;
  const [selected, setSelected] = React.useState<Record<string, boolean>>({});
  const [preview, setPreview] = React.useState<any | null>(null);
  const [viewMode, setViewMode] = React.useState<'table' | 'kanban'>(() => (localStorage.getItem('visa_apps_view') as 'table' | 'kanban') || 'table');
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [savedMenuEl, setSavedMenuEl] = React.useState<null | HTMLElement>(null);
  const [expandedRowId, setExpandedRowId] = React.useState<string | null>(null);
  const [notes, setNotes] = React.useState<Record<string, string>>({});
  const [attachments, setAttachments] = React.useState<Record<string, File[]>>({});
  const [reminderOpen, setReminderOpen] = React.useState<{ open: boolean; id?: string | null }>({ open: false, id: null });
  const [reminderDate, setReminderDate] = React.useState<string>('');

  const mockApplications = React.useMemo(() => ([
    { id: 'a1', applicant: 'John Doe', email: 'john@example.com', country: 'United States', status: 'submitted', submitted_at: '2024-05-12' },
    { id: 'a2', applicant: 'Aisha Khan', email: 'aisha@example.com', country: 'United Kingdom', status: 'in_review', submitted_at: '2024-05-08' },
    { id: 'a3', applicant: 'Wei Zhang', email: 'wei@example.com', country: 'Canada', status: 'approved', submitted_at: '2024-05-01' },
    { id: 'a4', applicant: 'Carlos Ruiz', email: 'carlos@example.com', country: 'Germany', status: 'rejected', submitted_at: '2024-04-28' },
    { id: 'a5', applicant: 'Sara Lee', email: 'sara@example.com', country: 'Australia', status: 'submitted', submitted_at: '2024-05-10' },
    { id: 'a6', applicant: 'Fatima Ali', email: 'fatima@example.com', country: 'UAE', status: 'in_review', submitted_at: '2024-05-03' },
  ]), []);
  

  const load = async () => {
    try {
      setLoading(true);
      const data = await visaApi.listApplicationsMy();
      const normalized = Array.isArray(data) ? data : (Array.isArray((data as any)?.data) ? (data as any).data : []);
      setRows(normalized.length ? normalized : mockApplications);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { load(); }, []);
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim().toLowerCase()), 250);
    return () => clearTimeout(t);
  }, [query]);

  const filtered = React.useMemo(() => {
    const q = debouncedQuery;
    let data = rows.filter((r: any) =>
      (!q || (r.applicant || r.applicant_name || r.email || '').toLowerCase().includes(q) || (r.country || '').toLowerCase().includes(q)) &&
      (!status || (r.status || '').toLowerCase() === status.toLowerCase()) &&
      (!country || (r.country || '').toLowerCase() === country.toLowerCase())
    );
    if (sortBy === 'recent') data = data.sort((a: any, b: any) => new Date(b.submitted_at || b.created_at || 0).getTime() - new Date(a.submitted_at || a.created_at || 0).getTime());
    if (sortBy === 'name') data = data.sort((a: any, b: any) => (a.applicant || a.applicant_name || a.email || '').localeCompare(b.applicant || b.applicant_name || b.email || ''));
    return data;
  }, [rows, debouncedQuery, status, country, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleSelect = (id: string) => setSelected((prev) => ({ ...prev, [id]: !prev[id] }));

  const exportCsv = () => {
    const rowsToExport = filtered.map((r: any) => ({ id: r.id, applicant: r.applicant || r.applicant_name || r.email, country: r.country, status: r.status, submitted: r.submitted_at || r.created_at }));
    const header = Object.keys(rowsToExport[0] || { id: '', applicant: '', country: '', status: '', submitted: '' });
    const csv = [header.join(','), ...rowsToExport.map((r) => header.map((h) => JSON.stringify((r as any)[h] ?? '')).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'visa_applications.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Attachments helpers
  const addAttachments = (id: string, fileList: FileList | null) => {
    if (!fileList) return;
    const files = Array.from(fileList);
    setAttachments((prev) => ({ ...prev, [id]: [ ...(prev[id] || []), ...files ] }));
  };
  const removeAttachment = (id: string, index: number) => {
    setAttachments((prev) => ({
      ...prev,
      [id]: (prev[id] || []).filter((_, i) => i !== index),
    }));
  };

  const onChangeView = (_: any, val: 'table' | 'kanban') => {
    if (!val) return;
    setViewMode(val);
    localStorage.setItem('visa_apps_view', val);
  };

  // Selection helpers
  const selectedIds = React.useMemo(() => Object.keys(selected).filter((id) => selected[id]), [selected]);
  const clearSelection = () => setSelected({});

  const saveCurrentView = () => {
    const name = prompt('Save current view as:');
    if (!name) return;
    const payload = { query, status, country, sortBy, viewMode };
    const key = 'visa_apps_saved_views';
    const store = JSON.parse(localStorage.getItem(key) || '{}');
    store[name] = payload;
    localStorage.setItem(key, JSON.stringify(store));
    alert('View saved');
  };
  const openSaved = (e: React.MouseEvent<HTMLElement>) => setSavedMenuEl(e.currentTarget);
  const closeSaved = () => setSavedMenuEl(null);
  const loadSaved = (name: string) => {
    const key = 'visa_apps_saved_views';
    const store = JSON.parse(localStorage.getItem(key) || '{}');
    const v = store[name];
    if (!v) return;
    setQuery(v.query || '');
    setStatus(v.status || '');
    setCountry(v.country || '');
    setSortBy(v.sortBy || 'recent');
    setViewMode(v.viewMode || 'table');
    setPage(1);
    closeSaved();
  };

  const daysSince = (iso?: string) => {
    if (!iso) return 0;
    const ms = Date.now() - new Date(iso).getTime();
    return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
  };
  const slaBadge = (submitted?: string) => {
    const d = daysSince(submitted);
    if (d < 3) return <Chip label={`SLA OK (${d}d)`} size="small" color="success" />;
    if (d < 7) return <Chip label={`Watch (${d}d)`} size="small" color="warning" />;
    return <Chip label={`Overdue (${d}d)`} size="small" color="error" />;
  };

  

  return (
    <VisaLayout>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2} flexWrap="wrap" gap={2}>
        <Typography variant="h5" fontWeight={700}>Applications</Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
          <TextField
            size="small"
            placeholder="Search by applicant or country..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
          />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Status</InputLabel>
            <Select label="Status" value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="submitted">Submitted</MenuItem>
              <MenuItem value="in_review">In Review</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Country</InputLabel>
            <Select label="Country" value={country} onChange={(e) => { setPage(1); setCountry(e.target.value); }}>
              <MenuItem value="">All</MenuItem>
              {[...new Set(rows.map((r: any) => r.country).filter(Boolean))].map((c: any) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Sort</InputLabel>
            <Select label="Sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <MenuItem value="recent">Most Recent</MenuItem>
              <MenuItem value="name">Applicant A→Z</MenuItem>
            </Select>
          </FormControl>
          <MuiTooltip title="Refresh">
            <IconButton onClick={load}><RefreshIcon /></IconButton>
          </MuiTooltip>
          <MuiTooltip title="Export CSV">
            <IconButton onClick={exportCsv}><FileDownloadIcon /></IconButton>
          </MuiTooltip>
          <MuiTooltip title="Advanced filters">
            <IconButton onClick={() => setFiltersOpen(true)}><FilterIcon /></IconButton>
          </MuiTooltip>
          <MuiTooltip title="Save view">
            <Button onClick={saveCurrentView}>Save View</Button>
          </MuiTooltip>
          <MuiTooltip title="Load saved view">
            <Button onClick={openSaved}>Load View</Button>
          </MuiTooltip>
          <ToggleButtonGroup size="small" exclusive value={viewMode} onChange={onChangeView} sx={{ ml: 1 }}>
            <ToggleButton value="table"><TableRowsIcon /></ToggleButton>
            <ToggleButton value="kanban"><ViewKanbanIcon /></ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Box>

      {/* Saved views menu */}
      <Menu anchorEl={savedMenuEl} open={Boolean(savedMenuEl)} onClose={closeSaved}>
        {Object.keys(JSON.parse(localStorage.getItem('visa_apps_saved_views') || '{}')).length === 0 && (
          <MenuItem disabled>No saved views</MenuItem>
        )}
        {Object.keys(JSON.parse(localStorage.getItem('visa_apps_saved_views') || '{}')).map((name) => (
          <MenuItem key={name} onClick={() => loadSaved(name)}>{name}</MenuItem>
        ))}
      </Menu>

      {/* KPI */}
      <Stack direction="row" spacing={2} flexWrap="wrap" mb={2}>
        <Card><CardContent><Typography variant="overline" color="text.secondary">Total</Typography><Typography variant="h6" fontWeight={700}>{rows.length}</Typography></CardContent></Card>
        <Card><CardContent><Typography variant="overline" color="text.secondary">Approved</Typography><Typography variant="h6" fontWeight={700}>{rows.filter((r: any) => (r.status || '').toLowerCase() === 'approved').length}</Typography></CardContent></Card>
        <Card><CardContent><Typography variant="overline" color="text.secondary">Rejected</Typography><Typography variant="h6" fontWeight={700}>{rows.filter((r: any) => (r.status || '').toLowerCase() === 'rejected').length}</Typography></CardContent></Card>
        <Card><CardContent><Typography variant="overline" color="text.secondary">In Review</Typography><Typography variant="h6" fontWeight={700}>{rows.filter((r: any) => (r.status || '').toLowerCase() === 'in_review').length}</Typography></CardContent></Card>
      </Stack>

      <Card>
        <CardContent>
          {loading ? (
            <Stack spacing={1}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} variant="rectangular" height={42} />
              ))}
            </Stack>
          ) : filtered.length === 0 ? (
            <Box textAlign="center" py={6}>
              <FilterIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography variant="h6" color="text.secondary">No applications found</Typography>
              <Typography variant="body2" color="text.secondary">Try changing filters or search terms.</Typography>
            </Box>
          ) : viewMode === 'table' ? (
            <Table size="small">
              <TableHead>
                <TableRow>
                  {isOfficer && <TableCell padding="checkbox"></TableCell>}
                  <TableCell>Applicant</TableCell>
                  <TableCell>Country</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Submitted</TableCell>
                  <TableCell>SLA</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pageData.map((r: any) => (
                  <React.Fragment key={r.id}>
                  <TableRow hover onClick={() => setExpandedRowId(expandedRowId === String(r.id) ? null : String(r.id))}>
                    {isOfficer && (
                      <TableCell padding="checkbox">
                        <Checkbox size="small" checked={!!selected[String(r.id)]} onChange={(e) => { e.stopPropagation(); toggleSelect(String(r.id)); }} />
                      </TableCell>
                    )}
                    <TableCell>{r.applicant || r.applicant_name || r.email}</TableCell>
                    <TableCell>{r.country || '-'}</TableCell>
                    <TableCell>
                      <Chip label={r.status || 'submitted'} color={(r.status || '').toLowerCase() === 'approved' ? 'success' : (r.status || '').toLowerCase() === 'rejected' ? 'error' : 'warning'} size="small" />
                    </TableCell>
                    <TableCell>{r.submitted_at || r.created_at}</TableCell>
                    <TableCell>{slaBadge(r.submitted_at || r.created_at)}</TableCell>
                    <TableCell align="right">
                      <MuiTooltip title="Preview">
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); setPreview(r); }}><VisibilityIcon /></IconButton>
                      </MuiTooltip>
                      {isOfficer && (
                        <>
                          <MuiTooltip title="Approve">
                            <IconButton size="small" color="success"><ApproveIcon /></IconButton>
                          </MuiTooltip>
                          <MuiTooltip title="Reject">
                            <IconButton size="small" color="error"><RejectIcon /></IconButton>
                          </MuiTooltip>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={isOfficer ? 7 : 6} sx={{ p: 0, border: 0 }}>
                      <Collapse in={expandedRowId === String(r.id)} timeout="auto" unmountOnExit>
                        <Box sx={{ p: 2, bgcolor: 'action.hover' }}>
                          <Typography variant="subtitle2" gutterBottom>Details</Typography>
                          <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mb: 2 }}>
                            <Chip label={`ID: ${r.id}`} size="small" />
                            <Chip label={`Email: ${r.email || '-'}`} size="small" />
                            <Chip label={`Country: ${r.country || '-'}`} size="small" />
                          </Stack>
                          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                            <Button size="small" variant="outlined" onClick={() => alert('Request missing documents (stub)')}>Request Docs</Button>
                            <Button size="small" variant="outlined" onClick={() => setReminderOpen({ open: true, id: String(r.id) })}>Set Reminder</Button>
                          </Stack>
                          <TextField
                            fullWidth
                            multiline
                            minRows={2}
                            label="Internal Notes"
                            value={notes[String(r.id)] || ''}
                            onChange={(e) => setNotes((prev) => ({ ...prev, [String(r.id)]: e.target.value }))}
                          />
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={isOfficer ? 7 : 6} sx={{ p: 0, border: 0 }}>
                      <Collapse in={expandedRowId === String(r.id)} timeout="auto" unmountOnExit>
                        <Box sx={{ p: 2, bgcolor: 'action.hover' }}>
                          <Typography variant="subtitle2" gutterBottom>Details</Typography>
                          <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mb: 2 }}>
                            <Chip label={`ID: ${r.id}`} size="small" />
                            <Chip label={`Email: ${r.email || '-'}`} size="small" />
                            <Chip label={`Country: ${r.country || '-'}`} size="small" />
                          </Stack>
                          {/* Simple timeline */}
                          <Stack spacing={0.5} sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary">Timeline</Typography>
                            <Typography variant="body2">Submitted: {r.submitted_at || r.created_at}</Typography>
                            <Typography variant="body2">Current Status: {(r.status || 'submitted').replace('_',' ')}</Typography>
                          </Stack>
                          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                            <Button size="small" variant="outlined" onClick={() => alert('Request missing documents (stub)')}>Request Docs</Button>
                            <Button size="small" variant="outlined" onClick={() => setReminderOpen({ open: true, id: String(r.id) })}>Set Reminder</Button>
                            <Button size="small" variant="outlined" onClick={() => window.print()}>Print</Button>
                          </Stack>
                          <TextField
                            fullWidth
                            multiline
                            minRows={2}
                            label="Internal Notes"
                            value={notes[String(r.id)] || ''}
                            onChange={(e) => setNotes((prev) => ({ ...prev, [String(r.id)]: e.target.value }))}
                          />
                          {/* Attachments */}
                          <Stack spacing={1} sx={{ mt: 2 }}>
                            <Typography variant="caption" color="text.secondary">Attachments</Typography>
                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                              {(attachments[String(r.id)] || []).map((f, idx) => (
                                <Chip key={idx} label={f.name} onDelete={() => removeAttachment(String(r.id), idx)} size="small" />
                              ))}
                            </Stack>
                            <Button size="small" variant="outlined" component="label">
                              Add Files
                              <input hidden type="file" multiple onChange={(e) => addAttachments(String(r.id), e.target.files)} />
                            </Button>
                          </Stack>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Box>
              <Stack direction="row" spacing={2} sx={{ overflowX: 'auto' }}>
                {['submitted', 'in_review', 'approved', 'rejected'].map((lane) => (
                  <Card key={lane} sx={{ minWidth: 260, flex: '0 0 auto' }}>
                    <CardContent>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ textTransform: 'capitalize' }}>{lane.replace('_', ' ')}</Typography>
                      <Divider sx={{ my: 1 }} />
                      <Stack spacing={1}>
                        {filtered.filter((r: any) => (r.status || 'submitted').toLowerCase() === lane).slice(0, 50).map((r: any) => (
                          <Card key={r.id} variant="outlined" sx={{ p: 1 }}>
                            <Typography variant="body2" fontWeight={600}>{r.applicant || r.applicant_name || r.email}</Typography>
                            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                              <Chip label={r.country || '-'} size="small" />
                              {slaBadge(r.submitted_at || r.created_at)}
                            </Stack>
                            <Stack direction="row" spacing={1} mt={1}>
                              <IconButton size="small" onClick={() => setPreview(r)}><VisibilityIcon fontSize="small" /></IconButton>
                              {isOfficer && <IconButton size="small" color="success"><ApproveIcon fontSize="small" /></IconButton>}
                              {isOfficer && <IconButton size="small" color="error"><RejectIcon fontSize="small" /></IconButton>}
                            </Stack>
                          </Card>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!loading && filtered.length > pageSize && (
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
          <Typography variant="body2" color="text.secondary">
            Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filtered.length)} of {filtered.length}
          </Typography>
          <Pagination color="primary" count={totalPages} page={page} onChange={(_, p) => setPage(p)} />
        </Box>
      )}

      {/* Filters drawer */}
      <Drawer anchor="right" open={filtersOpen} onClose={() => setFiltersOpen(false)}>
        <Box sx={{ width: 320, p: 2 }}>
          <Typography variant="h6" gutterBottom>Advanced Filters</Typography>
          <TextField fullWidth label="Applicant / Email" value={query} onChange={(e) => setQuery(e.target.value)} sx={{ mb: 2 }} />
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="submitted">Submitted</MenuItem>
              <MenuItem value="in_review">In Review</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Country</InputLabel>
            <Select label="Country" value={country} onChange={(e) => setCountry(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              {[...new Set(rows.map((r: any) => r.country).filter(Boolean))].map((c: any) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Sort</InputLabel>
            <Select label="Sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <MenuItem value="recent">Most Recent</MenuItem>
              <MenuItem value="name">Applicant A→Z</MenuItem>
            </Select>
          </FormControl>
          <Stack direction="row" spacing={1}>
            <Button variant="contained" onClick={() => setFiltersOpen(false)}>Apply</Button>
            <Button onClick={() => { setQuery(''); setStatus(''); setCountry(''); setSortBy('recent'); setPage(1); }}>Reset</Button>
          </Stack>
        </Box>
      </Drawer>

      {/* Reminder dialog */}
      <Dialog open={reminderOpen.open} onClose={() => setReminderOpen({ open: false, id: null })} maxWidth="xs" fullWidth>
        <DialogTitle>Schedule Reminder</DialogTitle>
        <DialogContent>
          <TextField
            type="datetime-local"
            fullWidth
            label="Reminder Time"
            InputLabelProps={{ shrink: true }}
            value={reminderDate}
            onChange={(e) => setReminderDate(e.target.value)}
            sx={{ mt: 1 }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            We'll send a notification at the selected time. (Stub)
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReminderOpen({ open: false, id: null })}>Cancel</Button>
          <Button variant="contained" onClick={() => { alert('Reminder scheduled (stub)'); setReminderOpen({ open: false, id: null }); }}>Schedule</Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!preview} onClose={() => setPreview(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Application Preview</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" fontWeight={700}>{preview?.applicant || preview?.applicant_name || preview?.email}</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1, mb: 1 }}>
            <Chip label={preview?.country || '-'} size="small" />
            <Chip label={preview?.status || 'submitted'} size="small" color={(preview?.status || '').toLowerCase() === 'approved' ? 'success' : (preview?.status || '').toLowerCase() === 'rejected' ? 'error' : 'warning'} />
          </Stack>
          <Typography variant="body2" color="text.secondary">Submitted: {preview?.submitted_at || preview?.created_at}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreview(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </VisaLayout>
  );
};

export default VisaApplications;


