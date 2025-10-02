import apiClient from './apiClient';
import {
  EcommerceAnalytics,
  UserAnalytics,
  PaymentAnalytics,
  ContentAnalytics,
  SystemAnalytics,
  RealtimeAnalytics,
  AnalyticsReport,
  DashboardLayout,
  DashboardWidget,
  AnalyticsEvent,
  FunnelAnalytics,
  ABTestAnalytics,
  NotificationAnalytics,
  SearchAnalytics,
  TimeRange,
  DateRange,
  ChartConfig,
  AnalyticsMetric,
} from '../../types/analytics.types';

export class AnalyticsApiService {
  /**
   * Get e-commerce analytics data
   */
  static async getEcommerceAnalytics(
    timeRange: TimeRange = '30d',
    dateRange?: DateRange
  ): Promise<EcommerceAnalytics> {
    try {
      const response = await apiClient.get('/analytics/ecommerce', {
        params: { time_range: timeRange, ...dateRange }
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching e-commerce analytics:', error);
      if (error.response?.status === 404) {
        return this.getMockEcommerceAnalytics();
      }
      throw error;
    }
  }

  /**
   * Get user analytics data
   */
  static async getUserAnalytics(
    timeRange: TimeRange = '30d',
    dateRange?: DateRange
  ): Promise<UserAnalytics> {
    try {
      const response = await apiClient.get('/analytics/users', {
        params: { time_range: timeRange, ...dateRange }
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching user analytics:', error);
      if (error.response?.status === 404) {
        return this.getMockUserAnalytics();
      }
      throw error;
    }
  }

  /**
   * Get payment analytics data
   */
  static async getPaymentAnalytics(
    timeRange: TimeRange = '30d',
    dateRange?: DateRange
  ): Promise<PaymentAnalytics> {
    try {
      const response = await apiClient.get('/analytics/payments', {
        params: { time_range: timeRange, ...dateRange }
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching payment analytics:', error);
      if (error.response?.status === 404) {
        return this.getMockPaymentAnalytics();
      }
      throw error;
    }
  }

  /**
   * Get content analytics data
   */
  static async getContentAnalytics(
    timeRange: TimeRange = '30d',
    dateRange?: DateRange
  ): Promise<ContentAnalytics> {
    try {
      const response = await apiClient.get('/analytics/content', {
        params: { time_range: timeRange, ...dateRange }
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching content analytics:', error);
      if (error.response?.status === 404) {
        return this.getMockContentAnalytics();
      }
      throw error;
    }
  }

  /**
   * Get system analytics data
   */
  static async getSystemAnalytics(
    timeRange: TimeRange = '7d',
    dateRange?: DateRange
  ): Promise<SystemAnalytics> {
    try {
      const response = await apiClient.get('/analytics/system', {
        params: { time_range: timeRange, ...dateRange }
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching system analytics:', error);
      if (error.response?.status === 404) {
        return this.getMockSystemAnalytics();
      }
      throw error;
    }
  }

  /**
   * Get real-time analytics data
   */
  static async getRealtimeAnalytics(): Promise<RealtimeAnalytics> {
    try {
      const response = await apiClient.get('/analytics/realtime');
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching real-time analytics:', error);
      if (error.response?.status === 404) {
        return this.getMockRealtimeAnalytics();
      }
      throw error;
    }
  }

  /**
   * Track an analytics event
   */
  static async trackEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>): Promise<void> {
    try {
      await apiClient.post('/analytics/events', {
        ...event,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('Error tracking event:', error);
      if (error.response?.status === 404) {
        // Silently succeed for development
        return;
      }
      throw error;
    }
  }

  /**
   * Get analytics dashboard data
   */
  static async getDashboardData(dashboardId?: string): Promise<{
    metrics: AnalyticsMetric[];
    charts: ChartConfig[];
    layout: DashboardLayout;
  }> {
    try {
      const response = await apiClient.get(`/analytics/dashboard${dashboardId ? `/${dashboardId}` : ''}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      if (error.response?.status === 404) {
        return this.getMockDashboardData();
      }
      throw error;
    }
  }

  /**
   * Generate analytics report
   */
  static async generateReport(
    type: 'overview' | 'detailed' | 'custom',
    sections: string[],
    timeRange: TimeRange,
    dateRange?: DateRange
  ): Promise<AnalyticsReport> {
    try {
      const response = await apiClient.post('/analytics/reports/generate', {
        type,
        sections,
        time_range: timeRange,
        ...dateRange,
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Error generating report:', error);
      if (error.response?.status === 404) {
        return this.getMockAnalyticsReport(type, sections, timeRange, dateRange);
      }
      throw error;
    }
  }

  /**
   * Get funnel analytics
   */
  static async getFunnelAnalytics(funnelId: string): Promise<FunnelAnalytics> {
    try {
      const response = await apiClient.get(`/analytics/funnels/${funnelId}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching funnel analytics:', error);
      if (error.response?.status === 404) {
        return this.getMockFunnelAnalytics(funnelId);
      }
      throw error;
    }
  }

  /**
   * Get A/B test analytics
   */
  static async getABTestAnalytics(testId: string): Promise<ABTestAnalytics> {
    try {
      const response = await apiClient.get(`/analytics/ab-tests/${testId}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching A/B test analytics:', error);
      if (error.response?.status === 404) {
        return this.getMockABTestAnalytics(testId);
      }
      throw error;
    }
  }

  /**
   * Get search analytics
   */
  static async getSearchAnalytics(
    timeRange: TimeRange = '30d',
    dateRange?: DateRange
  ): Promise<SearchAnalytics> {
    try {
      const response = await apiClient.get('/analytics/search', {
        params: { time_range: timeRange, ...dateRange }
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching search analytics:', error);
      if (error.response?.status === 404) {
        return this.getMockSearchAnalytics();
      }
      throw error;
    }
  }

  /**
   * Get notification analytics
   */
  static async getNotificationAnalytics(
    timeRange: TimeRange = '30d',
    dateRange?: DateRange
  ): Promise<NotificationAnalytics> {
    try {
      const response = await apiClient.get('/analytics/notifications', {
        params: { time_range: timeRange, ...dateRange }
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching notification analytics:', error);
      if (error.response?.status === 404) {
        return this.getMockNotificationAnalytics();
      }
      throw error;
    }
  }

  // Mock data methods for development
  private static getMockEcommerceAnalytics(): EcommerceAnalytics {
    return {
      overview: {
        total_revenue: 125000,
        total_orders: 450,
        total_products: 1200,
        total_customers: 380,
        average_order_value: 277.78,
        conversion_rate: 3.2,
      },
      sales: {
        daily_sales: Array.from({ length: 30 }, (_, i) => ({
          label: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          value: Math.floor(Math.random() * 5000) + 1000,
        })).reverse(),
        monthly_sales: Array.from({ length: 12 }, (_, i) => ({
          label: new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short' }),
          value: Math.floor(Math.random() * 15000) + 5000,
        })),
        sales_by_category: [
          { label: 'Cars', value: 45000 },
          { label: 'Spare Parts', value: 35000 },
          { label: 'Services', value: 25000 },
          { label: 'Accessories', value: 20000 },
        ],
        top_products: [
          { id: '1', name: 'Brake Pad Set', sales: 45, revenue: 4045.50 },
          { id: '2', name: 'Engine Oil Filter', sales: 38, revenue: 493.62 },
          { id: '3', name: 'LED Headlights', sales: 32, revenue: 9599.68 },
          { id: '4', name: 'Car Battery', sales: 28, revenue: 5039.72 },
        ],
      },
      customers: {
        new_customers: Array.from({ length: 30 }, (_, i) => ({
          label: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          value: Math.floor(Math.random() * 15) + 5,
        })).reverse(),
        customer_retention: 78.5,
        customer_lifetime_value: 325.50,
        geographic_distribution: [
          { label: 'United States', value: 45 },
          { label: 'Canada', value: 25 },
          { label: 'United Kingdom', value: 15 },
          { label: 'Australia', value: 10 },
          { label: 'Others', value: 5 },
        ],
      },
      inventory: {
        low_stock_items: 23,
        out_of_stock_items: 5,
        inventory_turnover: 4.2,
        top_moving_products: [
          { id: '1', name: 'Brake Pad Set', stock_level: 45, reorder_point: 20 },
          { id: '2', name: 'Engine Oil Filter', stock_level: 38, reorder_point: 15 },
          { id: '3', name: 'LED Headlights', stock_level: 32, reorder_point: 10 },
          { id: '4', name: 'Car Battery', stock_level: 28, reorder_point: 12 },
        ],
      },
    };
  }

  private static getMockUserAnalytics(): UserAnalytics {
    return {
      overview: {
        total_users: 15420,
        active_users: 8930,
        new_registrations: 245,
        user_retention: 68.5,
        average_session_duration: 8.5,
      },
      demographics: {
        by_role: [
          { label: 'Buyers', value: 8500 },
          { label: 'Sellers', value: 4200 },
          { label: 'Students', value: 1800 },
          { label: 'Instructors', value: 920 },
        ],
        by_location: [
          { label: 'North America', value: 45 },
          { label: 'Europe', value: 30 },
          { label: 'Asia', value: 15 },
          { label: 'Others', value: 10 },
        ],
        by_device: [
          { label: 'Desktop', value: 55 },
          { label: 'Mobile', value: 35 },
          { label: 'Tablet', value: 10 },
        ],
        age_groups: [
          { label: '18-24', value: 15 },
          { label: '25-34', value: 35 },
          { label: '35-44', value: 25 },
          { label: '45+', value: 25 },
        ],
      },
      behavior: {
        page_views: Array.from({ length: 30 }, (_, i) => ({
          label: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          value: Math.floor(Math.random() * 5000) + 2000,
        })).reverse(),
        feature_usage: [
          { label: 'Car Listings', value: 85 },
          { label: 'Spare Parts', value: 72 },
          { label: 'Payment', value: 68 },
          { label: 'Profile', value: 45 },
        ],
        user_journey: [
          { step: 'Landing Page', users: 10000, conversion: 100 },
          { step: 'Registration', users: 2500, conversion: 25 },
          { step: 'First Purchase', users: 890, conversion: 35.6 },
          { step: 'Repeat Purchase', users: 445, conversion: 50 },
        ],
      },
      engagement: {
        daily_active_users: Array.from({ length: 30 }, (_, i) => ({
          label: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          value: Math.floor(Math.random() * 800) + 400,
        })).reverse(),
        session_frequency: [
          { label: 'Daily', value: 45 },
          { label: 'Weekly', value: 30 },
          { label: 'Monthly', value: 25 },
        ],
        bounce_rate: 32.5,
        average_pages_per_session: 4.2,
      },
    };
  }

  private static getMockPaymentAnalytics(): PaymentAnalytics {
    return {
      overview: {
        total_payments: 1250,
        total_amount: 285000,
        successful_payments: 1180,
        failed_payments: 70,
        average_payment_amount: 228,
        payment_success_rate: 94.4,
      },
      trends: {
        daily_payments: Array.from({ length: 30 }, (_, i) => ({
          label: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          value: Math.floor(Math.random() * 50) + 20,
        })).reverse(),
        payment_methods: [
          { label: 'Credit Card', value: 65 },
          { label: 'PayPal', value: 25 },
          { label: 'Bank Transfer', value: 10 },
        ],
        payment_volumes: Array.from({ length: 12 }, (_, i) => ({
          label: new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short' }),
          value: Math.floor(Math.random() * 30000) + 15000,
        })),
      },
      performance: {
        processing_times: Array.from({ length: 7 }, (_, i) => ({
          label: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
          value: Math.floor(Math.random() * 3) + 1,
        })),
        failure_reasons: [
          { label: 'Card Declined', value: 45 },
          { label: 'Insufficient Funds', value: 25 },
          { label: 'Network Error', value: 20 },
          { label: 'Other', value: 10 },
        ],
        refund_rate: 2.5,
        chargeback_rate: 0.8,
      },
    };
  }

  private static getMockContentAnalytics(): ContentAnalytics {
    return {
      overview: {
        total_content: 450,
        published_content: 380,
        views: 125000,
        engagement_rate: 4.2,
      },
      performance: {
        top_performing_content: [
          { id: '1', title: 'How to Choose the Right Car', type: 'Article', views: 15000, engagement: 8.5 },
          { id: '2', title: 'Car Maintenance Tips', type: 'Video', views: 12000, engagement: 7.2 },
          { id: '3', title: 'Buying Guide 2024', type: 'Guide', views: 10000, engagement: 6.8 },
        ],
        content_by_type: [
          { label: 'Articles', value: 45 },
          { label: 'Videos', value: 30 },
          { label: 'Guides', value: 15 },
          { label: 'FAQs', value: 10 },
        ],
        publishing_frequency: Array.from({ length: 12 }, (_, i) => ({
          label: new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short' }),
          value: Math.floor(Math.random() * 20) + 10,
        })),
      },
      engagement: {
        comments: Array.from({ length: 30 }, (_, i) => ({
          label: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          value: Math.floor(Math.random() * 50) + 10,
        })).reverse(),
        shares: Array.from({ length: 30 }, (_, i) => ({
          label: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          value: Math.floor(Math.random() * 30) + 5,
        })).reverse(),
        likes: Array.from({ length: 30 }, (_, i) => ({
          label: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          value: Math.floor(Math.random() * 100) + 20,
        })).reverse(),
      },
    };
  }

  private static getMockSystemAnalytics(): SystemAnalytics {
    return {
      performance: {
        response_time: 245,
        uptime: 99.8,
        error_rate: 0.2,
        api_calls: Array.from({ length: 24 }, (_, i) => ({
          label: `${i}:00`,
          value: Math.floor(Math.random() * 1000) + 500,
        })),
      },
      resources: {
        cpu_usage: Array.from({ length: 24 }, (_, i) => ({
          label: `${i}:00`,
          value: Math.floor(Math.random() * 40) + 20,
        })),
        memory_usage: Array.from({ length: 24 }, (_, i) => ({
          label: `${i}:00`,
          value: Math.floor(Math.random() * 30) + 40,
        })),
        disk_usage: Array.from({ length: 24 }, (_, i) => ({
          label: `${i}:00`,
          value: Math.floor(Math.random() * 20) + 60,
        })),
        bandwidth_usage: Array.from({ length: 24 }, (_, i) => ({
          label: `${i}:00`,
          value: Math.floor(Math.random() * 50) + 25,
        })),
      },
      security: {
        failed_logins: Array.from({ length: 7 }, (_, i) => ({
          label: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
          value: Math.floor(Math.random() * 10) + 2,
        })),
        security_incidents: 3,
        active_sessions: 127,
        suspicious_activities: Array.from({ length: 7 }, (_, i) => ({
          label: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
          value: Math.floor(Math.random() * 5) + 1,
        })),
      },
    };
  }

  private static getMockRealtimeAnalytics(): RealtimeAnalytics {
    return {
      active_users: 127,
      current_sessions: 89,
      page_views_last_minute: 45,
      api_requests_last_minute: 234,
      errors_last_hour: 3,
      top_pages: [
        { path: '/app/cars', views: 23, users: 18 },
        { path: '/app/dashboard', views: 15, users: 12 },
        { path: '/app/spare-parts', views: 12, users: 9 },
        { path: '/app/payments', views: 8, users: 6 },
      ],
    };
  }

  private static getMockDashboardData() {
    return {
      metrics: [
        { label: 'Total Revenue', value: '$125,000', change: 12.5, changeType: 'increase' },
        { label: 'Active Users', value: '8,930', change: 8.2, changeType: 'increase' },
        { label: 'Total Orders', value: '450', change: -2.1, changeType: 'decrease' },
        { label: 'Conversion Rate', value: '3.2%', change: 0.5, changeType: 'increase' },
      ],
      charts: [
        {
          type: 'line',
          title: 'Revenue Trend',
          datasets: [{
            label: 'Revenue',
            data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 5000) + 2000),
          }],
          labels: Array.from({ length: 30 }, (_, i) =>
            new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          ).reverse(),
        },
      ],
      layout: {
        id: 'default',
        name: 'Default Dashboard',
        widgets: [],
        is_default: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };
  }

  private static getMockAnalyticsReport(
    type: string,
    sections: string[],
    timeRange: TimeRange,
    dateRange?: DateRange
  ): AnalyticsReport {
    return {
      id: `report_${Date.now()}`,
      title: `${type} Analytics Report`,
      type: type as any,
      time_range: timeRange,
      date_range: dateRange,
      sections,
      generated_at: new Date().toISOString(),
      generated_by: 'System',
      data: {},
    };
  }

  private static getMockFunnelAnalytics(funnelId: string): FunnelAnalytics {
    return {
      id: funnelId,
      name: 'Purchase Funnel',
      steps: [
        { id: '1', name: 'Landing Page', order: 1, users_entered: 10000, users_completed: 10000, conversion_rate: 100, drop_off_rate: 0 },
        { id: '2', name: 'Product View', order: 2, users_entered: 2500, users_completed: 2500, conversion_rate: 25, drop_off_rate: 75 },
        { id: '3', name: 'Add to Cart', order: 3, users_entered: 890, users_completed: 890, conversion_rate: 35.6, drop_off_rate: 64.4 },
        { id: '4', name: 'Checkout', order: 4, users_entered: 445, users_completed: 445, conversion_rate: 50, drop_off_rate: 50 },
        { id: '5', name: 'Purchase', order: 5, users_entered: 320, users_completed: 320, conversion_rate: 71.9, drop_off_rate: 28.1 },
      ],
      total_users: 10000,
      overall_conversion_rate: 3.2,
      created_at: new Date().toISOString(),
    };
  }

  private static getMockABTestAnalytics(testId: string): ABTestAnalytics {
    return {
      id: testId,
      name: 'Homepage CTA Test',
      status: 'completed',
      variants: [
        { id: '1', name: 'Original', traffic_percentage: 50, users_exposed: 5000, conversions: 160, conversion_rate: 3.2 },
        { id: '2', name: 'Variant A', traffic_percentage: 50, users_exposed: 5000, conversions: 185, conversion_rate: 3.7 },
      ],
      start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end_date: new Date().toISOString(),
      statistical_significance: 95.2,
      winner_variant_id: '2',
    };
  }

  private static getMockSearchAnalytics(): SearchAnalytics {
    return {
      total_searches: 15420,
      unique_searchers: 8930,
      average_searches_per_user: 1.73,
      top_search_terms: [
        { term: 'brake pads', count: 450, results_count: 125, click_through_rate: 28.5 },
        { term: 'engine oil', count: 380, results_count: 89, click_through_rate: 23.4 },
        { term: 'car battery', count: 320, results_count: 67, click_through_rate: 20.9 },
        { term: 'tires', count: 280, results_count: 156, click_through_rate: 17.9 },
      ],
      no_results_searches: 1250,
      search_success_rate: 91.9,
    };
  }

  private static getMockNotificationAnalytics(): NotificationAnalytics {
    return {
      sent_notifications: 25000,
      delivered_notifications: 24250,
      opened_notifications: 18200,
      clicked_notifications: 4550,
      delivery_rate: 97,
      open_rate: 75.1,
      click_rate: 25,
      unsubscribes: 125,
    };
  }
}

export default AnalyticsApiService;
