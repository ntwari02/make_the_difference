import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Button, IconButton } from '@mui/material';
import StudentLayout from '../components/layout/StudentLayout';
import { useParams } from 'react-router-dom';
import ShareIcon from '@mui/icons-material/Share';
import PrintIcon from '@mui/icons-material/Print';

const CertificateDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [cert, setCert] = useState<any>(null);

  useEffect(() => {
    setCert({ id, title: 'Certificate of Completion', name: 'Student Name', course: 'React for Beginners', date: new Date().toLocaleDateString(), url: '#' });
  }, [id]);

  return (
    <StudentLayout>
      <Box sx={{ display: 'grid', gap: 2 }}>
        <Typography variant="h4" fontWeight={700}>Certificate</Typography>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <IconButton onClick={() => window.print()}><PrintIcon /></IconButton>
              <IconButton onClick={async () => { try { await navigator.clipboard.writeText(window.location.href); alert('Link copied'); } catch {} }}><ShareIcon /></IconButton>
            </Box>
            <Box sx={{ p: 4, border: 1, borderColor: 'divider', borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="h5" fontWeight={800}>{cert?.title}</Typography>
              <Typography sx={{ mt: 2 }}>This is to certify that</Typography>
              <Typography variant="h4" fontWeight={900} sx={{ my: 1 }}>{cert?.name}</Typography>
              <Typography>has successfully completed</Typography>
              <Typography variant="h6" fontWeight={800} sx={{ my: 1 }}>{cert?.course}</Typography>
              <Typography>Date: {cert?.date}</Typography>
            </Box>
            <Button sx={{ mt: 2 }} variant="outlined" onClick={() => window.open(cert?.url || '#', '_blank')}>Download</Button>
          </CardContent>
        </Card>
      </Box>
    </StudentLayout>
  );
};

export default CertificateDetail;


