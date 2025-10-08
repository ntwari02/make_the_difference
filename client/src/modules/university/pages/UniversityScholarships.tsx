import React from 'react';
import { Box, Card, CardContent, Typography, GridLegacy as Grid, Button, TextField, InputAdornment, Chip, Select, MenuItem, Skeleton, Stack, Checkbox, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Toolbar, Paper, Tabs, Tab, ToggleButtonGroup, ToggleButton, Menu, ListItemIcon, ListItemText, Divider, Snackbar, Alert, Tooltip } from '@mui/material';
import UniversityLayout from '../components/layout/UniversityLayout';
import { universityApi } from '../services/universityApi';
import { Search, FilterList, CalendarMonth, People, AttachMoney, ContentCopy, Archive, Close, Visibility, ViewModule, ViewList, Edit, Link, FileUpload, FileDownload, MoreVert, StarBorder, Star, Lightbulb } from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const UniversityScholarships: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [items, setItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [query, setQuery] = React.useState<string>('');
  const [status, setStatus] = React.useState<string>('all');
  const [sortBy, setSortBy] = React.useState<string>('deadline_asc');
  const [page, setPage] = React.useState<number>(1);
  const pageSize = 8;
  const [categories] = React.useState<string[]>(['STEM','Business','Arts','Health','Technology','Research','Innovation','Sustainability','Education','Mental Health','Women','Blockchain','VR','AR','Food Security','Transportation','COVID-19','Remote Learning','E-commerce','Social Media','Telemedicine','Privacy','Security']);
  const [activeCategories, setActiveCategories] = React.useState<Set<string>>(new Set());
  const [budgetMin, setBudgetMin] = React.useState<string>('');
  const [budgetMax, setBudgetMax] = React.useState<string>('');
  const [deadlineRange, setDeadlineRange] = React.useState<string>('any');
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [quickItem, setQuickItem] = React.useState<any | null>(null);
  const loadMoreRef = React.useRef<HTMLDivElement | null>(null);
  const [tab, setTab] = React.useState<'all'|'active'|'inactive'|'draft'|'archived'>('all');
  const [view, setView] = React.useState<'grid'|'list'>('grid');
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [menuItem, setMenuItem] = React.useState<any | null>(null);
  const menuOpen = Boolean(anchorEl);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editingTitle, setEditingTitle] = React.useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = React.useState<string>('');
  const [favorites, setFavorites] = React.useState<Set<string>>(new Set());
  const [savedViews, setSavedViews] = React.useState<Array<{ name: string; query: string; status: string; sortBy: string }>>([
    { name: 'Closing Soon', query: '', status: 'active', sortBy: 'deadline_asc' },
    { name: 'High Budget', query: '', status: 'all', sortBy: 'budget_desc' },
  ]);
  const [toast, setToast] = React.useState<{ open: boolean; message: string; severity: 'success'|'info'|'warning'|'error' }>({ open: false, message: '', severity: 'success' });
  const [shortcutsOpen, setShortcutsOpen] = React.useState<boolean>(false);
  const [threadOpen, setThreadOpen] = React.useState<boolean>(false);
  const [activeThreadId, setActiveThreadId] = React.useState<string | null>(null);
  const [messageInput, setMessageInput] = React.useState<string>('');
  const [messagesByScholarship, setMessagesByScholarship] = React.useState<Record<string, Array<{ id: string; sender: 'me'|'admin'; text: string; time: string }>>>({});
  const [updates] = React.useState<Array<{ id: string; title: string; time: string }>>([
    { id: 'u1', title: 'Application review timelines updated for Spring intake', time: '2h ago' },
    { id: 'u2', title: 'New scholarship category: AI & Data Science', time: 'Today' },
    { id: 'u3', title: 'Reminder: Document verification closes in 7 days', time: 'Yesterday' },
  ]);

  const load = async () => {
    setLoading(true);
    const data = await universityApi.listProviderScholarships();
    const normalized = Array.isArray(data) ? data : (Array.isArray((data as any)?.data) ? (data as any).data : []);
    if (!normalized || normalized.length === 0) {
      const fallback = [
        { id: 'sch-101', title: 'Global Engineering Excellence', applications: 48, budget: 50000, deadline: '2025-11-30', status: 'active', tags: ['Engineering','STEM','Merit'], description: 'Supports outstanding engineering students with global ambitions.' },
        { id: 'sch-102', title: 'AI & Data Science Fellowship', applications: 62, budget: 65000, deadline: '2025-12-15', status: 'active', tags: ['AI','Data','Graduate'], description: 'Funding for research in AI applications and data science.' },
        { id: 'sch-103', title: 'Business Leadership Grant', applications: 30, budget: 40000, deadline: '2025-12-05', status: 'active', tags: ['Business','Leadership'], description: 'Empowers future business leaders with tuition support.' },
        { id: 'sch-104', title: 'Healthcare Innovators Scholarship', applications: 22, budget: 55000, deadline: '2025-11-28', status: 'active', tags: ['Health','Research'], description: 'Aids students innovating in healthcare and biotech.' },
        { id: 'sch-105', title: 'Computer Science Merit Award', applications: 54, budget: 30000, deadline: '2025-12-10', status: 'active', tags: ['CS','Undergraduate','Merit'], description: 'Recognizes academic excellence in computer science.' },
        { id: 'sch-106', title: 'Arts & Humanities Fund', applications: 18, budget: 25000, deadline: '2025-12-20', status: 'active', tags: ['Arts','Humanities'], description: 'Supports creative and cultural studies at all levels.' },
        { id: 'sch-107', title: 'Sustainable Energy Scholarship', applications: 27, budget: 45000, deadline: '2025-12-01', status: 'active', tags: ['Energy','Environment'], description: 'For students advancing renewable and sustainable energy.' },
        { id: 'sch-108', title: 'Global STEM Innovators', applications: 36, budget: 52000, deadline: '2025-12-08', status: 'active', tags: ['STEM','Innovation'], description: 'Backs innovative STEM projects with global impact.' },
        // Inactive scholarships
        { id: 'sch-201', title: 'Urban Development Grant', description: 'Temporarily unavailable.', applications: 0, budget: 0, deadline: '2025-10-01', status: 'inactive', tags: ['Urban','Planning'] },
        { id: 'sch-202', title: 'Climate Action Fellowship', description: 'On hold for review.', applications: 0, budget: 0, deadline: '2025-09-15', status: 'inactive', tags: ['Climate','Environment'] },
        { id: 'sch-203', title: 'Digital Literacy Award', description: 'Paused until next cycle.', applications: 0, budget: 0, deadline: '2025-08-30', status: 'inactive', tags: ['Education','Digital'] },
        { id: 'sch-204', title: 'Global Health Initiative', description: 'Temporarily closed.', applications: 0, budget: 0, deadline: '2025-08-10', status: 'inactive', tags: ['Health','Global'] },
        { id: 'sch-205', title: 'Sustainable Cities Challenge', description: 'Funding on hold.', applications: 0, budget: 0, deadline: '2025-07-20', status: 'inactive', tags: ['Sustainability','Urban'] },
        { id: 'sch-206', title: 'Quantum Computing Grant', description: 'Awaiting budget approval.', applications: 0, budget: 0, deadline: '2025-07-05', status: 'inactive', tags: ['Quantum','Research'] },
        { id: 'sch-207', title: 'Space Technology Fellowship', description: 'Program suspended.', applications: 0, budget: 0, deadline: '2025-06-15', status: 'inactive', tags: ['Space','Technology'] },
        { id: 'sch-208', title: 'Renewable Energy Innovation', description: 'Under reorganization.', applications: 0, budget: 0, deadline: '2025-05-30', status: 'inactive', tags: ['Energy','Innovation'] },
        // Draft scholarships
        { id: 'sch-301', title: 'Blockchain Technology Grant', description: 'Supporting blockchain research and development.', applications: 0, budget: 35000, deadline: '2025-12-30', status: 'draft', tags: ['Blockchain','Technology'] },
        { id: 'sch-302', title: 'Mental Health Awareness Fund', description: 'Promoting mental health research and support.', applications: 0, budget: 28000, deadline: '2025-12-25', status: 'draft', tags: ['Mental Health','Research'] },
        { id: 'sch-303', title: 'Women in STEM Initiative', description: 'Encouraging female participation in STEM fields.', applications: 0, budget: 40000, deadline: '2025-12-28', status: 'draft', tags: ['Women','STEM','Equity'] },
        { id: 'sch-304', title: 'Virtual Reality Innovation', description: 'Funding VR/AR technology development.', applications: 0, budget: 45000, deadline: '2025-12-22', status: 'draft', tags: ['VR','AR','Innovation'] },
        { id: 'sch-305', title: 'Food Security Research', description: 'Addressing global food security challenges.', applications: 0, budget: 32000, deadline: '2025-12-20', status: 'draft', tags: ['Food Security','Research'] },
        { id: 'sch-306', title: 'Green Transportation Grant', description: 'Supporting sustainable transportation solutions.', applications: 0, budget: 38000, deadline: '2025-12-18', status: 'draft', tags: ['Transportation','Sustainability'] },
        // Archived scholarships
        { id: 'sch-401', title: 'COVID-19 Research Fund', description: 'Completed research on pandemic response.', applications: 45, budget: 50000, deadline: '2023-12-31', status: 'archived', tags: ['COVID-19','Research'] },
        { id: 'sch-402', title: 'Remote Learning Initiative', description: 'Supporting online education during pandemic.', applications: 38, budget: 30000, deadline: '2023-11-30', status: 'archived', tags: ['Education','Remote Learning'] },
        { id: 'sch-403', title: 'E-commerce Innovation Award', description: 'Promoting digital commerce solutions.', applications: 52, budget: 25000, deadline: '2023-10-15', status: 'archived', tags: ['E-commerce','Innovation'] },
        { id: 'sch-404', title: 'Social Media Impact Study', description: 'Research on social media effects on society.', applications: 28, budget: 20000, deadline: '2023-09-30', status: 'archived', tags: ['Social Media','Research'] },
        { id: 'sch-405', title: 'Telemedicine Development', description: 'Advancing remote healthcare technologies.', applications: 41, budget: 35000, deadline: '2023-08-20', status: 'archived', tags: ['Telemedicine','Healthcare'] },
        { id: 'sch-406', title: 'Digital Privacy Protection', description: 'Research on data privacy and security.', applications: 33, budget: 28000, deadline: '2023-07-15', status: 'archived', tags: ['Privacy','Security'] },
      ];
      setItems(fallback);
    } else {
      setItems(normalized);
    }
    setLoading(false);
  };

  React.useEffect(() => { load(); }, []);

  // Handle URL tab parameter
  React.useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['all', 'active', 'inactive', 'draft', 'archived'].includes(tabParam)) {
      setTab(tabParam as 'all'|'active'|'inactive'|'draft'|'archived');
    }
  }, [searchParams]);

  // Debounce search
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 250);
    return () => clearTimeout(t);
  }, [query]);

  // Infinite scroll
  React.useEffect(() => {
    if (!loadMoreRef.current) return;
    const el = loadMoreRef.current;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setPage((p) => p + 1);
        }
      });
    }, { rootMargin: '200px' });
    obs.observe(el);
    return () => { obs.disconnect(); };
  }, [loadMoreRef.current]);

  const filtered = React.useMemo(() => {
    const base = Array.isArray(items) ? items : [];
    let out = base.filter((s: any) => {
      const text = `${s.title || s.name || ''} ${s.description || ''}`.toLowerCase();
      const qok = debouncedQuery.trim().length === 0 || text.includes(debouncedQuery.toLowerCase().trim());
      const sstatus = (s.status || 'active');
      const sok = (status === 'all' || sstatus === status) && (tab === 'all' || sstatus === tab);
      const catOk = activeCategories.size === 0 || (s.tags || []).some((t: string) => activeCategories.has(t)) || 
        Array.from(activeCategories).some(cat => 
          text.includes(cat.toLowerCase()) || 
          (s.title || '').toLowerCase().includes(cat.toLowerCase()) ||
          (s.description || '').toLowerCase().includes(cat.toLowerCase())
        );
      const bmin = budgetMin ? Number(budgetMin) : -Infinity;
      const bmax = budgetMax ? Number(budgetMax) : Infinity;
      const b = Number(s.budget || 0);
      const budgetOk = b >= bmin && b <= bmax;
      const d = s.deadline ? new Date(s.deadline).getTime() : 0;
      const now = Date.now();
      const deadlineOk = deadlineRange === 'any' || (
        (deadlineRange === '7d' && d <= now + 7*24*3600*1000) ||
        (deadlineRange === '30d' && d <= now + 30*24*3600*1000) ||
        (deadlineRange === '90d' && d <= now + 90*24*3600*1000)
      );
      return qok && sok && catOk && budgetOk && deadlineOk;
    });
    out = out.sort((a: any, b: any) => {
      if (sortBy === 'deadline_asc') return new Date(a.deadline || 0).getTime() - new Date(b.deadline || 0).getTime();
      if (sortBy === 'deadline_desc') return new Date(b.deadline || 0).getTime() - new Date(a.deadline || 0).getTime();
      if (sortBy === 'applications_desc') return (b.applications || 0) - (a.applications || 0);
      if (sortBy === 'budget_desc') return (b.budget || 0) - (a.budget || 0);
      return 0;
    });
    return out;
  }, [items, debouncedQuery, status, sortBy, activeCategories, budgetMin, budgetMax, deadlineRange, tab]);

  const paged = React.useMemo(() => filtered.slice(0, page * pageSize), [filtered, page]);

  const toggleCategory = (cat: string) => {
    setActiveCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      return next;
    });
    setPage(1);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const bulkArchive = () => {
    // Mock archive action
    clearSelection();
    setToast({ open: true, message: 'Archived selected scholarships', severity: 'success' });
  };

  const bulkDuplicate = () => {
    // Mock duplicate action
    clearSelection();
    setToast({ open: true, message: 'Duplicated selected scholarships', severity: 'success' });
  };

  const openMenu = (e: React.MouseEvent<HTMLElement>, item: any) => { setAnchorEl(e.currentTarget); setMenuItem(item); };
  const closeMenu = () => { setAnchorEl(null); setMenuItem(null); };
  const startInlineEdit = (item: any) => { setEditingId(String(item.id)); setEditingTitle(item.title || item.name || ''); };
  const saveInlineEdit = () => { setEditingId(null); };

  const exportCsv = async () => {
    const res = await universityApi.exportApplications('csv');
    window.open(res?.downloadUrl || '/mock-export.csv', '_blank');
    setToast({ open: true, message: 'Export started', severity: 'info' });
  };
  const importCsv = () => {
    // mock
    setToast({ open: true, message: 'Import completed', severity: 'success' });
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const applySavedView = (v: { name: string; query: string; status: string; sortBy: string }) => {
    setQuery(v.query);
    setStatus(v.status);
    setSortBy(v.sortBy);
    setPage(1);
  };

  const saveCurrentAsView = () => {
    const name = `View ${savedViews.length + 1}`;
    setSavedViews(prev => [...prev, { name, query, status, sortBy }]);
    setToast({ open: true, message: `Saved view: ${name}`, severity: 'success' });
  };

  const openThread = (scholarshipId: string) => {
    setActiveThreadId(scholarshipId);
    setThreadOpen(true);
    if (!messagesByScholarship[scholarshipId]) {
      setMessagesByScholarship(prev => ({
        ...prev,
        [scholarshipId]: [
          { id: 'm1', sender: 'admin', text: `Hello! We received your inquiry about scholarship ${scholarshipId}. How can we help you today?`, time: '10:12 AM' },
          { id: 'm2', sender: 'me', text: 'I have a question about the application deadline.', time: '10:15 AM' },
          { id: 'm3', sender: 'admin', text: 'The deadline is clearly stated in the scholarship details. Is there anything specific you need clarification on?', time: '10:16 AM' },
        ],
      }));
    }
  };

  const sendMessage = () => {
    if (!activeThreadId || !messageInput.trim()) return;
    const msg = { id: String(Date.now()), sender: 'me' as const, text: messageInput.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessagesByScholarship(prev => ({
      ...prev,
      [activeThreadId]: [...(prev[activeThreadId] || []), msg],
    }));
    setMessageInput('');
    setTimeout(() => {
      // mock admin reply
      setMessagesByScholarship(prev => ({
        ...prev,
        [activeThreadId]: [...(prev[activeThreadId] || []), { id: String(Date.now()+1), sender: 'admin', text: 'Thanks! We will review and update you shortly.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }],
      }));
    }, 800);
  };

  const EmptyState = (
    <Card sx={{ borderRadius: 3, boxShadow: 0, border: (t) => `1px dashed ${t.palette.divider}` }}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight={600}>No scholarships found</Typography>
        <Typography variant="body2" color="text.secondary">Try adjusting filters or create a new scholarship.</Typography>
        <Box mt={2}>
          <Button variant="contained" onClick={() => window.location.assign('/university/scholarships/create')}>Create Scholarship</Button>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <UniversityLayout>
      {/* Header with search and actions */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Box position="sticky" top={0} zIndex={1} bgcolor="background.default" display="flex" alignItems="center" justifyContent="space-between" mb={2} sx={{ pt: 1 }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>My Scholarships</Typography>
            <Typography variant="body2" color="text.secondary">Manage and track your scholarship programs</Typography>
          </Box>
          <Box display="flex" gap={1}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outlined" startIcon={<FileUpload />} onClick={importCsv}>Import</Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outlined" startIcon={<FileDownload />} onClick={exportCsv}>Export</Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outlined" startIcon={<FilterList />}>Filters</Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="contained" onClick={() => window.location.assign('/university/scholarships/create')}>Create Scholarship</Button>
            </motion.div>
          </Box>
        </Box>
      </motion.div>

      {/* Tabs and view toggle */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Tabs value={tab} onChange={(_, v) => { setTab(v); setPage(1); }} variant="scrollable" scrollButtons allowScrollButtonsMobile>
            <Tab value="all" label="All" />
            <Tab value="active" label="Active" />
            <Tab value="inactive" label="Inactive" />
            <Tab value="draft" label="Draft" />
            <Tab value="archived" label="Archived" />
          </Tabs>
          <motion.div whileHover={{ scale: 1.05 }}>
            <ToggleButtonGroup size="small" value={view} exclusive onChange={(_, v) => v && setView(v)}>
              <ToggleButton value="grid"><ViewModule fontSize="small" /></ToggleButton>
              <ToggleButton value="list"><ViewList fontSize="small" /></ToggleButton>
            </ToggleButtonGroup>
          </motion.div>
        </Box>
      </motion.div>

      {/* KPI strip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Grid container spacing={1} mb={1}>
          {[
            { label: 'Total', value: filtered.length },
            { label: 'Showing', value: paged.length },
            { label: 'Selected', value: selectedIds.size },
          ].map((k, index) => (
            <Grid item xs={4} key={k.label}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card sx={{ borderRadius: 2, border: (t) => `1px solid ${t.palette.divider}`, transition: 'all 0.2s ease' }}>
                  <CardContent sx={{ py: 1.25 }}>
                    <Typography variant="caption" color="text.secondary">{k.label}</Typography>
                    <Typography variant="subtitle1" fontWeight={700}>{k.value}</Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      {/* Saved views and AI insights */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
        <Box display="flex" gap={1} flexWrap="wrap">
          {savedViews.map((v) => (
            <Chip key={v.name} label={v.name} size="small" onClick={() => applySavedView(v)} />
          ))}
          <Button size="small" variant="outlined" onClick={saveCurrentAsView}>Save current</Button>
        </Box>
        <Chip icon={<Lightbulb />} label="AI: Boost conversion by adding essay tip" size="small" color="primary" variant="outlined" />
      </Box>

      {/* Unified compact toolbar (updates + filters) */}
      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, mb: 1, display: 'flex', alignItems: 'center' }}>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search scholarships..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              InputProps={{ startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              )}}
            />
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <Select fullWidth size="small" value={status} onChange={(e) => { setStatus(String(e.target.value)); setPage(1); }}>
              <MenuItem value="all">All statuses</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="archived">Archived</MenuItem>
              <MenuItem value="draft">Draft</MenuItem>
            </Select>
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <Select fullWidth size="small" value={sortBy} onChange={(e) => setSortBy(String(e.target.value))}>
              <MenuItem value="deadline_asc">Deadline soonest</MenuItem>
              <MenuItem value="deadline_desc">Deadline latest</MenuItem>
              <MenuItem value="applications_desc">Most applications</MenuItem>
              <MenuItem value="budget_desc">Highest budget</MenuItem>
            </Select>
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <TextField fullWidth size="small" label="Min budget" type="number" value={budgetMin} onChange={(e) => { setBudgetMin(e.target.value); setPage(1); }} />
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <TextField fullWidth size="small" label="Max budget" type="number" value={budgetMax} onChange={(e) => { setBudgetMax(e.target.value); setPage(1); }} />
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <Select fullWidth size="small" value={deadlineRange} onChange={(e) => { setDeadlineRange(String(e.target.value)); setPage(1); }}>
              <MenuItem value="any">Any deadline</MenuItem>
              <MenuItem value="7d">Within 7 days</MenuItem>
              <MenuItem value="30d">Within 30 days</MenuItem>
              <MenuItem value="90d">Within 90 days</MenuItem>
            </Select>
          </Grid>
          <Grid item xs={6} sm={3} md={1}>
            <Button fullWidth size="small" variant="outlined" onClick={() => { setQuery(''); setStatus('all'); setSortBy('deadline_asc'); setBudgetMin(''); setBudgetMax(''); setDeadlineRange('any'); setPage(1); }}>Clear</Button>
          </Grid>
          <Grid item xs={12} md>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              {updates.slice(0, 2).map(u => (
                <Chip key={u.id} label={u.title} size="small" />
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Paper>
      

      {/* Category chips row */}
      <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
        {categories.map((c) => (
          <Chip key={c} label={c} size="small" color={activeCategories.has(c) ? 'primary' : 'default'} variant={activeCategories.has(c) ? 'filled' : 'outlined'} onClick={() => toggleCategory(c)} />
        ))}
      </Box>

      {/* Bulk actions toolbar */}
      {selectedIds.size > 0 && (
        <Paper elevation={1} sx={{ mb: 2, borderRadius: 2, border: (t) => `1px solid ${t.palette.divider}` }}>
          <Toolbar sx={{ minHeight: 44, px: 2 }}>
            <Typography variant="body2" sx={{ flex: 1 }}>{selectedIds.size} selected</Typography>
            <Button size="small" startIcon={<Archive />} onClick={bulkArchive}>Archive</Button>
            <Button size="small" startIcon={<ContentCopy />} onClick={bulkDuplicate}>Duplicate</Button>
            <IconButton size="small" onClick={clearSelection}><Close /></IconButton>
          </Toolbar>
        </Paper>
      )}

      {/* Content grid */}
      {loading ? (
        <Grid container spacing={2}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
              <Card sx={{ borderRadius: 3, border: (t) => `1px solid ${t.palette.divider}`, height: '100%' }}>
                <CardContent>
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" />
                  <Skeleton variant="rectangular" height={48} sx={{ mt: 1 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <>
          {paged.length === 0 ? (
            EmptyState
          ) : (
            <>
              {view === 'grid' ? (
                <Grid container spacing={2}>
                  <AnimatePresence>
                    {paged.map((s: any, idx: number) => (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={s.id || idx}>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ 
                            duration: 0.3, 
                            delay: idx * 0.05,
                            ease: "easeOut"
                          }}
                          whileHover={{ 
                            y: -4, 
                            transition: { duration: 0.2 }
                          }}
                          style={{ height: '100%' }}
                        >
                          <Card sx={{ 
                            borderRadius: 3, 
                            boxShadow: 2, 
                            border: (t) => `1px solid ${t.palette.divider}`, 
                            transition: 'box-shadow 0.2s ease-in-out', 
                            height: '100%', 
                            minHeight: 420,
                            opacity: (s.status === 'inactive' ? 0.7 : 1),
                            background: 'background.paper',
                            display: 'flex',
                            flexDirection: 'column',
                            '&:hover': {
                              boxShadow: 4
                            }
                          }}>
                            <CardContent sx={{ 
                              p: 3, 
                              display: 'flex', 
                              flexDirection: 'column', 
                              height: '100%',
                              flex: 1,
                              '&:last-child': { pb: 3 }
                            }}>
                              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Checkbox size="small" checked={selectedIds.has(s.id)} onChange={() => toggleSelect(String(s.id))} />
                                  {editingId === String(s.id) ? (
                                    <TextField size="small" value={editingTitle} onChange={(e) => setEditingTitle(e.target.value)} onBlur={saveInlineEdit} autoFocus />
                                  ) : (
                                    <Typography variant="subtitle1" fontWeight={700}>{s.title || s.name}</Typography>
                                  )}
                                </Box>
                                <Box display="flex" alignItems="center" gap={1}>
                                  <IconButton size="small" onClick={() => toggleFavorite(String(s.id))}>
                                    {favorites.has(String(s.id)) ? <Star color="warning" fontSize="small" /> : <StarBorder fontSize="small" />}
                                  </IconButton>
                                  <Chip size="small" label={s.status || 'active'} color={((s.status === 'archived' || s.status === 'inactive') ? 'default' : 'success') as any} variant="outlined" />
                                  <IconButton size="small" onClick={(e) => openMenu(e, s)}><MoreVert fontSize="small" /></IconButton>
                                </Box>
                              </Box>
                              
                              <Box display="flex" alignItems="center" gap={2} mb={1.5} flexWrap="wrap">
                                <Box display="flex" alignItems="center" gap={0.5}>
                                  <People fontSize="small" />
                                  <Typography variant="body2" color="text.primary" fontWeight={600}>{s.applications ?? s.awards_count ?? 0} applications</Typography>
                                </Box>
                                <Box display="flex" alignItems="center" gap={0.5}>
                                  <AttachMoney fontSize="small" />
                                  <Typography variant="body2" color="text.primary" fontWeight={600}>${(s.budget ?? 0).toLocaleString()}</Typography>
                                </Box>
                                <Box display="flex" alignItems="center" gap={0.5}>
                                  <CalendarMonth fontSize="small" />
                                  <Tooltip title={s.deadline || 'No deadline'} placement="top" arrow>
                                    <Typography variant="body2" color="text.primary" fontWeight={600}>
                                      Deadline: {s.deadline ?? '-'}
                                    </Typography>
                                  </Tooltip>
                                </Box>
                              </Box>
                              
                              {/* Description */}
                              <Typography 
                                variant="body2" 
                                color="text.secondary" 
                                sx={{ 
                                  mb: 1.5, 
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  lineHeight: 1.4,
                                  minHeight: '2.8em'
                                }}
                              >
                                {s.description || 'Supporting outstanding students with financial assistance and academic opportunities.'}
                              </Typography>
                              
                              {/* Tags */}
                              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
                                {(s.tags || ['STEM','Undergraduate','Merit']).slice(0, 3).map((t: string) => (
                                  <Chip key={t} label={t} size="small" variant="outlined" />
                                ))}
                              </Stack>
                              
                              <Box pt={1} style={{ marginTop: 'auto' }}>
                                {/* Primary Actions Row */}
                                <Box display="flex" gap={0.5} mb={1} flexWrap="wrap">
                                  <Button 
                                    size="small" 
                                    variant="outlined" 
                                    disabled={s.status === 'inactive'} 
                                    onClick={() => window.location.assign(`/university/applications?scholarshipId=${s.id}`)}
                                    sx={{ fontSize: '0.75rem', minWidth: 'auto', px: 1 }}
                                  >
                                    View Apps
                                  </Button>
                                  <Button 
                                    size="small" 
                                    disabled={s.status === 'inactive'} 
                                    onClick={() => window.location.assign(`/university/scholarships/${s.id || 'edit'}`)}
                                    sx={{ fontSize: '0.75rem', minWidth: 'auto', px: 1 }}
                                  >
                                    Edit
                                  </Button>
                                </Box>
                                
                                {/* Secondary Actions Row */}
                                <Box display="flex" gap={0.5} flexWrap="wrap">
                                  <Button 
                                    size="small" 
                                    startIcon={<Visibility />} 
                                    onClick={() => setQuickItem(s)}
                                    sx={{ fontSize: '0.75rem', minWidth: 'auto', px: 1 }}
                                  >
                                    Quick View
                                  </Button>
                                  <Button 
                                    size="small" 
                                    variant="contained" 
                                    onClick={() => openThread(String(s.id))}
                                    sx={{ fontSize: '0.75rem', minWidth: 'auto', px: 1 }}
                                  >
                                    Message Admin
                                  </Button>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </Grid>
                    ))}
                  </AnimatePresence>
                </Grid>
              ) : (
                <Card sx={{ borderRadius: 2, border: (t) => `1px solid ${t.palette.divider}` }}>
                  <CardContent sx={{ p: 1.5 }}>
                    {paged.map((s: any, idx: number) => (
                      <Box key={s.id || idx} display="grid" gridTemplateColumns="auto 2fr 1fr 1fr 1fr auto" alignItems="center" gap={1} sx={{ py: 1 }}>
                        <Checkbox size="small" checked={selectedIds.has(s.id)} onChange={() => toggleSelect(String(s.id))} />
                        {editingId === String(s.id) ? (
                          <TextField size="small" value={editingTitle} onChange={(e) => setEditingTitle(e.target.value)} onBlur={saveInlineEdit} autoFocus />
                        ) : (
                          <Typography variant="subtitle2" fontWeight={600}>{s.title || s.name}</Typography>
                        )}
                        <Typography variant="caption" color="text.secondary">{s.applications ?? s.awards_count ?? 0} apps</Typography>
                        <Typography variant="caption" color="text.secondary">${(s.budget ?? 0).toLocaleString()}</Typography>
                        <Tooltip title={s.deadline || 'No deadline'} placement="top" arrow>
                          <Typography variant="body2" color="text.primary" fontWeight={600}>{s.deadline ?? '-'}</Typography>
                        </Tooltip>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Chip size="small" label={s.status || 'active'} variant="outlined" />
                          <IconButton size="small" onClick={() => toggleFavorite(String(s.id))}>{favorites.has(String(s.id)) ? <Star color="warning" fontSize="small" /> : <StarBorder fontSize="small" />}</IconButton>
                          <IconButton size="small" onClick={() => setQuickItem(s)}><Visibility fontSize="small" /></IconButton>
                          <Button size="small" variant="contained" onClick={() => openThread(String(s.id))} sx={{ fontSize: '0.7rem', minWidth: 'auto', px: 1 }}>
                            Message Admin
                          </Button>
                          <IconButton size="small" onClick={(e) => openMenu(e, s)}><MoreVert fontSize="small" /></IconButton>
                        </Box>
                        {idx < paged.length - 1 && <Divider sx={{ gridColumn: '1 / -1', my: 0.5 }} />}
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          )}
          {/* Infinite scroll sentinel */}
          <Box ref={loadMoreRef} sx={{ height: 1 }} />
        </>
      )}

      {/* Quick View Dialog */}
      <Dialog open={!!quickItem} onClose={() => setQuickItem(null)} fullWidth maxWidth="sm">
        <DialogTitle>
          {quickItem?.title || quickItem?.name}
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Deadline: {quickItem?.deadline ?? '-'} • Budget: ${((quickItem?.budget ?? 0)).toLocaleString()} • Applications: {quickItem?.applications ?? quickItem?.awards_count ?? 0}
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {(quickItem?.tags || ['STEM','Undergraduate','Merit']).slice(0, 6).map((t: string) => (
              <Chip key={t} label={t} size="small" variant="outlined" />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuickItem(null)}>Close</Button>
          <Button variant="contained" onClick={() => window.location.assign(`/university/applications?scholarshipId=${quickItem?.id}`)}>View Applications</Button>
        </DialogActions>
      </Dialog>

      {/* Card action menu */}
      <Menu anchorEl={anchorEl} open={menuOpen} onClose={closeMenu} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <MenuItem onClick={() => { startInlineEdit(menuItem); closeMenu(); }}>
          <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
          <ListItemText>Edit title</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/university/scholarships/${menuItem?.id}`); closeMenu(); }}>
          <ListItemIcon><Link fontSize="small" /></ListItemIcon>
          <ListItemText>Copy link</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { bulkDuplicate(); closeMenu(); }}>
          <ListItemIcon><ContentCopy fontSize="small" /></ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { bulkArchive(); closeMenu(); }}>
          <ListItemIcon><Archive fontSize="small" /></ListItemIcon>
          <ListItemText>Archive</ListItemText>
        </MenuItem>
      </Menu>

      {/* Messages Thread Dialog */}
      <Dialog open={threadOpen} onClose={() => setThreadOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          Messages with Admin
          <IconButton
            aria-label="close"
            onClick={() => setThreadOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ height: 400, overflowY: 'auto', p: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {(messagesByScholarship[activeThreadId || ''] || []).map((m) => (
              <Box 
                key={m.id} 
                sx={{ 
                  display: 'flex', 
                  justifyContent: m.sender === 'me' ? 'flex-end' : 'flex-start',
                  mb: 1
                }}
              >
                <Box sx={{ 
                  px: 2, 
                  py: 1.5, 
                  borderRadius: 3, 
                  bgcolor: m.sender === 'me' ? 'primary.main' : 'grey.100', 
                  maxWidth: '70%',
                  color: m.sender === 'me' ? 'primary.contrastText' : 'text.primary',
                  boxShadow: 1
                }}>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    {m.text}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      display: 'block', 
                      textAlign: 'right', 
                      opacity: 0.7,
                      fontSize: '0.75rem'
                    }}
                  >
                    {m.time}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ alignItems: 'center', p: 2 }}>
          <TextField 
            size="small" 
            fullWidth 
            placeholder="Type a message..." 
            value={messageInput} 
            onChange={(e) => setMessageInput(e.target.value)} 
            onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
            sx={{ mr: 1 }}
          />
          <Button variant="contained" onClick={sendMessage} disabled={!messageInput.trim()}>
            Send
          </Button>
        </DialogActions>
      </Dialog>

      {/* Shortcuts dialog */}
      <Dialog open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Keyboard Shortcuts</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2">/ Focus search</Typography>
          <Typography variant="body2">A Select all</Typography>
          <Typography variant="body2">E Edit selected</Typography>
          <Typography variant="body2">Del Archive selected</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShortcutsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Toast */}
      <Snackbar open={toast.open} autoHideDuration={2000} onClose={() => setToast({ ...toast, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={toast.severity} variant="filled" sx={{ width: '100%' }}>{toast.message}</Alert>
      </Snackbar>
    </UniversityLayout>
  );
};

export default UniversityScholarships;



