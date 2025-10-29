import React, { useEffect, useMemo, useState } from 'react';
import { Box, Card, CardContent, CardHeader, Typography, TextField, Button, Chip, Divider } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Save as SaveIcon, RestartAlt as ResetIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import SellerLayout from '../components/layout/SellerLayout';
import { sellerApi } from '../services/sellerApi';
import { useDispatch } from 'react-redux';
import { updateCar as updateCarInStore } from '../store/sellerSlice';
import PhotoUpload from '../../../shared/components/PhotoUpload';

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
      // Filter out base64 data URLs, only keep file paths (uploaded images)
      const imagePaths = (data.images || []).filter((img: string) => 
        img && !img.startsWith('data:') && (img.startsWith('/uploads/') || img.startsWith('http'))
      );
      
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
        images: imagePaths, // Include current images to replace existing ones
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
              <PhotoUpload
                images={values.images || []}
                onImagesChange={(imageUrls) => {
                  setValue('images', imageUrls, { shouldDirty: true });
                }}
                maxImages={10}
                maxFileSize={5}
                entityType="car"
                entityId={id}
                uploadEndpoint={id ? `/api/cars/${id}/images` : undefined}
                label="Car Images"
                description="Upload clear photos of the car. New uploads will replace existing images."
                aspectRatio="16/9"
                hideOverlayActions={false}
                replaceOnUpload={true}
              />

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


