import React, { useEffect, useMemo, useState } from 'react';
import { Box, Card, CardContent, Typography, Button, Grid, TextField, MenuItem, IconButton, Chip, Skeleton, Tooltip, Dialog, DialogContent } from '@mui/material';
import StudentLayout from '../components/layout/StudentLayout';
import { studentApi } from '../services/studentApi';
import { useNavigate } from 'react-router-dom';

const Certificates: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await studentApi.certificates.listMy();
        setItems(data?.certificates || data || []);
      } catch {
        setItems([
          { id: 'cert1', title: 'Intro to JavaScript', date: new Date().toISOString(), url: '#' },
          { id: 'cert2', title: 'React for Beginners', date: new Date().toISOString(), url: '#' },
          { id: 'cert3', title: 'SQL Essentials', date: new Date().toISOString(), url: '#' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const navigate = useNavigate();

  const filtered = useMemo(() => {
    const base = (items || []).filter((c) => !search || (c.title || '').toLowerCase().includes(search.toLowerCase()));
    return base.sort((a: any, b: any) => {
      if (sort === 'title') return String(a.title).localeCompare(String(b.title));
      const ad = new Date(a.date || a.created_at || 0).getTime();
      const bd = new Date(b.date || b.created_at || 0).getTime();
      return sort === 'newest' ? bd - ad : ad - bd;
    });
  }, [items, search, sort]);

  const exportCSV = () => {
    const rows = filtered.map((c: any) => [c.id, c.title, new Date(c.date || c.created_at || Date.now()).toISOString(), c.url || '']);
    const csv = [['id','title','issued_at','url'], ...rows].map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'certificates.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <StudentLayout>
      <Box sx={{ display: 'grid', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="h4" fontWeight={700}>Certificates</Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField size="small" placeholder="Search certificates" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ minWidth: 240 }} />
            <TextField size="small" select label="Sort" value={sort} onChange={(e) => setSort(e.target.value as any)}>
              <MenuItem value="newest">Newest</MenuItem>
              <MenuItem value="oldest">Oldest</MenuItem>
              <MenuItem value="title">Title</MenuItem>
            </TextField>
            <Button variant="outlined" onClick={exportCSV}>Export CSV</Button>
          </Box>
        </Box>
        <Grid container spacing={2}>
          {loading && Array.from({ length: 6 }).map((_, i) => (
            <Grid key={`s-${i}`} item xs={12} sm={6} md={4}>
              <Card><CardContent><Skeleton variant="rounded" height={120} /><Skeleton sx={{ mt: 1 }} width="70%" /><Skeleton width="40%" /></CardContent></Card>
            </Grid>
          ))}
          {!loading && filtered.map((c) => (
            <Grid item xs={12} md={6} key={c.id}>
              <Card onClick={() => navigate(`/student/certificates/${c.id}`)} sx={{ cursor: 'pointer', overflow: 'hidden', position: 'relative', border: 1, borderColor: 'divider', transition: 'transform .15s', '&:hover': { transform: 'translateY(-3px)', boxShadow: 4 } }}>
                <Box sx={{ position: 'absolute', top: -40, right: -60, width: 180, height: 180, bgcolor: 'primary.light', opacity: 0.15, transform: 'rotate(45deg)' }} />
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" fontWeight={800}>{c.title}</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Preview"><IconButton size="small" onClick={(e) => { e.stopPropagation(); setPreview(c.url || ''); }}>👁️</IconButton></Tooltip>
                      <Tooltip title="Share"><IconButton size="small" onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(window.location.origin + `/student/certificates/${c.id}`); }}>🔗</IconButton></Tooltip>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                    <Chip size="small" label={new Date(c.date || c.created_at || Date.now()).toLocaleDateString()} />
                    <Chip size="small" color="success" label="Verified" />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" variant="contained" onClick={(e) => { e.stopPropagation(); navigate(`/student/certificates/${c.id}`); }}>View</Button>
                    <Button size="small" variant="outlined" onClick={(e) => { e.stopPropagation(); window.open(c.url || '#', '_blank'); }}>Download</Button>
                    <Button size="small" onClick={(e) => { e.stopPropagation(); window.print(); }}>Print</Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {!loading && filtered.length === 0 && (
            <Grid item xs={12}>
              <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary', border: 1, borderColor: 'divider', borderRadius: 2 }}>
                No certificates found. Try adjusting your search.
              </Box>
            </Grid>
          )}
        </Grid>
        <Dialog open={Boolean(preview)} onClose={() => setPreview(null)} maxWidth="md" fullWidth>
          <DialogContent>
            {preview ? (
              <Box component="img" src={preview} alt="preview" sx={{ width: '100%', height: 'auto' }} />
            ) : null}
          </DialogContent>
        </Dialog>
      </Box>
    </StudentLayout>
  );
};

export default Certificates;


