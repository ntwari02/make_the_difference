import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  GridLegacy as Grid,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Autocomplete,
  Switch,
  FormControlLabel,
  Divider,
  Stack,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormGroup,
  InputAdornment,
  LinearProgress,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  ArrowForward as ForwardIcon,
  Save as SaveIcon,
  Preview as PreviewIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  AutoAwesome as AutoAwesomeIcon,
  SmartToy as SmartToyIcon,
  // Camera and Media Icons
  CameraAlt as CameraIcon,
  PhotoLibrary as PhotoLibraryIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  VideoFile as VideoIcon,
  AudioFile as AudioIcon,
  CloudUpload as CloudUploadIcon,
  QrCodeScanner as ScanIcon,
  DocumentScanner as DocumentScannerIcon,
  TextFields as TextFieldsIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import UniversityLayout from '../components/layout/UniversityLayout';
import { universityApi } from '../services/universityApi';

const UniversityCreateScholarship: React.FC = () => {
  const [activeStep, setActiveStep] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [previewMode, setPreviewMode] = React.useState(false);
  const [showTemplates, setShowTemplates] = React.useState(false);
  const [showAI, setShowAI] = React.useState(false);
  const [toast, setToast] = React.useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({ open: false, message: '', severity: 'success' });

  // Form data state
  const [formData, setFormData] = React.useState({
    // Basic Information
    title: '',
    description: '',
    shortDescription: '',
    category: '',
    subcategory: '',
    tags: [] as string[],
    status: 'draft',
    visibility: 'public',
    
    // Financial Information
    totalBudget: '',
    awardAmount: '',
    numberOfAwards: '',
    renewable: false,
    renewalCriteria: '',
    
    // Eligibility Criteria
    minGPA: '',
    maxGPA: '',
    academicLevel: [] as string[],
    majors: [] as string[],
    citizenship: [] as string[],
    residency: [] as string[],
    ageMin: '',
    ageMax: '',
    gender: [] as string[],
    ethnicity: [] as string[],
    disability: false,
    veteran: false,
    firstGeneration: false,
    financialNeed: false,
    
    // Application Process
    applicationDeadline: '',
    applicationStartDate: '',
    applicationMethod: 'online',
    requiredDocuments: [] as string[],
    essayRequired: false,
    essayPrompt: '',
    essayWordLimit: '',
    recommendationLetters: 0,
    interviewRequired: false,
    portfolioRequired: false,
    
    // Review Process
    reviewMethod: 'committee',
    reviewCriteria: [] as string[],
    scoringRubric: '',
    notificationDate: '',
    awardDate: '',
    
    // Funding Sources
    fundingSource: '',
    donorName: '',
    donorContact: '',
    fundingType: 'endowment',
    fundingDuration: '',
    matchingFunds: false,
    matchingRatio: '',
    reportingRequirements: [] as string[],
    
    // Marketing & Promotion
    marketingBudget: '',
    targetAudience: [] as string[],
    promotionChannels: [] as string[],
    socialMediaStrategy: '',
    emailCampaigns: false,
    printMaterials: false,
    websiteIntegration: false,
    seoKeywords: [] as string[],
    
    // Compliance & Reporting
    complianceRequirements: [] as string[],
    reportingFrequency: 'annual',
    reportingFormat: 'pdf',
    auditRequired: false,
    dataRetention: '7',
    gdprCompliant: false,
    ferpaCompliant: false,
    
    // Accessibility & Inclusion
    accessibilityFeatures: [] as string[],
    languageSupport: [] as string[],
    culturalConsiderations: '',
    inclusiveDesign: false,
    assistiveTechnology: false,
    alternativeFormats: [] as string[],
    
    // Advanced Settings
    autoRenewal: false,
    waitlistEnabled: false,
    priorityApplication: false,
    earlyDecision: false,
    rollingAdmission: false,
    applicationLimit: '',
    notificationPreferences: [] as string[],
    integrationSettings: {} as Record<string, any>,
    
    // Multimedia & Documents
    applicantPhotos: [] as File[],
    documentUploads: [] as File[],
    videoSubmissions: [] as File[],
    audioFiles: [] as File[],
    portfolioFiles: [] as File[],
    cameraAccess: false,
    galleryAccess: false,
    documentScanning: false,
    ocrEnabled: false,
    photoVerification: false,
    cloudStorage: false,
    batchUpload: false,
    mediaEditing: false,
    fileCompression: false,
    watermarking: false,
    metadataExtraction: false,
    
    // Additional Information
    contactEmail: '',
    contactPhone: '',
    website: '',
    socialMedia: [] as { platform: string; url: string }[],
    additionalInfo: '',
    termsAndConditions: '',
    privacyPolicy: '',
  });

  // Available options
  const categories = [
    'STEM', 'Business', 'Arts', 'Health', 'Education', 'Technology', 
    'Research', 'Innovation', 'Sustainability', 'Social Impact', 'Sports', 'Military'
  ];

  const academicLevels = [
    'High School', 'Undergraduate', 'Graduate', 'PhD', 'Post-Doctoral', 'Professional'
  ];

  const countries = [
    'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Australia', 'Japan', 'Other'
  ];

  const documentTypes = [
    'Transcript', 'Personal Statement', 'Essay', 'Recommendation Letter', 
    'Resume/CV', 'Portfolio', 'Financial Aid Form', 'Proof of Citizenship',
    'Proof of Enrollment', 'Test Scores', 'Other'
  ];

  const reviewMethods = [
    'Committee Review', 'Automated Screening', 'Faculty Review', 'External Review', 'Hybrid'
  ];

  const steps = [
    'Basic Information',
    'Financial Details',
    'Eligibility Criteria',
    'Application Process',
    'Review & Selection',
    'Funding Sources',
    'Marketing & Promotion',
    'Compliance & Reporting',
    'Accessibility & Inclusion',
    'Multimedia & Documents',
    'Advanced Settings',
    'Additional Information',
    'Preview & Publish'
  ];

  // Template options
  const templates = [
    {
      id: 1,
      name: 'STEM Research Scholarship',
      description: 'For students pursuing STEM research',
      category: 'STEM',
      fields: ['title', 'description', 'budget', 'gpa', 'research_area'],
      preview: 'Award for outstanding STEM research students...'
    },
    {
      id: 2,
      name: 'Merit-Based Scholarship',
      description: 'Academic excellence scholarship',
      category: 'Academic',
      fields: ['title', 'description', 'budget', 'gpa', 'academic_level'],
      preview: 'Recognition for academic excellence...'
    },
    {
      id: 3,
      name: 'Need-Based Grant',
      description: 'Financial assistance for students in need',
      category: 'Financial',
      fields: ['title', 'description', 'budget', 'financial_need', 'income_verification'],
      preview: 'Support for students with financial need...'
    }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setFormData({
      title: '',
      description: '',
      shortDescription: '',
      category: '',
      subcategory: '',
      tags: [],
      status: 'draft',
      visibility: 'public',
      totalBudget: '',
      awardAmount: '',
      numberOfAwards: '',
      renewable: false,
      renewalCriteria: '',
      minGPA: '',
      maxGPA: '',
      academicLevel: [],
      majors: [],
      citizenship: [],
      residency: [],
      ageMin: '',
      ageMax: '',
      gender: [],
      ethnicity: [],
      disability: false,
      veteran: false,
      firstGeneration: false,
      financialNeed: false,
      applicationDeadline: '',
      applicationStartDate: '',
      applicationMethod: 'online',
      requiredDocuments: [],
      essayRequired: false,
      essayPrompt: '',
      essayWordLimit: '',
      recommendationLetters: 0,
      interviewRequired: false,
      portfolioRequired: false,
      reviewMethod: 'committee',
      reviewCriteria: [],
      scoringRubric: '',
      notificationDate: '',
      awardDate: '',
      
      // Funding Sources
      fundingSource: '',
      donorName: '',
      donorContact: '',
      fundingType: 'endowment',
      fundingDuration: '',
      matchingFunds: false,
      matchingRatio: '',
      reportingRequirements: [] as string[],

      // Marketing & Promotion
      marketingBudget: '',
      targetAudience: [] as string[],
      promotionChannels: [] as string[],
      socialMediaStrategy: '',
      emailCampaigns: false,
      printMaterials: false,
      websiteIntegration: false,
      seoKeywords: [] as string[],

      // Compliance & Reporting
      complianceRequirements: [] as string[],
      reportingFrequency: 'annual',
      reportingFormat: 'pdf',
      auditRequired: false,
      dataRetention: '7',
      gdprCompliant: false,
      ferpaCompliant: false,

      // Accessibility & Inclusion
      accessibilityFeatures: [] as string[],
      languageSupport: [] as string[],
      culturalConsiderations: '',
      inclusiveDesign: false,
      assistiveTechnology: false,
      alternativeFormats: [] as string[],

      // Advanced Settings
      autoRenewal: false,
      waitlistEnabled: false,
      priorityApplication: false,
      earlyDecision: false,
      rollingAdmission: false,
      applicationLimit: '',
      notificationPreferences: [] as string[],
      integrationSettings: {} as Record<string, any>,
      
      // Multimedia & Documents
      applicantPhotos: [] as File[],
      documentUploads: [] as File[],
      videoSubmissions: [] as File[],
      audioFiles: [] as File[],
      portfolioFiles: [] as File[],
      cameraAccess: false,
      galleryAccess: false,
      documentScanning: false,
      ocrEnabled: false,
      photoVerification: false,
      cloudStorage: false,
      batchUpload: false,
      mediaEditing: false,
      fileCompression: false,
      watermarking: false,
      metadataExtraction: false,
      
      // Additional Information
      contactEmail: '',
      contactPhone: '',
      website: '',
      socialMedia: [] as { platform: string; url: string }[],
      additionalInfo: '',
      termsAndConditions: '',
      privacyPolicy: '',
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await universityApi.createScholarship(formData);
      setToast({ open: true, message: 'Scholarship created successfully!', severity: 'success' });
      setTimeout(() => {
        window.location.assign('/university/scholarships');
      }, 2000);
    } catch (error) {
      setToast({ open: true, message: 'Failed to create scholarship', severity: 'error' });
    }
    setLoading(false);
  };

  const handleTemplateSelect = (template: any) => {
    // Apply template data
    setFormData(prev => ({
      ...prev,
      title: template.name,
      description: template.preview,
      category: template.category,
    }));
    setShowTemplates(false);
  };

  const handleAIGenerate = (field: string) => {
    // Mock AI generation
    const aiSuggestions = {
      title: 'AI-Generated Scholarship Title',
      description: 'This is an AI-generated description for your scholarship...',
      essayPrompt: 'Describe your academic goals and how this scholarship will help you achieve them...'
    };
    
    setFormData(prev => ({
      ...prev,
      [field]: aiSuggestions[field as keyof typeof aiSuggestions] || ''
    }));
    
    setToast({ open: true, message: 'AI content generated successfully!', severity: 'success' });
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Basic Information</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Provide the essential details about your scholarship program.
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Scholarship Title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Engineering Excellence Scholarship"
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title="Generate with AI">
                          <IconButton onClick={() => handleAIGenerate('title')}>
                            <AutoAwesomeIcon />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    label="Category"
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Short Description"
                  value={formData.shortDescription}
                  onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                  placeholder="Brief summary (1-2 sentences)"
                  multiline
                  rows={2}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Detailed Description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Provide a comprehensive description of the scholarship..."
                  multiline
                  rows={6}
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title="Generate with AI">
                          <IconButton onClick={() => handleAIGenerate('description')}>
                            <AutoAwesomeIcon />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  options={['Merit-based', 'Need-based', 'Research', 'Leadership', 'Community Service', 'Innovation', 'Diversity', 'International']}
                  value={formData.tags}
                  onChange={(_, newValue) => handleInputChange('tags', newValue)}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Tags"
                      placeholder="Add tags to help students find this scholarship"
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Visibility</InputLabel>
                  <Select
                    value={formData.visibility}
                    onChange={(e) => handleInputChange('visibility', e.target.value)}
                    label="Visibility"
                  >
                    <MenuItem value="public">Public</MenuItem>
                    <MenuItem value="private">Private</MenuItem>
                    <MenuItem value="unlisted">Unlisted</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Financial Details</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Set the budget and award amounts for your scholarship.
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Total Budget"
                  type="number"
                  value={formData.totalBudget}
                  onChange={(e) => handleInputChange('totalBudget', e.target.value)}
                  placeholder="50000"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Award Amount per Student"
                  type="number"
                  value={formData.awardAmount}
                  onChange={(e) => handleInputChange('awardAmount', e.target.value)}
                  placeholder="5000"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Number of Awards"
                  type="number"
                  value={formData.numberOfAwards}
                  onChange={(e) => handleInputChange('numberOfAwards', e.target.value)}
                  placeholder="10"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.renewable}
                      onChange={(e) => handleInputChange('renewable', e.target.checked)}
                    />
                  }
                  label="Renewable Scholarship"
                />
              </Grid>
              
              {formData.renewable && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Renewal Criteria"
                    value={formData.renewalCriteria}
                    onChange={(e) => handleInputChange('renewalCriteria', e.target.value)}
                    placeholder="e.g., Maintain 3.0 GPA, full-time enrollment"
                    multiline
                    rows={3}
                  />
                </Grid>
              )}
            </Grid>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Eligibility Criteria</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Define who is eligible to apply for this scholarship.
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Minimum GPA"
                  type="number"
                  value={formData.minGPA}
                  onChange={(e) => handleInputChange('minGPA', e.target.value)}
                  placeholder="3.0"
                  inputProps={{ min: 0, max: 4, step: 0.1 }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Maximum GPA"
                  type="number"
                  value={formData.maxGPA}
                  onChange={(e) => handleInputChange('maxGPA', e.target.value)}
                  placeholder="4.0"
                  inputProps={{ min: 0, max: 4, step: 0.1 }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  options={academicLevels}
                  value={formData.academicLevel}
                  onChange={(_, newValue) => handleInputChange('academicLevel', newValue)}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Academic Level"
                      placeholder="Select academic levels"
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  options={['Computer Science', 'Engineering', 'Business', 'Medicine', 'Law', 'Arts', 'Sciences', 'Other']}
                  value={formData.majors}
                  onChange={(_, newValue) => handleInputChange('majors', newValue)}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Required Majors/Fields"
                      placeholder="Select majors or fields of study"
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Autocomplete
                  multiple
                  options={countries}
                  value={formData.citizenship}
                  onChange={(_, newValue) => handleInputChange('citizenship', newValue)}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Citizenship Requirements"
                      placeholder="Select countries"
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Autocomplete
                  multiple
                  options={countries}
                  value={formData.residency}
                  onChange={(_, newValue) => handleInputChange('residency', newValue)}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Residency Requirements"
                      placeholder="Select countries"
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Additional Criteria</Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.disability}
                        onChange={(e) => handleInputChange('disability', e.target.checked)}
                      />
                    }
                    label="Open to students with disabilities"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.veteran}
                        onChange={(e) => handleInputChange('veteran', e.target.checked)}
                      />
                    }
                    label="Veteran preference"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.firstGeneration}
                        onChange={(e) => handleInputChange('firstGeneration', e.target.checked)}
                      />
                    }
                    label="First-generation college student preference"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.financialNeed}
                        onChange={(e) => handleInputChange('financialNeed', e.target.checked)}
                      />
                    }
                    label="Financial need consideration"
                  />
                </FormGroup>
              </Grid>
            </Grid>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Application Process</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Configure how students will apply for this scholarship.
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Application Start Date"
                  type="date"
                  value={formData.applicationStartDate}
                  onChange={(e) => handleInputChange('applicationStartDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Application Deadline"
                  type="date"
                  value={formData.applicationDeadline}
                  onChange={(e) => handleInputChange('applicationDeadline', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Application Method</InputLabel>
                  <Select
                    value={formData.applicationMethod}
                    onChange={(e) => handleInputChange('applicationMethod', e.target.value)}
                    label="Application Method"
                  >
                    <MenuItem value="online">Online Application</MenuItem>
                    <MenuItem value="email">Email Submission</MenuItem>
                    <MenuItem value="mail">Mail Submission</MenuItem>
                    <MenuItem value="in-person">In-Person Submission</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  options={documentTypes}
                  value={formData.requiredDocuments}
                  onChange={(_, newValue) => handleInputChange('requiredDocuments', newValue)}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Required Documents"
                      placeholder="Select required documents"
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.essayRequired}
                      onChange={(e) => handleInputChange('essayRequired', e.target.checked)}
                    />
                  }
                  label="Essay Required"
                />
              </Grid>
              
              {formData.essayRequired && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Essay Prompt"
                      value={formData.essayPrompt}
                      onChange={(e) => handleInputChange('essayPrompt', e.target.value)}
                      placeholder="Describe your academic goals and how this scholarship will help you achieve them..."
                      multiline
                      rows={4}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip title="Generate with AI">
                              <IconButton onClick={() => handleAIGenerate('essayPrompt')}>
                                <AutoAwesomeIcon />
                              </IconButton>
                            </Tooltip>
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Word Limit"
                      value={formData.essayWordLimit}
                      onChange={(e) => handleInputChange('essayWordLimit', e.target.value)}
                      placeholder="500"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">words</InputAdornment>,
                      }}
                    />
                  </Grid>
                </>
              )}
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Recommendation Letters"
                  type="number"
                  value={formData.recommendationLetters}
                  onChange={(e) => handleInputChange('recommendationLetters', e.target.value)}
                  placeholder="2"
                  inputProps={{ min: 0, max: 5 }}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.interviewRequired}
                      onChange={(e) => handleInputChange('interviewRequired', e.target.checked)}
                    />
                  }
                  label="Interview Required"
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.portfolioRequired}
                      onChange={(e) => handleInputChange('portfolioRequired', e.target.checked)}
                    />
                  }
                  label="Portfolio Required"
                />
              </Grid>
            </Grid>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Review & Selection Process</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Define how applications will be reviewed and selected.
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Review Method</InputLabel>
                  <Select
                    value={formData.reviewMethod}
                    onChange={(e) => handleInputChange('reviewMethod', e.target.value)}
                    label="Review Method"
                  >
                    {reviewMethods.map((method) => (
                      <MenuItem key={method} value={method.toLowerCase().replace(' ', '_')}>{method}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Notification Date"
                  type="date"
                  value={formData.notificationDate}
                  onChange={(e) => handleInputChange('notificationDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  options={['Academic Excellence', 'Leadership', 'Community Service', 'Financial Need', 'Innovation', 'Diversity', 'Research Potential', 'Career Goals']}
                  value={formData.reviewCriteria}
                  onChange={(_, newValue) => handleInputChange('reviewCriteria', newValue)}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Review Criteria"
                      placeholder="Select criteria for evaluation"
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Scoring Rubric"
                  value={formData.scoringRubric}
                  onChange={(e) => handleInputChange('scoringRubric', e.target.value)}
                  placeholder="Describe how applications will be scored..."
                  multiline
                  rows={4}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Award Date"
                  type="date"
                  value={formData.awardDate}
                  onChange={(e) => handleInputChange('awardDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Funding Sources</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Configure funding sources and donor information for this scholarship.
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Funding Source</InputLabel>
                  <Select
                    value={formData.fundingSource}
                    onChange={(e) => handleInputChange('fundingSource', e.target.value)}
                    label="Funding Source"
                  >
                    <MenuItem value="endowment">Endowment Fund</MenuItem>
                    <MenuItem value="donor">Private Donor</MenuItem>
                    <MenuItem value="corporate">Corporate Sponsor</MenuItem>
                    <MenuItem value="government">Government Grant</MenuItem>
                    <MenuItem value="foundation">Foundation Grant</MenuItem>
                    <MenuItem value="university">University Budget</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Funding Type</InputLabel>
                  <Select
                    value={formData.fundingType}
                    onChange={(e) => handleInputChange('fundingType', e.target.value)}
                    label="Funding Type"
                  >
                    <MenuItem value="endowment">Endowment</MenuItem>
                    <MenuItem value="annual">Annual Allocation</MenuItem>
                    <MenuItem value="one-time">One-time Gift</MenuItem>
                    <MenuItem value="recurring">Recurring Gift</MenuItem>
                    <MenuItem value="matching">Matching Grant</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Donor/Organization Name"
                  value={formData.donorName}
                  onChange={(e) => handleInputChange('donorName', e.target.value)}
                  placeholder="e.g., John Smith Foundation"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Donor Contact"
                  value={formData.donorContact}
                  onChange={(e) => handleInputChange('donorContact', e.target.value)}
                  placeholder="donor@foundation.org"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Funding Duration"
                  value={formData.fundingDuration}
                  onChange={(e) => handleInputChange('fundingDuration', e.target.value)}
                  placeholder="e.g., 5 years, Ongoing, 2024-2026"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.matchingFunds}
                      onChange={(e) => handleInputChange('matchingFunds', e.target.checked)}
                    />
                  }
                  label="Matching Funds Required"
                />
              </Grid>
              
              {formData.matchingFunds && (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Matching Ratio"
                    value={formData.matchingRatio}
                    onChange={(e) => handleInputChange('matchingRatio', e.target.value)}
                    placeholder="e.g., 1:1, 2:1, 50%"
                  />
                </Grid>
              )}
              
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  options={['Financial Reports', 'Student Success Metrics', 'Demographic Data', 'Academic Performance', 'Graduation Rates', 'Employment Outcomes', 'Donor Recognition', 'Impact Stories']}
                  value={formData.reportingRequirements}
                  onChange={(_, newValue) => handleInputChange('reportingRequirements', newValue)}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Reporting Requirements"
                      placeholder="Select required reports"
                    />
                  )}
                />
              </Grid>
            </Grid>
          </motion.div>
        );

      case 6:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Marketing & Promotion</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Configure marketing strategies and promotion channels for your scholarship.
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Marketing Budget"
                  type="number"
                  value={formData.marketingBudget}
                  onChange={(e) => handleInputChange('marketingBudget', e.target.value)}
                  placeholder="5000"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Autocomplete
                  multiple
                  options={['High School Students', 'Current Students', 'Graduate Students', 'International Students', 'Underrepresented Minorities', 'First-Generation Students', 'Transfer Students', 'Adult Learners']}
                  value={formData.targetAudience}
                  onChange={(_, newValue) => handleInputChange('targetAudience', newValue)}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Target Audience"
                      placeholder="Select target demographics"
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  options={['University Website', 'Social Media', 'Email Campaigns', 'Print Materials', 'High School Visits', 'College Fairs', 'Online Platforms', 'Newsletters', 'Press Releases', 'Partner Organizations']}
                  value={formData.promotionChannels}
                  onChange={(_, newValue) => handleInputChange('promotionChannels', newValue)}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Promotion Channels"
                      placeholder="Select marketing channels"
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Social Media Strategy"
                  value={formData.socialMediaStrategy}
                  onChange={(e) => handleInputChange('socialMediaStrategy', e.target.value)}
                  placeholder="Describe your social media approach..."
                  multiline
                  rows={3}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Marketing Tools</Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.emailCampaigns}
                        onChange={(e) => handleInputChange('emailCampaigns', e.target.checked)}
                      />
                    }
                    label="Email Campaigns"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.printMaterials}
                        onChange={(e) => handleInputChange('printMaterials', e.target.checked)}
                      />
                    }
                    label="Print Materials"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.websiteIntegration}
                        onChange={(e) => handleInputChange('websiteIntegration', e.target.checked)}
                      />
                    }
                    label="Website Integration"
                  />
                </FormGroup>
              </Grid>
              
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  options={['scholarship', 'financial aid', 'education funding', 'student support', 'academic excellence', 'merit-based', 'need-based', 'STEM education', 'college funding']}
                  value={formData.seoKeywords}
                  onChange={(_, newValue) => handleInputChange('seoKeywords', newValue)}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="SEO Keywords"
                      placeholder="Add keywords for search optimization"
                    />
                  )}
                />
              </Grid>
            </Grid>
          </motion.div>
        );

      case 7:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Compliance & Reporting</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Configure compliance requirements and reporting obligations.
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  options={['FERPA Compliance', 'GDPR Compliance', 'ADA Compliance', 'Title IX', 'Financial Aid Regulations', 'Tax Reporting', 'Audit Requirements', 'Data Security', 'Privacy Protection', 'Equal Opportunity']}
                  value={formData.complianceRequirements}
                  onChange={(_, newValue) => handleInputChange('complianceRequirements', newValue)}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Compliance Requirements"
                      placeholder="Select applicable regulations"
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Reporting Frequency</InputLabel>
                  <Select
                    value={formData.reportingFrequency}
                    onChange={(e) => handleInputChange('reportingFrequency', e.target.value)}
                    label="Reporting Frequency"
                  >
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="quarterly">Quarterly</MenuItem>
                    <MenuItem value="semiannual">Semi-Annual</MenuItem>
                    <MenuItem value="annual">Annual</MenuItem>
                    <MenuItem value="as-needed">As Needed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Report Format</InputLabel>
                  <Select
                    value={formData.reportingFormat}
                    onChange={(e) => handleInputChange('reportingFormat', e.target.value)}
                    label="Report Format"
                  >
                    <MenuItem value="pdf">PDF</MenuItem>
                    <MenuItem value="excel">Excel</MenuItem>
                    <MenuItem value="csv">CSV</MenuItem>
                    <MenuItem value="json">JSON</MenuItem>
                    <MenuItem value="xml">XML</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Data Retention (Years)"
                  value={formData.dataRetention}
                  onChange={(e) => handleInputChange('dataRetention', e.target.value)}
                  placeholder="7"
                  type="number"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Compliance Features</Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.auditRequired}
                        onChange={(e) => handleInputChange('auditRequired', e.target.checked)}
                      />
                    }
                    label="Audit Required"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.gdprCompliant}
                        onChange={(e) => handleInputChange('gdprCompliant', e.target.checked)}
                      />
                    }
                    label="GDPR Compliant"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.ferpaCompliant}
                        onChange={(e) => handleInputChange('ferpaCompliant', e.target.checked)}
                      />
                    }
                    label="FERPA Compliant"
                  />
                </FormGroup>
              </Grid>
            </Grid>
          </motion.div>
        );

      case 8:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Accessibility & Inclusion</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Ensure your scholarship is accessible and inclusive for all students.
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  options={['Screen Reader Compatible', 'Keyboard Navigation', 'High Contrast Mode', 'Large Text Options', 'Audio Descriptions', 'Sign Language Support', 'Braille Materials', 'Voice Recognition']}
                  value={formData.accessibilityFeatures}
                  onChange={(_, newValue) => handleInputChange('accessibilityFeatures', newValue)}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Accessibility Features"
                      placeholder="Select accessibility features"
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  options={['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Arabic', 'Portuguese', 'Russian', 'Other']}
                  value={formData.languageSupport}
                  onChange={(_, newValue) => handleInputChange('languageSupport', newValue)}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Language Support"
                      placeholder="Select supported languages"
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Cultural Considerations"
                  value={formData.culturalConsiderations}
                  onChange={(e) => handleInputChange('culturalConsiderations', e.target.value)}
                  placeholder="Describe cultural considerations and accommodations..."
                  multiline
                  rows={3}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Inclusion Features</Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.inclusiveDesign}
                        onChange={(e) => handleInputChange('inclusiveDesign', e.target.checked)}
                      />
                    }
                    label="Inclusive Design Principles"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.assistiveTechnology}
                        onChange={(e) => handleInputChange('assistiveTechnology', e.target.checked)}
                      />
                    }
                    label="Assistive Technology Support"
                  />
                </FormGroup>
              </Grid>
              
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  options={['PDF', 'Word Document', 'HTML', 'Audio', 'Video', 'Braille', 'Large Print', 'Electronic Text']}
                  value={formData.alternativeFormats}
                  onChange={(_, newValue) => handleInputChange('alternativeFormats', newValue)}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Alternative Formats"
                      placeholder="Select available formats"
                    />
                  )}
                />
              </Grid>
            </Grid>
          </motion.div>
        );

      case 9:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Multimedia & Documents</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Configure camera access, photo uploads, and document management features.
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Camera & Photo Features</Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.cameraAccess}
                        onChange={(e) => handleInputChange('cameraAccess', e.target.checked)}
                      />
                    }
                    label="Enable Camera Access for Applicant Photos"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.galleryAccess}
                        onChange={(e) => handleInputChange('galleryAccess', e.target.checked)}
                      />
                    }
                    label="Enable Gallery/File System Access"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.photoVerification}
                        onChange={(e) => handleInputChange('photoVerification', e.target.checked)}
                      />
                    }
                    label="Photo Verification & Validation"
                  />
                </FormGroup>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Document Management</Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.documentScanning}
                        onChange={(e) => handleInputChange('documentScanning', e.target.checked)}
                      />
                    }
                    label="Document Scanning Capability"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.ocrEnabled}
                        onChange={(e) => handleInputChange('ocrEnabled', e.target.checked)}
                      />
                    }
                    label="OCR Text Extraction"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.metadataExtraction}
                        onChange={(e) => handleInputChange('metadataExtraction', e.target.checked)}
                      />
                    }
                    label="Metadata Extraction"
                  />
                </FormGroup>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>File Management</Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.cloudStorage}
                        onChange={(e) => handleInputChange('cloudStorage', e.target.checked)}
                      />
                    }
                    label="Cloud Storage Integration"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.batchUpload}
                        onChange={(e) => handleInputChange('batchUpload', e.target.checked)}
                      />
                    }
                    label="Batch Upload Support"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.fileCompression}
                        onChange={(e) => handleInputChange('fileCompression', e.target.checked)}
                      />
                    }
                    label="Automatic File Compression"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.watermarking}
                        onChange={(e) => handleInputChange('watermarking', e.target.checked)}
                      />
                    }
                    label="Document Watermarking"
                  />
                </FormGroup>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Media Editing</Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.mediaEditing}
                        onChange={(e) => handleInputChange('mediaEditing', e.target.checked)}
                      />
                    }
                    label="Built-in Media Editing Tools"
                  />
                </FormGroup>
              </Grid>
              
              {/* Camera Access Demo */}
              {formData.cameraAccess && (
                <Grid item xs={12}>
                  <Card sx={{ p: 3, bgcolor: 'primary.50' }}>
                    <Typography variant="h6" gutterBottom>
                      <CameraIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Camera Access Demo
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Test camera functionality for applicant photo capture.
                    </Typography>
                    <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                      <Button
                        variant="contained"
                        startIcon={<CameraIcon />}
                        onClick={() => {
                          // Simulate camera access
                          navigator.mediaDevices?.getUserMedia({ video: true })
                            .then(() => {
                              setToast({ open: true, message: 'Camera access granted!', severity: 'success' });
                            })
                            .catch(() => {
                              setToast({ open: true, message: 'Camera access denied or not available', severity: 'warning' });
                            });
                        }}
                      >
                        Test Camera
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<PhotoLibraryIcon />}
                        onClick={() => {
                          // Simulate gallery access
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = () => {
                            setToast({ open: true, message: 'Gallery access working!', severity: 'success' });
                          };
                          input.click();
                        }}
                      >
                        Test Gallery
                      </Button>
                    </Stack>
                  </Card>
                </Grid>
              )}
              
              {/* Document Scanning Demo */}
              {formData.documentScanning && (
                <Grid item xs={12}>
                  <Card sx={{ p: 3, bgcolor: 'success.50' }}>
                    <Typography variant="h6" gutterBottom>
                      <DocumentScannerIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Document Scanning Demo
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Test document scanning and OCR capabilities.
                    </Typography>
                    <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                      <Button
                        variant="contained"
                        startIcon={<ScanIcon />}
                        onClick={() => {
                          setToast({ open: true, message: 'Document scanner activated!', severity: 'success' });
                        }}
                      >
                        Scan Document
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<TextFieldsIcon />}
                        onClick={() => {
                          setToast({ open: true, message: 'OCR text extraction enabled!', severity: 'info' });
                        }}
                      >
                        Extract Text
                      </Button>
                    </Stack>
                  </Card>
                </Grid>
              )}
              
              {/* File Upload Demo */}
              <Grid item xs={12}>
                <Card sx={{ p: 3, bgcolor: 'info.50' }}>
                  <Typography variant="h6" gutterBottom>
                    <CloudUploadIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    File Upload Demo
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Test various file upload capabilities.
                  </Typography>
                  <Stack direction="row" spacing={2} sx={{ mt: 2 }} flexWrap="wrap">
                    <Button
                      variant="outlined"
                      startIcon={<ImageIcon />}
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.multiple = true;
                        input.onchange = () => {
                          setToast({ open: true, message: 'Image files selected!', severity: 'success' });
                        };
                        input.click();
                      }}
                    >
                      Upload Images
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<PdfIcon />}
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.pdf';
                        input.multiple = true;
                        input.onchange = () => {
                          setToast({ open: true, message: 'PDF documents selected!', severity: 'success' });
                        };
                        input.click();
                      }}
                    >
                      Upload PDFs
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<VideoIcon />}
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'video/*';
                        input.multiple = true;
                        input.onchange = () => {
                          setToast({ open: true, message: 'Video files selected!', severity: 'success' });
                        };
                        input.click();
                      }}
                    >
                      Upload Videos
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<AudioIcon />}
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'audio/*';
                        input.multiple = true;
                        input.onchange = () => {
                          setToast({ open: true, message: 'Audio files selected!', severity: 'success' });
                        };
                        input.click();
                      }}
                    >
                      Upload Audio
                    </Button>
                  </Stack>
                </Card>
              </Grid>
            </Grid>
          </motion.div>
        );

      case 10:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Advanced Settings</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Configure advanced features and automation options.
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Application Management</Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.autoRenewal}
                        onChange={(e) => handleInputChange('autoRenewal', e.target.checked)}
                      />
                    }
                    label="Auto-Renewal for Eligible Students"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.waitlistEnabled}
                        onChange={(e) => handleInputChange('waitlistEnabled', e.target.checked)}
                      />
                    }
                    label="Waitlist for Full Scholarships"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.priorityApplication}
                        onChange={(e) => handleInputChange('priorityApplication', e.target.checked)}
                      />
                    }
                    label="Priority Application Processing"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.earlyDecision}
                        onChange={(e) => handleInputChange('earlyDecision', e.target.checked)}
                      />
                    }
                    label="Early Decision Option"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.rollingAdmission}
                        onChange={(e) => handleInputChange('rollingAdmission', e.target.checked)}
                      />
                    }
                    label="Rolling Admission Process"
                  />
                </FormGroup>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Application Limit"
                  type="number"
                  value={formData.applicationLimit}
                  onChange={(e) => handleInputChange('applicationLimit', e.target.value)}
                  placeholder="100"
                  helperText="Maximum number of applications to accept"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  options={['Email Notifications', 'SMS Alerts', 'Dashboard Updates', 'Mobile App Push', 'Slack Integration', 'Teams Integration', 'Webhook Notifications']}
                  value={formData.notificationPreferences}
                  onChange={(_, newValue) => handleInputChange('notificationPreferences', newValue)}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Notification Preferences"
                      placeholder="Select notification methods"
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Integration Settings</Typography>
                <Card sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Configure integrations with external systems and platforms.
                  </Typography>
                  <Stack spacing={2}>
                    <FormControlLabel
                      control={<Checkbox />}
                      label="Student Information System (SIS) Integration"
                    />
                    <FormControlLabel
                      control={<Checkbox />}
                      label="Financial Aid System Integration"
                    />
                    <FormControlLabel
                      control={<Checkbox />}
                      label="CRM Integration"
                    />
                    <FormControlLabel
                      control={<Checkbox />}
                      label="Learning Management System (LMS) Integration"
                    />
                    <FormControlLabel
                      control={<Checkbox />}
                      label="Third-Party Scholarship Platforms"
                    />
                  </Stack>
                </Card>
              </Grid>
            </Grid>
          </motion.div>
        );

      case 11:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Additional Information</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Provide contact information and additional details.
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Contact Email"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  placeholder="scholarship@university.edu"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Contact Phone"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Website"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://university.edu/scholarships"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Social Media</Typography>
                <Stack spacing={2}>
                  {formData.socialMedia.map((social, index) => (
                    <Box key={index} display="flex" gap={2} alignItems="center">
                      <TextField
                        label="Platform"
                        value={social.platform}
                        onChange={(e) => {
                          const newSocial = [...formData.socialMedia];
                          newSocial[index].platform = e.target.value;
                          handleInputChange('socialMedia', newSocial);
                        }}
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        label="URL"
                        value={social.url}
                        onChange={(e) => {
                          const newSocial = [...formData.socialMedia];
                          newSocial[index].url = e.target.value;
                          handleInputChange('socialMedia', newSocial);
                        }}
                        sx={{ flex: 2 }}
                      />
                      <IconButton onClick={() => {
                        const newSocial = formData.socialMedia.filter((_, i) => i !== index);
                        handleInputChange('socialMedia', newSocial);
                      }}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => {
                      const newSocial = [...formData.socialMedia, { platform: '', url: '' }];
                      handleInputChange('socialMedia', newSocial);
                    }}
                  >
                    Add Social Media
                  </Button>
                </Stack>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Additional Information"
                  value={formData.additionalInfo}
                  onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                  placeholder="Any additional information for applicants..."
                  multiline
                  rows={4}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Terms and Conditions"
                  value={formData.termsAndConditions}
                  onChange={(e) => handleInputChange('termsAndConditions', e.target.value)}
                  placeholder="Terms and conditions for this scholarship..."
                  multiline
                  rows={3}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Privacy Policy"
                  value={formData.privacyPolicy}
                  onChange={(e) => handleInputChange('privacyPolicy', e.target.value)}
                  placeholder="Privacy policy for applicant data..."
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </motion.div>
        );

      case 12:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Preview & Publish</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Review your scholarship details before publishing.
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Card sx={{ p: 3, bgcolor: 'grey.50' }}>
                  <Typography variant="h5" gutterBottom>{formData.title}</Typography>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    {formData.shortDescription}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {formData.description}
                  </Typography>
                  
                  <Box mt={3}>
                    <Grid container spacing={2}>
                      <Grid item xs={6} md={3}>
                        <Typography variant="subtitle2" color="text.secondary">Award Amount</Typography>
                        <Typography variant="h6">${formData.awardAmount || '0'}</Typography>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Typography variant="subtitle2" color="text.secondary">Number of Awards</Typography>
                        <Typography variant="h6">{formData.numberOfAwards || '0'}</Typography>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Typography variant="subtitle2" color="text.secondary">Deadline</Typography>
                        <Typography variant="h6">{formData.applicationDeadline || 'Not set'}</Typography>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Typography variant="subtitle2" color="text.secondary">Category</Typography>
                        <Typography variant="h6">{formData.category || 'Not set'}</Typography>
                      </Grid>
                    </Grid>
                  </Box>
                  
                  {/* Enhanced Preview Information */}
                  <Box mt={3}>
                    <Typography variant="h6" gutterBottom>Scholarship Details</Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Financial Information</Typography>
                        <Stack spacing={1}>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2">Total Budget:</Typography>
                            <Typography variant="body2" fontWeight={600}>${formData.totalBudget || '0'}</Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2">Award per Student:</Typography>
                            <Typography variant="body2" fontWeight={600}>${formData.awardAmount || '0'}</Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2">Renewable:</Typography>
                            <Typography variant="body2" fontWeight={600}>{formData.renewable ? 'Yes' : 'No'}</Typography>
                          </Box>
                          {formData.fundingSource && (
                            <Box display="flex" justifyContent="space-between">
                              <Typography variant="body2">Funding Source:</Typography>
                              <Typography variant="body2" fontWeight={600}>{formData.fundingSource}</Typography>
                            </Box>
                          )}
                        </Stack>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Eligibility Requirements</Typography>
                        <Stack spacing={1}>
                          {formData.minGPA && (
                            <Box display="flex" justifyContent="space-between">
                              <Typography variant="body2">Min GPA:</Typography>
                              <Typography variant="body2" fontWeight={600}>{formData.minGPA}</Typography>
                            </Box>
                          )}
                          {formData.academicLevel.length > 0 && (
                            <Box display="flex" justifyContent="space-between">
                              <Typography variant="body2">Academic Level:</Typography>
                              <Typography variant="body2" fontWeight={600}>{formData.academicLevel.join(', ')}</Typography>
                            </Box>
                          )}
                          {formData.majors.length > 0 && (
                            <Box display="flex" justifyContent="space-between">
                              <Typography variant="body2">Majors:</Typography>
                              <Typography variant="body2" fontWeight={600}>{formData.majors.join(', ')}</Typography>
                            </Box>
                          )}
                          {formData.citizenship.length > 0 && (
                            <Box display="flex" justifyContent="space-between">
                              <Typography variant="body2">Citizenship:</Typography>
                              <Typography variant="body2" fontWeight={600}>{formData.citizenship.join(', ')}</Typography>
                            </Box>
                          )}
                        </Stack>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Application Process</Typography>
                        <Stack spacing={1}>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2">Method:</Typography>
                            <Typography variant="body2" fontWeight={600}>{formData.applicationMethod}</Typography>
                          </Box>
                          {formData.essayRequired && (
                            <Box display="flex" justifyContent="space-between">
                              <Typography variant="body2">Essay Required:</Typography>
                              <Typography variant="body2" fontWeight={600}>Yes</Typography>
                            </Box>
                          )}
                          {formData.recommendationLetters > 0 && (
                            <Box display="flex" justifyContent="space-between">
                              <Typography variant="body2">Recommendation Letters:</Typography>
                              <Typography variant="body2" fontWeight={600}>{formData.recommendationLetters}</Typography>
                            </Box>
                          )}
                          {formData.interviewRequired && (
                            <Box display="flex" justifyContent="space-between">
                              <Typography variant="body2">Interview Required:</Typography>
                              <Typography variant="body2" fontWeight={600}>Yes</Typography>
                            </Box>
                          )}
                        </Stack>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Review Process</Typography>
                        <Stack spacing={1}>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2">Review Method:</Typography>
                            <Typography variant="body2" fontWeight={600}>{formData.reviewMethod}</Typography>
                          </Box>
                          {formData.notificationDate && (
                            <Box display="flex" justifyContent="space-between">
                              <Typography variant="body2">Notification Date:</Typography>
                              <Typography variant="body2" fontWeight={600}>{formData.notificationDate}</Typography>
                            </Box>
                          )}
                          {formData.awardDate && (
                            <Box display="flex" justifyContent="space-between">
                              <Typography variant="body2">Award Date:</Typography>
                              <Typography variant="body2" fontWeight={600}>{formData.awardDate}</Typography>
                            </Box>
                          )}
                        </Stack>
                      </Grid>
                    </Grid>
                  </Box>
                  
                  {/* Compliance and Features */}
                  <Box mt={3}>
                    <Typography variant="h6" gutterBottom>Compliance & Features</Typography>
                    <Grid container spacing={2}>
                      {formData.complianceRequirements.length > 0 && (
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>Compliance</Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            {formData.complianceRequirements.map((req, index) => (
                              <Chip key={index} label={req} size="small" color="primary" variant="outlined" />
                            ))}
                          </Stack>
                        </Grid>
                      )}
                      
                      {formData.accessibilityFeatures.length > 0 && (
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>Accessibility</Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            {formData.accessibilityFeatures.map((feature, index) => (
                              <Chip key={index} label={feature} size="small" color="success" variant="outlined" />
                            ))}
                          </Stack>
                        </Grid>
                      )}
                      
                      {formData.languageSupport.length > 0 && (
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>Language Support</Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            {formData.languageSupport.map((lang, index) => (
                              <Chip key={index} label={lang} size="small" color="info" variant="outlined" />
                            ))}
                          </Stack>
                        </Grid>
                      )}
                      
                      {formData.promotionChannels.length > 0 && (
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>Marketing Channels</Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            {formData.promotionChannels.map((channel, index) => (
                              <Chip key={index} label={channel} size="small" color="warning" variant="outlined" />
                            ))}
                          </Stack>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                  
                  {/* Multimedia Features */}
                  <Box mt={3}>
                    <Typography variant="h6" gutterBottom>Multimedia & Document Features</Typography>
                    <Grid container spacing={2}>
                      {(formData.cameraAccess || formData.galleryAccess || formData.documentScanning) && (
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>Media Capabilities</Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            {formData.cameraAccess && <Chip label="Camera Access" size="small" color="primary" variant="outlined" />}
                            {formData.galleryAccess && <Chip label="Gallery Access" size="small" color="primary" variant="outlined" />}
                            {formData.documentScanning && <Chip label="Document Scanning" size="small" color="success" variant="outlined" />}
                            {formData.ocrEnabled && <Chip label="OCR Text Extraction" size="small" color="success" variant="outlined" />}
                            {formData.photoVerification && <Chip label="Photo Verification" size="small" color="info" variant="outlined" />}
                          </Stack>
                        </Grid>
                      )}
                      
                      {(formData.cloudStorage || formData.batchUpload || formData.fileCompression) && (
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>File Management</Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            {formData.cloudStorage && <Chip label="Cloud Storage" size="small" color="info" variant="outlined" />}
                            {formData.batchUpload && <Chip label="Batch Upload" size="small" color="info" variant="outlined" />}
                            {formData.fileCompression && <Chip label="File Compression" size="small" color="warning" variant="outlined" />}
                            {formData.watermarking && <Chip label="Watermarking" size="small" color="warning" variant="outlined" />}
                            {formData.mediaEditing && <Chip label="Media Editing" size="small" color="secondary" variant="outlined" />}
                          </Stack>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                  
                  {formData.tags.length > 0 && (
                    <Box mt={2}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>Tags</Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {formData.tags.map((tag, index) => (
                          <Chip key={index} label={tag} size="small" />
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Ready to publish?</strong> Your scholarship will be visible to students once published. 
                    You can always edit it later from the scholarships management page.
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <UniversityLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box mb={3} display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Create New Scholarship
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Design and configure a comprehensive scholarship program
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={1}>
            <Tooltip title="Templates">
              <Button
                variant="outlined"
                startIcon={<SmartToyIcon />}
                onClick={() => setShowTemplates(true)}
              >
                Templates
              </Button>
            </Tooltip>
            
            <Tooltip title="AI Assistant">
              <Button
                variant="outlined"
                startIcon={<SmartToyIcon />}
                onClick={() => setShowAI(true)}
              >
                AI Help
              </Button>
            </Tooltip>
            
            <Tooltip title="Preview">
              <Button
                variant="outlined"
                startIcon={<PreviewIcon />}
                onClick={() => setPreviewMode(!previewMode)}
              >
                Preview
              </Button>
            </Tooltip>
          </Stack>
        </Box>
      </motion.div>

      {/* Progress Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h6">Progress</Typography>
              <Typography variant="body2" color="text.secondary">
                Step {activeStep + 1} of {steps.length}
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={((activeStep + 1) / steps.length) * 100} 
              sx={{ height: 8, borderRadius: 4 }}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Grid container spacing={3}>
          {/* Stepper */}
          <Grid item xs={12} md={4}>
            <Card sx={{ position: 'sticky', top: 20 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Steps</Typography>
                <Stepper activeStep={activeStep} orientation="vertical">
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </CardContent>
            </Card>
          </Grid>

          {/* Form Content */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent sx={{ minHeight: 600 }}>
                {renderStepContent(activeStep)}
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <Box mt={3} display="flex" justifyContent="space-between">
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                startIcon={<BackIcon />}
              >
                Back
              </Button>
              
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  onClick={handleReset}
                  startIcon={<DeleteIcon />}
                >
                  Reset
                </Button>
                
                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                    startIcon={loading ? <LinearProgress /> : <SaveIcon />}
                  >
                    {loading ? 'Creating...' : 'Create Scholarship'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    endIcon={<ForwardIcon />}
                  >
                    Next
                  </Button>
                )}
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </motion.div>

      {/* Templates Dialog */}
      <Dialog open={showTemplates} onClose={() => setShowTemplates(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <SmartToyIcon sx={{ mr: 1 }} />
            Scholarship Templates
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {templates.map((template) => (
              <Grid item xs={12} md={6} key={template.id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer', 
                    '&:hover': { boxShadow: 4 },
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                  onClick={() => handleTemplateSelect(template)}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>{template.name}</Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {template.description}
                    </Typography>
                    <Chip label={template.category} size="small" sx={{ mb: 2 }} />
                    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                      "{template.preview}"
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTemplates(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* AI Assistant Dialog */}
      <Dialog open={showAI} onClose={() => setShowAI(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <SmartToyIcon sx={{ mr: 1 }} />
            AI Writing Assistant
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Get AI-powered suggestions for your scholarship content.
          </Typography>
          
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              startIcon={<AutoAwesomeIcon />}
              onClick={() => handleAIGenerate('title')}
              fullWidth
            >
              Generate Scholarship Title
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<AutoAwesomeIcon />}
              onClick={() => handleAIGenerate('description')}
              fullWidth
            >
              Generate Description
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<AutoAwesomeIcon />}
              onClick={() => handleAIGenerate('essayPrompt')}
              fullWidth
            >
              Generate Essay Prompt
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAI(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Toast Notification */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={toast.severity} variant="filled">
          {toast.message}
        </Alert>
      </Snackbar>
    </UniversityLayout>
  );
};

export default UniversityCreateScholarship;