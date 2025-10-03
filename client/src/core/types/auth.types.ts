// Authentication types
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  lastLogin: string | null;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: UserRole;
  is_verified: boolean;
  is_active: boolean;
  preferences: UserPreferences;
  created_at: string;
  updated_at: string;
}

export type UserRole = 
  | 'admin'
  | 'student'
  | 'instructor'
  | 'buyer'
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

// Login/Register types
export interface LoginCredentials {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role?: UserRole;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
  expires_in: number;
}

// Token types
export interface TokenPayload {
  sub: string; // user id
  role: UserRole;
  iat: number;
  exp: number;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

// Password reset types
export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetResponse {
  message: string;
  reset_token?: string;
}

export interface PasswordResetConfirm {
  token: string;
  new_password: string;
}

// Security questions types
export interface SecurityQuestion {
  id: string;
  question_text: string;
  category: string;
}

export interface SecurityQuestionAnswer {
  questionId: string;
  answer: string;
}

export interface SecurityQuestionsSetup {
  questions: SecurityQuestionAnswer[];
}

export interface PasswordResetWithQuestions {
  email: string;
  answers: SecurityQuestionAnswer[];
}

// Permission types
export interface Permission {
  resource: string;
  actions: string[];
}

export interface RolePermissions {
  [key: string]: Permission[];
}

// Session types
export interface UserSession {
  id: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  last_activity: string;
  is_active: boolean;
}

// Auth context types
export interface AuthContextType {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  confirmPasswordReset: (token: string, newPassword: string) => Promise<void>;
  
  // Security questions
  setupSecurityQuestions: (questions: SecurityQuestionAnswer[]) => Promise<void>;
  resetPasswordWithQuestions: (email: string, answers: SecurityQuestionAnswer[]) => Promise<void>;
  
  // Permissions
  hasPermission: (resource: string, action: string) => boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  
  // Session management
  getSessions: () => Promise<UserSession[]>;
  revokeSession: (sessionId: string) => Promise<void>;
  revokeAllSessions: () => Promise<void>;
}

// Auth hook return type
export interface UseAuthReturn extends AuthContextType {
  // Additional computed properties
  isAdmin: boolean;
  isStudent: boolean;
  isInstructor: boolean;
  isBuyer: boolean;
  fullName: string;
  initials: string;
}

// Auth form types
export interface LoginFormData {
  email: string;
  password: string;
  remember_me: boolean;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  terms_accepted: boolean;
}

export interface ChangePasswordFormData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  token: string;
  new_password: string;
  confirm_password: string;
}

// Auth validation types
export interface AuthValidationErrors {
  email?: string;
  password?: string;
  confirm_password?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  terms_accepted?: string;
  general?: string;
}

// Auth API response types
export interface AuthApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  errors?: AuthValidationErrors;
}

// Auth middleware types
export interface AuthMiddlewareOptions {
  requireAuth?: boolean;
  requiredRoles?: UserRole[];
  requiredPermissions?: string[];
  redirectTo?: string;
}

// Auth storage types
export interface AuthStorage {
  getAccessToken: () => string | null;
  setAccessToken: (token: string) => void;
  removeAccessToken: () => void;
  getRefreshToken: () => string | null;
  setRefreshToken: (token: string) => void;
  removeRefreshToken: () => void;
  getUser: () => User | null;
  setUser: (user: User) => void;
  removeUser: () => void;
  clear: () => void;
}

export default {};
