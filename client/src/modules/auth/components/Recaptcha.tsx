import React from 'react';
import { ENV } from '../../../core/config/environment';

declare global {
  interface Window {
    grecaptcha?: any;
  }
}

interface Props {
  onToken: (token: string | null) => void;
  onError?: (error: string) => void;
}

const Recaptcha: React.FC<Props> = ({ onToken, onError }) => {
  const siteKey = ENV.RECAPTCHA_SITE_KEY;
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [retryCount, setRetryCount] = React.useState(0);
  const maxRetries = 3;

  const generateToken = React.useCallback(async (): Promise<string | null> => {
    if (!window.grecaptcha || !siteKey) {
      throw new Error('reCAPTCHA not available');
    }

    try {
      const token = await window.grecaptcha.execute(siteKey, { action: 'submit' });
      return token;
    } catch (err: any) {
      throw new Error(`Token generation failed: ${err.message}`);
    }
  }, [siteKey]);

  const attemptTokenGeneration = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log(`🔄 reCAPTCHA attempt ${retryCount + 1}/${maxRetries + 1}`);
      
      const token = await generateToken();
      
      if (token) {
        console.log('✅ reCAPTCHA token generated successfully:', `${token.substring(0, 20)}...`);
        onToken(token);
        setIsLoading(false);
      } else {
        throw new Error('Token generation returned null');
      }
    } catch (err: any) {
      console.error(`❌ reCAPTCHA attempt ${retryCount + 1} failed:`, err.message);
      setError(err.message);
      
      if (retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => attemptTokenGeneration(), 1000 * (retryCount + 1)); // Exponential backoff
      } else {
        console.error('❌ All reCAPTCHA attempts failed, disabling reCAPTCHA');
        onToken(null);
        onError?.(`reCAPTCHA failed after ${maxRetries + 1} attempts: ${err.message}`);
        setIsLoading(false);
      }
    }
  }, [generateToken, retryCount, maxRetries, onToken, onError]);

  React.useEffect(() => {
    console.log('🔧 reCAPTCHA component initialized:', { 
      siteKey: siteKey ? `${siteKey.substring(0, 10)}...` : 'MISSING',
      environment: ENV.IS_PRODUCTION ? 'production' : 'development',
      retryCount: 0
    });

    if (!siteKey) {
      console.warn('⚠️ VITE_RECAPTCHA_SITE_KEY not set - reCAPTCHA will be disabled');
      onToken(null);
      onError?.('reCAPTCHA site key not configured');
      setIsLoading(false);
      return;
    }

    // Check if reCAPTCHA is already loaded
    if (window.grecaptcha) {
      attemptTokenGeneration();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('📜 reCAPTCHA script loaded successfully');
      
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => {
          console.log('🎯 reCAPTCHA ready, starting token generation...');
          attemptTokenGeneration();
        });
      } else {
        const errorMsg = 'window.grecaptcha not available after script load';
        console.error('❌', errorMsg);
        setError(errorMsg);
        onError?.(errorMsg);
        setIsLoading(false);
      }
    };
    
    script.onerror = (error) => {
      const errorMsg = 'Failed to load reCAPTCHA script';
      console.error('❌', errorMsg, error);
      setError(errorMsg);
      onError?.(errorMsg);
      setIsLoading(false);
    };

    document.body.appendChild(script);
    
    return () => {
      console.log('🧹 Cleaning up reCAPTCHA component');
      onToken(null);
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [siteKey, onToken, onError, attemptTokenGeneration]);

  // Expose retry function for manual retry
  React.useEffect(() => {
    (window as any).retryRecaptcha = () => {
      console.log('🔄 Manual reCAPTCHA retry triggered');
      setRetryCount(0);
      attemptTokenGeneration();
    };
  }, [attemptTokenGeneration]);

  return (
    <div style={{ display: 'none' }}>
      {isLoading && (
        <div style={{ fontSize: '12px', color: '#666' }}>
          🔄 Loading reCAPTCHA... {retryCount > 0 && `(Attempt ${retryCount + 1})`}
        </div>
      )}
      {error && (
        <div style={{ fontSize: '12px', color: '#ff6b6b' }}>
          ❌ reCAPTCHA Error: {error}
        </div>
      )}
    </div>
  );
};

export default Recaptcha;


