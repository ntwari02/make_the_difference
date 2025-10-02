import apiClient from './apiClient';

export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel_type: string;
  transmission: string;
  body_type: string;
  car_condition: string;
  location: string;
  description: string;
  images: string[];
  seller_name?: string;
  seller_phone?: string;
  dealer_name?: string;
  dealer_logo?: string;
  rating?: number;
  created_at: string;
  updated_at: string;
  status: 'active' | 'pending' | 'sold' | 'inactive';
}

export interface CarFilters {
  page?: number;
  limit?: number;
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
  sort_by?: 'price' | 'year' | 'mileage' | 'created_at' | 'rating';
  sort_order?: 'ASC' | 'DESC';
}

export interface CarListResponse {
  success: boolean;
  message?: string;
  data: Car[];
}

export interface CarReview {
  id: string;
  user_id: string;
  car_id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_name?: string;
}

export class CarListingApiService {
  /**
   * Get list of cars with optional filters
   */
  static async listCars(filters: CarFilters = {}): Promise<Car[]> {
    try {
      const response = await apiClient.get('/cars', { params: filters });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching cars:', error);
      throw error;
    }
  }

  /**
   * Search cars with text query
   */
  static async searchCars(query: string, filters: CarFilters = {}): Promise<Car[]> {
    try {
      const response = await apiClient.get('/cars/search', { 
        params: { ...filters, q: query } 
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error searching cars:', error);
      throw error;
    }
  }

  /**
   * Get a specific car by ID
   */
  static async getCarById(carId: string): Promise<Car> {
    try {
      const response = await apiClient.get(`/cars/${carId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching car:', error);
      throw error;
    }
  }

  /**
   * Get reviews for a specific car
   */
  static async getCarReviews(carId: string, page = 1, limit = 10): Promise<CarReview[]> {
    try {
      const response = await apiClient.get(`/cars/${carId}/reviews`, {
        params: { page, limit }
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching car reviews:', error);
      throw error;
    }
  }

  /**
   * Add car to favorites (requires authentication)
   */
  static async addToFavorites(carId: string): Promise<void> {
    try {
      await apiClient.post(`/cars/${carId}/favorite`);
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  }

  /**
   * Remove car from favorites (requires authentication)
   */
  static async removeFromFavorites(carId: string): Promise<void> {
    try {
      await apiClient.delete(`/cars/${carId}/favorite`);
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }
  }

  /**
   * Get user's favorite cars (requires authentication)
   */
  static async getFavorites(page = 1, limit = 20): Promise<Car[]> {
    try {
      const response = await apiClient.get('/cars/buyer/favorites', {
        params: { page, limit }
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching favorites:', error);
      throw error;
    }
  }

  /**
   * Create a review for a car (requires authentication)
   */
  static async createReview(carId: string, rating: number, comment: string): Promise<CarReview> {
    try {
      const response = await apiClient.post(`/cars/${carId}/review`, {
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
   * Get available car brands
   */
  static async getBrands(): Promise<string[]> {
    try {
      // This would need to be implemented in the backend if not already available
      const response = await apiClient.get('/cars/brands');
      return response.data || [];
    } catch (error: any) {
      console.error('Error fetching car brands:', error);
      if (error.response?.status === 404) {
        // Fallback to common brands if endpoint doesn't exist
        return [
          'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'BMW', 'Mercedes-Benz',
          'Audi', 'Volkswagen', 'Hyundai', 'Kia', 'Mazda', 'Subaru', 'Lexus',
          'Acura', 'Infiniti', 'Cadillac', 'Lincoln', 'Buick', 'GMC', 'Jeep',
          'Ram', 'Dodge', 'Chrysler', 'Tesla', 'Volvo', 'Jaguar', 'Land Rover',
          'Porsche', 'Mini', 'Mitsubishi', 'Genesis'
        ];
      }
      return [];
    }
  }

  /**
   * Get available fuel types
   */
  static getFuelTypes(): string[] {
    return ['Gasoline', 'Diesel', 'Hybrid', 'Electric', 'Plug-in Hybrid', 'CNG', 'LPG'];
  }

  /**
   * Get available transmission types
   */
  static getTransmissionTypes(): string[] {
    return ['Manual', 'Automatic', 'CVT', 'Semi-Automatic'];
  }

  /**
   * Get available body types
   */
  static getBodyTypes(): string[] {
    return [
      'Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible', 'Wagon',
      'Pickup Truck', 'Van', 'Minivan', 'Crossover'
    ];
  }

  /**
   * Get available car conditions
   */
  static getCarConditions(): string[] {
    return ['New', 'Like New', 'Excellent', 'Good', 'Fair', 'Poor'];
  }
}

export default CarListingApiService;
