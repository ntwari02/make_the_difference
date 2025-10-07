import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Card, CardContent, Typography, GridLegacy as Grid, TextField, Button, Switch, FormControlLabel, MenuItem, Alert, Checkbox } from '@mui/material';
import VisaDocUpload from '../components/VisaDocUpload';
import VisaLayout from '../components/layout/VisaLayout';
import { visaApi } from '../services/visaApi';

const VisaApplyForm: React.FC = () => {
  const [params] = useSearchParams();
  const visaId = params.get('id') || '';
  const [fullName, setFullName] = React.useState('');
  const [passport, setPassport] = React.useState('');
  const [purpose, setPurpose] = React.useState('');
  const [nationality, setNationality] = React.useState('');
  const [dateOfBirth, setDateOfBirth] = React.useState('');
  const [travelFrom, setTravelFrom] = React.useState('');
  const [travelTo, setTravelTo] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [employmentStatus, setEmploymentStatus] = React.useState('');
  const [previousTravel, setPreviousTravel] = React.useState('');
  const [hasInvitation, setHasInvitation] = React.useState(false);
  const [invitationCode, setInvitationCode] = React.useState('');
  const [inviterName, setInviterName] = React.useState('');
  const [inviterContact, setInviterContact] = React.useState('');
  const [invitationLetterUrl, setInvitationLetterUrl] = React.useState('');
  const [agreeTerms, setAgreeTerms] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!agreeTerms) {
      setError('You must agree to the visa terms and conditions to proceed.');
      return;
    }
    const required = [fullName, passport, nationality, dateOfBirth, travelFrom, travelTo];
    if (required.some(v => !v)) {
      setError('Please fill all required fields (marked with *).');
      return;
    }
    const applicationData = { fullName, passport, nationality, dateOfBirth, travelFrom, travelTo, address, employmentStatus, previousTravel, purpose, hasInvitation, agreeTerms };
    const documents = hasInvitation ? { invitationCode, inviterName, inviterContact, invitationLetterUrl } : {};
    await visaApi.apply(visaId, applicationData, documents);
    window.location.assign('/visa/applications');
  };

  return (
    <VisaLayout>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={700}>Apply for Visa</Typography>
        <Typography variant="body2" color="text.secondary">Service ID: {visaId || 'N/A'}</Typography>
      </Box>
      <Card>
        <CardContent>
          <Box mb={2}>
            <Typography variant="subtitle1" fontWeight={600}>Requirements</Typography>
            <Typography variant="body2" color="text.secondary">
              Please ensure you have: a valid passport (6+ months), a recent passport photo, proof of funds, travel itinerary, and accommodation details. Invitations should include inviter contact and letter.
            </Typography>
          </Box>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          )}
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Full Name *" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Passport Number *" value={passport} onChange={(e) => setPassport(e.target.value)} required />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Nationality *" value={nationality} onChange={(e) => setNationality(e.target.value)} required />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Date of Birth (YYYY-MM-DD) *" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} required />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Travel From (YYYY-MM-DD) *" value={travelFrom} onChange={(e) => setTravelFrom(e.target.value)} required />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Travel To (YYYY-MM-DD) *" value={travelTo} onChange={(e) => setTravelTo(e.target.value)} required />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Residential Address" value={address} onChange={(e) => setAddress(e.target.value)} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth select label="Employment Status" value={employmentStatus} onChange={(e) => setEmploymentStatus(e.target.value)}>
                  <MenuItem value="">Select</MenuItem>
                  <MenuItem value="employed">Employed</MenuItem>
                  <MenuItem value="self_employed">Self-employed</MenuItem>
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="unemployed">Unemployed</MenuItem>
                  <MenuItem value="retired">Retired</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Previous Travel (last 5 years)" value={previousTravel} onChange={(e) => setPreviousTravel(e.target.value)} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Purpose of Travel" value={purpose} onChange={(e) => setPurpose(e.target.value)} multiline minRows={3} required />
              </Grid>
              <Grid item xs={12}>
                <VisaDocUpload onChange={() => {}} />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel control={<Switch checked={hasInvitation} onChange={(e) => setHasInvitation(e.target.checked)} />} label="I have an invitation" />
              </Grid>
              {hasInvitation && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Invitation Code" value={invitationCode} onChange={(e) => setInvitationCode(e.target.value)} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Inviter Name" value={inviterName} onChange={(e) => setInviterName(e.target.value)} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Inviter Contact" value={inviterContact} onChange={(e) => setInviterContact(e.target.value)} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Invitation Letter URL" placeholder="https://..." value={invitationLetterUrl} onChange={(e) => setInvitationLetterUrl(e.target.value)} />
                  </Grid>
                </>
              )}
              <Grid item xs={12}>
                <FormControlLabel control={<Checkbox checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} />} label={<Typography variant="body2">I have read and agree to the visa terms and conditions, and confirm all information is accurate.</Typography>} />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained">Submit Application</Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </VisaLayout>
  );
};

export default VisaApplyForm;


