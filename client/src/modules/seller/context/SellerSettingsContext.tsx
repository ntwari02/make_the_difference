import React, { createContext, useContext, useMemo, useState } from 'react';

interface SellerPreferences {
  language: string;
  timezone: string;
  currency: string;
  autoRefresh: boolean;
  theme: 'light' | 'dark' | 'system' | string;
}

interface SellerNotifications {
  email: boolean;
  push: boolean;
  sms: boolean;
  newInquiries: boolean;
  newOffers: boolean;
  paymentUpdates: boolean;
  reviewReplies: boolean;
}

export interface SellerSettings {
  notifications: SellerNotifications;
  preferences: SellerPreferences;
}

interface SellerSettingsContextValue {
  settings: SellerSettings;
  setSettings: React.Dispatch<React.SetStateAction<SellerSettings>>;
}

const defaultSettings: SellerSettings = {
  notifications: {
    email: true,
    push: true,
    sms: false,
    newInquiries: true,
    newOffers: true,
    paymentUpdates: true,
    reviewReplies: true,
  },
  preferences: {
    language: 'en',
    timezone: 'UTC',
    currency: 'USD',
    autoRefresh: true,
    theme: 'system',
  },
};

const SellerSettingsContext = createContext<SellerSettingsContextValue | undefined>(undefined);

export const SellerSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SellerSettings>(defaultSettings);

  const value = useMemo(() => ({ settings, setSettings }), [settings]);

  return (
    <SellerSettingsContext.Provider value={value}>{children}</SellerSettingsContext.Provider>
  );
};

export function useSellerSettings(): SellerSettingsContextValue {
  const ctx = useContext(SellerSettingsContext);
  if (!ctx) {
    // Provide a helpful error if hook is used outside the provider
    throw new Error('useSellerSettings must be used within a SellerSettingsProvider');
  }
  return ctx;
}

export default SellerSettingsContext;


