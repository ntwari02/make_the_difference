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
    if (!siteKey) return;
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.onload = () => {
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => {
          window.grecaptcha.execute(siteKey, { action: 'submit' }).then((token: string) => onToken(token));
        });
      }
    };
    document.body.appendChild(script);
    return () => {
      onToken(null);
      document.body.removeChild(script);
    };
  }, [siteKey, onToken]);

  return null;
};

export default Recaptcha;


