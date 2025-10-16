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
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  FileDownload as DownloadIcon,
  Save as SaveIcon,
  Print as PrintIcon,
  RestartAlt as ResetIcon,
  Image as ImageIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import SellerLayout from '../components/layout/SellerLayout';
import { useDispatch } from 'react-redux';
import { setCars } from '../store/sellerSlice';
import { sellerApi } from '../services/sellerApi';

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
  images: string[]; // data URLs for preview-only
  color: string;
  engine_size: string;
  horsepower: number | '';
  vin: string;
  // Spare part fields (mapped to backend)
  part_name?: string;
  part_description?: string;
  part_category_id?: string; // UUID
  part_brand_id?: string; // UUID
  part_price?: number | '';
  short_description?: string;
  part_number?: string;
  oem_number?: string;
  currency?: string;
  cost_price?: number | '';
  msrp?: number | '';
  weight?: number | '';
  dimensions?: string; // JSON string
  specifications?: string; // JSON string
  warranty_period?: number | '';
  warranty_type?: 'manufacturer' | 'seller' | 'extended' | '';
  condition?: 'new' | 'refurbished' | 'used' | 'remanufactured' | '';
  stock_quantity?: number | '';
  installation_difficulty?: 'easy' | 'medium' | 'hard' | 'professional' | '';
  estimated_installation_time?: number | '';
  installation_cost?: number | '';
  vehicle_compatibility?: string; // JSON string (array)
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
  price: '',
  location: '',
  description: '',
  features: [],
  isNegotiable: true,
  images: [],
  color: '',
  engine_size: '',
  horsepower: '',
  vin: '',
  part_name: '',
  part_description: '',
  part_category_id: '',
  part_brand_id: '',
  part_price: '',
  short_description: '',
  part_number: '',
  oem_number: '',
  currency: 'USD',
  cost_price: '',
  msrp: '',
  weight: '',
  dimensions: '',
  specifications: '',
  warranty_period: '',
  warranty_type: '',
  condition: '',
  stock_quantity: '',
  installation_difficulty: '',
  estimated_installation_time: '',
  installation_cost: '',
  vehicle_compatibility: '',
};

const STORAGE_KEY = 'seller.addCar.draft.v1';

const SellerAddCar: React.FC = () => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>(
    { open: false, message: '', severity: 'success' }
  );
  const [mode, setMode] = useState<'vehicle' | 'part'>('vehicle');
  const [vehicleImages, setVehicleImages] = useState<string[]>([]);
  const [partImages, setPartImages] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});

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
        const parsed = JSON.parse(raw) as Partial<CarForm>;
        // Ensure all fields are initialized to avoid uncontrolled->controlled warnings
        const safe: CarForm = { ...defaultValues, ...parsed } as CarForm;
        reset(safe);
      } catch {}
    }
  }, [reset]);

  // Autosave draft
  const values = watch();
  const [brands, setBrands] = useState<Array<{ id: string; name: string }>>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  useEffect(() => {
    const id = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
    }, 400);
    return () => clearTimeout(id);
  }, [values]);

  // Load spare part brands/categories for dropdowns and preview labels
  const [brandsLoading, setBrandsLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  
  // Mock data fallback
  const mockBrands = [
    { id: 'mock-bosch', name: 'Bosch' },
    { id: 'mock-continental', name: 'Continental' },
    { id: 'mock-denso', name: 'Denso' },
    { id: 'mock-ngk', name: 'NGK' },
    { id: 'mock-delphi', name: 'Delphi' },
    { id: 'mock-acdelco', name: 'ACDelco' },
    { id: 'mock-brembo', name: 'Brembo' },
    { id: 'mock-marelli', name: 'Magneti Marelli' },
    { id: 'mock-valeo', name: 'Valeo' },
    { id: 'mock-mann', name: 'Mann-Filter' }
  ];
  
  const mockCategories = [
    { id: 'mock-engine', name: 'Engine Parts' },
    { id: 'mock-brake', name: 'Brake System' },
    { id: 'mock-suspension', name: 'Suspension' },
    { id: 'mock-electrical', name: 'Electrical' },
    { id: 'mock-cooling', name: 'Cooling System' },
    { id: 'mock-exhaust', name: 'Exhaust' },
    { id: 'mock-filters', name: 'Filters' },
    { id: 'mock-body', name: 'Body & Interior' }
  ];
  
  useEffect(() => {
    let mounted = true;
    const loadMeta = async () => {
      try {
        console.log('Loading brands and categories...');
        setBrandsLoading(true);
        setCategoriesLoading(true);
        const [b, c] = await Promise.all([
          sellerApi.parts.getBrands().catch((e) => {
            console.error('Failed to load brands:', e);
            return mockBrands; // Fallback to mock data
          }),
          sellerApi.parts.getCategories().catch((e) => {
            console.error('Failed to load categories:', e);
            return mockCategories; // Fallback to mock data
          }),
        ]);
        if (!mounted) return;
        console.log('Loaded brands:', b);
        console.log('Loaded categories:', c);
        setBrands(Array.isArray(b) && b.length > 0 ? b : mockBrands);
        setCategories(Array.isArray(c) && c.length > 0 ? c : mockCategories);
        setBrandsLoading(false);
        setCategoriesLoading(false);
      } catch (e) {
        console.error('Error loading meta data:', e);
        // Use mock data as fallback
        setBrands(mockBrands);
        setCategories(mockCategories);
        setBrandsLoading(false);
        setCategoriesLoading(false);
      }
    };
    loadMeta(); // Load immediately on component mount
    return () => { mounted = false; };
  }, []); // Remove mode dependency

  const validateFields = (data: CarForm) => {
    const errors: Record<string, boolean> = {};
    
    if (mode === 'vehicle') {
      const titleCandidate = (data.title || `${data.make || ''} ${data.model || ''}`).trim();
      if (!titleCandidate || titleCandidate.length < 5) errors.title = true;
      if (!data.make) errors.make = true;
      if (!data.model) errors.model = true;
      const currentYear = new Date().getFullYear() + 1;
      if (!data.year || data.year < 1900 || data.year > currentYear) errors.year = true;
      if (data.mileage === '' || (typeof data.mileage === 'number' && data.mileage < 0)) errors.mileage = true;
      if (data.price === '' || (typeof data.price === 'number' && data.price < 0)) errors.price = true;
      if (!data.location || String(data.location).trim().length < 5) errors.location = true;
    } else {
      if (!data.part_name) errors.part_name = true;
      if (!data.part_category_id) errors.part_category_id = true;
      if (!data.part_brand_id) errors.part_brand_id = true;
      if (data.part_price === '' || (typeof data.part_price === 'number' && data.part_price <= 0)) errors.part_price = true;
    }
    
    return errors;
  };

  const onSubmit = async (data: CarForm) => {
    setSaving(true);
    setValidationErrors({});
    
    try {
      // Validate fields and show errors
      const errors = validateFields(data);
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        setFeedback({ open: true, message: 'Please fill in all required fields', severity: 'error' });
        setSaving(false);
        return;
      }

      if (mode === 'vehicle') {
        // Vehicle validation
        const titleCandidate = (data.title || `${data.make || ''} ${data.model || ''}`).trim();

        const payload = {
          title: titleCandidate,
          brand: data.make,
          model: data.model,
          year: data.year ? Number(data.year) : undefined,
          mileage: data.mileage ? Number(data.mileage) : 0,
          price: data.price ? Number(data.price) : 0,
          currency: 'USD',
          transmission: (data.transmission || '').toString().toLowerCase() === 'automatic' ? 'automatic' : (data.transmission || '').toString().toLowerCase() === 'manual' ? 'manual' : 'manual',
          fuel_type: (data.fuelType || '').toString().toLowerCase() || 'petrol',
          body_type: 'sedan',
          car_condition: 'used',
          color: data.color || 'Unknown',
          location: data.location,
          description: data.description || null,
          images: currentImages || [],
          features: Array.isArray(data.features) ? data.features : [],
          engine_size: data.engine_size || null,
          horsepower: data.horsepower ? Number(data.horsepower) : null,
          vin: data.vin || null,
        } as any;
        await sellerApi.cars.createCar(payload);
      } else {
        // Spare part validation
        if (!data.part_name) throw new Error('Part name is required');
        if (!data.part_category_id) throw new Error('Category ID is required');
        if (!data.part_brand_id) throw new Error('Brand ID is required');
        if (data.part_price === '' || (typeof data.part_price === 'number' && data.part_price <= 0)) throw new Error('Price must be a positive number');

        // Parse JSON fields safely
        const parseJson = (s?: string) => {
          if (!s) return undefined;
          try { const v = JSON.parse(s); return v; } catch { return undefined; }
        };

        const partPayload: any = {
          name: data.part_name,
          description: data.part_description || undefined,
          short_description: data.short_description || undefined,
          category_id: data.part_category_id,
          brand_id: data.part_brand_id,
          price: Number(data.part_price),
          currency: (data.currency || 'USD').toUpperCase().slice(0,3),
          images: currentImages || [],
          features: Array.isArray(data.features) ? data.features : [],
          part_number: data.part_number || undefined,
          oem_number: data.oem_number || undefined,
          cost_price: data.cost_price !== '' ? Number(data.cost_price) : undefined,
          msrp: data.msrp !== '' ? Number(data.msrp) : undefined,
          weight: data.weight !== '' ? Number(data.weight) : undefined,
          dimensions: parseJson(data.dimensions),
          specifications: parseJson(data.specifications),
          warranty_period: data.warranty_period !== '' ? Number(data.warranty_period) : undefined,
          warranty_type: data.warranty_type || undefined,
          condition: data.condition || undefined,
          stock_quantity: data.stock_quantity !== '' ? Number(data.stock_quantity) : undefined,
          installation_difficulty: data.installation_difficulty || undefined,
          estimated_installation_time: data.estimated_installation_time !== '' ? Number(data.estimated_installation_time) : undefined,
          installation_cost: data.installation_cost !== '' ? Number(data.installation_cost) : undefined,
          vehicle_compatibility: parseJson(data.vehicle_compatibility),
        };
        await sellerApi.parts.createPart(partPayload);
      }
      // Refresh cars list optimistically
      const listRes = await sellerApi.cars.getMyCars({ page: 1, limit: 50 });
      dispatch(setCars(listRes.cars));
      // Clear draft and reset the form for a fresh entry
      localStorage.removeItem(STORAGE_KEY);
      reset(defaultValues);
      setVehicleImages([]);
      setPartImages([]);
      setFeedback({ open: true, message: mode === 'vehicle' ? 'Vehicle listing saved' : 'Spare part saved', severity: 'success' });
    } catch (e: any) {
      const apiErrors = e?.response?.data || e?.message || e;
      const msg = typeof apiErrors === 'string'
        ? apiErrors
        : (apiErrors?.error || apiErrors?.message || apiErrors?.errors?.[0]?.msg || 'Failed to save listing');
      console.error('Create car failed:', String(msg), apiErrors);
      setFeedback({ open: true, message: String(msg), severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    reset(defaultValues);
    setVehicleImages([]);
    setPartImages([]);
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
    await processImageFiles(Array.from(files));
    e.target.value = '';
  };

  const processImageFiles = async (files: File[]) => {
    const readers = files.map(
      (f) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.readAsDataURL(f);
        })
    );
    const dataUrls = await Promise.all(readers);
    
    if (mode === 'vehicle') {
      setVehicleImages(prev => [...prev, ...dataUrls]);
    } else {
      setPartImages(prev => [...prev, ...dataUrls]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      await processImageFiles(files);
    }
  };

  const removeImage = (index: number) => {
    if (mode === 'vehicle') {
      setVehicleImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setPartImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const clearFieldError = (fieldName: string) => {
    if (validationErrors[fieldName]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const getFieldErrorStyle = (fieldName: string) => {
    return validationErrors[fieldName] ? {
      '& .MuiOutlinedInput-root': {
        borderColor: 'error.main',
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: 'error.main',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: 'error.main',
        },
      },
      '& .MuiInputLabel-root': {
        color: 'error.main',
      },
    } : {};
  };

  const currentImages = mode === 'vehicle' ? vehicleImages : partImages;

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
    <>
    <SellerLayout>
      <Box sx={{ width: '100%', display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', lg: '1.2fr 0.8fr' } }}>
        <Box sx={{ display: 'grid', gap: 2 }}>
          <Card>
            <CardHeader title="🚗 Create New Listing" subheader={mode === 'vehicle' ? '🚙 Describe your car with rich details' : '🔧 Add a spare part with accurate details'} />
            <CardContent>
              <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'grid', gap: { xs: 1.5, sm: 2 } }}>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button variant={mode === 'vehicle' ? 'contained' : 'outlined'} onClick={() => setMode('vehicle')} size={isSmall ? 'small' : 'medium'}>🚗 Vehicle</Button>
                  <Button variant={mode === 'part' ? 'contained' : 'outlined'} onClick={() => setMode('part')} size={isSmall ? 'small' : 'medium'}>🔧 Spare Part</Button>
                </Box>

                {mode === 'vehicle' ? (
                  <TextField size={isSmall ? 'small' : 'medium'} label="📝 Listing title" {...register('title')} placeholder="E.g. Clean 2018 Honda Civic" fullWidth sx={getFieldErrorStyle('title')} />
                ) : (
                  <TextField size={isSmall ? 'small' : 'medium'} label="🔧 Part name" {...register('part_name')} placeholder="e.g., Front brake pads" fullWidth sx={getFieldErrorStyle('part_name')} />
                )}

                {mode === 'vehicle' ? (
                <Box sx={{ display: 'grid', gap: { xs: 1.5, sm: 2 }, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
                  <TextField size={isSmall ? 'small' : 'medium'} label="🏭 Make" {...register('make')} select sx={getFieldErrorStyle('make')}>
                    {['Toyota','Honda','Ford','BMW','Mercedes','Nissan','Hyundai','Kia','Volkswagen','Audi'].map((m) => (
                      <MenuItem key={m} value={m}>{m}</MenuItem>
                    ))}
                  </TextField>
                  <TextField size={isSmall ? 'small' : 'medium'} label="🚗 Model" {...register('model')} placeholder="Model" sx={getFieldErrorStyle('model')} />
                  <TextField size={isSmall ? 'small' : 'medium'} label="📅 Year" type="number" inputProps={{ min: 1960, max: new Date().getFullYear() + 1 }} {...register('year', { valueAsNumber: true })} sx={getFieldErrorStyle('year')} />
                </Box>
                ) : (
                <Box sx={{ display: 'grid', gap: { xs: 1.5, sm: 2 }, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
                  <TextField
                    size={isSmall ? 'small' : 'medium'}
                    label="📂 Category"
                    select
                    {...register('part_category_id', { required: true })}
                    sx={getFieldErrorStyle('part_category_id')}
                    helperText={validationErrors.part_category_id ? 'Category is required' : ''}
                  >
                    {categoriesLoading ? (
                      <MenuItem disabled>Loading...</MenuItem>
                    ) : categories.length === 0 ? (
                      <MenuItem disabled>No categories available</MenuItem>
                    ) : (
                      categories.map((c) => (
                        <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                      ))
                    )}
                  </TextField>
                  <TextField
                    size={isSmall ? 'small' : 'medium'}
                    label="🏷️ Brand"
                    select
                    {...register('part_brand_id', { required: true })}
                    sx={getFieldErrorStyle('part_brand_id')}
                    helperText={validationErrors.part_brand_id ? 'Brand is required' : ''}
                  >
                    {brandsLoading ? (
                      <MenuItem disabled>Loading...</MenuItem>
                    ) : brands.length === 0 ? (
                      <MenuItem disabled>No brands available</MenuItem>
                    ) : (
                      brands.map((b) => (
                        <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
                      ))
                    )}
                  </TextField>
                  <TextField size={isSmall ? 'small' : 'medium'} label="💰 Price" type="number" {...register('part_price', { valueAsNumber: true })} sx={getFieldErrorStyle('part_price')} />
                </Box>
                )}

                {mode === 'vehicle' ? (
                <Box sx={{ display: 'grid', gap: { xs: 1.5, sm: 2 }, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
                  <TextField size={isSmall ? 'small' : 'medium'} label="🛣️ Mileage (km)" type="number" {...register('mileage', { valueAsNumber: true })} sx={getFieldErrorStyle('mileage')} />
                  <TextField size={isSmall ? 'small' : 'medium'} label="⚙️ Transmission" select {...register('transmission')}>
                    {['Automatic','Manual'].map((v) => (
                      <MenuItem key={v} value={v as any}>{v}</MenuItem>
                    ))}
                  </TextField>
                  <TextField size={isSmall ? 'small' : 'medium'} label="⛽ Fuel" select {...register('fuelType')}>
                    {['Petrol','Diesel','Hybrid','Electric'].map((v) => (
                      <MenuItem key={v} value={v as any}>{v}</MenuItem>
                    ))}
                  </TextField>
                </Box>
                ) : null}

                {mode === 'vehicle' ? (
                <Box sx={{ display: 'grid', gap: { xs: 1.5, sm: 2 }, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
                  <TextField size={isSmall ? 'small' : 'medium'} label="🚗 Drivetrain" select {...register('drivetrain')}>
                    {['FWD','RWD','AWD'].map((v) => (
                      <MenuItem key={v} value={v as any}>{v}</MenuItem>
                    ))}
                  </TextField>
                  <TextField size={isSmall ? 'small' : 'medium'} label="💰 Price (USD)" type="number" {...register('price', { valueAsNumber: true })} sx={getFieldErrorStyle('price')} />
                  <TextField size={isSmall ? 'small' : 'medium'} label="📍 Location" placeholder="City, Country" {...register('location')} sx={getFieldErrorStyle('location')} />
                </Box>
                ) : null}

                {mode === 'vehicle' ? (
                  <Box sx={{ display: 'grid', gap: { xs: 1.5, sm: 2 }, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
                    <TextField size={isSmall ? 'small' : 'medium'} label="🎨 Color" placeholder="e.g., Red" {...register('color')} />
                    <TextField size={isSmall ? 'small' : 'medium'} label="🔧 Engine size" placeholder="e.g., 2.0L" {...register('engine_size')} />
                    <TextField size={isSmall ? 'small' : 'medium'} label="🐎 Horsepower" type="number" {...register('horsepower', { valueAsNumber: true })} />
                  </Box>
                ) : (
                  <>
                    <TextField size={isSmall ? 'small' : 'medium'} label="📝 Short description" placeholder="Brief details" {...register('short_description')} multiline minRows={2} />
                    <Box sx={{ display: 'grid', gap: { xs: 1.5, sm: 2 }, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
                      <TextField size={isSmall ? 'small' : 'medium'} label="🔢 Part number" placeholder="e.g., BP-1234" {...register('part_number')} />
                      <TextField size={isSmall ? 'small' : 'medium'} label="🏭 OEM number" placeholder="e.g., OEM-5678" {...register('oem_number')} />
                      <TextField size={isSmall ? 'small' : 'medium'} label="💱 Currency" placeholder="USD" inputProps={{ maxLength: 3 }} {...register('currency')} />
                    </Box>
                    <Box sx={{ display: 'grid', gap: { xs: 1.5, sm: 2 }, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
                      <TextField size={isSmall ? 'small' : 'medium'} label="💵 Cost price" type="number" {...register('cost_price', { valueAsNumber: true })} />
                      <TextField size={isSmall ? 'small' : 'medium'} label="🏷️ MSRP" type="number" {...register('msrp', { valueAsNumber: true })} />
                      <TextField size={isSmall ? 'small' : 'medium'} label="⚖️ Weight (kg)" type="number" {...register('weight', { valueAsNumber: true })} />
                    </Box>
                    <TextField size={isSmall ? 'small' : 'medium'} label="📏 Dimensions (JSON)" placeholder='{"length": 30, "width": 20, "height": 10}' {...register('dimensions')} />
                    <TextField size={isSmall ? 'small' : 'medium'} label="📋 Specifications (JSON)" placeholder='{"material": "steel"}' {...register('specifications')} />
                    <Box sx={{ display: 'grid', gap: { xs: 1.5, sm: 2 }, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
                      <TextField size={isSmall ? 'small' : 'medium'} label="🛡️ Warranty period (months)" type="number" {...register('warranty_period', { valueAsNumber: true })} />
                      <TextField size={isSmall ? 'small' : 'medium'} label="📜 Warranty type" select {...register('warranty_type')}>
                        {['manufacturer','seller','extended'].map((v) => (
                          <MenuItem key={v} value={v as any}>{v}</MenuItem>
                        ))}
                      </TextField>
                      <TextField size={isSmall ? 'small' : 'medium'} label="🔍 Condition" select {...register('condition')}>
                        {['new','refurbished','used','remanufactured'].map((v) => (
                          <MenuItem key={v} value={v as any}>{v}</MenuItem>
                        ))}
                      </TextField>
                    </Box>
                    <Box sx={{ display: 'grid', gap: { xs: 1.5, sm: 2 }, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
                      <TextField size={isSmall ? 'small' : 'medium'} label="📦 Stock quantity" type="number" {...register('stock_quantity', { valueAsNumber: true })} />
                      <TextField size={isSmall ? 'small' : 'medium'} label="🔧 Installation difficulty" select {...register('installation_difficulty')}>
                        {['easy','medium','hard','professional'].map((v) => (
                          <MenuItem key={v} value={v as any}>{v}</MenuItem>
                        ))}
                      </TextField>
                      <TextField size={isSmall ? 'small' : 'medium'} label="⏱️ Est. installation time (min)" type="number" {...register('estimated_installation_time', { valueAsNumber: true })} />
                    </Box>
                    <Box sx={{ display: 'grid', gap: { xs: 1.5, sm: 2 }, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
                      <TextField size={isSmall ? 'small' : 'medium'} label="💰 Installation cost" type="number" {...register('installation_cost', { valueAsNumber: true })} />
                      <TextField size={isSmall ? 'small' : 'medium'} label="🚗 Vehicle compatibility (JSON array)" placeholder='[{"make":"Toyota","model":"Corolla","year":2019}]' {...register('vehicle_compatibility')} />
                    </Box>
                  </>
                )}

                {mode === 'vehicle' ? (
                  <Box sx={{ display: 'grid', gap: { xs: 1.5, sm: 2 }, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
                    <TextField size={isSmall ? 'small' : 'medium'} label="🆔 VIN" placeholder="17-character VIN" {...register('vin')} />
                  </Box>
                ) : null}

                {mode === 'vehicle' ? (
                  <FormControlLabel control={<Switch checked={values.isNegotiable} onChange={(e) => setValue('isNegotiable', e.target.checked, { shouldDirty: true })} />} label="💰 Price negotiable" />
                ) : null}

                {mode === 'vehicle' ? (
                  <TextField size={isSmall ? 'small' : 'medium'} label="📝 Description" multiline minRows={4} placeholder="Condition, service history, ownership, extras..." {...register('description')} />
                ) : null}

                <Divider textAlign="left">📸 Images</Divider>
                <Box
                  component="label"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  sx={{
                    border: `2px dashed ${theme.palette.divider}`,
                    borderRadius: 2,
                    p: 3,
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 56,
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      backgroundColor: theme.palette.action.hover,
                    },
                    '&.drag-over': {
                      borderColor: theme.palette.primary.main,
                      backgroundColor: theme.palette.action.hover,
                    }
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <ImageIcon color="action" />
                    <Typography variant="body1" color="text.secondary">
                      Drag and drop images here or click to browse
                    </Typography>
                  </Stack>
                  <input hidden accept="image/*" multiple type="file" onChange={handleImagesSelected} />
                </Box>

                {mode === 'vehicle' && (
                  <>
                    <Divider textAlign="left">⭐ Features</Divider>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {(values.features || []).map((f) => (
                        <Chip key={f} label={f} onDelete={() => removeFeature(f)} />
                      ))}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {['Sunroof','Leather seats','Bluetooth','Backup camera','Heated seats','Apple CarPlay','Android Auto','Navigation'].map((f) => (
                        <Button key={f} size={isSmall ? 'small' : 'medium'} variant="outlined" onClick={() => addFeature(f)} sx={{ flex: { xs: '1 1 48%', sm: '0 0 auto' } }}>{f}</Button>
                      ))}
                    </Box>
                  </>
                )}

                <Divider />
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: { xs: 'stretch', md: 'flex-end' } }}>
                  <Tooltip title="📄 Export JSON"><span><IconButton size={isSmall ? 'small' : 'medium'} onClick={handleExportJSON}><DownloadIcon /></IconButton></span></Tooltip>
                  <Tooltip title="📊 Export CSV"><span><IconButton size={isSmall ? 'small' : 'medium'} onClick={handleExportCSV}><DownloadIcon fontSize="small" /></IconButton></span></Tooltip>
                  <Tooltip title="🖨️ Print / Save PDF"><span><IconButton size={isSmall ? 'small' : 'medium'} onClick={handlePrint}><PrintIcon /></IconButton></span></Tooltip>
                  <Button size={isSmall ? 'small' : 'medium'} onClick={handleReset} startIcon={<ResetIcon />} sx={{ flex: { xs: '1 1 48%', md: '0 0 auto' } }}>🔄 Reset</Button>
                  <Button size={isSmall ? 'small' : 'medium'} type="submit" variant="contained" startIcon={<SaveIcon />} disabled={saving || !isValid} sx={{
                    flex: { xs: '1 1 100%', md: '0 0 auto' }, textTransform: 'none', borderRadius: 2, px: 3
                  }}>💾 Save Listing</Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Right column: Live preview */}
        <Box sx={{ display: 'grid', gap: 2 }}>
          <Card>
            <CardHeader title="👁️ Preview" subheader={mode === 'vehicle' ? '🚗 How your vehicle listing will appear to buyers' : '🔧 How your spare part listing will appear to buyers'} />
            <CardContent>
              {mode === 'vehicle' ? (
                <>
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
                  <Typography variant="subtitle1" fontWeight={600}>💰 Price</Typography>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    {values.price ? `$${Number(values.price).toLocaleString()}` : '—'} {values.isNegotiable ? <Chip label="Negotiable" size="small" sx={{ ml: 1 }} /> : null}
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={600}>📸 Photos</Typography>
                  <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' }, mb: 2 }}>
                    {(vehicleImages || []).map((src, i) => (
                      <Box key={i} sx={{ borderRadius: 1, overflow: 'hidden', border: `1px solid ${theme.palette.divider}` }}>
                        <img src={src} alt={`preview-${i}`} style={{ display: 'block', width: '100%', height: 90, objectFit: 'cover' }} />
                      </Box>
                    ))}
                    {vehicleImages.length === 0 && (
                      <Box sx={{ display: 'grid', placeItems: 'center', height: 90, borderRadius: 1, border: `1px dashed ${theme.palette.divider}`, color: 'text.secondary' }}>
                        No photos yet
                      </Box>
                    )}
                  </Box>
                  <Typography variant="subtitle1" fontWeight={600}>📝 Description</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                    {values.description || 'Add details about condition, maintenance, and extras.'}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  {mode === 'vehicle' && (
                    <>
                      <Typography variant="subtitle1" fontWeight={600}>⭐ Features</Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {(values.features || []).length > 0 ? (
                          (values.features || []).map((f) => <Chip key={f} label={f} />)
                        ) : (
                          <Typography variant="body2" color="text.secondary">No features selected yet.</Typography>
                        )}
                      </Box>
                    </>
                  )}
                </>
              ) : (
                <>
                  <Typography variant="h5" fontWeight={700}>{values.part_name || 'New Spare Part'}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {(() => {
                      const brandName = brands.find(b => b.id === values.part_brand_id)?.name || 'Unknown brand';
                      const categoryName = categories.find(c => c.id === values.part_category_id)?.name || 'Unknown category';
                      return `${brandName} · ${categoryName}`;
                    })()}
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={600}>💰 Price</Typography>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    {values.part_price ? `$${Number(values.part_price).toLocaleString()}` : '—'}
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={600}>📸 Photos</Typography>
                  <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' }, mb: 2 }}>
                    {(partImages || []).map((src, i) => (
                      <Box key={i} sx={{ borderRadius: 1, overflow: 'hidden', border: `1px solid ${theme.palette.divider}` }}>
                        <img src={src} alt={`preview-${i}`} style={{ display: 'block', width: '100%', height: 90, objectFit: 'cover' }} />
                      </Box>
                    ))}
                    {partImages.length === 0 && (
                      <Box sx={{ display: 'grid', placeItems: 'center', height: 90, borderRadius: 1, border: `1px dashed ${theme.palette.divider}`, color: 'text.secondary' }}>
                        No photos yet
                      </Box>
                    )}
                  </Box>
                  <Typography variant="subtitle1" fontWeight={600}>📝 Short description</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                    {values.short_description || 'Add a short description for this part.'}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </SellerLayout>
    
    <Snackbar
      open={feedback.open}
      autoHideDuration={2500}
      onClose={() => setFeedback((f) => ({ ...f, open: false }))}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={() => setFeedback((f) => ({ ...f, open: false }))} severity={feedback.severity} sx={{ width: '100%' }}>
        {feedback.message}
      </Alert>
    </Snackbar>
    </>
  );
};

export default SellerAddCar;


