// Analytics Types
export interface AnalyticsMetric {
  label: string;
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  format?: 'number' | 'currency' | 'percentage';
  icon?: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  date?: string;
  category?: string;
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area';
  title: string;
  datasets: ChartDataset[];
  labels: string[];
  options?: any;
}

// Time Range Types
export type TimeRange = 'today' | 'yesterday' | '7d' | '30d' | '90d' | '1y' | 'custom';

export interface DateRange {
  start: string;
  end: string;
}

// E-commerce Analytics
export interface EcommerceAnalytics {
  overview: {
    total_revenue: number;
    total_orders: number;
    total_products: number;
    total_customers: number;
    average_order_value: number;
    conversion_rate: number;
  };
  sales: {
    daily_sales: ChartDataPoint[];
    monthly_sales: ChartDataPoint[];
    sales_by_category: ChartDataPoint[];
    top_products: Array<{
      id: string;
      name: string;
      sales: number;
      revenue: number;
    }>;
  };
  customers: {
    new_customers: ChartDataPoint[];
    customer_retention: number;
    customer_lifetime_value: number;
    geographic_distribution: ChartDataPoint[];
  };
  inventory: {
    low_stock_items: number;
    out_of_stock_items: number;
    inventory_turnover: number;
    top_moving_products: Array<{
      id: string;
      name: string;
      stock_level: number;
      reorder_point: number;
    }>;
  };
}

// User Analytics
export interface UserAnalytics {
  overview: {
    total_users: number;
    active_users: number;
    new_registrations: number;
    user_retention: number;
    average_session_duration: number;
  };
  demographics: {
    by_role: ChartDataPoint[];
    by_location: ChartDataPoint[];
    by_device: ChartDataPoint[];
    age_groups: ChartDataPoint[];
  };
  behavior: {
    page_views: ChartDataPoint[];
    feature_usage: ChartDataPoint[];
    user_journey: Array<{
      step: string;
      users: number;
      conversion: number;
    }>;
  };
  engagement: {
    daily_active_users: ChartDataPoint[];
    session_frequency: ChartDataPoint[];
    bounce_rate: number;
    average_pages_per_session: number;
  };
}

// Payment Analytics
export interface PaymentAnalytics {
  overview: {
    total_payments: number;
    total_amount: number;
    successful_payments: number;
    failed_payments: number;
    average_payment_amount: number;
    payment_success_rate: number;
  };
  trends: {
    daily_payments: ChartDataPoint[];
    payment_methods: ChartDataPoint[];
    payment_volumes: ChartDataPoint[];
  };
  performance: {
    processing_times: ChartDataPoint[];
    failure_reasons: ChartDataPoint[];
    refund_rate: number;
    chargeback_rate: number;
  };
}

// Content Analytics
export interface ContentAnalytics {
  overview: {
    total_content: number;
    published_content: number;
    views: number;
    engagement_rate: number;
  };
  performance: {
    top_performing_content: Array<{
      id: string;
      title: string;
      type: string;
      views: number;
      engagement: number;
    }>;
    content_by_type: ChartDataPoint[];
    publishing_frequency: ChartDataPoint[];
  };
  engagement: {
    comments: ChartDataPoint[];
    shares: ChartDataPoint[];
    likes: ChartDataPoint[];
  };
}

// System Analytics
export interface SystemAnalytics {
  performance: {
    response_time: number;
    uptime: number;
    error_rate: number;
    api_calls: ChartDataPoint[];
  };
  resources: {
    cpu_usage: ChartDataPoint[];
    memory_usage: ChartDataPoint[];
    disk_usage: ChartDataPoint[];
    bandwidth_usage: ChartDataPoint[];
  };
  security: {
    failed_logins: ChartDataPoint[];
    security_incidents: number;
    active_sessions: number;
    suspicious_activities: ChartDataPoint[];
  };
}

// Real-time Analytics
export interface RealtimeAnalytics {
  active_users: number;
  current_sessions: number;
  page_views_last_minute: number;
  api_requests_last_minute: number;
  errors_last_hour: number;
  top_pages: Array<{
    path: string;
    views: number;
    users: number;
  }>;
}

// Report Types
export interface AnalyticsReport {
  id: string;
  title: string;
  type: 'overview' | 'detailed' | 'custom';
  time_range: TimeRange;
  date_range?: DateRange;
  sections: string[];
  generated_at: string;
  generated_by: string;
  data: any;
}

// Dashboard Configuration
export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'list';
  title: string;
  position: { x: number; y: number; w: number; h: number };
  data_source: string;
  configuration: any;
  refresh_interval?: number;
}

export interface DashboardLayout {
  id: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// Event Tracking
export interface AnalyticsEvent {
  id: string;
  user_id?: string;
  session_id: string;
  event_type: string;
  event_name: string;
  properties: Record<string, any>;
  timestamp: string;
  page_url?: string;
  user_agent?: string;
  ip_address?: string;
}

// Funnel Analytics
export interface FunnelStep {
  id: string;
  name: string;
  order: number;
  users_entered: number;
  users_completed: number;
  conversion_rate: number;
  drop_off_rate: number;
}

export interface FunnelAnalytics {
  id: string;
  name: string;
  steps: FunnelStep[];
  total_users: number;
  overall_conversion_rate: number;
  created_at: string;
}

// A/B Testing Analytics
export interface ABTestVariant {
  id: string;
  name: string;
  traffic_percentage: number;
  users_exposed: number;
  conversions: number;
  conversion_rate: number;
}

export interface ABTestAnalytics {
  id: string;
  name: string;
  status: 'draft' | 'running' | 'completed' | 'paused';
  variants: ABTestVariant[];
  start_date: string;
  end_date?: string;
  statistical_significance: number;
  winner_variant_id?: string;
}

// Notification Analytics
export interface NotificationAnalytics {
  sent_notifications: number;
  delivered_notifications: number;
  opened_notifications: number;
  clicked_notifications: number;
  delivery_rate: number;
  open_rate: number;
  click_rate: number;
  unsubscribes: number;
}

// Search Analytics
export interface SearchAnalytics {
  total_searches: number;
  unique_searchers: number;
  average_searches_per_user: number;
  top_search_terms: Array<{
    term: string;
    count: number;
    results_count: number;
    click_through_rate: number;
  }>;
  no_results_searches: number;
  search_success_rate: number;
}

// Export Analytics
export interface ExportFormat {
  format: 'csv' | 'excel' | 'pdf' | 'json';
  sections: string[];
  date_range?: DateRange;
  filters?: Record<string, any>;
}

export interface ExportJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  format: ExportFormat;
  download_url?: string;
  expires_at?: string;
  created_at: string;
  completed_at?: string;
  error_message?: string;
}
