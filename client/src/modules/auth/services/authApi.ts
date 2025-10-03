import { api } from '../../../core/services/api/apiClient';
import { 
  LoginCredentials, 
  RegisterCredentials, 
  AuthResponse, 
  User,
  SecurityQuestionAnswer,
  PasswordResetRequest,
  PasswordResetConfirm 
} from '../../../core/types';

// Auth API service
export const authApi = {
  // Login user
  login: async (credentials: LoginCredentials): Promise<any> => {
    // Backend expects 'identifier' instead of 'email'
    const requestData = {
      identifier: credentials.email,
      password: credentials.password,
    };
    const response = await api.post('/auth/login', requestData);
    // Backend returns: { access_token, refresh_token, user }
    return response.data;
  },

  // Register user
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', credentials);
    return response.data;
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  // Logout user
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  // Verify email
  verifyEmail: async (token: string): Promise<void> => {
    await api.post('/auth/verify-email', { token });
  },

  // Resend verification email
  resendVerificationEmail: async (email: string): Promise<void> => {
    await api.post('/auth/resend-verification', { email });
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email });
  },

  // Reset password
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await api.post('/auth/reset-password', {
      token,
      new_password: newPassword,
    });
  },

  // Get password reset options
  getPasswordResetOptions: async (email: string) => {
    const response = await api.get(`/password-reset/options/${email}`);
    return response.data;
  },

  // Initiate password reset with security questions
  initiatePasswordReset: async (email: string, answers: SecurityQuestionAnswer[]) => {
    const response = await api.post('/password-reset/initiate', {
      email,
      answers,
    });
    return response.data;
  },

  // Complete password reset
  completePasswordReset: async (token: string, newPassword: string) => {
    const response = await api.post('/password-reset/reset', {
      token,
      newPassword,
    });
    return response.data;
  },

  // Verify reset token
  verifyResetToken: async (token: string) => {
    const response = await api.get(`/password-reset/verify/${token}`);
    return response.data;
  },

  // Get user profile
  getProfile: async (): Promise<User> => {
    const response = await api.get<User>('/auth/profile');
    return response.data.data;
  },

  // Update user profile
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const response = await api.patch<User>(`/users/${userData.id}`, userData);
    return response.data.data;
  },

  // Get user sessions
  getSessions: async () => {
    const response = await api.get('/auth/sessions');
    return response.data;
  },

  // Revoke session
  revokeSession: async (sessionId: string): Promise<void> => {
    await api.delete(`/auth/sessions/${sessionId}`);
  },

  // Revoke all sessions
  revokeAllSessions: async (): Promise<void> => {
    await api.delete('/auth/sessions');
  },
};

export default authApi;
