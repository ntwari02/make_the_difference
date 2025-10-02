// Payment Types
export type PaymentMethod = 'credit_card' | 'debit_card' | 'paypal' | 'apple_pay' | 'google_pay' | 'bank_transfer';

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded' | 'partially_refunded';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';

export interface PaymentMethodDetails {
  id: string;
  type: PaymentMethod;
  card_last_four?: string;
  card_brand?: string;
  expiry_month?: number;
  expiry_year?: number;
  paypal_email?: string;
  bank_name?: string;
  account_last_four?: string;
  is_default?: boolean;
}

export interface BillingAddress {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface PaymentRequest {
  amount: number;
  currency: Currency;
  payment_method: PaymentMethod;
  payment_method_details: PaymentMethodDetails;
  billing_address: BillingAddress;
  order_id?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  id: string;
  status: PaymentStatus;
  amount: number;
  currency: Currency;
  payment_method: PaymentMethod;
  transaction_id?: string;
  gateway_response?: any;
  created_at: string;
  updated_at: string;
  failure_reason?: string;
}

export interface PaymentIntent {
  id: string;
  client_secret: string;
  amount: number;
  currency: Currency;
  status: PaymentStatus;
  payment_method_types: PaymentMethod[];
  created_at: string;
  expires_at: string;
}

export interface PaymentConfirmation {
  payment_id: string;
  status: PaymentStatus;
  receipt_url?: string;
  transaction_id?: string;
  amount_paid: number;
  currency: Currency;
}

export interface PaymentMethodSetup {
  type: PaymentMethod;
  billing_details: BillingAddress;
  make_default?: boolean;
}

export interface PaymentMethodResponse {
  id: string;
  type: PaymentMethod;
  billing_details: BillingAddress;
  card_last_four?: string;
  card_brand?: string;
  expiry_month?: number;
  expiry_year?: number;
  is_default: boolean;
  created_at: string;
}

// Credit Card Types
export interface CreditCardDetails {
  card_number: string;
  expiry_month: number;
  expiry_year: number;
  cvv: string;
  cardholder_name: string;
}

// PayPal Types
export interface PayPalDetails {
  email: string;
  payer_id?: string;
}

// Bank Transfer Types
export interface BankTransferDetails {
  account_holder_name: string;
  account_number: string;
  routing_number: string;
  bank_name: string;
  account_type: 'checking' | 'savings';
}

// Payment Processing Types
export interface PaymentProcessingOptions {
  save_payment_method?: boolean;
  make_default?: boolean;
  send_receipt?: boolean;
  notification_email?: string;
}

export interface PaymentValidation {
  is_valid: boolean;
  errors: string[];
  warnings?: string[];
}

// Payment Gateway Types
export interface PaymentGateway {
  id: string;
  name: string;
  supported_currencies: Currency[];
  supported_methods: PaymentMethod[];
  is_active: boolean;
  configuration: Record<string, any>;
}

export interface PaymentWebhook {
  id: string;
  event_type: string;
  payment_id: string;
  data: any;
  created_at: string;
  processed: boolean;
}

// Subscription/Recurring Payment Types
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  amount: number;
  currency: Currency;
  interval: 'day' | 'week' | 'month' | 'year';
  interval_count: number;
  trial_period_days?: number;
  is_active: boolean;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'past_due' | 'incomplete';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  cancelled_at?: string;
}

// Analytics and Reporting Types
export interface PaymentAnalytics {
  total_payments: number;
  total_amount: number;
  successful_payments: number;
  failed_payments: number;
  average_payment_amount: number;
  payment_method_breakdown: {
    method: PaymentMethod;
    count: number;
    amount: number;
    percentage: number;
  }[];
  daily_totals: {
    date: string;
    count: number;
    amount: number;
  }[];
}

export interface PaymentReport {
  id: string;
  title: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  date_range: {
    start_date: string;
    end_date: string;
  };
  data: PaymentAnalytics;
  generated_at: string;
  generated_by: string;
}
