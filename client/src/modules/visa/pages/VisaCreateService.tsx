import React from 'react';
import { Box, Card, CardContent, Typography, GridLegacy as Grid, TextField, Button, MenuItem, Switch, FormControlLabel, Chip, IconButton, Alert, Divider } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import VisaLayout from '../components/layout/VisaLayout';
import { visaApi } from '../services/visaApi';

const VisaCreateService: React.FC = () => {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [country, setCountry] = React.useState('');
  const [visaType, setVisaType] = React.useState('');
  const [processingTime, setProcessingTime] = React.useState('');
  const [applicationFee, setApplicationFee] = React.useState('');
  const [currency, setCurrency] = React.useState('USD');
  const [validityMonths, setValidityMonths] = React.useState('');
  const [maxStayDays, setMaxStayDays] = React.useState('');
  const [requiresAppointment, setRequiresAppointment] = React.useState(false);
  const [supportsOnlineSubmission, setSupportsOnlineSubmission] = React.useState(true);
  const [eligibility, setEligibility] = React.useState('');
  const [documents, setDocuments] = React.useState<string[]>(['Passport (6+ months validity)', 'Passport photo (recent)', 'Proof of funds']);
  const [docInput, setDocInput] = React.useState('');
  const [terms, setTerms] = React.useState('');
  const [refundPolicy, setRefundPolicy] = React.useState('');
  const [contactEmail, setContactEmail] = React.useState('');
  const [contactPhone, setContactPhone] = React.useState('');
  const [locations, setLocations] = React.useState<string[]>([]);
  const [locationInput, setLocationInput] = React.useState('');
  const [categories, setCategories] = React.useState<string[]>(['Tourist']);
  const [categoryInput, setCategoryInput] = React.useState('');
  const [regions, setRegions] = React.useState<string[]>([]);
  const [regionInput, setRegionInput] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent, asDraft: boolean = false) => {
    e.preventDefault();
    setError(null);
    if (!title || !description || !country || !visaType) {
      setError('Please fill all required fields (Title, Description, Country, Visa Type).');
      return;
    }
    const payload = {
      title,
      description,
      country,
      visa_type: visaType,
      processing_time: processingTime,
      fee_amount: applicationFee ? Number(applicationFee) : undefined,
      fee_currency: currency,
      validity_months: validityMonths ? Number(validityMonths) : undefined,
      max_stay_days: maxStayDays ? Number(maxStayDays) : undefined,
      requires_appointment: requiresAppointment,
      online_submission: supportsOnlineSubmission,
      eligibility,
      required_documents: documents,
      terms,
      refund_policy: refundPolicy,
      contact_email: contactEmail || undefined,
      contact_phone: contactPhone || undefined,
      locations,
      categories,
      regions,
      status: asDraft ? 'draft' : 'active',
    };
    await visaApi.createService(payload);
    window.location.assign('/visa/services');
  };

  return (
    <VisaLayout>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={700}>Create Visa Service</Typography>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={(e) => handleSubmit(e)}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth label="Title *" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Description *" value={description} onChange={(e) => setDescription(e.target.value)} multiline minRows={4} required />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Country *" value={country} onChange={(e) => setCountry(e.target.value)} required />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Visa Type *" value={visaType} onChange={(e) => setVisaType(e.target.value)} required />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Processing Time (e.g., 10-15 days)" value={processingTime} onChange={(e) => setProcessingTime(e.target.value)} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth type="number" label="Application Fee" value={applicationFee} onChange={(e) => setApplicationFee(e.target.value)} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth select label="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  {['USD','EUR','GBP','KES','TZS','UGX'].map((c) => (
                    <MenuItem key={c} value={c}>{c}</MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField fullWidth type="number" label="Validity (months)" value={validityMonths} onChange={(e) => setValidityMonths(e.target.value)} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth type="number" label="Max Stay (days)" value={maxStayDays} onChange={(e) => setMaxStayDays(e.target.value)} />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel control={<Switch checked={requiresAppointment} onChange={(e) => setRequiresAppointment(e.target.checked)} />} label="Requires In-Person Appointment" />
                <FormControlLabel sx={{ ml: 2 }} control={<Switch checked={supportsOnlineSubmission} onChange={(e) => setSupportsOnlineSubmission(e.target.checked)} />} label="Supports Online Submission" />
              </Grid>

              <Grid item xs={12}>
                <TextField fullWidth label="Eligibility" value={eligibility} onChange={(e) => setEligibility(e.target.value)} multiline minRows={3} placeholder="Who can apply, age, background, etc." />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>Required Documents</Typography>
                <Box display="flex" gap={1} alignItems="center" mb={1}>
                  <TextField fullWidth size="small" placeholder="Add a required document..." value={docInput} onChange={(e) => setDocInput(e.target.value)} />
                  <IconButton aria-label="add" color="primary" onClick={() => { if (docInput.trim()) { setDocuments([...documents, docInput.trim()]); setDocInput(''); }}}>
                    <AddIcon />
                  </IconButton>
                </Box>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {documents.map((d, i) => (
                    <Chip key={`${d}-${i}`} label={d} onDelete={() => setDocuments(documents.filter((_, idx) => idx !== i))} deleteIcon={<DeleteIcon />} />
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <TextField fullWidth label="Terms & Conditions" value={terms} onChange={(e) => setTerms(e.target.value)} multiline minRows={3} placeholder="Refund rules, rescheduling, compliance, etc." />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Refund Policy" value={refundPolicy} onChange={(e) => setRefundPolicy(e.target.value)} multiline minRows={2} />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Contact Email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Contact Phone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>Application Centers / Locations</Typography>
                <Box display="flex" gap={1} alignItems="center" mb={1}>
                  <TextField fullWidth size="small" placeholder="Add a location (city/center)..." value={locationInput} onChange={(e) => setLocationInput(e.target.value)} />
                  <IconButton aria-label="add" color="primary" onClick={() => { if (locationInput.trim()) { setLocations([...locations, locationInput.trim()]); setLocationInput(''); }}}>
                    <AddIcon />
                  </IconButton>
                </Box>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {locations.map((d, i) => (
                    <Chip key={`${d}-${i}`} label={d} onDelete={() => setLocations(locations.filter((_, idx) => idx !== i))} deleteIcon={<DeleteIcon />} />
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>Categories</Typography>
                <Box display="flex" gap={1} alignItems="center" mb={1}>
                  <TextField fullWidth size="small" placeholder="Add category (e.g., Tourist, Work, Student)" value={categoryInput} onChange={(e) => setCategoryInput(e.target.value)} />
                  <IconButton aria-label="add" color="primary" onClick={() => { if (categoryInput.trim()) { setCategories([...categories, categoryInput.trim()]); setCategoryInput(''); }}}>
                    <AddIcon />
                  </IconButton>
                </Box>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {categories.map((d, i) => (
                    <Chip key={`${d}-${i}`} label={d} onDelete={() => setCategories(categories.filter((_, idx) => idx !== i))} deleteIcon={<DeleteIcon />} />
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>Regions Served</Typography>
                <Box display="flex" gap={1} alignItems="center" mb={1}>
                  <TextField fullWidth size="small" placeholder="Add region (e.g., East Africa, EU)" value={regionInput} onChange={(e) => setRegionInput(e.target.value)} />
                  <IconButton aria-label="add" color="primary" onClick={() => { if (regionInput.trim()) { setRegions([...regions, regionInput.trim()]); setRegionInput(''); }}}>
                    <AddIcon />
                  </IconButton>
                </Box>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {regions.map((d, i) => (
                    <Chip key={`${d}-${i}`} label={d} onDelete={() => setRegions(regions.filter((_, idx) => idx !== i))} deleteIcon={<DeleteIcon />} />
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" gap={1}>
                  <Button type="submit" variant="contained">Create</Button>
                  <Button type="button" variant="outlined" onClick={(e) => handleSubmit(e as any, true)}>Save Draft</Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Preview</Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="overline" color="text.secondary">Title</Typography>
              <Typography variant="h6" fontWeight={700} gutterBottom>{title || 'Untitled Service'}</Typography>
              <Typography variant="overline" color="text.secondary">Description</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>{description || '—'}</Typography>
              <Box display="flex" gap={1} flexWrap="wrap" my={1}>
                {country && <Chip label={country} />}
                {visaType && <Chip label={visaType} variant="outlined" />}
                {processingTime && <Chip label={`Processing: ${processingTime}`} />}
                {applicationFee && <Chip label={`Fee: ${applicationFee} ${currency}`} />}
              </Box>
              {(categories.length > 0 || regions.length > 0) && (
                <Box my={1}>
                  <Typography variant="overline" color="text.secondary">Tags</Typography>
                  <Box display="flex" gap={1} flexWrap="wrap" mt={0.5}>
                    {categories.map((c, i) => (<Chip key={`c-${i}`} label={c} size="small" />))}
                    {regions.map((r, i) => (<Chip key={`r-${i}`} label={r} size="small" variant="outlined" />))}
                  </Box>
                </Box>
              )}
              {eligibility && (
                <Box my={1}>
                  <Typography variant="overline" color="text.secondary">Eligibility</Typography>
                  <Typography variant="body2" color="text.secondary">{eligibility}</Typography>
                </Box>
              )}
              {documents.length > 0 && (
                <Box my={1}>
                  <Typography variant="overline" color="text.secondary">Required Documents</Typography>
                  <Box display="flex" gap={1} flexWrap="wrap" mt={0.5}>
                    {documents.map((d, i) => (<Chip key={`d-${i}`} label={d} size="small" />))}
                  </Box>
                </Box>
              )}
              {(terms || refundPolicy) && (
                <Box my={1}>
                  <Typography variant="overline" color="text.secondary">Policies</Typography>
                  <Typography variant="body2" color="text.secondary">{terms}</Typography>
                  {refundPolicy && <Typography variant="body2" color="text.secondary" mt={0.5}>Refund: {refundPolicy}</Typography>}
                </Box>
              )}
              {(contactEmail || contactPhone) && (
                <Box my={1}>
                  <Typography variant="overline" color="text.secondary">Contact</Typography>
                  <Typography variant="body2" color="text.secondary">{contactEmail || '—'} • {contactPhone || '—'}</Typography>
                </Box>
              )}
              {locations.length > 0 && (
                <Box my={1}>
                  <Typography variant="overline" color="text.secondary">Locations</Typography>
                  <Box display="flex" gap={1} flexWrap="wrap" mt={0.5}>
                    {locations.map((l, i) => (<Chip key={`l-${i}`} label={l} size="small" />))}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </VisaLayout>
  );
};

export default VisaCreateService;


