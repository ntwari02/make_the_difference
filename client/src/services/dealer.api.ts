import api from '../core/services/api/apiClient';

export interface DealerStats {
  inventory: {
    total_vehicles: number;
    active_listings: number;
    sold_vehicles: number;
    average_price: number;
  };
  sales: {
    total_sales: number;
    total_revenue: number;
    average_sale_price: number;
  };
  recent_sales: Array<{
    id: string;
    make: string;
    model: string;
    year: number;
    price: number;
    sold_at: string;
  }>;
  monthly_sales: Array<{
    month: string;
    sales_count: number;
    monthly_revenue: number;
  }>;
}

export interface DealerAnalytics {
  period: string;
  sales_count: number;
  total_revenue: number;
  average_price: number;
  min_price: number;
  max_price: number;
}

export interface DealerProfile {
  id: string;
  business_name: string;
  business_type: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  logo: string;
  status: string;
  active_listings: number;
  average_rating: number;
  review_count: number;
}

export interface DealerReview {
  id: string;
  customer_id: string;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface DealerSearchFilters {
  business_name?: string;
  city?: string;
  state?: string;
  business_type?: string;
  status?: string;
  min_rating?: number;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  condition: string;
  fuel_type?: string;
  transmission?: string;
  body_type?: string;
  color?: string;
  description?: string;
  features?: string[];
  vin?: string;
  engine_size?: string | number;
  horsepower?: number;
  torque?: number;
  status: string;
  images?: string[];
  created_at: string;
}

class DealerAPI {
  // Get current dealer's profile
  async getMyProfile(): Promise<DealerProfile> {
    const response = await api.get('/dealers/profile/my');
    const payload: any = (response as any).data;
    return (payload && (payload.data ?? payload)) as DealerProfile;
  }

  // Get my dealer ID by looking up the dealer profile
  async getMyDealerId(): Promise<string | null> {
    try {
      const profile = await this.getMyProfile();
      return profile?.id || null;
    } catch (error) {
      console.error('Error getting dealer ID:', error);
      return null;
    }
  }

  // Get dealer statistics
  async getDealerStats(dealerId: string): Promise<DealerStats> {
    const response = await api.get(`/dealers/profile/${dealerId}/stats`);
    const payload: any = (response as any).data;
    return (payload && (payload.data ?? payload)) as DealerStats;
  }

  // Get dealer sales analytics
  async getDealerAnalytics(
    dealerId: string,
    startDate?: string,
    endDate?: string,
    period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly'
  ): Promise<DealerAnalytics[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    params.append('period', period);

    const response = await api.get(
      `/dealers/profile/${dealerId}/analytics?${params.toString()}`
    );
    const payload: any = (response as any).data;
    return (payload && (payload.data ?? payload)) as DealerAnalytics[];
  }

  // Get dealer inventory
  async getDealerInventory(
    dealerId: string,
    page: number = 1,
    limit: number = 20,
    filters: Record<string, any> = {}
  ): Promise<{ inventory: Vehicle[]; pagination: any }> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, String(value));
    });

    const response = await api.get(
      `/dealers/profile/${dealerId}/inventory?${params.toString()}`
    );
    const payload: any = (response as any).data || {};
    const data = payload.data ?? payload;
    return {
      inventory: data?.inventory ?? data ?? [],
      pagination: payload.pagination ?? data?.pagination ?? {},
    };
  }

  // Create dealer profile
  async createProfile(profileData: any): Promise<DealerProfile> {
    const response = await api.post('/dealers/profile', profileData);
    const payload: any = (response as any).data;
    return (payload && (payload.data ?? payload)) as DealerProfile;
  }

  // Update dealer profile
  async updateProfile(dealerId: string, profileData: any): Promise<DealerProfile> {
    const response = await api.put(`/dealers/profile/${dealerId}`, profileData);
    const payload: any = (response as any).data;
    return (payload && (payload.data ?? payload)) as DealerProfile;
  }

  // Add vehicle to inventory
  async addVehicle(dealerId: string, vehicleData: Partial<Vehicle>): Promise<Vehicle> {
    const response = await api.post(
      `/dealers/profile/${dealerId}/inventory`,
      vehicleData
    );
    const payload: any = (response as any).data;
    return (payload && (payload.data ?? payload)) as Vehicle;
  }

  // Update vehicle in inventory
  async updateVehicle(
    dealerId: string,
    vehicleId: string,
    vehicleData: Partial<Vehicle>
  ): Promise<void> {
    await api.put(
      `/dealers/profile/${dealerId}/inventory/${vehicleId}`,
      vehicleData
    );
  }

  // Delete vehicle from inventory
  async deleteVehicle(dealerId: string, vehicleId: string): Promise<void> {
    await api.delete(`/dealers/profile/${dealerId}/inventory/${vehicleId}`);
  }

  // Get specific dealer profile by ID
  async getDealerProfile(dealerId: string): Promise<DealerProfile> {
    const response = await api.get(`/dealers/profile/${dealerId}`);
    const payload: any = (response as any).data;
    return (payload && (payload.data ?? payload)) as DealerProfile;
  }

  // Get dealer reviews
  async getDealerReviews(
    dealerId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ reviews: DealerReview[]; pagination: any }> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    
    const response = await api.get(
      `/dealers/profile/${dealerId}/reviews?${params.toString()}`
    );
    const payload: any = (response as any).data || {};
    const data = payload.data ?? payload;
    return {
      reviews: data?.reviews ?? data ?? [],
      pagination: payload.pagination ?? data?.pagination ?? {},
    };
  }

  // Search dealers with filters
  async searchDealers(
    page: number = 1,
    limit: number = 20,
    filters: DealerSearchFilters = {}
  ): Promise<{ dealers: DealerProfile[]; pagination: any }> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, String(value));
    });

    const response = await api.get(
      `/dealers/search?${params.toString()}`
    );
    const payload: any = (response as any).data || {};
    const data = payload.data ?? payload;
    return {
      dealers: data?.dealers ?? data ?? [],
      pagination: payload.pagination ?? data?.pagination ?? {},
    };
  }

  // Admin: Get all dealers
  async getAllDealers(
    page: number = 1,
    limit: number = 20,
    filters: any = {}
  ): Promise<{ dealers: DealerProfile[]; pagination: any }> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, String(value));
    });

    const response = await api.get(
      `/dealers/admin/all?${params.toString()}`
    );
    const payload: any = (response as any).data || {};
    const data = payload.data ?? payload;
    return {
      dealers: data?.dealers ?? data ?? [],
      pagination: payload.pagination ?? data?.pagination ?? {},
    };
  }

  // Admin: Verify dealer
  async verifyDealer(
    dealerId: string,
    status: 'verified' | 'rejected',
    verificationDocuments?: any
  ): Promise<void> {
    await api.put(`/dealers/admin/${dealerId}/verify`, {
      status,
      verification_documents: verificationDocuments,
    });
  }

  // Admin: Update dealer status
  async updateDealerStatus(
    dealerId: string,
    status: string,
    reason?: string
  ): Promise<void> {
    await api.put(`/dealers/admin/${dealerId}/status`, {
      status,
      reason,
    });
  }
}

export const dealerAPI = new DealerAPI();

