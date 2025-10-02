// Spare Parts Types
export interface SparePart {
  id: string;
  name: string;
  brand: string;
  model: string;
  year?: number;
  part_number: string;
  category: string;
  subcategory?: string;
  price: number;
  condition: 'new' | 'refurbished' | 'used' | 'remanufactured';
  compatibility: string[];
  description: string;
  images: string[];
  location: string;
  stock_quantity: number;
  min_order_quantity?: number;
  max_order_quantity?: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  seller_name?: string;
  seller_phone?: string;
  dealer_name?: string;
  dealer_logo?: string;
  rating?: number;
  is_featured?: boolean;
  is_urgent?: boolean;
  warranty_months?: number;
  created_at: string;
  updated_at: string;
  status: 'active' | 'pending' | 'sold' | 'inactive' | 'out_of_stock';
}

export interface SparePartFilters {
  page?: number;
  limit?: number;
  brand?: string;
  model?: string;
  category?: string;
  subcategory?: string;
  condition?: string;
  price_min?: number;
  price_max?: number;
  location?: string;
  in_stock?: boolean;
  featured?: boolean;
  sort_by?: 'price' | 'name' | 'brand' | 'created_at' | 'rating' | 'popularity';
  sort_order?: 'ASC' | 'DESC';
  search?: string;
}

export interface SparePartListResponse {
  success: boolean;
  message?: string;
  data: SparePart[];
}

export interface SparePartReview {
  id: string;
  user_id: string;
  spare_part_id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_name?: string;
}

export interface SparePartCartItem {
  id: string;
  spare_part: SparePart;
  quantity: number;
  selected_condition?: string;
}

export interface SparePartOrder {
  id: string;
  user_id: string;
  items: SparePartCartItem[];
  total_amount: number;
  shipping_address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
  };
  payment_method: string;
  order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  tracking_number?: string;
  estimated_delivery?: string;
  created_at: string;
  updated_at: string;
}

export interface SparePartWishlist {
  id: string;
  user_id: string;
  spare_part_id: string;
  added_at: string;
  spare_part?: SparePart;
}

// Compatibility types
export interface VehicleCompatibility {
  brand: string;
  model: string;
  year_from: number;
  year_to: number;
  engine?: string;
  transmission?: string;
}

export interface SparePartCompatibility extends VehicleCompatibility {
  part_position?: string;
  notes?: string;
}

// Search and filter types
export interface SparePartSearchSuggestion {
  id: string;
  text: string;
  type: 'brand' | 'model' | 'category' | 'part_number';
  count?: number;
}

export interface SparePartSearchFilters {
  query?: string;
  brands?: string[];
  models?: string[];
  categories?: string[];
  conditions?: string[];
  price_range?: {
    min: number;
    max: number;
  };
  location?: string;
  in_stock_only?: boolean;
  featured_only?: boolean;
}

// Analytics types
export interface SparePartAnalytics {
  total_parts: number;
  total_sellers: number;
  average_price: number;
  popular_categories: {
    category: string;
    count: number;
    percentage: number;
  }[];
  popular_brands: {
    brand: string;
    count: number;
    percentage: number;
  }[];
  price_ranges: {
    range: string;
    count: number;
    percentage: number;
  }[];
}
