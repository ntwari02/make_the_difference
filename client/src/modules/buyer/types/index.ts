// Buyer types and interfaces

export interface BuyerProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  preferences?: {
    notifications: boolean;
    priceAlerts: boolean;
    savedSearches: boolean;
  };
  bio?: string;
  address?: any;
  created_at: string;
  updated_at: string;
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
  seller_info?: {
    business_name: string;
    rating: number;
    review_count: number;
  };
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  car_id: string;
  vehicle: Vehicle;
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  car_id: string;
  rating: number;
  title: string;
  comment: string;
  status: 'active' | 'pending' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface SearchFilters {
  brand?: string;
  model?: string;
  year_min?: number;
  year_max?: number;
  price_min?: number;
  price_max?: number;
  fuel_type?: string;
  transmission?: string;
  body_type?: string;
  car_condition?: string;
  location?: string;
  sort_by?: string;
  sort_order?: 'ASC' | 'DESC';
}

export interface SavedSearch {
  id: string;
  name: string;
  filters: SearchFilters;
  notify: boolean;
  created_at: string;
}

export interface BuyerStats {
  total_favorites: number;
  recent_views: number;
  saved_searches: number;
  reviews_written: number;
}

