import React from 'react';
import { ENV } from '../../../core/config/environment';

declare global {
  interface Window {
    grecaptcha?: any;
  }
}

interface Props {
  onToken: (token: string | null) => void;
}

const Recaptcha: React.FC<Props> = ({ onToken }) => {
  const siteKey = ENV.RECAPTCHA_SITE_KEY;

  React.useEffect(() => {
    console.log('🔧 reCAPTCHA component initialized:', { 
      siteKey: siteKey ? `${siteKey.substring(0, 10)}...` : 'MISSING',
      environment: ENV.IS_PRODUCTION ? 'production' : 'development'
    });

    if (!siteKey) {
      console.warn('⚠️ VITE_RECAPTCHA_SITE_KEY not set - reCAPTCHA will be disabled');
      onToken(null);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.onload = () => {
      console.log('📜 reCAPTCHA script loaded successfully');
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => {
          console.log('🎯 reCAPTCHA ready, generating token...');
          window.grecaptcha.execute(siteKey, { action: 'submit' })
            .then((token: string) => {
              console.log('✅ reCAPTCHA token generated:', token ? `${token.substring(0, 20)}...` : 'MISSING');
              onToken(token);
            })
            .catch((error: any) => {
              console.error('❌ reCAPTCHA token generation failed:', error);
              onToken(null);
            });
        });
      } else {
        console.error('❌ window.grecaptcha not available after script load');
        onToken(null);
      }
    };
    
    script.onerror = (error) => {
      console.error('❌ Failed to load reCAPTCHA script:', error);
      onToken(null);
    };

    document.body.appendChild(script);
    
    return () => {
      console.log('🧹 Cleaning up reCAPTCHA component');
      onToken(null);
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [siteKey, onToken]);

  return null;
};

export default Recaptcha;


