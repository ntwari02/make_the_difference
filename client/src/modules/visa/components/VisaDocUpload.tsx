import React from 'react';
import { Box, Typography, Button, Stack, Chip } from '@mui/material';

interface FileItem {
  file: File;
  name: string;
  status: 'valid' | 'review' | 'missing';
  previewUrl?: string;
}

interface VisaDocUploadProps {
  onChange?: (files: FileItem[]) => void;
}

const VisaDocUpload: React.FC<VisaDocUploadProps> = ({ onChange }) => {
  const [items, setItems] = React.useState<FileItem[]>([]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const arr: FileItem[] = Array.from(files).map((f) => ({
      file: f,
      name: f.name,
      status: f.size > 0 && f.type.match(/image|pdf/) ? 'valid' : 'review',
      previewUrl: f.type.startsWith('image') ? URL.createObjectURL(f) : undefined,
    }));
    const next = [...items, ...arr];
    setItems(next);
    onChange?.(next);
  };

  const statusColor = (s: FileItem['status']) => (s === 'valid' ? 'success' : s === 'review' ? 'warning' : 'default');

  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>Upload Documents</Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Accepted: images (JPG/PNG) and PDF. Ensure clarity, unexpired, all pages included.
      </Typography>
      <Button variant="outlined" component="label">
        Choose Files
        <input hidden multiple type="file" accept="image/*,.pdf" onChange={(e) => handleFiles(e.target.files)} />
      </Button>
      <Stack spacing={1} sx={{ mt: 2 }}>
        {items.map((it, idx) => (
          <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {it.previewUrl ? (
              <img src={it.previewUrl} alt={it.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }} />
            ) : (
              <Box sx={{ width: 48, height: 48, bgcolor: 'action.hover', borderRadius: 1 }} />
            )}
            <Typography variant="body2" sx={{ flex: 1 }} noWrap title={it.name}>{it.name}</Typography>
            <Chip label={it.status === 'valid' ? 'Valid' : it.status === 'review' ? 'Needs Review' : 'Missing'} color={statusColor(it.status) as any} size="small" />
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default VisaDocUpload;


