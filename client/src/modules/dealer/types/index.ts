// Dealer types and interfaces

export interface DealerProfile {
  id: string;
  business_name: string;
  business_type: 'dealership' | 'private_seller' | 'auction_house' | 'rental_company';
  license_number?: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code?: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  images?: string[];
  rating: number;
  review_count: number;
  is_verified: boolean;
  verification_documents?: any;
  business_hours?: BusinessHours;
  services?: string[];
  status: 'active' | 'inactive' | 'suspended' | 'pending_verification';
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface BusinessHours {
  monday?: { open: string; close: string; closed?: boolean };
  tuesday?: { open: string; close: string; closed?: boolean };
  wednesday?: { open: string; close: string; closed?: boolean };
  thursday?: { open: string; close: string; closed?: boolean };
  friday?: { open: string; close: string; closed?: boolean };
  saturday?: { open: string; close: string; closed?: boolean };
  sunday?: { open: string; close: string; closed?: boolean };
}

export interface Vehicle {
  id: string;
  title: string;
  description?: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  currency: string;
  car_condition: 'new' | 'used' | 'certified';
  fuel_type: 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'lpg' | 'cng';
  transmission: 'manual' | 'automatic' | 'semi-automatic';
  body_type: 'sedan' | 'suv' | 'hatchback' | 'coupe' | 'convertible' | 'wagon' | 'pickup' | 'van';
  color: string;
  engine_size?: string;
  horsepower?: number;
  vin?: string;
  location: string;
  latitude?: number;
  longitude?: number;
  images?: string[];
  features?: string[];
  model_3d_url?: string;
  model_3d_format?: 'gltf' | 'glb' | 'obj' | 'fbx' | 'dae';
  has_3d_model: boolean;
  status: 'active' | 'sold' | 'pending' | 'draft';
  is_featured: boolean;
  views_count: number;
  seller_id: string;
  dealer_id?: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_listings: number;
  active_listings: number;
  sold_cars: number;
  pending_listings: number;
  draft_listings: number;
  total_views: number;
  total_favorites: number;
  total_inquiries: number;
  total_revenue: number;
  this_month_sales: number;
  last_month_sales: number;
  growth_percentage: number;
}

export interface SalesAnalytics {
  date: string;
  sales: number;
  revenue: number;
  views: number;
}

export interface Notification {
  id: string;
  type: 'inquiry' | 'sale' | 'verification' | 'system' | 'message';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  link?: string;
}

export interface Activity {
  id: string;
  type: 'created' | 'updated' | 'deleted' | 'sold' | 'inquiry';
  description: string;
  vehicle_id?: string;
  vehicle_title?: string;
  timestamp: string;
  user?: string;
}

export interface TeamMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  phone?: string;
  is_active: boolean;
  permissions: string[];
  created_at: string;
}

export interface Inquiry {
  id: string;
  vehicle_id: string;
  vehicle_title: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  message: string;
  status: 'new' | 'in_progress' | 'responded' | 'closed';
  created_at: string;
  responded_at?: string;
}

