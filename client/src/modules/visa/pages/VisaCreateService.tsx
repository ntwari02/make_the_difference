import React from 'react';
import { Box, Card, CardContent, Typography, GridLegacy as Grid, TextField, Button, MenuItem, Switch, FormControlLabel, Chip, IconButton, Alert, Divider, Stack, Dialog, DialogTitle, DialogContent, DialogActions, LinearProgress, Tooltip as MuiTooltip } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Calculate as CalculateIcon, AutoAwesome as AutoAwesomeIcon, Save as SaveIcon, Restore as RestoreIcon } from '@mui/icons-material';
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

  // Advanced: fee calculator
  const [baseFee, setBaseFee] = React.useState<string>('');
  const [serviceFee, setServiceFee] = React.useState<string>('');
  const [expedite, setExpedite] = React.useState<boolean>(false);
  const [expediteFee, setExpediteFee] = React.useState<string>('');
  const [taxPct, setTaxPct] = React.useState<string>('0');

  // Advanced: eligibility wizard
  const [wizardOpen, setWizardOpen] = React.useState(false);
  const [wizard, setWizard] = React.useState({ purpose: '', duration: '', nationality: '', priorTravel: '', budget: '' });
  const [fitScore, setFitScore] = React.useState<number>(0);

  // Autosave
  const LOCAL_KEY = 'visa_create_service_autosave_v1';

  React.useEffect(() => {
    // load draft
    const draft = localStorage.getItem(LOCAL_KEY);
    if (draft) {
      try {
        const d = JSON.parse(draft);
        setTitle(d.title || '');
        setDescription(d.description || '');
        setCountry(d.country || '');
        setVisaType(d.visaType || '');
        setProcessingTime(d.processingTime || '');
        setApplicationFee(d.applicationFee || '');
        setCurrency(d.currency || 'USD');
        setValidityMonths(d.validityMonths || '');
        setMaxStayDays(d.maxStayDays || '');
        setRequiresAppointment(!!d.requiresAppointment);
        setSupportsOnlineSubmission(d.supportsOnlineSubmission !== false);
        setEligibility(d.eligibility || '');
        setDocuments(Array.isArray(d.documents) ? d.documents : documents);
        setTerms(d.terms || '');
        setRefundPolicy(d.refundPolicy || '');
        setContactEmail(d.contactEmail || '');
        setContactPhone(d.contactPhone || '');
        setLocations(Array.isArray(d.locations) ? d.locations : []);
        setCategories(Array.isArray(d.categories) ? d.categories : categories);
        setRegions(Array.isArray(d.regions) ? d.regions : []);
        setBaseFee(d.baseFee || '');
        setServiceFee(d.serviceFee || '');
        setExpedite(!!d.expedite);
        setExpediteFee(d.expediteFee || '');
        setTaxPct(d.taxPct || '0');
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const draft = {
      title, description, country, visaType, processingTime, applicationFee, currency, validityMonths, maxStayDays,
      requiresAppointment, supportsOnlineSubmission, eligibility, documents, terms, refundPolicy, contactEmail, contactPhone,
      locations, categories, regions, baseFee, serviceFee, expedite, expediteFee, taxPct,
    };
    localStorage.setItem(LOCAL_KEY, JSON.stringify(draft));
  }, [title, description, country, visaType, processingTime, applicationFee, currency, validityMonths, maxStayDays, requiresAppointment, supportsOnlineSubmission, eligibility, documents, terms, refundPolicy, contactEmail, contactPhone, locations, categories, regions, baseFee, serviceFee, expedite, expediteFee, taxPct]);

  const clearAutosave = () => {
    localStorage.removeItem(LOCAL_KEY);
  };

  const computeTotalCost = React.useMemo(() => {
    const base = Number(baseFee || 0);
    const svc = Number(serviceFee || 0);
    const exp = expedite ? Number(expediteFee || 0) : 0;
    const taxes = Number(taxPct || 0) / 100;
    const subtotal = base + svc + exp + Number(applicationFee || 0);
    return (subtotal + subtotal * taxes).toFixed(2);
  }, [baseFee, serviceFee, expedite, expediteFee, taxPct, applicationFee]);

  // Payment
  const [paymentMethod, setPaymentMethod] = React.useState<'card' | 'mobile' | 'bank'>('card');
  const [cardName, setCardName] = React.useState('');
  const [cardNumber, setCardNumber] = React.useState('');
  const [cardExpiry, setCardExpiry] = React.useState('');
  const [cardCvc, setCardCvc] = React.useState('');
  const [mobileNumber, setMobileNumber] = React.useState('');
  const [bankReference, setBankReference] = React.useState('');
  const [paid, setPaid] = React.useState<boolean>(false);
  const [processingPayment, setProcessingPayment] = React.useState<boolean>(false);

  const processPayment = async () => {
    setProcessingPayment(true);
    try {
      // simulate payment processing delay
      await new Promise((res) => setTimeout(res, 1200));
      setPaid(true);
    } finally {
      setProcessingPayment(false);
    }
  };

  const runEligibilityScoring = () => {
    // Simple heuristic scoring (stub)
    let score = 50;
    if (wizard.purpose && visaType && wizard.purpose.toLowerCase().includes(visaType.toLowerCase())) score += 20;
    if (wizard.duration) score += 5;
    if (wizard.priorTravel) score += 10;
    if (wizard.budget) score += 5;
    if (country && wizard.nationality && country !== wizard.nationality) score += 5;
    score = Math.max(0, Math.min(100, score));
    setFitScore(score);
    // Generate eligibility text + document recommendations
    const recDocs = [...documents];
    if (!recDocs.find(d => d.toLowerCase().includes('itinerary'))) recDocs.push('Travel itinerary');
    if (!recDocs.find(d => d.toLowerCase().includes('invitation'))) recDocs.push('Invitation letter (if applicable)');
    setDocuments(recDocs);
    setEligibility(`Fit Score: ${score}/100 • Purpose: ${wizard.purpose || '—'} • Duration: ${wizard.duration || '—'} • Budget: ${wizard.budget || '—'}`);
    setWizardOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent, asDraft: boolean = false) => {
    e.preventDefault();
    setError(null);
    if (!title || !description || !country || !visaType) {
      setError('Please fill all required fields (Title, Description, Country, Visa Type).');
      return;
    }
    if (!asDraft && !paid) {
      setError('Please complete payment before publishing the service.');
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
      payment: {
        method: paymentMethod,
        currency,
        amount_total: Number(computeTotalCost),
        paid,
        ref: paymentMethod === 'bank' ? bankReference : paymentMethod === 'mobile' ? mobileNumber : cardNumber ? `**** **** **** ${cardNumber.slice(-4)}` : undefined,
      },
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
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Button size="small" startIcon={<AutoAwesomeIcon />} onClick={() => setWizardOpen(true)}>Eligibility Wizard</Button>
                </Stack>
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
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <MuiTooltip title="Add tourist pack">
                    <Button size="small" onClick={() => setDocuments((prev) => Array.from(new Set([...prev, 'Round-trip tickets', 'Hotel booking', 'Travel insurance'])))}>Tourist Pack</Button>
                  </MuiTooltip>
                  <MuiTooltip title="Add student pack">
                    <Button size="small" onClick={() => setDocuments((prev) => Array.from(new Set([...prev, 'Admission letter', 'Sponsor letter', 'Bank statements (6 months)'])))}>Student Pack</Button>
                  </MuiTooltip>
                  <MuiTooltip title="Add work pack">
                    <Button size="small" onClick={() => setDocuments((prev) => Array.from(new Set([...prev, 'Employment contract', 'Company invitation', 'Tax clearance'])))}>Work Pack</Button>
                  </MuiTooltip>
                </Stack>
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

              {/* Fee calculator */}
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>Cost & Fees</Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField fullWidth type="number" label="Govt/Base Fee" value={baseFee} onChange={(e) => setBaseFee(e.target.value)} />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField fullWidth type="number" label="Service Fee" value={serviceFee} onChange={(e) => setServiceFee(e.target.value)} />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControlLabel control={<Switch checked={expedite} onChange={(e) => setExpedite(e.target.checked)} />} label="Expedite" />
                {expedite && (
                  <TextField fullWidth type="number" label="Expedite Fee" value={expediteFee} onChange={(e) => setExpediteFee(e.target.value)} sx={{ mt: 1 }} />
                )}
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField fullWidth type="number" label="Tax %" value={taxPct} onChange={(e) => setTaxPct(e.target.value)} />
              </Grid>
              <Grid item xs={12}>
                <Alert severity="info" icon={<CalculateIcon />} sx={{ display: 'flex', alignItems: 'center' }}>
                  Estimated Total: <strong style={{ marginLeft: 6 }}>{computeTotalCost} {currency}</strong>
                </Alert>
              </Grid>

              {/* Payment */}
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>Payment</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth select label="Payment Method" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as any)}>
                  <MenuItem value="card">Card</MenuItem>
                  <MenuItem value="mobile">Mobile Money</MenuItem>
                  <MenuItem value="bank">Bank Transfer</MenuItem>
                </TextField>
              </Grid>
              {paymentMethod === 'card' && (
                <>
                  <Grid item xs={12} md={4}>
                    <TextField fullWidth label="Name on Card" value={cardName} onChange={(e) => setCardName(e.target.value)} />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField fullWidth label="Card Number" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="4111 1111 1111 1111" />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <TextField fullWidth label="Expiry (MM/YY)" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <TextField fullWidth label="CVC" value={cardCvc} onChange={(e) => setCardCvc(e.target.value)} />
                  </Grid>
                </>
              )}
              {paymentMethod === 'mobile' && (
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Mobile Number" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} placeholder="e.g., +254 7XX XXX XXX" />
                </Grid>
              )}
              {paymentMethod === 'bank' && (
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Bank Reference" value={bankReference} onChange={(e) => setBankReference(e.target.value)} placeholder="Transaction reference" />
                </Grid>
              )}
              <Grid item xs={12}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Button type="button" variant="contained" disabled={processingPayment || paid} onClick={processPayment}>
                    {paid ? 'Paid' : `Pay ${computeTotalCost} ${currency}`}
                  </Button>
                  {processingPayment && <LinearProgress sx={{ width: 160 }} />}
                  {paid && <Typography variant="body2" color="success.main">Payment confirmed</Typography>}
                </Stack>
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
                  <Button type="button" variant="text" startIcon={<SaveIcon />} onClick={() => alert('Autosaved locally')}>Autosave</Button>
                  <Button type="button" variant="text" color="warning" startIcon={<RestoreIcon />} onClick={() => { clearAutosave(); alert('Autosave cleared'); }}>Clear Autosave</Button>
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
              {fitScore > 0 && (
                <Box mb={2}>
                  <Typography variant="overline" color="text.secondary">Fit Score</Typography>
                  <LinearProgress variant="determinate" value={fitScore} sx={{ my: 0.5 }} />
                  <Typography variant="caption" color="text.secondary">{fitScore}% match based on wizard</Typography>
                </Box>
              )}
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

      {/* Eligibility Wizard */}
      <Dialog open={wizardOpen} onClose={() => setWizardOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Eligibility Wizard</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Purpose of travel" value={wizard.purpose} onChange={(e) => setWizard({ ...wizard, purpose: e.target.value })} placeholder="Tourism, Study, Work, Business..." />
            <TextField label="Intended duration" value={wizard.duration} onChange={(e) => setWizard({ ...wizard, duration: e.target.value })} placeholder="e.g., 14 days" />
            <TextField label="Applicant nationality" value={wizard.nationality} onChange={(e) => setWizard({ ...wizard, nationality: e.target.value })} placeholder="e.g., Kenya" />
            <TextField label="Prior travel (optional)" value={wizard.priorTravel} onChange={(e) => setWizard({ ...wizard, priorTravel: e.target.value })} placeholder="Schengen, US, UK..." />
            <TextField label="Budget estimate" value={wizard.budget} onChange={(e) => setWizard({ ...wizard, budget: e.target.value })} placeholder="e.g., 1500 USD" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWizardOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={runEligibilityScoring}>Generate Fit & Requirements</Button>
        </DialogActions>
      </Dialog>
    </VisaLayout>
  );
};

export default VisaCreateService;


