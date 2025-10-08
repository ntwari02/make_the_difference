import React from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  GridLegacy as Grid,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip as MuiTooltip,
  Skeleton,
  Pagination,
  Menu,
  ToggleButton,
  ToggleButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import {
  Search as SearchIcon,
  Public as CountryIcon,
  Category as TypeIcon,
  TravelExplore as ServiceIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  FileDownload as FileDownloadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  HourglassTop as PendingIcon,
  Cancel as RejectedIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import VisaLayout from '../components/layout/VisaLayout';
import { visaApi } from '../services/visaApi';

const VisaServices: React.FC = () => {
  const role = useSelector((state: any) => state?.auth?.user?.role);
  const isAdmin = role === 'admin' || role === 'visa_officer' || role === 'moderator' || role === 'staff';
  const [items, setItems] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [query, setQuery] = React.useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = React.useState<string>('');
  const [country, setCountry] = React.useState<string>('');
  const [visaType, setVisaType] = React.useState<string>('');
  const [status, setStatus] = React.useState<string>('');
  const [sortBy, setSortBy] = React.useState<string>('recent');
  const [page, setPage] = React.useState<number>(1);
  const pageSize = 8;
  const [anchorEl, setAnchorEl] = React.useState<Record<string, HTMLElement | null>>({});
  const [favorites, setFavorites] = React.useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>(() => (localStorage.getItem('visa_services_view') as 'grid' | 'list') || 'grid');
  const [selected, setSelected] = React.useState<Record<string, boolean>>({});
  const [compareOpen, setCompareOpen] = React.useState(false);
  const [previewItem, setPreviewItem] = React.useState<any | null>(null);
  const [filtersMenuEl, setFiltersMenuEl] = React.useState<null | HTMLElement>(null);

  const mockServices = React.useMemo(() => ([
    { id: 'm1', title: 'Tourist Visa - USA', country: 'United States', visa_type: 'Tourist', status: 'open', description: 'Short-term travel for tourism and visits.', views: 1240, created_at: '2024-01-12' },
    { id: 'm2', title: 'Student Visa - UK', country: 'United Kingdom', visa_type: 'Student', status: 'pending', description: 'Study at accredited institutions in the UK.', views: 980, created_at: '2024-02-04' },
    { id: 'm3', title: 'Work Permit - Canada', country: 'Canada', visa_type: 'Work', status: 'open', description: 'Skilled worker programs and employer-sponsored permits.', views: 2105, created_at: '2024-03-22' },
    { id: 'm4', title: 'Business Visa - UAE', country: 'United Arab Emirates', visa_type: 'Business', status: 'open', description: 'Attend meetings, conferences, and business events.', views: 745, created_at: '2024-04-10' },
    { id: 'm5', title: 'Schengen Visa - Germany', country: 'Germany', visa_type: 'Tourist', status: 'open', description: 'Travel within the Schengen area for up to 90 days.', views: 1673, created_at: '2024-05-18' },
    { id: 'm6', title: 'Research Visa - Australia', country: 'Australia', visa_type: 'Research', status: 'closed', description: 'For academic researchers and visiting scholars.', views: 312, created_at: '2024-01-29' },
  ]), []);

  const load = async () => {
    try {
      setIsLoading(true);
      const data = await visaApi.listServices();
      const normalized = Array.isArray(data) ? data : (Array.isArray((data as any)?.data) ? (data as any).data : []);
      setItems(normalized.length ? normalized : mockServices);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => { load(); }, []);

  // Debounce search
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim().toLowerCase()), 250);
    return () => clearTimeout(t);
  }, [query]);

  const openMenu = (id: string, e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl((prev) => ({ ...prev, [id]: e.currentTarget }));
  };
  const closeMenu = (id: string) => setAnchorEl((prev) => ({ ...prev, [id]: null }));

  const toggleFavorite = (id: string) => setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));

  const onChangeView = (_: any, val: 'grid' | 'list') => {
    if (!val) return;
    setViewMode(val);
    localStorage.setItem('visa_services_view', val);
  };

  const toggleSelect = (id: string) => setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  const selectedItems = Object.keys(selected)
    .filter((id) => selected[id])
    .map((id) => items.find((x: any) => String(x.id) === id))
    .filter(Boolean) as any[];

  const saveCurrentFilters = () => {
    const name = prompt('Save current filters as:');
    if (!name) return;
    const payload = { query, country, visaType, status, sortBy };
    const key = 'visa_services_saved_filters';
    const store = JSON.parse(localStorage.getItem(key) || '{}');
    store[name] = payload;
    localStorage.setItem(key, JSON.stringify(store));
    alert('Filters saved');
  };

  const openLoadFilters = (e: React.MouseEvent<HTMLElement>) => setFiltersMenuEl(e.currentTarget);
  const closeLoadFilters = () => setFiltersMenuEl(null);
  const loadFilters = (name: string) => {
    const key = 'visa_services_saved_filters';
    const store = JSON.parse(localStorage.getItem(key) || '{}');
    const f = store[name];
    if (!f) return;
    setQuery(f.query || '');
    setCountry(f.country || '');
    setVisaType(f.visaType || '');
    setStatus(f.status || '');
    setSortBy(f.sortBy || 'recent');
    setPage(1);
    closeLoadFilters();
  };

  const exportCsv = () => {
    const rows = filtered.map((s: any) => ({
      id: s.id,
      title: s.title,
      country: s.country,
      visa_type: s.visa_type,
      status: s.status,
      description: (s.description || '').replace(/\n/g, ' '),
    }));
    const header = Object.keys(rows[0] || { id: '', title: '', country: '', visa_type: '', status: '', description: '' });
    const csv = [header.join(','), ...rows.map((r) => header.map((h) => JSON.stringify((r as any)[h] ?? '')).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'visa_services.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = React.useMemo(() => {
    const q = debouncedQuery;
    let data = items.filter((s: any) =>
      (!q || (s.title || '').toLowerCase().includes(q) || (s.country || '').toLowerCase().includes(q) || (s.visa_type || '').toLowerCase().includes(q)) &&
      (!country || (s.country || '').toLowerCase() === country.toLowerCase()) &&
      (!visaType || (s.visa_type || '').toLowerCase() === visaType.toLowerCase()) &&
      (!status || (s.status || '').toLowerCase() === status.toLowerCase())
    );
    if (sortBy === 'recent') data = data.sort((a: any, b: any) => (new Date(b.updated_at || b.created_at || 0).getTime()) - (new Date(a.updated_at || a.created_at || 0).getTime()));
    if (sortBy === 'popular') data = data.sort((a: any, b: any) => (b.views || 0) - (a.views || 0));
    if (sortBy === 'country') data = data.sort((a: any, b: any) => (a.country || '').localeCompare(b.country || ''));
    return data;
  }, [items, debouncedQuery, country, visaType, status, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  const statusChip = (value?: string) => {
    const v = (value || 'open').toLowerCase();
    if (v === 'open' || v === 'active') return <Chip color="success" size="small" icon={<CheckCircleIcon />} label={v.toUpperCase()} />;
    if (v === 'pending') return <Chip color="warning" size="small" icon={<PendingIcon />} label={v.toUpperCase()} />;
    if (v === 'closed' || v === 'rejected') return <Chip color="error" size="small" icon={<RejectedIcon />} label={v.toUpperCase()} />;
    return <Chip variant="outlined" size="small" label={v.toUpperCase()} />;
  };

  return (
    <VisaLayout>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2} flexWrap="wrap" gap={2}>
        <Typography variant="h5" fontWeight={700}>Visa Services</Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
          <TextField
            size="small"
            placeholder="Search services..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Country</InputLabel>
            <Select label="Country" value={country} onChange={(e) => { setPage(1); setCountry(e.target.value); }}>
              <MenuItem value="">All</MenuItem>
              {[...new Set(items.map((s: any) => s.country).filter(Boolean))].map((c: any) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Type</InputLabel>
            <Select label="Type" value={visaType} onChange={(e) => { setPage(1); setVisaType(e.target.value); }}>
              <MenuItem value="">All</MenuItem>
              {[...new Set(items.map((s: any) => s.visa_type).filter(Boolean))].map((t: any) => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Status</InputLabel>
            <Select label="Status" value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Sort By</InputLabel>
            <Select label="Sort By" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <MenuItem value="recent">Most Recent</MenuItem>
              <MenuItem value="popular">Most Viewed</MenuItem>
              <MenuItem value="country">Country A→Z</MenuItem>
            </Select>
          </FormControl>
          {isAdmin && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => window.location.assign('/visa/services/create')}>Create Service</Button>
          )}
          <MuiTooltip title="Save current filters">
            <Button onClick={saveCurrentFilters}>Save Filters</Button>
          </MuiTooltip>
          <MuiTooltip title="Load saved filters">
            <Button onClick={openLoadFilters}>Load Filters</Button>
          </MuiTooltip>
          <MuiTooltip title="Export visible results (CSV)">
            <IconButton onClick={exportCsv}>
              <FileDownloadIcon />
            </IconButton>
          </MuiTooltip>
          <ToggleButtonGroup size="small" exclusive value={viewMode} onChange={onChangeView} sx={{ ml: 1 }}>
            <ToggleButton value="grid"><ViewModuleIcon /></ToggleButton>
            <ToggleButton value="list"><ViewListIcon /></ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Box>

      {/* Saved filters menu */}
      <Menu anchorEl={filtersMenuEl} open={Boolean(filtersMenuEl)} onClose={closeLoadFilters}>
        {Object.keys(JSON.parse(localStorage.getItem('visa_services_saved_filters') || '{}')).length === 0 && (
          <MenuItem disabled>No saved filters</MenuItem>
        )}
        {Object.keys(JSON.parse(localStorage.getItem('visa_services_saved_filters') || '{}')).map((name) => (
          <MenuItem key={name} onClick={() => loadFilters(name)}>{name}</MenuItem>
        ))}
      </Menu>

      {/* KPI Summary */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="overline" color="text.secondary">Total Services</Typography>
              <Typography variant="h5" fontWeight={700}>{items.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="overline" color="text.secondary">Open</Typography>
              <Typography variant="h5" fontWeight={700}>{items.filter((s: any) => (s.status || 'open').toLowerCase() === 'open').length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="overline" color="text.secondary">Pending</Typography>
              <Typography variant="h5" fontWeight={700}>{items.filter((s: any) => (s.status || '').toLowerCase() === 'pending').length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="overline" color="text.secondary">Closed</Typography>
              <Typography variant="h5" fontWeight={700}>{items.filter((s: any) => (s.status || '').toLowerCase() === 'closed').length}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Filters from data */}
      {!!items.length && (
        <Stack direction="row" spacing={1} flexWrap="wrap" mb={2}>
          {[...new Set(items.map((s: any) => s.country).filter(Boolean))].slice(0, 6).map((c: any) => (
            <Chip key={c} label={c} onClick={() => { setCountry(c); setPage(1); }} />
          ))}
          {[...new Set(items.map((s: any) => s.visa_type).filter(Boolean))].slice(0, 6).map((t: any) => (
            <Chip key={t} variant="outlined" label={t} onClick={() => { setVisaType(t); setPage(1); }} />
          ))}
        </Stack>
      )}

      {isLoading ? (
        <Grid container spacing={2}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid item xs={12} md={6} key={i}>
              <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
                <CardContent>
                  <Stack spacing={1}>
                    <Skeleton variant="text" width="40%" height={24} />
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="rectangular" height={18} />
                    <Stack direction="row" spacing={1}>
                      <Skeleton variant="rounded" width={80} height={24} />
                      <Skeleton variant="rounded" width={80} height={24} />
                    </Stack>
                    <Skeleton variant="rounded" width={160} height={32} />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : items.length === 0 ? (
        <Card sx={{ textAlign: 'center' }}>
          <CardContent>
            <ServiceIcon sx={{ fontSize: 56, color: 'text.secondary', mb: 1 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>No services found</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Create your first visa service to get started.</Typography>
            {isAdmin && (
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => window.location.assign('/visa/services/create')}>Create Service</Button>
            )}
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card sx={{ textAlign: 'center' }}>
          <CardContent>
            <ServiceIcon sx={{ fontSize: 56, color: 'text.secondary', mb: 1 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>No results match your filters</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Try adjusting search, country, type, or status.</Typography>
            <Button
              variant="outlined"
              onClick={() => { setQuery(''); setCountry(''); setVisaType(''); setStatus(''); setSortBy('recent'); setPage(1); }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <Grid container spacing={2}>
              {pageData.map((s: any, idx: number) => (
                <Grid item xs={12} md={6} key={s.id || idx}>
                  <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2, border: (t) => `1px solid ${t.palette.divider}` }}>
                    <CardContent>
                      <Box display="flex" alignItems="flex-start" justifyContent="space-between">
                        <Box>
                          <Typography variant="overline" color="text.secondary">Visa Service</Typography>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Checkbox size="small" checked={!!selected[String(s.id)]} onChange={() => toggleSelect(String(s.id))} />
                            <Typography variant="h6" fontWeight={700}>{s.title}</Typography>
                            {statusChip(s.status)}
                          </Box>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                          <IconButton onClick={() => setPreviewItem(s)}><VisibilityIcon /></IconButton>
                          <IconButton color={favorites[String(s.id)] ? 'error' : 'default'} onClick={() => toggleFavorite(String(s.id))}>
                            {favorites[String(s.id)] ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                          </IconButton>
                          <IconButton onClick={(e) => openMenu(String(s.id), e)}>
                            <MoreVertIcon />
                          </IconButton>
                          <Menu
                            anchorEl={anchorEl[String(s.id)] || null}
                            open={Boolean(anchorEl[String(s.id)])}
                            onClose={() => closeMenu(String(s.id))}
                          >
                            <MenuItem onClick={() => window.location.assign(`/visa/services/${s.id}`)}>
                              <EditIcon fontSize="small" style={{ marginRight: 8 }} /> View / Edit
                            </MenuItem>
                            {isAdmin && (
                              <MenuItem onClick={() => window.alert('Duplicated!')}>
                                <ServiceIcon fontSize="small" style={{ marginRight: 8 }} /> Duplicate
                              </MenuItem>
                            )}
                            <MenuItem onClick={() => navigator.clipboard.writeText(window.location.origin + `/visa/services/${s.id}`)}>
                              <ShareIcon fontSize="small" style={{ marginRight: 8 }} /> Copy Link
                            </MenuItem>
                            {isAdmin && (
                              <MenuItem onClick={() => window.confirm('Delete this service?') && window.alert('Deleted')}>
                                <DeleteIcon fontSize="small" style={{ marginRight: 8 }} /> Delete
                              </MenuItem>
                            )}
                          </Menu>
                        </Box>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {s.description || 'No description provided.'}
                      </Typography>
                      <Box display="flex" gap={1} mt={1} flexWrap="wrap">
                        <Chip icon={<CountryIcon />} label={s.country || 'Country'} size="small" />
                        <Chip icon={<TypeIcon />} label={s.visa_type || 'Type'} size="small" variant="outlined" />
                      </Box>
                      <Box mt={2} display="flex" gap={1}>
                        <MuiTooltip title="View details">
                          <Button size="small" variant="outlined" onClick={() => window.location.assign(`/visa/services/${s.id}`)}>Details</Button>
                        </MuiTooltip>
                        <MuiTooltip title="Start application">
                          <Button size="small" variant="contained" onClick={() => window.location.assign(`/visa/apply?id=${s.id}`)}>Apply</Button>
                        </MuiTooltip>
                        <MuiTooltip title="Share">
                          <IconButton onClick={() => navigator.clipboard.writeText(window.location.origin + `/visa/services/${s.id}`)}>
                            <ShareIcon />
                          </IconButton>
                        </MuiTooltip>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Card>
              <CardContent>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox"></TableCell>
                      <TableCell>Title</TableCell>
                      <TableCell>Country</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pageData.map((s: any, idx: number) => (
                      <TableRow key={s.id || idx} hover>
                        <TableCell padding="checkbox">
                          <Checkbox size="small" checked={!!selected[String(s.id)]} onChange={() => toggleSelect(String(s.id))} />
                        </TableCell>
                        <TableCell>{s.title}</TableCell>
                        <TableCell>{s.country}</TableCell>
                        <TableCell>{s.visa_type}</TableCell>
                        <TableCell>{statusChip(s.status)}</TableCell>
                        <TableCell align="right">
                          <IconButton onClick={() => setPreviewItem(s)}><VisibilityIcon /></IconButton>
                          <IconButton size="small" color={favorites[String(s.id)] ? 'error' : 'default'} onClick={() => toggleFavorite(String(s.id))}>
                            {favorites[String(s.id)] ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                          </IconButton>
                          <IconButton size="small" onClick={(e) => openMenu(String(s.id), e)}>
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Pagination */}
      {!isLoading && filtered.length > pageSize && (
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
          <Typography variant="body2" color="text.secondary">
            Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filtered.length)} of {filtered.length}
          </Typography>
          <Pagination color="primary" count={totalPages} page={page} onChange={(_, p) => setPage(p)} />
        </Box>
      )}

      {/* Compare Dialog */}
      <Dialog open={compareOpen} onClose={() => setCompareOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Compare Selected Services ({selectedItems.length})</DialogTitle>
        <DialogContent>
          {selectedItems.length === 0 ? (
            <Typography variant="body2" color="text.secondary">Select services to compare.</Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Country</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedItems.map((s: any) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.title}</TableCell>
                    <TableCell>{s.country}</TableCell>
                    <TableCell>{s.visa_type}</TableCell>
                    <TableCell>{s.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompareOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Quick Preview */}
      <Dialog open={!!previewItem} onClose={() => setPreviewItem(null)} maxWidth="sm" fullWidth>
        <DialogTitle>{previewItem?.title}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{previewItem?.description || 'No description.'}</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip icon={<CountryIcon />} label={previewItem?.country || 'Country'} size="small" />
            <Chip icon={<TypeIcon />} label={previewItem?.visa_type || 'Type'} size="small" variant="outlined" />
            {statusChip(previewItem?.status)}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => previewItem && window.location.assign(`/visa/services/${previewItem.id}`)} startIcon={<EditIcon />}>Open</Button>
          <Button onClick={() => setPreviewItem(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </VisaLayout>
  );
};

export default VisaServices;


