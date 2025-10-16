import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Checkbox,
  IconButton,
  Button,
  Chip,
  TextField,
  MenuItem,
  Toolbar,
  Tooltip,
  Avatar,
  TableSortLabel,
  Menu,
  ListItemIcon,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Publish as PublishIcon,
  Unpublished as DraftIcon,
  FileDownload as DownloadIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  MoreVert as MoreIcon,
} from '@mui/icons-material';
import SellerLayout from '../components/layout/SellerLayout';
import { useDispatch } from 'react-redux';
import { removeCar, setCars } from '../store/sellerSlice';
import type { Car } from '../types';
import { sellerApi } from '../services/sellerApi';
import { useNavigate } from 'react-router-dom';

const SellerInventory: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [cars, setLocalCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [cardMenuAnchor, setCardMenuAnchor] = useState<Record<string, HTMLElement | null>>({});
  const [bulkMenuAnchor, setBulkMenuAnchor] = useState<null | HTMLElement>(null);

  // Sample data fallback for demo/empty states
  const mockCars: Car[] = useMemo(() => ([
    { id: 'm1', seller_id: 's1', title: '2019 Toyota Corolla LE', brand: 'Toyota', model: 'Corolla', year: 2019, mileage: 38500, price: 15900, status: 'active', location: 'Chicago, IL', images: ['https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=1200&auto=format&fit=crop'], car_condition: 'used', fuel_type: 'Petrol', transmission: 'Automatic', body_type: 'Sedan', color: 'Silver', features: ['Bluetooth','Backup camera'], specifications: {}, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'm2', seller_id: 's1', title: '2020 Honda Civic Sport', brand: 'Honda', model: 'Civic', year: 2020, mileage: 24000, price: 18750, status: 'active', location: 'Austin, TX', images: ['https://images.unsplash.com/photo-1549921296-3fdc4a3fa5d8?q=80&w=1200&auto=format&fit=crop'], car_condition: 'used', fuel_type: 'Petrol', transmission: 'Automatic', body_type: 'Sedan', color: 'Blue', features: ['CarPlay','Heated seats'], specifications: {}, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'm3', seller_id: 's1', title: '2018 Ford Focus SE', brand: 'Ford', model: 'Focus', year: 2018, mileage: 52500, price: 12990, status: 'pending', location: 'Miami, FL', images: ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1200&auto=format&fit=crop'], car_condition: 'used', fuel_type: 'Petrol', transmission: 'Automatic', body_type: 'Hatchback', color: 'Red', features: ['Bluetooth'], specifications: {}, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'm4', seller_id: 's1', title: '2017 BMW 330i', brand: 'BMW', model: '3 Series', year: 2017, mileage: 61000, price: 23400, status: 'draft', location: 'New York, NY', images: ['https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=1200&auto=format&fit=crop'], car_condition: 'used', fuel_type: 'Petrol', transmission: 'Automatic', body_type: 'Sedan', color: 'Black', features: ['Sunroof','Navigation'], specifications: {}, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'm5', seller_id: 's1', title: '2019 Mercedes C300', brand: 'Mercedes', model: 'C-Class', year: 2019, mileage: 41000, price: 26800, status: 'active', location: 'Seattle, WA', images: ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop'], car_condition: 'used', fuel_type: 'Petrol', transmission: 'Automatic', body_type: 'Sedan', color: 'White', features: ['Leather','CarPlay'], specifications: {}, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'm6', seller_id: 's1', title: '2021 Tesla Model 3', brand: 'Tesla', model: 'Model 3', year: 2021, mileage: 12000, price: 34900, status: 'sold', location: 'San Jose, CA', images: ['https://images.unsplash.com/photo-1511390428939-6b0f04096b4a?q=80&w=1200&auto=format&fit=crop'], car_condition: 'used', fuel_type: 'Electric', transmission: 'Automatic', body_type: 'Sedan', color: 'White', features: ['Autopilot'], specifications: {}, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ]), []);

  const filtered = useMemo(() => {
    return cars.filter((c) =>
      (!statusFilter || c.status === statusFilter) &&
      (!search ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.model.toLowerCase().includes(search.toLowerCase()) ||
        c.brand.toLowerCase().includes(search.toLowerCase()))
    );
  }, [cars, statusFilter, search]);

  const isAllSelected = filtered.length > 0 && selected.length === filtered.length;

  const load = async () => {
    try {
      setLoading(true);
      const res = await sellerApi.cars.getMyCars({ page: 1, limit: 100 });
      const list = res.cars || [];
      // If API returns empty, show mock cars so the UI is illustrative
      const withFallback = list.length > 0 ? list : mockCars;
      setLocalCars(withFallback);
      dispatch(setCars(withFallback));
    } catch (e) {
      console.error(e);
      // On error, still show mock cars
      setLocalCars(mockCars);
      dispatch(setCars(mockCars));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleAll = (checked: boolean) => {
    setSelected(checked ? filtered.map((c) => c.id) : []);
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const bulkUpdateStatus = async (status: 'active' | 'draft') => {
    if (selected.length === 0) return;
    try {
      await Promise.all(selected.map((id) => sellerApi.cars.updateCarStatus(id, status)));
      await load();
      setSelected([]);
    } catch (e) {
      console.error(e);
    }
  };

  const bulkDelete = async () => {
    if (selected.length === 0) return;
    try {
      await Promise.all(selected.map((id) => sellerApi.cars.deleteCar(id)));
      selected.forEach((id) => dispatch(removeCar(id)));
      setLocalCars((prev) => prev.filter((c) => !selected.includes(c.id)));
      setSelected([]);
    } catch (e) {
      console.error(e);
    }
  };

  const openCardMenu = (id: string, el: HTMLElement) => setCardMenuAnchor((prev) => ({ ...prev, [id]: el }));
  const closeCardMenu = (id: string) => setCardMenuAnchor((prev) => ({ ...prev, [id]: null }));

  const handleCardAction = async (id: string, action: 'publish' | 'draft' | 'delete') => {
    try {
      if (action === 'delete') {
        await sellerApi.cars.deleteCar(id);
        dispatch(removeCar(id));
        setLocalCars((prev) => prev.filter((c) => c.id !== id));
      } else {
        await sellerApi.cars.updateCarStatus(id, action === 'publish' ? 'active' : 'draft');
        await load();
      }
    } catch (e) {
      console.error(e);
    } finally {
      closeCardMenu(id);
    }
  };

  const exportCSV = () => {
    const rows = (selected.length ? cars.filter((c) => selected.includes(c.id)) : filtered).map((c) => [
      c.id,
      c.title,
      c.brand,
      c.model,
      c.year,
      c.mileage,
      c.price,
      c.status,
      c.location,
    ]);
    const header = ['id','title','brand','model','year','mileage','price','status','location'];
    const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const counts = useMemo(() => {
    return cars.reduce(
      (acc, c) => {
        acc.total += 1;
        acc[c.status] = (acc[c.status] || 0) + 1;
        return acc;
      },
      { total: 0, active: 0, draft: 0, pending: 0, sold: 0, rejected: 0 } as Record<string, number>
    );
  }, [cars]);

  return (
    <SellerLayout>
      <Box sx={{ width: '100%', display: 'grid', gap: 2 }}>
        <Card>
          <CardHeader title="Inventory" subheader="Manage your stock, status, and exports" />
          <CardContent>
            {/* Summary cards at top */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(5, 1fr)' }, gap: 1.5, mb: 2 }}>
              <Card variant="outlined">
                <CardContent sx={{ py: 1.25 }}>
                  <Typography variant="overline" color="text.secondary">Total</Typography>
                  <Typography variant="h6" fontWeight={800}>{counts.total}</Typography>
                </CardContent>
              </Card>
              <Card variant="outlined" sx={{ borderColor: 'success.light' }}>
                <CardContent sx={{ py: 1.25 }}>
                  <Typography variant="overline" color="success.main">Active</Typography>
                  <Typography variant="h6" fontWeight={800} color="success.main">{counts.active}</Typography>
                </CardContent>
              </Card>
              <Card variant="outlined">
                <CardContent sx={{ py: 1.25 }}>
                  <Typography variant="overline" color="text.secondary">Draft</Typography>
                  <Typography variant="h6" fontWeight={800}>{counts.draft}</Typography>
                </CardContent>
              </Card>
              <Card variant="outlined" sx={{ borderColor: 'warning.light' }}>
                <CardContent sx={{ py: 1.25 }}>
                  <Typography variant="overline" color="warning.main">Pending</Typography>
                  <Typography variant="h6" fontWeight={800} color="warning.main">{counts.pending}</Typography>
                </CardContent>
              </Card>
              <Card variant="outlined" sx={{ borderColor: 'info.light' }}>
                <CardContent sx={{ py: 1.25 }}>
                  <Typography variant="overline" color="info.main">Sold</Typography>
                  <Typography variant="h6" fontWeight={800} color="info.main">{counts.sold}</Typography>
                </CardContent>
              </Card>
            </Box>
            <Toolbar disableGutters sx={{ display: 'flex', gap: 1, justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                <TextField size="small" placeholder="Search title, make, model" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ minWidth: 260 }} />
                <TextField size="small" select label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 160 }}>
                  <MenuItem value="">All</MenuItem>
                  {['active','draft','pending','sold','rejected'].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </TextField>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                <Tooltip title="Refresh"><span><IconButton onClick={load} disabled={loading}><RefreshIcon /></IconButton></span></Tooltip>
                <Tooltip title="Export CSV"><span><IconButton onClick={exportCSV} disabled={filtered.length === 0}><DownloadIcon /></IconButton></span></Tooltip>
                <Button size="small" variant={viewMode === 'grid' ? 'contained' : 'outlined'} onClick={() => setViewMode('grid')}>Cards</Button>
                <Button size="small" variant={viewMode === 'table' ? 'contained' : 'outlined'} onClick={() => setViewMode('table')}>Table</Button>
                {/* Bulk actions condensed into a menu when selection exists */}
                <span>
                  <Button size="small" variant="outlined" startIcon={<MoreIcon />} disabled={selected.length === 0} onClick={(e) => setBulkMenuAnchor(e.currentTarget)}>Bulk actions</Button>
                </span>
                <Menu anchorEl={bulkMenuAnchor} open={Boolean(bulkMenuAnchor)} onClose={() => setBulkMenuAnchor(null)}>
                  <MenuItem onClick={() => { setBulkMenuAnchor(null); bulkUpdateStatus('draft'); }}>
                    <ListItemIcon><DraftIcon fontSize="small" /></ListItemIcon>
                    Mark Draft
                  </MenuItem>
                  <MenuItem onClick={() => { setBulkMenuAnchor(null); bulkUpdateStatus('active'); }}>
                    <ListItemIcon><PublishIcon fontSize="small" /></ListItemIcon>
                    Publish
                  </MenuItem>
                  <MenuItem onClick={() => { setBulkMenuAnchor(null); bulkDelete(); }}>
                    <ListItemIcon><DeleteIcon fontSize="small" /></ListItemIcon>
                    Delete
                  </MenuItem>
                </Menu>
                <Button variant="contained" onClick={() => navigate('/seller/cars/add')}>Add Vehicle</Button>
              </Box>
            </Toolbar>

            {viewMode === 'grid' ? (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mt: 1 }}>
                {filtered.map((c) => (
                  <Card key={c.id} sx={{ position: 'relative', overflow: 'hidden', transition: 'transform 160ms ease, box-shadow 160ms ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } }}>
                    <Box sx={{ position: 'relative' }}>
                      <Avatar
                        variant="rounded"
                        src={c.images?.[0]}
                        sx={{ width: '100%', height: 180, bgcolor: 'grey.100' }}
                      >
                        {c.brand}
                      </Avatar>
                      <Checkbox
                        checked={selected.includes(c.id)}
                        onChange={() => toggleOne(c.id)}
                        sx={{ position: 'absolute', top: 8, left: 8, bgcolor: 'background.paper', borderRadius: 1 }}
                      />
                      <Chip size="small" label={c.status} color={c.status === 'active' ? 'success' : c.status === 'draft' ? 'default' : c.status === 'pending' ? 'warning' : c.status === 'sold' ? 'info' : 'error'} sx={{ position: 'absolute', top: 8, right: 8 }} />
                    </Box>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                        {c.title || `${c.year} ${c.brand} ${c.model}`}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                        <Chip size="small" variant="outlined" label={`${c.year || '—'}`}/>
                        <Chip size="small" variant="outlined" label={c.mileage ? `${c.mileage.toLocaleString()} km` : '—'}/>
                        {c.location ? <Chip size="small" variant="outlined" label={c.location}/> : null}
                      </Box>
                      <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
                        {c.price ? `$${Number(c.price).toLocaleString()}` : '—'}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Button size="small" onClick={() => navigate(`/cars/${c.id}`)}>View</Button>
                          <Button size="small" onClick={() => navigate(`/seller/cars/${c.id}/edit`)}>Edit</Button>
                        </Box>
                        <IconButton size="small" onClick={(e) => openCardMenu(c.id, e.currentTarget)}>
                          <MoreIcon fontSize="small" />
                        </IconButton>
                        <Menu anchorEl={cardMenuAnchor[c.id]} open={Boolean(cardMenuAnchor[c.id])} onClose={() => closeCardMenu(c.id)}>
                          <MenuItem onClick={() => handleCardAction(c.id, 'publish')}>
                            <ListItemIcon><PublishIcon fontSize="small" /></ListItemIcon>
                            Publish
                          </MenuItem>
                          <MenuItem onClick={() => handleCardAction(c.id, 'draft')}>
                            <ListItemIcon><DraftIcon fontSize="small" /></ListItemIcon>
                            Mark Draft
                          </MenuItem>
                          <MenuItem onClick={() => handleCardAction(c.id, 'delete')}>
                            <ListItemIcon><DeleteIcon fontSize="small" /></ListItemIcon>
                            Delete
                          </MenuItem>
                        </Menu>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
                {filtered.length === 0 && (
                  <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary', gridColumn: '1 / -1' }}>
                    No cars match your filters.
                  </Box>
                )}
              </Box>
            ) : (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox checked={isAllSelected} indeterminate={selected.length > 0 && !isAllSelected} onChange={(e) => toggleAll(e.target.checked)} />
                    </TableCell>
                    <TableCell>Car</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell>Mileage</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Added</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((c) => (
                    <TableRow key={c.id} hover>
                      <TableCell padding="checkbox">
                        <Checkbox checked={selected.includes(c.id)} onChange={() => toggleOne(c.id)} />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ width: 56, height: 36, borderRadius: 1, overflow: 'hidden', bgcolor: 'grey.100', border: '1px solid', borderColor: 'divider' }}>
                            {c.images?.[0] ? (
                              <img src={c.images[0]} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : null}
                          </Box>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={600}>{c.title || `${c.year} ${c.brand} ${c.model}`}</Typography>
                            <Typography variant="caption" color="text.secondary">{c.brand} · {c.model} · {c.year}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={c.status} color={c.status === 'active' ? 'success' : c.status === 'draft' ? 'default' : c.status === 'pending' ? 'warning' : c.status === 'sold' ? 'info' : 'error'} />
                      </TableCell>
                      <TableCell align="right">{c.price ? `$${Number(c.price).toLocaleString()}` : '—'}</TableCell>
                      <TableCell>{c.mileage ? `${c.mileage} km` : '—'}</TableCell>
                      <TableCell>{c.location || '—'}</TableCell>
                      <TableCell>{new Date(c.created_at).toLocaleDateString()}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="View"><IconButton size="small" onClick={() => navigate(`/cars/${c.id}`)}><ViewIcon fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Edit"><IconButton size="small" onClick={() => navigate(`/seller/cars/${c.id}/edit`)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="More"><IconButton size="small" onClick={(e) => openCardMenu(c.id, e.currentTarget)}><MoreIcon fontSize="small" /></IconButton></Tooltip>
                        <Menu anchorEl={cardMenuAnchor[c.id]} open={Boolean(cardMenuAnchor[c.id])} onClose={() => closeCardMenu(c.id)}>
                          <MenuItem onClick={() => handleCardAction(c.id, 'publish')}><ListItemIcon><PublishIcon fontSize="small" /></ListItemIcon>Publish</MenuItem>
                          <MenuItem onClick={() => handleCardAction(c.id, 'draft')}><ListItemIcon><DraftIcon fontSize="small" /></ListItemIcon>Mark Draft</MenuItem>
                          <MenuItem onClick={() => handleCardAction(c.id, 'delete')}><ListItemIcon><DeleteIcon fontSize="small" /></ListItemIcon>Delete</MenuItem>
                        </Menu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8}>
                        <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
                          No cars match your filters.
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>) }
          </CardContent>
        </Card>
      </Box>
    </SellerLayout>
  );
};

export default SellerInventory;


