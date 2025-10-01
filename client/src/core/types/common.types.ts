// Common types used across the application
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface Timestamps {
  created_at: string;
  updated_at: string;
}

// Generic API response wrapper
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

// Pagination types
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

// Generic CRUD operations
export interface CreateRequest<T> {
  data: Omit<T, 'id' | 'created_at' | 'updated_at'>;
}

export interface UpdateRequest<T> {
  id: string;
  data: Partial<Omit<T, 'id' | 'created_at' | 'updated_at'>>;
}

export interface DeleteRequest {
  id: string;
}

// Search and filter types
export interface SearchParams {
  query?: string;
  filters?: FilterOption[];
  sort?: SortOption[];
  page?: number;
  limit?: number;
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

// Select option type
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

// Loading states
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated?: string;
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'date' | 'file' | 'url';
  required?: boolean;
  placeholder?: string;
  options?: SelectOption[];
  validation?: ValidationRule[];
  disabled?: boolean;
  hidden?: boolean;
}

export interface ValidationRule {
  type: 'required' | 'email' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

// File upload types
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

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
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
  fill?: boolean;
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

// Status types
export type Status = 'active' | 'inactive' | 'pending' | 'approved' | 'rejected' | 'suspended' | 'cancelled';

// Priority types
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

// Size types
export type Size = 'small' | 'medium' | 'large';

// Color types
export type Color = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

// Direction types
export type Direction = 'up' | 'down' | 'left' | 'right';

// Alignment types
export type Alignment = 'start' | 'center' | 'end' | 'stretch';

// Justify types
export type Justify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

// Wrap types
export type Wrap = 'nowrap' | 'wrap' | 'wrap-reverse';

// Position types
export type Position = 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';

// Display types
export type Display = 'block' | 'inline' | 'inline-block' | 'flex' | 'inline-flex' | 'grid' | 'inline-grid' | 'none';

// Overflow types
export type Overflow = 'visible' | 'hidden' | 'scroll' | 'auto';

// Text align types
export type TextAlign = 'left' | 'center' | 'right' | 'justify';

// Font weight types
export type FontWeight = 'normal' | 'bold' | 'bolder' | 'lighter' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';

// Font style types
export type FontStyle = 'normal' | 'italic' | 'oblique';

// Text decoration types
export type TextDecoration = 'none' | 'underline' | 'overline' | 'line-through';

// Text transform types
export type TextTransform = 'none' | 'capitalize' | 'uppercase' | 'lowercase';

// Cursor types
export type Cursor = 'auto' | 'default' | 'pointer' | 'wait' | 'text' | 'move' | 'help' | 'not-allowed';

// Border style types
export type BorderStyle = 'none' | 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset';

// Border radius types
export type BorderRadius = 'none' | 'small' | 'medium' | 'large' | 'full';

// Shadow types
export type Shadow = 'none' | 'small' | 'medium' | 'large' | 'xl';

// Z-index types
export interface ZIndex {
  DROPDOWN: 1000;
  STICKY: 1020;
  FIXED: 1030;
  MODAL_BACKDROP: 1040;
  MODAL: 1050;
  POPOVER: 1060;
  TOOLTIP: 1070;
  NOTIFICATION: 1080;
}

// Animation types
export interface Animation {
  duration: number;
  easing: string;
  delay?: number;
}

// Transition types
export interface Transition {
  property: string;
  duration: number;
  easing: string;
  delay?: number;
}

// Media query types
export interface MediaQuery {
  mobile: string;
  tablet: string;
  desktop: string;
  largeDesktop: string;
}

// Breakpoint types
export interface Breakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
  largeDesktop: number;
}

export default {};
