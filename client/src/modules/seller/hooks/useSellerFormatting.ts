import { useSellerSettings } from '../context/SellerSettingsContext';

/**
 * Hook to get currency formatting function based on user's currency preference
 */
export const useCurrencyFormat = () => {
  const { settings } = useSellerSettings();
  const currency = settings?.preferences?.currency || 'USD';

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  return { formatCurrency, currency };
};

/**
 * Hook to get timezone-aware date formatting based on user's timezone preference
 */
export const useTimezoneFormat = () => {
  const { settings } = useSellerSettings();
  const timezone = settings?.preferences?.timezone || 'America/New_York';

  const formatDate = (date: string | Date, options?: Intl.DateTimeFormatOptions): string => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid Date';

    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      ...options,
    }).format(d);
  };

  const formatDateTime = (date: string | Date): string => {
    return formatDate(date, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (date: string | Date): string => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid Time';

    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  };

  return { formatDate, formatDateTime, formatTime, timezone };
};

