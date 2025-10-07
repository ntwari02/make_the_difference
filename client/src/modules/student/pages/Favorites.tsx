import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Button } from '@mui/material';
import StudentLayout from '../components/layout/StudentLayout';
import { studentApi } from '../services/studentApi';

const Favorites: React.FC = () => {
  const [favorites, setFavorites] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await studentApi.listFavorites();
        setFavorites(data?.favorites || data || []);
      } catch {
        setFavorites([
          { id: 'f1', title: 'Advanced CSS', thumbnail: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=1200&auto=format&fit=crop' },
          { id: 'f2', title: 'Node.js APIs', thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop' },
        ]);
      }
    };
    load();
  }, []);

  return (
    <StudentLayout>
      <Box sx={{ display: 'grid', gap: 2 }}>
        <Typography variant="h4" fontWeight={700}>Favorites</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
          {favorites.map((c) => (
            <Card key={c.id} sx={{ cursor: 'pointer', transition: 'transform .15s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } }}>
              <Box component="img" src={c.thumbnail} alt={c.title} sx={{ width: '100%', height: 140, objectFit: 'cover' }} />
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700}>{c.title}</Typography>
                <Button size="small" variant="outlined">Remove</Button>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    </StudentLayout>
  );
};

export default Favorites;


