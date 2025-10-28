import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Stack,
  Chip,
  GridLegacy as Grid,
  Button,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Rating,
  TextField
} from '@mui/material';
import { Edit, Share2, Mail, CalendarDays } from 'lucide-react';
import InstructorLayout from '../components/layout/InstructorLayout';

const InstructorProfile: React.FC = () => {
  const [editingBio, setEditingBio] = React.useState(false);
  const [bio, setBio] = React.useState('Educator with 10+ years experience in web development and computer science. Passionate about teaching React, TypeScript, and modern tooling.');
  const [skills, setSkills] = React.useState<string[]>(['React', 'TypeScript', 'Node.js']);

  const addSkill = () => {
    const s = prompt('Add a skill');
    if (s && !skills.includes(s)) setSkills([...skills, s]);
  };

  const removeSkill = (skill: string) => setSkills(skills.filter((x) => x !== skill));

  return (
    <InstructorLayout>
      <Grid container spacing={2}>
        {/* Left column */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ width: 72, height: 72, border: '3px solid white', mt: -7 }}>JD</Avatar>
                  <Box>
                    <Typography variant="h6">John Doe</Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" color="text.secondary">Senior Instructor</Typography>
                      <Divider orientation="vertical" flexItem />
                      <Rating value={4.7} precision={0.1} readOnly size="small" />
                      <Typography variant="caption" color="text.secondary">4.7</Typography>
                    </Box>
                    <Box mt={1} display="flex" gap={1} flexWrap="wrap">
                      {skills.map((s) => (
                        <Chip key={s} label={s} onDelete={() => removeSkill(s)} size="small" />
                      ))}
                      <Button size="small" onClick={addSkill}>Add Skill</Button>
                    </Box>
                  </Box>
                </Stack>
                <Box display="flex" alignItems="center" gap={1}>
                  <Button variant="outlined" startIcon={<Mail size={16} />}>Message</Button>
                  <Button variant="contained" startIcon={<CalendarDays size={16} />}>Schedule</Button>
                  <IconButton>
                    <Share2 size={18} />
                  </IconButton>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="h6">About</Typography>
                <IconButton onClick={() => setEditingBio((v) => !v)}>
                  <Edit size={18} />
                </IconButton>
              </Box>
              {editingBio ? (
                <Box>
                  <TextField fullWidth multiline minRows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
                  <Box mt={1} display="flex" gap={1}>
                    <Button variant="contained" size="small" onClick={() => setEditingBio(false)}>Save</Button>
                    <Button size="small" onClick={() => setEditingBio(false)}>Cancel</Button>
                  </Box>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">{bio}</Typography>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Courses</Typography>
              <List>
                {[{ t: 'React for Beginners', s: 1240 }, { t: 'Advanced TypeScript', s: 860 }, { t: 'Node.js APIs', s: 530 }].map((c, i) => (
                  <ListItem key={c.t} divider secondaryAction={<Typography variant="caption" color="text.secondary">{c.s} students</Typography>}>
                    <ListItemAvatar>
                      <Avatar>{i + 1}</Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={c.t} secondary="Updated last month" />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Right column */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Overview</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                    <CardContent>
                      <Typography variant="h6">12.3k</Typography>
                      <Typography variant="caption">Followers</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">4.7</Typography>
                      <Typography variant="caption">Rating</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">35</Typography>
                      <Typography variant="caption">Courses</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">2,630</Typography>
                      <Typography variant="caption">Reviews</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Recent Reviews</Typography>
              <List>
                {[{ n: 'Alice', r: 5, t: 'Great instructor!' }, { n: 'Bob', r: 4, t: 'Very detailed and helpful.' }].map((rv) => (
                  <ListItem key={rv.n} alignItems="flex-start" divider>
                    <ListItemAvatar>
                      <Avatar>{rv.n.charAt(0)}</Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={rv.n} secondaryTypographyProps={{ component: 'div' }} secondary={
                      <Box>
                        <Rating value={rv.r} readOnly size="small" />
                        <Typography variant="body2" color="text.secondary">{rv.t}</Typography>
                      </Box>
                    } />
                  </ListItem>
                ))}
              </List>
              <Box display="flex" justifyContent="flex-end">
                <Button size="small">View all</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </InstructorLayout>
  );
};

export default InstructorProfile;


