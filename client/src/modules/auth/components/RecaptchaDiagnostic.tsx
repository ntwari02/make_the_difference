import React, { useState } from 'react';
import { ENV } from '../../../core/config/environment';
import { Box, Button, Typography, Alert, Stack, Chip } from '@mui/material';

interface DiagnosticResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

const RecaptchaDiagnostic: React.FC = () => {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);
    const newResults: DiagnosticResult[] = [];

    // Test 1: Environment Variables
    const siteKey = ENV.RECAPTCHA_SITE_KEY;
    newResults.push({
      test: 'Environment Variables',
      status: siteKey ? 'pass' : 'fail',
      message: siteKey ? 'VITE_RECAPTCHA_SITE_KEY is set' : 'VITE_RECAPTCHA_SITE_KEY is missing',
      details: { siteKey: siteKey ? `${siteKey.substring(0, 10)}...` : 'MISSING' }
    });

    // Test 2: Script Loading
    const scriptLoaded = !!window.grecaptcha;
    newResults.push({
      test: 'reCAPTCHA Script',
      status: scriptLoaded ? 'pass' : 'fail',
      message: scriptLoaded ? 'reCAPTCHA script loaded successfully' : 'reCAPTCHA script not loaded',
      details: { grecaptcha: !!window.grecaptcha }
    });

    // Test 3: Token Generation
    if (scriptLoaded && siteKey) {
      try {
        const token = await window.grecaptcha.execute(siteKey, { action: 'test' });
        newResults.push({
          test: 'Token Generation',
          status: token ? 'pass' : 'fail',
          message: token ? 'Token generated successfully' : 'Token generation returned null',
          details: { token: token ? `${token.substring(0, 20)}...` : 'NULL' }
        });
      } catch (error: any) {
        newResults.push({
          test: 'Token Generation',
          status: 'fail',
          message: `Token generation failed: ${error.message}`,
          details: { error: error.message }
        });
      }
    } else {
      newResults.push({
        test: 'Token Generation',
        status: 'warning',
        message: 'Skipped - prerequisites not met',
        details: { reason: 'Script not loaded or site key missing' }
      });
    }

    // Test 4: Network Connectivity
    try {
      const response = await fetch('https://www.google.com/recaptcha/api.js', { method: 'HEAD' });
      newResults.push({
        test: 'Network Connectivity',
        status: response.ok ? 'pass' : 'warning',
        message: response.ok ? 'Can reach Google reCAPTCHA servers' : 'Cannot reach Google reCAPTCHA servers',
        details: { status: response.status, statusText: response.statusText }
      });
    } catch (error: any) {
      newResults.push({
        test: 'Network Connectivity',
        status: 'fail',
        message: `Network error: ${error.message}`,
        details: { error: error.message }
      });
    }

    // Test 5: Domain Configuration
    const currentDomain = window.location.hostname;
    newResults.push({
      test: 'Domain Configuration',
      status: 'warning',
      message: `Current domain: ${currentDomain}`,
      details: { 
        domain: currentDomain,
        suggestion: 'Verify this domain is added to Google reCAPTCHA console'
      }
    });

    // Test 6: CORS Check
    try {
      const corsTest = await fetch('/api/auth/profile', { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      newResults.push({
        test: 'CORS Configuration',
        status: corsTest.status !== 0 ? 'pass' : 'fail',
        message: corsTest.status !== 0 ? 'CORS allows requests to backend' : 'CORS blocking requests',
        details: { status: corsTest.status, statusText: corsTest.statusText }
      });
    } catch (error: any) {
      newResults.push({
        test: 'CORS Configuration',
        status: 'fail',
        message: `CORS error: ${error.message}`,
        details: { error: error.message }
      });
    }

    setResults(newResults);
    setIsRunning(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'success';
      case 'fail': return 'error';
      case 'warning': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return '✅';
      case 'fail': return '❌';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        🔧 reCAPTCHA Diagnostic Tool
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        This tool will help diagnose reCAPTCHA configuration issues. Run diagnostics to identify problems.
      </Typography>

      <Button 
        variant="contained" 
        onClick={runDiagnostics} 
        disabled={isRunning}
        sx={{ mb: 3 }}
      >
        {isRunning ? 'Running Diagnostics...' : 'Run Diagnostics'}
      </Button>

      {results.length > 0 && (
        <Stack spacing={2}>
          {results.map((result, index) => (
            <Alert 
              key={index}
              severity={getStatusColor(result.status) as any}
              sx={{ textAlign: 'left' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Chip 
                  label={result.test} 
                  size="small" 
                  color={getStatusColor(result.status) as any}
                />
                <Typography variant="body2">
                  {getStatusIcon(result.status)} {result.message}
                </Typography>
              </Box>
              
              {result.details && (
                <Box sx={{ mt: 1, p: 1, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 1 }}>
                  <Typography variant="caption" component="pre" sx={{ fontSize: '11px' }}>
                    {JSON.stringify(result.details, null, 2)}
                  </Typography>
                </Box>
              )}
            </Alert>
          ))}
        </Stack>
      )}

      <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          🛠️ Manual Testing Commands
        </Typography>
        <Typography variant="body2" component="div">
          <strong>Test reCAPTCHA in browser console:</strong>
          <pre style={{ fontSize: '12px', marginTop: '8px' }}>
{`// Check if reCAPTCHA is loaded
console.log('grecaptcha available:', !!window.grecaptcha);

// Check site key
console.log('Site key:', '${ENV.RECAPTCHA_SITE_KEY ? ENV.RECAPTCHA_SITE_KEY.substring(0, 10) + '...' : 'MISSING'}');

// Test token generation
if (window.grecaptcha) {
  window.grecaptcha.execute('${ENV.RECAPTCHA_SITE_KEY}', { action: 'test' })
    .then(token => console.log('Token:', token))
    .catch(err => console.error('Error:', err));
}

// Manual retry
if (window.retryRecaptcha) {
  window.retryRecaptcha();
}`}
          </pre>
        </Typography>
      </Box>
    </Box>
  );
};

export default RecaptchaDiagnostic;
