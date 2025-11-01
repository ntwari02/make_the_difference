import axios from 'axios';
import { createRetryAxios, rateLimitRetryConfig } from '../../../utils/apiRetry';

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api');

// Create axios instance with retry logic for rate limiting
const api = createRetryAxios(rateLimitRetryConfig);
api.defaults.baseURL = API_BASE_URL;
api.defaults.headers = {
  'Content-Type': 'application/json',
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem('access_token');
    console.log('sparePartsApi - Raw token:', token);
    if (token) {
      // Some storages include quotes; strip them and any whitespace
      token = token.trim().replace(/^"+|"+$/g, '');
      config.headers.Authorization = `Bearer ${token}`;
      console.log('sparePartsApi - Authorization header:', config.headers.Authorization);
    }
    console.log('sparePartsApi - Final headers:', config.headers);
    return config;
  },
  (error) => Promise.reject(error)
);

// Types
export interface SparePart {
  id: string;
  seller_id: string;
  sku: string;
  name: string;
  description: string;
  category_id: string;
  brand_id: string;
  price: number;
  currency: string;
  cost_price?: number;
  markup_percentage?: number;
  quantity_available: number;
  quantity_reserved: number;
  reorder_point: number;
  max_stock_level?: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  vehicle_compatibility: VehicleCompatibility[];
  images: string[];
  status: 'active' | 'inactive' | 'discontinued';
  is_featured: boolean;
  requires_installation: boolean;
  warranty_period_months: number;
  meta_title?: string;
  meta_description?: string;
  keywords: string[];
  rating?: number;
  review_count?: number;
  created_at: string;
  updated_at: string;
  last_restocked_at?: string;
  last_sold_at?: string;
}

export interface VehicleCompatibility {
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year_from: number;
  vehicle_year_to: number;
  compatibility_confidence: number;
}

export interface SparePartCategory {
  id: string;
  name: string;
  description: string;
  parent_category_id?: string;
  created_at: string;
  updated_at: string;
}

export interface SparePartBrand {
  id: string;
  name: string;
  logo_url?: string;
  website_url?: string;
  created_at: string;
  updated_at: string;
}

export interface SparePartBundle {
  id: string;
  seller_id: string;
  name: string;
  description: string;
  bundle_price: number;
  currency: string;
  discount_percentage: number;
  spare_parts: Array<{
    spare_part_id: string;
    quantity: number;
    spare_part: SparePart;
  }>;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface SparePartAnalytics {
  total_parts: number;
  active_parts: number;
  low_stock_items: number;
  out_of_stock_items: number;
  total_inventory_value: number;
  monthly_sales: number;
  avg_price: number;
  top_category: string;
  top_brand: string;
  sales_trend: Array<{
    period: string;
    sales: number;
    orders: number;
    avg_order_value: number;
  }>;
  category_performance: Array<{
    category_name: string;
    sales_count: number;
    revenue: number;
    percentage: number;
  }>;
  top_selling_parts: Array<{
    spare_part_id: string;
    name: string;
    sku: string;
    sales_count: number;
    revenue: number;
    growth_percentage: number;
  }>;
}

export interface SparePartRecommendation {
  id: string;
  spare_part_id: string;
  recommended_part_id: string;
  recommendation_type: 'complementary' | 'alternative' | 'upgrade' | 'replacement';
  confidence_score: number;
  reason: string;
  spare_part: SparePart;
  recommended_part: SparePart;
  created_at: string;
}

export interface SparePartNotification {
  id: string;
  seller_id: string;
  type: 'low_stock' | 'price_drop' | 'new_order' | 'restock_reminder' | 'seasonal_demand';
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  created_at: string;
}

// API Functions
export const sparePartsApi = {
  // CRUD Operations
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category_id?: string;
    brand_id?: string;
    status?: string;
    availability_status?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }) {
    const response = await api.get('/spare-parts', { params });
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get(`/spare-parts/${id}`);
    return response.data;
  },

  async create(data: Partial<SparePart>) {
    const response = await api.post('/spare-parts', data);
    return response.data;
  },

  async update(id: string, data: Partial<SparePart>) {
    const response = await api.put(`/spare-parts/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/spare-parts/${id}`);
    return response.data;
  },

  async uploadImages(id: string, formData: FormData) {
    const response = await api.post(`/spare-parts/${id}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Inventory Management
  async updateInventory(id: string, data: {
    quantity_available?: number;
    quantity_reserved?: number;
    reorder_point?: number;
    max_stock_level?: number;
  }) {
    const response = await api.patch(`/spare-parts/${id}/inventory`, data);
    return response.data;
  },

  async restock(id: string, data: {
    quantity_added: number;
    cost_per_unit?: number;
    supplier?: string;
    notes?: string;
  }) {
    const response = await api.post(`/spare-parts/${id}/restock`, data);
    return response.data;
  },

  async reserve(id: string, data: {
    quantity: number;
    order_id?: string;
    customer_id?: string;
    expires_at?: string;
  }) {
    const response = await api.post(`/spare-parts/${id}/reserve`, data);
    return response.data;
  },

  async unreserve(id: string, data: {
    quantity: number;
    order_id?: string;
  }) {
    const response = await api.post(`/spare-parts/${id}/unreserve`, data);
    return response.data;
  },

  // Vehicle Compatibility
  async addVehicleCompatibility(id: string, data: VehicleCompatibility) {
    const response = await api.post(`/spare-parts/${id}/compatibility`, data);
    return response.data;
  },

  async removeVehicleCompatibility(id: string, compatibilityId: string) {
    const response = await api.delete(`/spare-parts/${id}/compatibility/${compatibilityId}`);
    return response.data;
  },

  async getCompatibleVehicles(id: string) {
    const response = await api.get(`/spare-parts/${id}/compatibility`);
    return response.data;
  },

  // Pricing
  async updatePricing(id: string, data: {
    price?: number;
    cost_price?: number;
    markup_percentage?: number;
    currency?: string;
  }) {
    const response = await api.patch(`/spare-parts/${id}/pricing`, data);
    return response.data;
  },

  async getPriceHistory(id: string) {
    const response = await api.get(`/spare-parts/${id}/price-history`);
    return response.data;
  },

  async comparePrices(id: string, competitorUrls?: string[]) {
    const response = await api.post(`/spare-parts/${id}/price-comparison`, {
      competitor_urls: competitorUrls
    });
    return response.data;
  },

  async getAllPriceComparisons() {
    const response = await api.get('/spare-parts/price-comparison/all');
    return response.data;
  },

  async getPriceComparison(id: string) {
    const response = await api.get(`/spare-parts/${id}/price-comparison`);
    return response.data;
  },

  async getPriceAnalysis(id: string) {
    const response = await api.get(`/spare-parts/${id}/price-analysis`);
    return response.data;
  },

  async addPriceComparison(id: string, data: {
    competitor_name: string;
    competitor_url?: string;
    competitor_price: number;
    competitor_currency?: string;
  }) {
    const response = await api.post(`/spare-parts/${id}/price-comparison`, data);
    return response.data;
  },

  async updatePriceComparison(comparisonId: string, data: {
    competitor_name: string;
    competitor_url?: string;
    competitor_price: number;
    competitor_currency?: string;
  }) {
    const response = await api.put(`/spare-parts/price-comparison/${comparisonId}`, data);
    return response.data;
  },

  async deletePriceComparison(comparisonId: string) {
    const response = await api.delete(`/spare-parts/price-comparison/${comparisonId}`);
    return response.data;
  },

  // Search and Filtering
  async search(query: string, filters?: {
    category_id?: string;
    brand_id?: string;
    price_min?: number;
    price_max?: number;
    vehicle_make?: string;
    vehicle_model?: string;
    vehicle_year?: number;
    in_stock?: boolean;
  }) {
    const response = await api.get('/spare-parts/search', {
      params: { query, ...filters }
    });
    return response.data;
  },

  async getAdvancedSearch(filters: {
    category_id?: string;
    brand_id?: string;
    price_min?: number;
    price_max?: number;
    vehicle_make?: string;
    vehicle_model?: string;
    vehicle_year?: number;
    weight_min?: number;
    weight_max?: number;
    dimensions?: {
      length_min?: number;
      length_max?: number;
      width_min?: number;
      width_max?: number;
      height_min?: number;
      height_max?: number;
    };
    in_stock?: boolean;
    is_featured?: boolean;
    requires_installation?: boolean;
    warranty_period_min?: number;
    rating_min?: number;
  }) {
    const response = await api.post('/spare-parts/advanced-search', filters);
    return response.data;
  },

  // Categories
  async getCategories() {
    const response = await api.get('/spare-parts/categories');
    return response.data;
  },

  async createCategory(data: Partial<SparePartCategory>) {
    const response = await api.post('/spare-parts/categories', data);
    return response.data;
  },

  // Brands
  async getBrands() {
    const response = await api.get('/spare-parts/brands');
    return response.data;
  },

  async createBrand(data: Partial<SparePartBrand>) {
    const response = await api.post('/spare-parts/brands', data);
    return response.data;
  },

  // Bundles
  async getBundles(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) {
    const response = await api.get('/spare-parts/bundles', { params });
    return response.data;
  },

  async getBundleById(id: string) {
    const response = await api.get(`/spare-parts/bundles/${id}`);
    return response.data;
  },

  async createBundle(data: Partial<SparePartBundle>) {
    const response = await api.post('/spare-parts/bundles', data);
    return response.data;
  },

  async updateBundle(id: string, data: Partial<SparePartBundle>) {
    const response = await api.put(`/spare-parts/bundles/${id}`, data);
    return response.data;
  },

  async deleteBundle(id: string) {
    const response = await api.delete(`/spare-parts/bundles/${id}`);
    return response.data;
  },

  // Analytics
  async getAnalytics(params?: {
    period?: '1m' | '3m' | '6m' | '1y';
    start_date?: string;
    end_date?: string;
  }) {
    const response = await api.get('/spare-parts-analytics', { params });
    return response.data;
  },

  async getSalesTrend(params?: {
    period?: '1m' | '3m' | '6m' | '1y';
    start_date?: string;
    end_date?: string;
  }) {
    const response = await api.get('/spare-parts-analytics/sales-trend', { params });
    return response.data;
  },

  async getCategoryPerformance(params?: {
    period?: '1m' | '3m' | '6m' | '1y';
    start_date?: string;
    end_date?: string;
  }) {
    const response = await api.get('/spare-parts-analytics/category-performance', { params });
    return response.data;
  },

  

  async getInventoryInsights() {
    const response = await api.get('/spare-parts-analytics/inventory-insights');
    return response.data;
  },

  // Recommendations
  async getRecommendations(id: string, params?: {
    type?: 'complementary' | 'alternative' | 'upgrade' | 'replacement';
    limit?: number;
  }) {
    const response = await api.get(`/spare-parts-recommendations/${id}`, { params });
    return response.data;
  },

  async getBulkRecommendations(sparePartIds: string[], params?: {
    type?: 'complementary' | 'alternative' | 'upgrade' | 'replacement';
    limit?: number;
  }) {
    const response = await api.post('/spare-parts-recommendations/bulk', {
      spare_part_ids: sparePartIds,
      ...params
    });
    return response.data;
  },

  async getCrossSellRecommendations(customerId: string, params?: {
    limit?: number;
  }) {
    const response = await api.get(`/spare-parts-recommendations/cross-sell/${customerId}`, { params });
    return response.data;
  },

  async getUpsellRecommendations(customerId: string, params?: {
    limit?: number;
  }) {
    const response = await api.get(`/spare-parts-recommendations/upsell/${customerId}`, { params });
    return response.data;
  },

  // Notifications
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    type?: string;
    is_read?: boolean;
  }) {
    const response = await api.get('/spare-parts-notifications', { params });
    return response.data;
  },

  async markAsRead(notificationId: string) {
    const response = await api.patch(`/spare-parts-notifications/${notificationId}/read`);
    return response.data;
  },

  async markAllAsRead() {
    const response = await api.patch('/spare-parts-notifications/read-all');
    return response.data;
  },

  async getNotificationSettings() {
    const response = await api.get('/spare-parts-notifications/settings');
    return response.data;
  },

  async updateNotificationSettings(settings: {
    low_stock_alerts: boolean;
    price_drop_alerts: boolean;
    new_order_alerts: boolean;
    restock_reminders: boolean;
    seasonal_demand_alerts: boolean;
    email_notifications: boolean;
    push_notifications: boolean;
  }) {
    const response = await api.put('/spare-parts-notifications/settings', settings);
    return response.data;
  },

  // Bulk Operations
  async bulkUpdateStatus(sparePartIds: string[], status: 'active' | 'inactive' | 'discontinued') {
    const response = await api.patch('/spare-parts/bulk-status', {
      spare_part_ids: sparePartIds,
      status
    });
    return response.data;
  },

  async bulkUpdatePricing(sparePartIds: string[], data: {
    price_adjustment?: number;
    price_adjustment_type?: 'percentage' | 'fixed';
    markup_percentage?: number;
  }) {
    const response = await api.patch('/spare-parts/bulk-pricing', {
      spare_part_ids: sparePartIds,
      ...data
    });
    return response.data;
  },

  async bulkExport(sparePartIds: string[], format: 'csv' | 'excel' | 'pdf') {
    const response = await api.post('/spare-parts/bulk-export', {
      spare_part_ids: sparePartIds,
      format
    });
    return response.data;
  },

  // Import/Export
  async importFromFile(file: File, options?: {
    update_existing?: boolean;
    skip_duplicates?: boolean;
  }) {
    const formData = new FormData();
    formData.append('file', file);
    if (options) {
      formData.append('options', JSON.stringify(options));
    }
    
    const response = await api.post('/spare-parts/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async exportToFile(params?: {
    format?: 'csv' | 'excel' | 'json';
    date_range?: '1m' | '3m' | '6m' | '1y' | 'all';
    include_inventory?: boolean;
    include_sales?: boolean;
    include_analytics?: boolean;
    include_bundles?: boolean;
  }) {
    const response = await api.post('/spare-parts/export', params, {
      responseType: params?.format === 'json' ? 'json' : 'blob',
    });
    return response.data;
  },

  async exportData(params: {
    format: 'csv' | 'excel' | 'json';
    date_range?: '1m' | '3m' | '6m' | '1y' | 'all';
    include_inventory?: boolean;
    include_sales?: boolean;
    include_analytics?: boolean;
    include_bundles?: boolean;
  }) {
    const response = await api.post('/spare-parts/export', params, {
      responseType: params.format === 'json' ? 'json' : 'blob',
    });
    return response;
  },

  // Seller-specific operations
  async getSellerParts(sellerId: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
    category_id?: string;
    brand_id?: string;
  }) {
    const response = await api.get(`/spare-parts/seller/${sellerId}`, { params });
    return response.data;
  },

  async getSellerAnalytics(sellerId: string, params?: {
    period?: '1m' | '3m' | '6m' | '1y';
    start_date?: string;
    end_date?: string;
  }) {
    const response = await api.get(`/spare-parts-analytics/seller/${sellerId}`, { params });
    return response.data;
  },

  async getSellerRecommendations(sellerId: string, params?: {
    type?: 'complementary' | 'alternative' | 'upgrade' | 'replacement';
    limit?: number;
  }) {
    const response = await api.get(`/spare-parts-recommendations/seller/${sellerId}`, { params });
    return response.data;
  },

  async getSellerNotifications(sellerId: string, params?: {
    page?: number;
    limit?: number;
    type?: string;
    is_read?: boolean;
  }) {
    const response = await api.get(`/spare-parts-notifications/seller/${sellerId}`, { params });
    return response.data;
  },

  // Analytics API methods
  async getAnalyticsOverview(timeRange: string = '6m') {
    const response = await api.get('/spare-parts/analytics/overview', {
      params: { time_range: timeRange }
    });
    return response.data;
  },

  async getPerformanceMetrics(timeRange: string = '6m') {
    const response = await api.get('/spare-parts/analytics/metrics', {
      params: { time_range: timeRange }
    });
    return response.data;
  },

  async getSalesTrends(timeRange: string = '6m') {
    const response = await api.get('/spare-parts/analytics/sales-trends', {
      params: { time_range: timeRange }
    });
    return response.data;
  },

  async getCategoryAnalysis(timeRange: string = '6m') {
    const response = await api.get('/spare-parts/analytics/categories', {
      params: { time_range: timeRange }
    });
    return response.data;
  },

  async getTopSellingParts(timeRange: string = '6m', limit: number = 10) {
    const response = await api.get('/spare-parts/analytics/top-selling', {
      params: { time_range: timeRange, limit }
    });
    return response.data;
  },

  async getInventoryAlerts() {
    const response = await api.get('/spare-parts/analytics/inventory-alerts');
    return response.data;
  },

  async getSellerStats() {
    const response = await api.get('/spare-parts/analytics/stats');
    return response.data;
  },

  async getTrendingParts(params?: {
    category_id?: string;
    brand_id?: string;
    limit?: number;
    time_range?: string;
  }) {
    const response = await api.get('/spare-parts/analytics/trending', { params });
    return response.data;
  },

  // Inventory Management
  async getAllInventory() {
    const response = await api.get('/spare-parts/inventory/all');
    return response.data;
  },

  async updateStock(id: string, data: {
    quantity_available: number;
    reorder_point?: number;
    max_stock_level?: number;
  }) {
    const response = await api.put(`/spare-parts/${id}/stock/update`, data);
    return response.data;
  },

  async restockItem(id: string, quantityToAdd: number) {
    const response = await api.post(`/spare-parts/${id}/stock/restock`, {
      quantity_to_add: quantityToAdd
    });
    return response.data;
  },

  async getLowStockItems() {
    const response = await api.get('/spare-parts/inventory/low-stock');
    return response.data;
  }
};

export default sparePartsApi;
