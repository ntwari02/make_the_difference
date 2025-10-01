// Core API types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  errors?: ApiError[];
}

export interface ApiError {
  type: string;
  msg: string;
  path: string;
  location: string;
  value?: any;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationMeta;
}

// User types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  nationality?: string;
  profile_image?: string;
  role: UserRole;
  is_verified: boolean;
  is_active: boolean;
  last_login?: string;
  preferences: UserPreferences;
  address?: Address;
  social_links?: SocialLinks;
  bio?: string;
  skills?: string[];
  education?: Education[];
  work_experience?: WorkExperience[];
  verification_token?: string;
  password_reset_token?: string;
  password_reset_expires?: string;
  created_at: string;
  updated_at: string;
  // Additional computed fields
  total_cars?: number;
  total_enrollments?: number;
  total_classes?: number;
}

export type UserRole = 
  | 'admin'
  | 'student'
  | 'instructor'
  | 'buyer'
  | 'seller'
  | 'dealer'
  | 'university'
  | 'visa_officer'
  | 'advertiser';

export interface UserPreferences {
  currency: string;
  language: string;
  notifications: {
    sms: boolean;
    push: boolean;
    email: boolean;
  };
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
}

export interface SocialLinks {
  website?: string;
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
}

export interface Education {
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date?: string;
  gpa?: number;
  description?: string;
}

export interface WorkExperience {
  company: string;
  position: string;
  start_date: string;
  end_date?: string;
  description?: string;
  current: boolean;
}

// Authentication types
export interface LoginRequest {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
  expires_in: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role?: UserRole;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

// Common types
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface FilterOption {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in' | 'not_in';
  value: any;
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

export interface SearchParams {
  query?: string;
  filters?: FilterOption[];
  sort?: SortOption[];
  page?: number;
  limit?: number;
}

// File types
export interface FileUpload {
  file: File;
  preview?: string;
  progress?: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export interface UploadedFile {
  id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  url: string;
  created_at: string;
}

// Notification types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
  data?: any;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  in_app: boolean;
}

// Theme types
export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeSettings {
  mode: ThemeMode;
  primary_color?: string;
  secondary_color?: string;
}

// Language and Currency types
export interface Language {
  code: string;
  name: string;
  flag: string;
  native_name: string;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  decimal_places: number;
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'date' | 'file';
  required?: boolean;
  placeholder?: string;
  options?: SelectOption[];
  validation?: ValidationRule[];
}

export interface ValidationRule {
  type: 'required' | 'email' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// Loading states
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated?: string;
}

// Chart types
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

// Table types
export interface TableColumn<T = any> {
  key: keyof T;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, record: T) => React.ReactNode;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  pagination?: PaginationMeta;
  onSort?: (field: keyof T, direction: 'asc' | 'desc') => void;
  onFilter?: (filters: FilterOption[]) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

// Modal types
export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  closable?: boolean;
  maskClosable?: boolean;
}

// Breadcrumb types
export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

// Menu types
export interface MenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  children?: MenuItem[];
  disabled?: boolean;
  hidden?: boolean;
  badge?: string | number;
}

// Statistics types
export interface StatCard {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon?: React.ReactNode;
  color?: string;
}

export interface DashboardStats {
  users: {
    total: number;
    active: number;
    new_this_period: number;
    students: number;
    instructors: number;
    sellers: number;
    buyers: number;
    admins: number;
  };
  ecommerce: {
    total_cars: number;
    active_cars: number;
    pending_cars: number;
    sold_cars: number;
    new_this_period: number;
  };
  elearning: {
    total_courses: number;
    published_courses: number;
    new_this_period: number;
  };
  online_classes: {
    total_classes: number;
    live_classes: number;
    completed_classes: number;
    new_this_period: number;
  };
  revenue: {
    total_revenue: number;
    this_period: number;
    course_sales: number;
    car_sales: number;
  };
  period: string;
  generated_at: string;
}

export default {};
