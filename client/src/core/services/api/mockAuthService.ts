// Mock authentication service for development/testing
import { User, LoginCredentials, RegisterCredentials, AuthResponse } from '../../types';

// Mock user data
const mockUsers: User[] = [
  {
    id: 1,
    email: 'admin@reaglex.com',
    first_name: 'Admin',
    last_name: 'User',
    role: 'admin',
    phone: '+1234567890',
    is_active: true,
    email_verified: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    email: 'student@reaglex.com',
    first_name: 'John',
    last_name: 'Student',
    role: 'student',
    phone: '+1234567891',
    is_active: true,
    email_verified: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 3,
    email: 'instructor@reaglex.com',
    first_name: 'Jane',
    last_name: 'Instructor',
    role: 'instructor',
    phone: '+1234567892',
    is_active: true,
    email_verified: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

// Mock authentication service
export const mockAuthService = {
  // Simulate API delay
  delay: (ms: number = 1000) => new Promise(resolve => setTimeout(resolve, ms)),

  // Mock login
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    await mockAuthService.delay(800); // Simulate network delay
    
    const user = mockUsers.find(u => u.email === credentials.email);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // Mock password check (in real app, this would be server-side)
    if (credentials.password !== 'password123') {
      throw new Error('Invalid email or password');
    }
    
    const mockTokens = {
      access_token: `mock_access_token_${user.id}_${Date.now()}`,
      refresh_token: `mock_refresh_token_${user.id}_${Date.now()}`,
    };
    
    return {
      success: true,
      message: 'Login successful',
      data: {
        user,
        ...mockTokens,
      },
    };
  },

  // Mock registration
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    await mockAuthService.delay(1200); // Simulate network delay
    
    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === credentials.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    // Create new user
    const newUser: User = {
      id: mockUsers.length + 1,
      email: credentials.email,
      first_name: credentials.first_name,
      last_name: credentials.last_name,
      role: credentials.role,
      phone: credentials.phone || '',
      is_active: true,
      email_verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    mockUsers.push(newUser);
    
    const mockTokens = {
      access_token: `mock_access_token_${newUser.id}_${Date.now()}`,
      refresh_token: `mock_refresh_token_${newUser.id}_${Date.now()}`,
    };
    
    return {
      success: true,
      message: 'Registration successful',
      data: {
        user: newUser,
        ...mockTokens,
      },
    };
  },

  // Mock token refresh
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    await mockAuthService.delay(500);
    
    // Extract user ID from mock token
    const userIdMatch = refreshToken.match(/mock_refresh_token_(\d+)_/);
    if (!userIdMatch) {
      throw new Error('Invalid refresh token');
    }
    
    const userId = parseInt(userIdMatch[1]);
    const user = mockUsers.find(u => u.id === userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    const mockTokens = {
      access_token: `mock_access_token_${user.id}_${Date.now()}`,
      refresh_token: `mock_refresh_token_${user.id}_${Date.now()}`,
    };
    
    return {
      success: true,
      message: 'Token refreshed successfully',
      data: {
        user,
        ...mockTokens,
      },
    };
  },

  // Mock logout
  logout: async (): Promise<{ success: boolean; message: string }> => {
    await mockAuthService.delay(300);
    return {
      success: true,
      message: 'Logout successful',
    };
  },
};

// Mock API client for development
export const mockApiClient = {
  post: async (url: string, data: any) => {
    if (url.includes('/auth/login')) {
      const response = await mockAuthService.login(data);
      return { data: response };
    }
    
    if (url.includes('/auth/register')) {
      const response = await mockAuthService.register(data);
      return { data: response };
    }
    
    if (url.includes('/auth/refresh')) {
      const response = await mockAuthService.refreshToken(data.refresh_token);
      return { data: response };
    }
    
    if (url.includes('/auth/logout')) {
      const response = await mockAuthService.logout();
      return { data: response };
    }
    
    throw new Error(`Mock API endpoint not found: ${url}`);
  },
};

export default mockAuthService;
