import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { sellerApi } from '../services/sellerApi';
import { useThemeMode } from '../../../core/theme/ThemeProvider';

export interface SellerSettings {
	notifications: {
		email: boolean;
		push: boolean;
		sms: boolean;
		newInquiries: boolean;
		newOffers: boolean;
		paymentUpdates: boolean;
		reviewReplies: boolean;
	};
	privacy: {
		showProfile: boolean;
		showContact: boolean;
		showListings: boolean;
		allowMessages: boolean;
	};
	preferences: {
		language: string;
		timezone: string;
		currency: string;
		autoRefresh: boolean;
		theme: 'light' | 'dark' | 'system';
	};
}

interface SellerSettingsContextType {
	settings: SellerSettings | null;
	loading: boolean;
	refreshSettings: () => Promise<void>;
	updateSettings: (updates: Partial<SellerSettings>) => Promise<void>;
}

const SellerSettingsContext = createContext<SellerSettingsContextType | undefined>(undefined);

interface SellerSettingsProviderProps {
	children: ReactNode;
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
	privacy: {
		showProfile: true,
		showContact: false,
		showListings: true,
		allowMessages: true,
	},
	preferences: {
		language: 'en',
		timezone: 'America/New_York',
		currency: 'USD',
		autoRefresh: true,
		theme: 'system',
	},
};

export const SellerSettingsProvider: React.FC<SellerSettingsProviderProps> = ({ children }) => {
	const [settings, setSettings] = useState<SellerSettings | null>(null);
	const [loading, setLoading] = useState(true);
	const { setMode } = useThemeMode();

	const loadSettings = async () => {
		try {
			const data = await sellerApi.settings.getSettings();
			const loadedSettings: SellerSettings = {
				notifications: {
					email: !!data?.notifications?.email,
					push: !!data?.notifications?.push,
					sms: !!data?.notifications?.sms,
					newInquiries: !!data?.notifications?.newInquiries,
					newOffers: !!data?.notifications?.newOffers,
					paymentUpdates: !!data?.notifications?.paymentUpdates,
					reviewReplies: !!data?.notifications?.reviewReplies,
				},
				privacy: {
					showProfile: data?.privacy?.showProfile !== false,
					showContact: !!data?.privacy?.showContact,
					showListings: data?.privacy?.showListings !== false,
					allowMessages: data?.privacy?.allowMessages !== false,
				},
				preferences: {
					language: data?.preferences?.language || 'en',
					timezone: data?.preferences?.timezone || 'America/New_York',
					currency: data?.preferences?.currency || 'USD',
					autoRefresh: data?.preferences?.autoRefresh !== false,
					theme: (data?.preferences?.theme as 'light' | 'dark' | 'system') || 'system',
				},
			};
			setSettings(loadedSettings);
			// Apply theme preference on load
			if (loadedSettings.preferences.theme && setMode) {
				setMode(loadedSettings.preferences.theme);
			}
		} catch (error) {
			console.error('Failed to load seller settings:', error);
			setSettings(defaultSettings);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadSettings();
	}, []);

	const refreshSettings = async () => {
		await loadSettings();
	};

	const updateSettings = async (updates: Partial<SellerSettings>) => {
		try {
			const updated = { ...settings, ...updates } as SellerSettings;
			await sellerApi.settings.updateSettings(updated);
			setSettings(updated);
			// Update theme if it changed
			if (updates.preferences?.theme && setMode) {
				setMode(updates.preferences.theme);
			}
		} catch (error) {
			console.error('Failed to update settings:', error);
			throw error;
		}
	};

	return (
		<SellerSettingsContext.Provider value={{ settings, loading, refreshSettings, updateSettings }}>
			{children}
		</SellerSettingsContext.Provider>
	);
};

export const useSellerSettings = (): SellerSettingsContextType => {
	const context = useContext(SellerSettingsContext);
	if (context === undefined) {
		throw new Error('useSellerSettings must be used within a SellerSettingsProvider');
	}
	return context;
};

