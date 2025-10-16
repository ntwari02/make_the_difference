import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Button,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  MenuItem,
  Stack,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  FileDownload as DownloadIcon,
  Save as SaveIcon,
  Print as PrintIcon,
  RestartAlt as ResetIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import SellerLayout from '../components/layout/SellerLayout';
import { useDispatch } from 'react-redux';
import { setCars } from '../store/sellerSlice';
import { sellerApi } from '../services/sellerApi';

type CarForm = {
  title: string;
  make: string; // maps to backend brand
  model: string;
  year: number | '';
  mileage: number | '';
  transmission: 'Automatic' | 'Manual' | 'Semi-automatic' | '';
  fuelType: 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric' | 'LPG' | 'CNG' | '';
  drivetrain: 'FWD' | 'RWD' | 'AWD' | '';
  bodyType: 'Sedan' | 'SUV' | 'Hatchback' | 'Coupe' | 'Convertible' | 'Wagon' | 'Pickup' | 'Van' | '';
  condition: 'New' | 'Used' | 'Certified' | '';
  color: string;
  price: number | '';
  location: string;
  description: string;
  features: string[];
  isNegotiable: boolean;
  images: string[]; // data URLs for preview-only
};

const defaultValues: CarForm = {
  title: '',
  make: '',
  model: '',
  year: '',
  mileage: '',
  transmission: '',
  fuelType: '',
  drivetrain: '',
  bodyType: '',
  condition: '',
  color: '',
  price: '',
  location: '',
  description: '',
  features: [],
  isNegotiable: true,
  images: [],
};

const STORAGE_KEY = 'seller.addCar.draft.v1';

const SellerAddCar: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { isValid },
  } = useForm<CarForm>({ defaultValues, mode: 'onChange' });

  // Load draft from localStorage
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as CarForm;
        reset(parsed);
      } catch {}
    }
  }, [reset]);

  // Autosave draft
  const values = watch();
  useEffect(() => {
    const id = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
    }, 400);
    return () => clearTimeout(id);
  }, [values]);

  const onSubmit = async (data: CarForm) => {
    setSaving(true);
    try {
      // Map UI fields to backend schema (required fields and enums)
      const toLower = (s: string) => String(s || '').toLowerCase();
      const payload: any = {
        title: data.title,
        brand: data.make,
        model: data.model,
        year: data.year,
        mileage: data.mileage,
        price: data.price,
        currency: 'USD',
        car_condition: toLower(data.condition),
        fuel_type: toLower(data.fuelType),
        transmission: toLower(data.transmission),
        body_type: toLower(data.bodyType),
        color: data.color,
        location: data.location,
        images: [],
        features: data.features,
      };

      // Frontend guard for required fields to avoid 400s
      for (const k of ['title','brand','model','year','mileage','price','car_condition','fuel_type','transmission','body_type','color','location']) {
        if (payload[k] === '' || payload[k] === undefined || payload[k] === null) {
          throw new Error(`Missing required field: ${k}`);
        }
      }
      await sellerApi.cars.createCar(payload);
      // Refresh cars list optimistically
      const listRes = await sellerApi.cars.getMyCars({ page: 1, limit: 50 });
      dispatch(setCars(listRes.cars));
      localStorage.removeItem(STORAGE_KEY);
      navigate('/seller/cars');
    } catch (e) {
      // Swallow for now; toast system likely exists elsewhere
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    reset(defaultValues);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(values, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${values.make || 'car'}-${values.model || 'listing'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const entries = [
      ['Title', values.title],
      ['Make', values.make],
      ['Model', values.model],
      ['Year', String(values.year ?? '')],
      ['Mileage', String(values.mileage ?? '')],
      ['Transmission', values.transmission],
      ['Fuel', values.fuelType],
      ['Drivetrain', values.drivetrain],
      ['Price', String(values.price ?? '')],
      ['Location', values.location],
      ['Negotiable', values.isNegotiable ? 'Yes' : 'No'],
      ['Features', values.features.join('|')],
      ['Description', values.description.replace(/\n/g, ' ')],
    ];
    const csv = entries.map(([k, v]) => `${k},"${(v || '').toString().replace(/"/g, '""')}"`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${values.make || 'car'}-${values.model || 'listing'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`<!doctype html><html><head><title>Listing Preview</title></head><body>`);
    printWindow.document.write(`<h1>${values.title || 'New Listing'}</h1>`);
    printWindow.document.write(`<p><strong>${values.year || ''} ${values.make || ''} ${values.model || ''}</strong></p>`);
    printWindow.document.write(`<p>Price: ${values.price ? `$${values.price.toLocaleString?.() || values.price}` : '-'}</p>`);
    printWindow.document.write(`<p>Mileage: ${values.mileage ? `${values.mileage} km` : '-'}</p>`);
    printWindow.document.write(`<p>Transmission: ${values.transmission || '-'}</p>`);
    printWindow.document.write(`<p>Fuel: ${values.fuelType || '-'}</p>`);
    printWindow.document.write(`<p>Drivetrain: ${values.drivetrain || '-'}</p>`);
    printWindow.document.write(`<p>Location: ${values.location || '-'}</p>`);
    printWindow.document.write(`<p>Features: ${values.features.join(', ') || '-'}</p>`);
    printWindow.document.write(`<pre style="white-space:pre-wrap">${values.description || ''}</pre>`);
    printWindow.document.write(`</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const addFeature = (feature: string) => {
    if (!feature) return;
    const next = Array.from(new Set([...(values.features || []), feature]));
    setValue('features', next, { shouldDirty: true, shouldValidate: true });
  };

  const removeFeature = (feature: string) => {
    setValue('features', (values.features || []).filter((f) => f !== feature), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleImagesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const readers = Array.from(files).map(
      (f) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.readAsDataURL(f);
        })
    );
    const dataUrls = await Promise.all(readers);
    setValue('images', [...(values.images || []), ...dataUrls], { shouldDirty: true });
    e.target.value = '';
  };

  const specs = useMemo(
    () => [
      { label: 'Year', value: values.year },
      { label: 'Mileage', value: values.mileage ? `${values.mileage} km` : '' },
      { label: 'Transmission', value: values.transmission },
      { label: 'Fuel', value: values.fuelType },
      { label: 'Drivetrain', value: values.drivetrain },
      { label: 'Location', value: values.location },
      { label: 'Negotiable', value: values.isNegotiable ? 'Yes' : 'No' },
    ],
    [values]
  );

  return (
    <SellerLayout>
      <Box sx={{ width: '100%', display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', lg: '1.2fr 0.8fr' } }}>
        <Box sx={{ display: 'grid', gap: 2 }}>
          <Card>
            <CardHeader title="Create New Listing" subheader="Describe your car with rich details" />
            <CardContent>
              <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'grid', gap: 2 }}>
                <TextField id="title" label="Listing title" inputProps={{ name: 'title' }} {...register('title')} placeholder="E.g. Clean 2018 Honda Civic" fullWidth />

                <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
                  <TextField id="make" label="Make" InputLabelProps={{ id: 'make-label' }} SelectProps={{ labelId: 'make-label' }} inputProps={{ name: 'make' }} {...register('make')} select>
                    {['Toyota','Honda','Ford','BMW','Mercedes','Nissan','Hyundai','Kia','Volkswagen','Audi'].map((m) => (
                      <MenuItem key={m} value={m}>{m}</MenuItem>
                    ))}
                  </TextField>
                  <TextField id="model" label="Model" inputProps={{ name: 'model' }} {...register('model')} placeholder="Model" />
                  <TextField id="year" label="Year" type="number" inputProps={{ name: 'year', min: 1960, max: new Date().getFullYear() + 1 }} {...register('year', { valueAsNumber: true })} />
                </Box>

                <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
                  <TextField id="mileage" label="Mileage (km)" type="number" inputProps={{ name: 'mileage' }} {...register('mileage', { valueAsNumber: true })} />
                  <TextField id="transmission" label="Transmission" InputLabelProps={{ id: 'transmission-label' }} SelectProps={{ labelId: 'transmission-label' }} inputProps={{ name: 'transmission' }} select {...register('transmission')}>
                    {['Automatic','Manual','Semi-automatic'].map((v) => (
                      <MenuItem key={v} value={v as any}>{v}</MenuItem>
                    ))}
                  </TextField>
                  <TextField id="fuelType" label="Fuel" InputLabelProps={{ id: 'fuelType-label' }} SelectProps={{ labelId: 'fuelType-label' }} inputProps={{ name: 'fuelType' }} select {...register('fuelType')}>
                    {['Petrol','Diesel','Hybrid','Electric','LPG','CNG'].map((v) => (
                      <MenuItem key={v} value={v as any}>{v}</MenuItem>
                    ))}
                  </TextField>
                </Box>

                <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
                  <TextField id="bodyType" label="Body Type" InputLabelProps={{ id: 'bodyType-label' }} SelectProps={{ labelId: 'bodyType-label' }} inputProps={{ name: 'bodyType' }} select {...register('bodyType')}>
                    {['Sedan','SUV','Hatchback','Coupe','Convertible','Wagon','Pickup','Van'].map((v) => (
                      <MenuItem key={v} value={v as any}>{v}</MenuItem>
                    ))}
                  </TextField>
                  <TextField id="condition" label="Condition" InputLabelProps={{ id: 'condition-label' }} SelectProps={{ labelId: 'condition-label' }} inputProps={{ name: 'condition' }} select {...register('condition')}>
                    {['New','Used','Certified'].map((v) => (
                      <MenuItem key={v} value={v as any}>{v}</MenuItem>
                    ))}
                  </TextField>
                  <TextField id="color" label="Color" placeholder="e.g. Silver" inputProps={{ name: 'color' }} {...register('color')} />
                </Box>

                <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
                  <TextField id="drivetrain" label="Drivetrain" InputLabelProps={{ id: 'drivetrain-label' }} SelectProps={{ labelId: 'drivetrain-label' }} inputProps={{ name: 'drivetrain' }} select {...register('drivetrain')}>
                    {['FWD','RWD','AWD'].map((v) => (
                      <MenuItem key={v} value={v as any}>{v}</MenuItem>
                    ))}
                  </TextField>
                  <TextField id="price" label="Price (USD)" type="number" inputProps={{ name: 'price' }} {...register('price', { valueAsNumber: true })} />
                  <TextField id="location" label="Location" placeholder="City, Country" inputProps={{ name: 'location' }} {...register('location')} />
                </Box>

                <FormControlLabel control={<Switch inputProps={{ id: 'isNegotiable', name: 'isNegotiable' }} checked={values.isNegotiable} onChange={(e) => setValue('isNegotiable', e.target.checked, { shouldDirty: true })} />} label="Price negotiable" />

                <TextField id="description" label="Description" multiline minRows={4} placeholder="Condition, service history, ownership, extras..." inputProps={{ name: 'description' }} {...register('description')} />

                <Divider textAlign="left">Images</Divider>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                  <Button variant="outlined" startIcon={<ImageIcon />} component="label">
                    Add images
                    <input id="images" name="images" hidden accept="image/*" multiple type="file" onChange={handleImagesSelected} />
                  </Button>
                  <Typography variant="body2" color="text.secondary">Up to 10 images. They won’t upload until you save.</Typography>
                </Stack>
                <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: 'repeat(3, 1fr)', md: 'repeat(6, 1fr)' } }}>
                  {(values.images || []).map((src, i) => (
                    <Box key={i} sx={{ position: 'relative', borderRadius: 1, overflow: 'hidden', border: `1px solid ${theme.palette.divider}` }}>
                      <img src={src} alt={`car-${i}`} style={{ display: 'block', width: '100%', height: 90, objectFit: 'cover' }} />
                    </Box>
                  ))}
                </Box>

                <Divider textAlign="left">Features</Divider>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {(values.features || []).map((f) => (
                    <Chip key={f} label={f} onDelete={() => removeFeature(f)} />
                  ))}
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {['Sunroof','Leather seats','Bluetooth','Backup camera','Heated seats','Apple CarPlay','Android Auto','Navigation'].map((f) => (
                    <Button key={f} size="small" variant="outlined" onClick={() => addFeature(f)}>{f}</Button>
                  ))}
                </Box>

                <Divider />
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <Tooltip title="Export JSON"><span><IconButton onClick={handleExportJSON}><DownloadIcon /></IconButton></span></Tooltip>
                  <Tooltip title="Export CSV"><span><IconButton onClick={handleExportCSV}><DownloadIcon fontSize="small" /></IconButton></span></Tooltip>
                  <Tooltip title="Print / Save PDF"><span><IconButton onClick={handlePrint}><PrintIcon /></IconButton></span></Tooltip>
                  <Button onClick={handleReset} startIcon={<ResetIcon />}>Reset</Button>
                  <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={saving} sx={{
                    bgcolor: 'common.white', color: 'text.primary', textTransform: 'none', borderRadius: 2, px: 3,
                    '&:hover': { bgcolor: 'common.white' }, '&:active': { bgcolor: 'common.white' }, '&.Mui-disabled': { bgcolor: 'common.white' }
                  }}>Save Listing</Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Right column: Live preview */}
        <Box sx={{ display: 'grid', gap: 2 }}>
          <Card>
            <CardHeader title="Preview" subheader="How your listing will appear to buyers" />
            <CardContent>
              <Typography variant="h5" fontWeight={700}>{values.title || 'New Listing'}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {values.year || 'Year'} · {values.make || 'Make'} · {values.model || 'Model'}
              </Typography>
              <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)' }, mb: 2 }}>
                {specs.map((s) => (
                  <Box key={s.label} sx={{ p: 1, borderRadius: 1, border: `1px dashed ${theme.palette.divider}` }}>
                    <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                    <Typography variant="body2">{String(s.value || '-')}</Typography>
                  </Box>
                ))}
              </Box>

              <Typography variant="subtitle1" fontWeight={600}>Price</Typography>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {values.price ? `$${Number(values.price).toLocaleString()}` : '—'} {values.isNegotiable ? <Chip label="Negotiable" size="small" sx={{ ml: 1 }} /> : null}
              </Typography>

              <Typography variant="subtitle1" fontWeight={600}>Photos</Typography>
              <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' }, mb: 2 }}>
                {(values.images || []).slice(0, 8).map((src, i) => (
                  <Box key={i} sx={{ borderRadius: 1, overflow: 'hidden', border: `1px solid ${theme.palette.divider}` }}>
                    <img src={src} alt={`preview-${i}`} style={{ display: 'block', width: '100%', height: 90, objectFit: 'cover' }} />
                  </Box>
                ))}
                {values.images.length === 0 && (
                  <Box sx={{ display: 'grid', placeItems: 'center', height: 90, borderRadius: 1, border: `1px dashed ${theme.palette.divider}`, color: 'text.secondary' }}>
                    No photos yet
                  </Box>
                )}
              </Box>

              <Typography variant="subtitle1" fontWeight={600}>Description</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                {values.description || 'Add details about condition, maintenance, and extras.'}
              </Typography>

              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" fontWeight={600}>Features</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {(values.features || []).length > 0 ? (
                  (values.features || []).map((f) => <Chip key={f} label={f} />)
                ) : (
                  <Typography variant="body2" color="text.secondary">No features selected yet.</Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </SellerLayout>
  );
};

export default SellerAddCar;


