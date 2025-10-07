import React, { useEffect, useMemo, useState } from 'react';
import { Box, Card, CardContent, CardHeader, Typography, TextField, Button, Chip, Divider, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Save as SaveIcon, RestartAlt as ResetIcon, Image as ImageIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import SellerLayout from '../components/layout/SellerLayout';
import { sellerApi } from '../services/sellerApi';
import { useDispatch } from 'react-redux';
import { updateCar as updateCarInStore } from '../store/sellerSlice';

type CarForm = {
  title: string;
  make: string;
  model: string;
  year: number | '';
  mileage: number | '';
  transmission: 'Automatic' | 'Manual' | '';
  fuelType: 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric' | '';
  drivetrain: 'FWD' | 'RWD' | 'AWD' | '';
  price: number | '';
  location: string;
  description: string;
  features: string[];
  isNegotiable: boolean;
  images: string[];
};

const emptyValues: CarForm = {
  title: '', make: '', model: '', year: '', mileage: '', transmission: '', fuelType: '', drivetrain: '', price: '', location: '', description: '', features: [], isNegotiable: true, images: [],
};

const SellerEditCar: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, watch, setValue, reset, formState: { isValid } } = useForm<CarForm>({ defaultValues: emptyValues, mode: 'onChange' });

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const car = await sellerApi.cars.getCar(id);
        // Map API car shape to form fields as best-effort
        reset({
          title: (car as any).title || `${(car as any).year || ''} ${(car as any).brand || (car as any).make || ''} ${(car as any).model || ''}`.trim(),
          make: (car as any).brand || (car as any).make || '',
          model: (car as any).model || '',
          year: (car as any).year || '',
          mileage: (car as any).mileage || '',
          transmission: ((car as any).transmission || '') as any,
          fuelType: ((car as any).fuel_type || (car as any).fuelType || '') as any,
          drivetrain: ((car as any).drivetrain || '') as any,
          price: (car as any).price || '',
          location: (car as any).location || '',
          description: (car as any).description || '',
          features: (car as any).features || [],
          isNegotiable: true,
          images: (car as any).images || [],
        });
      } catch (e) {
        // If API fails (e.g. mock id), set a simple mock
        reset({ ...emptyValues, title: 'Sample Car', make: 'Toyota', model: 'Corolla', year: 2019, mileage: 38000, transmission: 'Automatic', fuelType: 'Petrol', drivetrain: 'FWD', price: 15900, location: 'Chicago, IL', features: ['Bluetooth','Backup camera'] });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, reset]);

  const values = watch();

  const onSubmit = async (data: CarForm) => {
    if (!id) return;
    setSaving(true);
    try {
      const payload: any = {
        title: data.title,
        brand: data.make,
        model: data.model,
        year: data.year || undefined,
        mileage: data.mileage || undefined,
        transmission: data.transmission || undefined,
        fuel_type: data.fuelType || undefined,
        drivetrain: data.drivetrain || undefined,
        price: data.price || undefined,
        location: data.location,
        description: data.description,
        features: data.features,
      };
      const updated = await sellerApi.cars.updateCar(id, payload);
      dispatch(updateCarInStore(updated as any));
      navigate('/seller/cars');
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleImagesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const readers = Array.from(files).map((f) => new Promise<string>((resolve) => { const r = new FileReader(); r.onload = () => resolve(String(r.result)); r.readAsDataURL(f); }));
    const dataUrls = await Promise.all(readers);
    setValue('images', [...(values.images || []), ...dataUrls], { shouldDirty: true });
    e.target.value = '';
  };

  if (loading) {
    return (
      <SellerLayout>
        <Box sx={{ p: 3 }}>Loading…</Box>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout>
      <Box sx={{ width: '100%', display: 'grid', gap: 2 }}>
        <Card>
          <CardHeader title="Edit Listing" subheader={`Update your car details (${id})`} />
          <CardContent>
            <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'grid', gap: 2 }}>
              <TextField label="Listing title" {...register('title')} fullWidth />
              <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
                <TextField label="Make" {...register('make')} />
                <TextField label="Model" {...register('model')} />
                <TextField label="Year" type="number" {...register('year', { valueAsNumber: true })} />
              </Box>
              <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
                <TextField label="Mileage" type="number" {...register('mileage', { valueAsNumber: true })} />
                <TextField label="Transmission" {...register('transmission')} />
                <TextField label="Fuel" {...register('fuelType')} />
              </Box>
              <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
                <TextField label="Drivetrain" {...register('drivetrain')} />
                <TextField label="Price (USD)" type="number" {...register('price', { valueAsNumber: true })} />
                <TextField label="Location" {...register('location')} />
              </Box>
              <TextField label="Description" multiline minRows={4} {...register('description')} />

              <Divider textAlign="left">Images</Divider>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                <Button variant="outlined" startIcon={<ImageIcon />} component="label">
                  Add images
                  <input hidden accept="image/*" multiple type="file" onChange={handleImagesSelected} />
                </Button>
                <Typography variant="body2" color="text.secondary">Images are preview-only in this demo.</Typography>
              </Stack>
              <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: 'repeat(3, 1fr)', md: 'repeat(6, 1fr)' } }}>
                {(values.images || []).map((src, i) => (
                  <Box key={i} sx={{ position: 'relative', borderRadius: 1, overflow: 'hidden', border: `1px solid ${theme.palette.divider}` }}>
                    <img src={src} alt={`car-${i}`} style={{ display: 'block', width: '100%', height: 90, objectFit: 'cover' }} />
                  </Box>
                ))}
              </Box>

              <Divider />
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button onClick={() => navigate('/seller/cars')} startIcon={<ResetIcon />}>Cancel</Button>
                <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={saving || !isValid} sx={{
                  bgcolor: 'common.white', color: 'text.primary', textTransform: 'none', borderRadius: 2, px: 3,
                  '&:hover': { bgcolor: 'common.white' }, '&:active': { bgcolor: 'common.white' }, '&.Mui-disabled': { bgcolor: 'common.white' }
                }}>Save Changes</Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </SellerLayout>
  );
};

export default SellerEditCar;


