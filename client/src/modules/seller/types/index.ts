// Seller Types
export interface SellerProfile {
  id: string;
  user_id: string;
  business_name: string;
  business_type: string;
  license_number?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  images?: string[];
  business_hours?: Record<string, any>;
  services?: string[];
  status: 'active' | 'pending_verification' | 'suspended' | 'inactive';
  is_verified?: boolean;
  verification_documents?: any[];
  created_at: string;
  updated_at: string;
}

export interface Car {
  id: string;
  seller_id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  car_condition: 'new' | 'used' | 'certified';
  fuel_type: string;
  transmission: string;
  body_type: string;
  color: string;
  location: string;
  images: string[];
  features: string[];
  specifications: Record<string, any>;
  description?: string;
  vin?: string;
  engine_size?: string;
  horsepower?: number;
  torque?: string;
  status: 'active' | 'pending' | 'sold' | 'draft' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface SellerStats {
  inventory: {
    total_vehicles: number;
    active_listings: number;
    sold_vehicles: number;
    average_price: number;
    total_views?: number;
    total_favorites?: number;
    conversion_rate?: number;
  };
  sales: {
    total_sales: number;
    total_revenue: number;
    average_sale_price: number;
  };
  recent_sales: Car[];
  monthly_sales: Array<{
    month: string;
    sales_count: number;
    monthly_revenue: number;
  }>;
}

export interface SellerAnalytics {
  sales_by_period: Array<{
    period: string;
    sales_count: number;
    total_revenue: number;
    average_price: number;
  }>;
  top_selling_models: Array<{
    make: string;
    model: string;
    sales_count: number;
    total_revenue: number;
    average_price: number;
  }>;
  sales_by_channel?: Array<{
    channel: string;
    sales: number;
  }>;
  sales_by_location?: Array<{
    region: string;
    revenue: number;
  }>;
  conversion_rate?: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}
