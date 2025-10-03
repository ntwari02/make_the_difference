import api from '../core/services/api/apiClient';

export interface DealerStats {
  total_vehicles: number;
  active_listings: number;
  sold_vehicles: number;
  average_price: number;
  total_sales: number;
  total_revenue: number;
  average_sale_price: number;
  recent_sales: Array<{
    id: string;
    make: string;
    model: string;
    year: number;
    price: number;
    sold_at: string;
  }>;
  views_count?: number;
  inquiries_count?: number;
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

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  condition: string;
  status: string;
  images: string[];
  created_at: string;
}

class DealerAPI {
  // Get current dealer's profile
  async getMyProfile(): Promise<DealerProfile> {
    const response = await api.get('/dealers/profile/my');
    const payload: any = (response as any).data;
    return (payload && (payload.data ?? payload)) as DealerProfile;
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
}

export const dealerAPI = new DealerAPI();

