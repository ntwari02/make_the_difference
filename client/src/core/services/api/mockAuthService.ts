// Mock authentication service for development/testing
import { User, LoginCredentials, RegisterCredentials, AuthResponse } from '../../types';

// Extended user interface with password for mock service
interface MockUser extends User {
  password: string;
}

// Mock user data with passwords
const mockUsers: MockUser[] = [
  {
    id: '1',
    email: 'admin@reaglex.com',
    first_name: 'Admin',
    last_name: 'User',
    role: 'admin',
    phone: '+1234567890',
    is_active: true,
    is_verified: true,
    password: 'password123', // Default password for all mock users
    preferences: {
      currency: 'USD',
      language: 'en',
      notifications: {
        sms: true,
        push: true,
        email: true,
      },
    },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    email: 'student@reaglex.com',
    first_name: 'John',
    last_name: 'Student',
    role: 'student',
    phone: '+1234567891',
    is_active: true,
    is_verified: true,
    password: 'password123', // Default password for all mock users
    preferences: {
      currency: 'USD',
      language: 'en',
      notifications: {
        sms: true,
        push: true,
        email: true,
      },
    },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    email: 'instructor@reaglex.com',
    first_name: 'Jane',
    last_name: 'Instructor',
    role: 'instructor',
    phone: '+1234567892',
    is_active: true,
    is_verified: true,
    password: 'password123', // Default password for all mock users
    preferences: {
      currency: 'USD',
      language: 'en',
      notifications: {
        sms: true,
        push: true,
        email: true,
      },
    },
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
    
    console.log('🔐 Mock Login Attempt:', { email: credentials.email, passwordLength: credentials.password.length });
    console.log('📋 Available Users:', mockUsers.map(u => ({ email: u.email, id: u.id })));
    
    const user = mockUsers.find(u => u.email === credentials.email);
    
    if (!user) {
      console.log('❌ User not found:', credentials.email);
      throw new Error('Invalid email or password');
    }
    
    console.log('👤 User found:', { email: user.email, id: user.id });
    
    // Check password against stored password
    if (credentials.password !== user.password) {
      console.log('❌ Password mismatch:', { provided: credentials.password, stored: user.password });
      throw new Error('Invalid email or password');
    }
    
    console.log('✅ Login successful for:', user.email);
    
    // Remove password from user object before returning
    const { password, ...userWithoutPassword } = user;
    
    const mockTokens = {
      access_token: `mock_access_token_${user.id}_${Date.now()}`,
      refresh_token: `mock_refresh_token_${user.id}_${Date.now()}`,
    };
    
    return {
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        ...mockTokens,
      },
    };
  },

  // Mock registration
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    await mockAuthService.delay(1200); // Simulate network delay
    
    console.log('📝 Mock Registration Attempt:', { 
      email: credentials.email, 
      firstName: credentials.first_name,
      passwordLength: credentials.password.length 
    });
    
    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === credentials.email);
    if (existingUser) {
      console.log('❌ User already exists:', credentials.email);
      throw new Error('User with this email already exists');
    }
    
    // Create new user with password
    const newUser: MockUser = {
      id: String(mockUsers.length + 1),
      email: credentials.email,
      first_name: credentials.first_name,
      last_name: credentials.last_name,
      role: credentials.role,
      phone: credentials.phone || '',
      is_active: true,
      is_verified: false,
      password: credentials.password, // Store the password
      preferences: {
        currency: 'USD',
        language: 'en',
        notifications: {
          sms: true,
          push: true,
          email: true,
        },
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    mockUsers.push(newUser);
    
    console.log('✅ Registration successful for:', newUser.email);
    console.log('📋 Total users now:', mockUsers.length);
    
    const mockTokens = {
      access_token: `mock_access_token_${newUser.id}_${Date.now()}`,
      refresh_token: `mock_refresh_token_${newUser.id}_${Date.now()}`,
    };
    
    // Remove password from user object before returning
    const { password, ...userWithoutPassword } = newUser;
    
    return {
      success: true,
      message: 'Registration successful',
      data: {
        user: userWithoutPassword,
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
    
    const userId = userIdMatch[1];
    const user = mockUsers.find(u => u.id === userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    const mockTokens = {
      access_token: `mock_access_token_${user.id}_${Date.now()}`,
      refresh_token: `mock_refresh_token_${user.id}_${Date.now()}`,
    };
    
    // Remove password from user object before returning
    const { password, ...userWithoutPassword } = user;
    
    return {
      success: true,
      message: 'Token refreshed successfully',
      data: {
        user: userWithoutPassword,
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
