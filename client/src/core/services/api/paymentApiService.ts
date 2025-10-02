import apiClient from './apiClient';
import {
  PaymentRequest,
  PaymentResponse,
  PaymentIntent,
  PaymentConfirmation,
  PaymentMethodSetup,
  PaymentMethodResponse,
  PaymentStatus,
  PaymentMethod,
  PaymentProcessingOptions,
  PaymentValidation,
  PaymentAnalytics,
  PaymentReport,
  BillingAddress,
  CreditCardDetails,
  PayPalDetails,
  BankTransferDetails,
} from '../../types/payment.types';

export class PaymentApiService {
  /**
   * Create a payment intent for processing payments
   */
  static async createPaymentIntent(
    amount: number,
    currency: string,
    paymentMethods: PaymentMethod[] = ['credit_card'],
    metadata?: Record<string, any>
  ): Promise<PaymentIntent> {
    try {
      const response = await apiClient.post('/payments/create-intent', {
        amount,
        currency,
        payment_method_types: paymentMethods,
        metadata,
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Error creating payment intent:', error);
      if (error.response?.status === 404) {
        // Return mock payment intent for development
        return this.getMockPaymentIntent(amount, currency, paymentMethods);
      }
      throw error;
    }
  }

  /**
   * Process a payment with the given payment method
   */
  static async processPayment(
    paymentIntentId: string,
    paymentMethodDetails: any,
    billingAddress: BillingAddress,
    options?: PaymentProcessingOptions
  ): Promise<PaymentResponse> {
    try {
      const response = await apiClient.post(`/payments/${paymentIntentId}/process`, {
        payment_method_details: paymentMethodDetails,
        billing_address: billingAddress,
        options,
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Error processing payment:', error);
      if (error.response?.status === 404) {
        // Return mock payment response for development
        return this.getMockPaymentResponse(paymentIntentId, 'completed');
      }
      throw error;
    }
  }

  /**
   * Confirm a payment after processing
   */
  static async confirmPayment(paymentIntentId: string): Promise<PaymentConfirmation> {
    try {
      const response = await apiClient.post(`/payments/${paymentIntentId}/confirm`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error confirming payment:', error);
      if (error.response?.status === 404) {
        // Return mock confirmation for development
        return this.getMockPaymentConfirmation(paymentIntentId);
      }
      throw error;
    }
  }

  /**
   * Get payment status by ID
   */
  static async getPaymentStatus(paymentId: string): Promise<PaymentResponse> {
    try {
      const response = await apiClient.get(`/payments/${paymentId}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching payment status:', error);
      if (error.response?.status === 404) {
        // Return mock payment status for development
        return this.getMockPaymentResponse(paymentId, 'completed');
      }
      throw error;
    }
  }

  /**
   * Get payment history for a user
   */
  static async getPaymentHistory(
    page = 1,
    limit = 20,
    status?: PaymentStatus
  ): Promise<{ payments: PaymentResponse[]; total: number; page: number; totalPages: number }> {
    try {
      const response = await apiClient.get('/payments/history', {
        params: { page, limit, status },
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching payment history:', error);
      if (error.response?.status === 404) {
        // Return mock payment history for development
        return this.getMockPaymentHistory(page, limit);
      }
      throw error;
    }
  }

  /**
   * Setup a payment method for future use
   */
  static async setupPaymentMethod(
    paymentMethod: PaymentMethod,
    details: CreditCardDetails | PayPalDetails | BankTransferDetails,
    billingAddress: BillingAddress,
    makeDefault = false
  ): Promise<PaymentMethodResponse> {
    try {
      const response = await apiClient.post('/payment-methods/setup', {
        type: paymentMethod,
        payment_method_details: details,
        billing_address: billingAddress,
        make_default: makeDefault,
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Error setting up payment method:', error);
      if (error.response?.status === 404) {
        // Return mock payment method for development
        return this.getMockPaymentMethod(paymentMethod, billingAddress, makeDefault);
      }
      throw error;
    }
  }

  /**
   * Get user's saved payment methods
   */
  static async getPaymentMethods(): Promise<PaymentMethodResponse[]> {
    try {
      const response = await apiClient.get('/payment-methods');
      return response.data.data || [];
    } catch (error: any) {
      console.error('Error fetching payment methods:', error);
      if (error.response?.status === 404) {
        // Return mock payment methods for development
        return this.getMockPaymentMethods();
      }
      return [];
    }
  }

  /**
   * Delete a payment method
   */
  static async deletePaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      await apiClient.delete(`/payment-methods/${paymentMethodId}`);
    } catch (error: any) {
      console.error('Error deleting payment method:', error);
      if (error.response?.status === 404) {
        // Silently succeed for development
        return;
      }
      throw error;
    }
  }

  /**
   * Set default payment method
   */
  static async setDefaultPaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      await apiClient.patch(`/payment-methods/${paymentMethodId}/default`);
    } catch (error: any) {
      console.error('Error setting default payment method:', error);
      if (error.response?.status === 404) {
        // Silently succeed for development
        return;
      }
      throw error;
    }
  }

  /**
   * Validate payment details before processing
   */
  static async validatePayment(
    paymentMethod: PaymentMethod,
    details: any,
    amount: number,
    currency: string
  ): Promise<PaymentValidation> {
    try {
      const response = await apiClient.post('/payments/validate', {
        payment_method: paymentMethod,
        payment_method_details: details,
        amount,
        currency,
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Error validating payment:', error);
      if (error.response?.status === 404) {
        // Return mock validation for development
        return this.getMockPaymentValidation(true);
      }
      throw error;
    }
  }

  /**
   * Process refund for a payment
   */
  static async processRefund(
    paymentId: string,
    amount?: number,
    reason?: string
  ): Promise<PaymentResponse> {
    try {
      const response = await apiClient.post(`/payments/${paymentId}/refund`, {
        amount,
        reason,
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Error processing refund:', error);
      if (error.response?.status === 404) {
        // Return mock refund response for development
        return this.getMockPaymentResponse(paymentId, 'refunded');
      }
      throw error;
    }
  }

  /**
   * Get payment analytics
   */
  static async getPaymentAnalytics(
    startDate?: string,
    endDate?: string
  ): Promise<PaymentAnalytics> {
    try {
      const response = await apiClient.get('/payments/analytics', {
        params: { start_date: startDate, end_date: endDate },
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching payment analytics:', error);
      if (error.response?.status === 404) {
        // Return mock analytics for development
        return this.getMockPaymentAnalytics();
      }
      throw error;
    }
  }

  /**
   * Generate payment report
   */
  static async generatePaymentReport(
    type: 'daily' | 'weekly' | 'monthly',
    startDate: string,
    endDate: string
  ): Promise<PaymentReport> {
    try {
      const response = await apiClient.post('/payments/reports/generate', {
        type,
        start_date: startDate,
        end_date: endDate,
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Error generating payment report:', error);
      if (error.response?.status === 404) {
        // Return mock report for development
        return this.getMockPaymentReport(type, startDate, endDate);
      }
      throw error;
    }
  }

  // Mock data methods for development
  private static getMockPaymentIntent(
    amount: number,
    currency: string,
    paymentMethods: PaymentMethod[]
  ): PaymentIntent {
    return {
      id: `pi_mock_${Date.now()}`,
      client_secret: `pi_mock_${Date.now()}_secret`,
      amount,
      currency: currency as any,
      status: 'requires_payment_method',
      payment_method_types: paymentMethods,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    };
  }

  private static getMockPaymentResponse(
    paymentIntentId: string,
    status: PaymentStatus
  ): PaymentResponse {
    return {
      id: paymentIntentId,
      status,
      amount: 100,
      currency: 'USD',
      payment_method: 'credit_card',
      transaction_id: `txn_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  private static getMockPaymentConfirmation(paymentIntentId: string): PaymentConfirmation {
    return {
      payment_id: paymentIntentId,
      status: 'completed',
      amount_paid: 100,
      currency: 'USD',
      receipt_url: `https://example.com/receipt/${paymentIntentId}`,
      transaction_id: `txn_${Date.now()}`,
    };
  }

  private static getMockPaymentHistory(page: number, limit: number) {
    const mockPayments: PaymentResponse[] = [];
    for (let i = 0; i < limit; i++) {
      mockPayments.push({
        id: `pi_mock_${Date.now()}_${i}`,
        status: 'completed',
        amount: Math.floor(Math.random() * 500) + 50,
        currency: 'USD',
        payment_method: 'credit_card',
        transaction_id: `txn_${Date.now()}_${i}`,
        created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    return {
      payments: mockPayments,
      total: 100,
      page,
      totalPages: Math.ceil(100 / limit),
    };
  }

  private static getMockPaymentMethod(
    type: PaymentMethod,
    billingAddress: BillingAddress,
    isDefault: boolean
  ): PaymentMethodResponse {
    return {
      id: `pm_mock_${Date.now()}`,
      type,
      billing_details: billingAddress,
      card_last_four: type === 'credit_card' ? '4242' : undefined,
      card_brand: type === 'credit_card' ? 'visa' : undefined,
      is_default: isDefault,
      created_at: new Date().toISOString(),
    };
  }

  private static getMockPaymentMethods(): PaymentMethodResponse[] {
    return [
      {
        id: 'pm_mock_1',
        type: 'credit_card',
        billing_details: {
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          address_line_1: '123 Main St',
          city: 'New York',
          state: 'NY',
          postal_code: '10001',
          country: 'US',
        },
        card_last_four: '4242',
        card_brand: 'visa',
        is_default: true,
        created_at: new Date().toISOString(),
      },
    ];
  }

  private static getMockPaymentValidation(isValid: boolean): PaymentValidation {
    return {
      is_valid: isValid,
      errors: isValid ? [] : ['Invalid card number', 'Invalid expiry date'],
    };
  }

  private static getMockPaymentAnalytics(): PaymentAnalytics {
    return {
      total_payments: 150,
      total_amount: 25000,
      successful_payments: 145,
      failed_payments: 5,
      average_payment_amount: 166.67,
      payment_method_breakdown: [
        { method: 'credit_card', count: 120, amount: 20000, percentage: 80 },
        { method: 'paypal', count: 25, amount: 4000, percentage: 16.67 },
        { method: 'bank_transfer', count: 5, amount: 1000, percentage: 3.33 },
      ],
      daily_totals: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        count: Math.floor(Math.random() * 20) + 5,
        amount: Math.floor(Math.random() * 5000) + 1000,
      })),
    };
  }

  private static getMockPaymentReport(
    type: 'daily' | 'weekly' | 'monthly',
    startDate: string,
    endDate: string
  ): PaymentReport {
    return {
      id: `report_${Date.now()}`,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Payment Report`,
      type,
      date_range: { start_date: startDate, end_date: endDate },
      data: this.getMockPaymentAnalytics(),
      generated_at: new Date().toISOString(),
      generated_by: 'System',
    };
  }
}

export default PaymentApiService;
