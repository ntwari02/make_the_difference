import apiClient from './apiClient';

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

export class SparePartsApiService {
  /**
   * Get list of spare parts with optional filters
   */
  static async listSpareParts(filters: SparePartFilters = {}): Promise<SparePart[]> {
    try {
      const response = await apiClient.get('/spare-parts', { params: filters });
      return response.data.data || [];
    } catch (error: any) {
      console.error('Error fetching spare parts:', error);
      if (error.response?.status === 404) {
        // Return mock data when endpoint doesn't exist
        return this.getMockSpareParts();
      }
      throw error;
    }
  }

  /**
   * Search spare parts with text query
   */
  static async searchSpareParts(query: string, filters: SparePartFilters = {}): Promise<SparePart[]> {
    try {
      const response = await apiClient.get('/spare-parts/search', {
        params: { ...filters, q: query }
      });
      return response.data.data || [];
    } catch (error: any) {
      console.error('Error searching spare parts:', error);
      if (error.response?.status === 404) {
        // Return filtered mock data when endpoint doesn't exist
        const allParts = this.getMockSpareParts();
        return allParts.filter(part =>
          part.name.toLowerCase().includes(query.toLowerCase()) ||
          part.brand.toLowerCase().includes(query.toLowerCase()) ||
          part.part_number.toLowerCase().includes(query.toLowerCase())
        );
      }
      throw error;
    }
  }

  /**
   * Get a specific spare part by ID
   */
  static async getSparePartById(sparePartId: string): Promise<SparePart> {
    try {
      const response = await apiClient.get(`/spare-parts/${sparePartId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching spare part:', error);
      throw error;
    }
  }

  /**
   * Get reviews for a specific spare part
   */
  static async getSparePartReviews(sparePartId: string, page = 1, limit = 10): Promise<SparePartReview[]> {
    try {
      const response = await apiClient.get(`/spare-parts/${sparePartId}/reviews`, {
        params: { page, limit }
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching spare part reviews:', error);
      throw error;
    }
  }

  /**
   * Add spare part to favorites (requires authentication)
   */
  static async addToFavorites(sparePartId: string): Promise<void> {
    try {
      await apiClient.post(`/spare-parts/${sparePartId}/favorite`);
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  }

  /**
   * Remove spare part from favorites (requires authentication)
   */
  static async removeFromFavorites(sparePartId: string): Promise<void> {
    try {
      await apiClient.delete(`/spare-parts/${sparePartId}/favorite`);
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }
  }

  /**
   * Get user's favorite spare parts (requires authentication)
   */
  static async getFavorites(page = 1, limit = 20): Promise<SparePart[]> {
    try {
      const response = await apiClient.get('/spare-parts/buyer/favorites', {
        params: { page, limit }
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching favorites:', error);
      throw error;
    }
  }

  /**
   * Create a review for a spare part (requires authentication)
   */
  static async createReview(sparePartId: string, rating: number, comment: string): Promise<SparePartReview> {
    try {
      const response = await apiClient.post(`/spare-parts/${sparePartId}/review`, {
        rating,
        comment
      });
      return response.data.data;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }

  /**
   * Get available spare part brands
   */
  static async getBrands(): Promise<string[]> {
    try {
      const response = await apiClient.get('/spare-parts/brands');
      return response.data || [];
    } catch (error: any) {
      console.error('Error fetching brands:', error);
      if (error.response?.status === 404) {
        // Fallback to common car brands if endpoint doesn't exist
        return [
          'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'BMW', 'Mercedes-Benz',
          'Audi', 'Volkswagen', 'Hyundai', 'Kia', 'Mazda', 'Subaru', 'Lexus',
          'Acura', 'Infiniti', 'Cadillac', 'Lincoln', 'Buick', 'GMC', 'Jeep',
          'Ram', 'Dodge', 'Chrysler', 'Tesla', 'Volvo', 'Jaguar', 'Land Rover',
          'Porsche', 'Mini', 'Mitsubishi', 'Genesis', 'Generic'
        ];
      }
      return [];
    }
  }

  /**
   * Get available car models for compatibility
   */
  static async getModels(brand?: string): Promise<string[]> {
    try {
      const response = await apiClient.get('/spare-parts/models', {
        params: brand ? { brand } : {}
      });
      return response.data;
    } catch (error) {
      // Fallback to common models if endpoint doesn't exist
      return [
        'Camry', 'Civic', 'Accord', 'Corolla', 'Altima', 'Sentra', 'F-150',
        'Silverado', 'Ram 1500', 'Sierra', 'Explorer', 'Highlander', 'RAV4',
        'CR-V', 'Pilot', 'Odyssey', 'Sienna', 'Model 3', 'Model S', 'Model X'
      ];
    }
  }

  /**
   * Get available spare part categories
   */
  static getCategories(): string[] {
    return [
      'Engine Parts',
      'Transmission Parts',
      'Brake System',
      'Suspension & Steering',
      'Electrical System',
      'Cooling System',
      'Exhaust System',
      'Fuel System',
      'Body Parts',
      'Interior Parts',
      'Exterior Parts',
      'Wheels & Tires',
      'Lighting',
      'Filters',
      'Belts & Hoses',
      'Ignition System',
      'Air Conditioning',
      'Tools & Equipment',
      'Accessories',
      'Other'
    ];
  }

  /**
   * Get available conditions
   */
  static getConditions(): string[] {
    return ['New', 'Refurbished', 'Used', 'Remanufactured'];
  }

  /**
   * Get subcategories for a specific category
   */
  static getSubcategories(category: string): string[] {
    const subcategoryMap: { [key: string]: string[] } = {
      'Engine Parts': [
        'Engine Block', 'Cylinder Head', 'Pistons & Rings', 'Crankshaft',
        'Camshaft', 'Timing Belt/Chain', 'Valves', 'Gaskets', 'Bearings',
        'Oil Pump', 'Water Pump', 'Turbocharger', 'Supercharger'
      ],
      'Brake System': [
        'Brake Pads', 'Brake Rotors', 'Brake Calipers', 'Brake Lines',
        'Master Cylinder', 'Brake Booster', 'ABS Components'
      ],
      'Electrical System': [
        'Battery', 'Alternator', 'Starter', 'Spark Plugs', 'Ignition Coil',
        'Wiring Harness', 'Sensors', 'ECU/ECM', 'Fuses'
      ],
      'Suspension & Steering': [
        'Shocks & Struts', 'Control Arms', 'Ball Joints', 'Tie Rods',
        'Steering Rack', 'Power Steering Pump', 'Bushings', 'Sway Bars'
      ]
    };

    return subcategoryMap[category] || [];
  }

  /**
   * Get mock spare parts data for development/fallback
   */
  static getMockSpareParts(): SparePart[] {
    const currentDate = new Date().toISOString();
    return [
      {
        id: '1',
        name: 'Brake Pad Set',
        brand: 'Toyota',
        model: 'Camry',
        year: 2020,
        part_number: 'BP-2020-CAMRY',
        category: 'Brake System',
        subcategory: 'Brake Pads',
        price: 89.99,
        condition: 'new',
        compatibility: ['Toyota Camry 2018-2023', 'Toyota Corolla 2019-2022'],
        description: 'High-quality ceramic brake pads designed for Toyota vehicles. Provides excellent stopping power and reduced dust.',
        images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'],
        location: 'Los Angeles, CA',
        stock_quantity: 15,
        min_order_quantity: 1,
        max_order_quantity: 4,
        weight: 2.5,
        dimensions: { length: 12, width: 8, height: 3 },
        seller_name: 'Auto Parts Pro',
        rating: 4.5,
        is_featured: true,
        warranty_months: 12,
        created_at: currentDate,
        updated_at: currentDate,
        status: 'active'
      },
      {
        id: '2',
        name: 'Engine Oil Filter',
        brand: 'Honda',
        model: 'Civic',
        year: 2019,
        part_number: 'OF-2019-CIVIC',
        category: 'Engine Parts',
        subcategory: 'Filters',
        price: 12.99,
        condition: 'new',
        compatibility: ['Honda Civic 2016-2021', 'Honda Accord 2018-2022'],
        description: 'Premium oil filter for Honda engines. Ensures clean oil circulation and engine protection.',
        images: ['https://images.unsplash.com/photo-1486754735734-325b5831c3ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'],
        location: 'Miami, FL',
        stock_quantity: 8,
        min_order_quantity: 1,
        seller_name: 'Parts Express',
        rating: 4.2,
        is_featured: false,
        warranty_months: 6,
        created_at: currentDate,
        updated_at: currentDate,
        status: 'active'
      },
      {
        id: '3',
        name: 'LED Headlight Assembly',
        brand: 'BMW',
        model: 'X5',
        year: 2021,
        part_number: 'HL-2021-X5',
        category: 'Lighting',
        price: 299.99,
        condition: 'new',
        compatibility: ['BMW X5 2019-2023', 'BMW X3 2020-2023'],
        description: 'Complete LED headlight assembly with adaptive lighting technology. Plug and play installation.',
        images: ['https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'],
        location: 'New York, NY',
        stock_quantity: 3,
        min_order_quantity: 1,
        max_order_quantity: 2,
        seller_name: 'Luxury Auto Parts',
        rating: 4.8,
        is_featured: true,
        is_urgent: true,
        warranty_months: 24,
        created_at: currentDate,
        updated_at: currentDate,
        status: 'active'
      },
      {
        id: '4',
        name: 'Air Conditioning Compressor',
        brand: 'Ford',
        model: 'F-150',
        year: 2020,
        part_number: 'AC-2020-F150',
        category: 'Air Conditioning',
        price: 189.99,
        condition: 'refurbished',
        compatibility: ['Ford F-150 2018-2023', 'Ford Explorer 2019-2022'],
        description: 'Refurbished AC compressor with 6-month warranty. Tested and guaranteed to perform like new.',
        images: ['https://images.unsplash.com/photo-1580414155534-57fe7737c3d4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'],
        location: 'Dallas, TX',
        stock_quantity: 1,
        min_order_quantity: 1,
        seller_name: 'Texas Auto Parts',
        rating: 4.0,
        warranty_months: 6,
        created_at: currentDate,
        updated_at: currentDate,
        status: 'active'
      },
      {
        id: '5',
        name: 'Shock Absorber Set',
        brand: 'Chevrolet',
        model: 'Silverado',
        year: 2019,
        part_number: 'SA-2019-SILVERADO',
        category: 'Suspension & Steering',
        price: 149.99,
        condition: 'new',
        compatibility: ['Chevrolet Silverado 2019-2023', 'GMC Sierra 2019-2023'],
        description: 'Heavy-duty shock absorbers designed for trucks. Provides excellent ride quality and stability.',
        images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'],
        location: 'Chicago, IL',
        stock_quantity: 6,
        min_order_quantity: 1,
        seller_name: 'Midwest Auto',
        rating: 4.3,
        warranty_months: 18,
        created_at: currentDate,
        updated_at: currentDate,
        status: 'active'
      },
      {
        id: '6',
        name: 'Battery - 12V AGM',
        brand: 'Tesla',
        model: 'Model 3',
        year: 2022,
        part_number: 'BAT-2022-MODEL3',
        category: 'Electrical System',
        price: 179.99,
        condition: 'new',
        compatibility: ['Tesla Model 3 2017-2023', 'Tesla Model Y 2020-2023'],
        description: 'High-performance AGM battery specifically designed for electric vehicles. Long lifespan and reliable performance.',
        images: ['https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'],
        location: 'San Francisco, CA',
        stock_quantity: 12,
        min_order_quantity: 1,
        seller_name: 'EV Parts Specialist',
        rating: 4.7,
        is_featured: true,
        warranty_months: 36,
        created_at: currentDate,
        updated_at: currentDate,
        status: 'active'
      }
    ];
  }
}

export default SparePartsApiService;
