import React from 'react';
import { Box, Card, CardContent, Typography, GridLegacy as Grid, Button, List, ListItem, ListItemText, Divider } from '@mui/material';
import UniversityLayout from '../components/layout/UniversityLayout';
import { universityApi } from '../services/universityApi';
import { Link } from 'react-router-dom';

const UniversityScholarships: React.FC = () => {
  const [items, setItems] = React.useState<any[]>([]);

  React.useEffect(() => {
    universityApi.listProviderScholarships().then((res: any) => {
      const normalized = Array.isArray(res)
        ? res
        : Array.isArray(res?.items)
        ? res.items
        : Array.isArray(res?.data)
        ? res.data
        : [];
      setItems(normalized);
    }).catch(() => setItems([]));
  }, []);

  return (
    <UniversityLayout>
      <Box mb={3} display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h5" fontWeight={700}>Scholarships</Typography>
          <Typography variant="body2" color="text.secondary">Manage your scholarships</Typography>
        </Box>
        <Button component={Link} to="/university/scholarships/create" variant="contained">Create Scholarship</Button>
      </Box>
      <Card>
        <CardContent>
          <List>
            {(items || []).map((s) => (
              <React.Fragment key={s.id}>
                <ListItem
                  secondaryAction={<Typography variant="caption" color="text.secondary">{s.awards_count ?? 0} awards</Typography>}
                >
                  <ListItemText primary={s.title} secondary={s.id} />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>
    </UniversityLayout>
  );
};

export default UniversityScholarships;



