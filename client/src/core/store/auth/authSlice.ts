import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, LoginCredentials, RegisterCredentials } from '../../types';
import { api } from '../../services/api/apiClient';
import { setToStorage, getFromStorage } from '../../../shared/utils';
import { STORAGE_KEYS } from '../../config/constants';

// Auth state interface
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  lastLogin: string | null;
}

// Initial state
const initialState: AuthState = {
  user: getFromStorage(STORAGE_KEYS.USER_DATA, null),
  accessToken: getFromStorage(STORAGE_KEYS.ACCESS_TOKEN, null),
  refreshToken: getFromStorage(STORAGE_KEYS.REFRESH_TOKEN, null),
  isAuthenticated: !!getFromStorage(STORAGE_KEYS.ACCESS_TOKEN, null),
  isLoading: false,
  error: null,
  lastLogin: getFromStorage('last_login', null),
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    const MAX_RETRIES = 3;
    const RETRY_DELAYS = [1000, 2000, 3000]; // Exponential backoff: 1s, 2s, 3s
    
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`🔐 Login attempt ${attempt + 1}/${MAX_RETRIES + 1}:`, { email: credentials.email });

        // Map email to identifier for backend compatibility
        const loginPayload = {
          identifier: credentials.email,
          password: credentials.password,
          remember_me: credentials.remember_me
        };

        // Use 4 second timeout for login to match reCAPTCHA timeout
        const response = await api.post('/auth/login', loginPayload, {
          timeout: 4000 // Increased to 4s to match reCAPTCHA timeout
        });

        console.log('✅ Login response from backend:', response.data);
        const { access_token, refresh_token, user } = response.data;

        // Store tokens and user data immediately
        setToStorage(STORAGE_KEYS.ACCESS_TOKEN, access_token);
        setToStorage(STORAGE_KEYS.REFRESH_TOKEN, refresh_token);
        setToStorage(STORAGE_KEYS.USER_DATA, user);
        setToStorage('last_login', new Date().toISOString());

        console.log('✅ Login successful, tokens stored');
        
        // Pre-fetch seller profile immediately after login to show avatar instantly
        if (user?.role === 'seller') {
          console.log('📥 Pre-fetching seller profile for instant avatar...');
          import('../../../modules/seller/services/sellerApi').then(({ sellerApi }) => {
            sellerApi.profile.getProfile().then(profile => {
              try {
                localStorage.setItem('seller_profile_cache', JSON.stringify(profile));
                console.log('✅ Seller profile cached for instant avatar display');
              } catch {}
            }).catch(err => console.warn('Failed to pre-fetch seller profile:', err));
          }).catch(err => console.warn('Failed to import sellerApi:', err));
        }

        return { access_token, refresh_token, user };
      } catch (error: any) {
        console.error(`❌ Login attempt ${attempt + 1} failed:`, {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          statusText: error.response?.statusText,
          fullError: error
        });

        // Check if it's a timeout error and we have retries left
        const isTimeout = error.code === 'ECONNABORTED' || error.message.includes('timeout');
        
        if (isTimeout && attempt < MAX_RETRIES) {
          console.log(`⏳ Timeout on attempt ${attempt + 1}, retrying in ${RETRY_DELAYS[attempt]}ms...`);
          
          // Dispatch retry attempt to update UI
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('loginRetryAttempt', { 
              detail: { attempt: attempt + 1, maxRetries: MAX_RETRIES + 1 } 
            }));
          }
          
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAYS[attempt]));
          continue; // Try again
        }

        // If it's the last attempt or not a timeout, return the error
        if (isTimeout) {
          return rejectWithValue('Login is taking longer than expected. Please check your connection and try again.');
        }

        return rejectWithValue(error.response?.data?.error || error.message || 'Login failed');
      }
    }
  }
);

// Handle OAuth login (data returned via postMessage)
export const oauthLogin = createAsyncThunk(
  'auth/oauthLogin',
  async (payload: { access_token: string; refresh_token: string; user: { id: string; email: string; role: any } }, { rejectWithValue }) => {
    try {
      const { access_token, refresh_token, user } = payload;
      setToStorage(STORAGE_KEYS.ACCESS_TOKEN, access_token);
      setToStorage(STORAGE_KEYS.REFRESH_TOKEN, refresh_token);
      setToStorage(STORAGE_KEYS.USER_DATA, user);
      setToStorage('last_login', new Date().toISOString());
      return { access_token, refresh_token, user };
    } catch (e) {
      return rejectWithValue('OAuth login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (credentials: RegisterCredentials, { rejectWithValue, dispatch }) => {
    const MAX_RETRIES = 3;
    const RETRY_DELAYS = [1000, 2000, 3000]; // Exponential backoff: 1s, 2s, 3s
    
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`📝 Registration attempt ${attempt + 1}/${MAX_RETRIES + 1}:`, { 
          email: credentials.email, 
          firstName: credentials.first_name,
          role: credentials.role 
        });
        
        const response = await api.post('/auth/register', {
          email: credentials.email,
          password: credentials.password,
          first_name: credentials.first_name,
          last_name: credentials.last_name,
          phone: credentials.phone,
          role: credentials.role || 'student'
        }, {
          timeout: 30000 // 30 seconds for registration to allow for database operations
        });
        
        console.log('✅ Registration response from backend:', response.data);
        
        const { id, email, role, is_verified } = response.data;
        
        // Skip auto-login for now to avoid timeout issues
        console.log('ℹ️ Skipping auto-login after registration - user can login manually');
        
        const user = {
          id,
          email,
          first_name: credentials.first_name,
          last_name: credentials.last_name,
          phone: credentials.phone || '',
          role,
          is_verified,
          is_active: true,
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
        
        console.log('✅ Registration successful, user created:', user);
        
        return { 
          user,
          isAuthenticated: false, // User needs to login manually after registration
          accessToken: null,
          refreshToken: null
        };
      } catch (error: any) {
        console.error(`❌ Registration attempt ${attempt + 1} failed:`, {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          statusText: error.response?.statusText,
          fullError: error
        });

        // Check if it's a timeout error and we have retries left
        const isTimeout = error.code === 'ECONNABORTED' || error.message.includes('timeout');
        
        if (isTimeout && attempt < MAX_RETRIES) {
          console.log(`⏳ Timeout on attempt ${attempt + 1}, retrying in ${RETRY_DELAYS[attempt]}ms...`);
          
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAYS[attempt]));
          continue; // Try again
        }

        // If it's the last attempt or not a timeout, return the error
        if (isTimeout) {
          return rejectWithValue('Registration is taking longer than expected. Please check your connection and try again.');
        }

        return rejectWithValue(error.response?.data?.error || error.message || 'Registration failed');
      }
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const refreshTokenValue = getFromStorage(STORAGE_KEYS.REFRESH_TOKEN, null);
      
      if (!refreshTokenValue) {
        throw new Error('No refresh token available');
      }
      
      console.log('🔄 Attempting token refresh with real backend API');
      
      const response = await api.post('/auth/refresh', {
        refresh_token: refreshTokenValue,
      });
      
      console.log('✅ Token refresh response from backend:', response.data);
      
      // Your backend returns: { access_token, access_expires_in, refresh_token, refresh_expires_in }
      const { access_token, refresh_token: newRefreshToken } = response.data;
      
      // Update stored tokens
      setToStorage(STORAGE_KEYS.ACCESS_TOKEN, access_token);
      setToStorage(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
      
      console.log('✅ Token refresh successful, new tokens stored');
      
      return { access_token, refresh_token: newRefreshToken };
    } catch (error: any) {
      console.error('❌ Token refresh failed:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.error || error.message || 'Token refresh failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    try {
      const refreshTokenValue = getFromStorage(STORAGE_KEYS.REFRESH_TOKEN, null);
      
      console.log('🚪 Attempting logout with real backend API');
      
      // Call logout endpoint if refresh token exists
      if (refreshTokenValue) {
        await api.post('/auth/logout', {
          refresh_token: refreshTokenValue,
        });
        console.log('✅ Logout request sent to backend');
      }
      
      // Clear ALL storage data (session debug approach)
      localStorage.clear();
      sessionStorage.clear();
      
      console.log('✅ Logout successful, all storage cleared');
      
      return null;
    } catch (error: any) {
      console.error('⚠️ Logout API call failed, but clearing local data:', error.response?.data || error.message);
      
      // Even if logout fails on server, clear ALL local data
      localStorage.clear();
      sessionStorage.clear();
      
      console.log('✅ All storage cleared despite API error');
      
      return null;
    }
  }
);

// Interface for profile updates
interface ProfileUpdateData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  bio?: string;
}

export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData: ProfileUpdateData) => {
    try {
      console.log('👤 Attempting profile update with real backend API:', userData);
      
      const response = await api.put(`/auth/profile`, {
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone,
        bio: userData.bio
      });
      
      console.log('✅ Profile update response from backend:', response.data);
      
      // Your backend returns: { message, user: { id, email, first_name, last_name, phone, bio, role, updated_at } }
      const updatedUser = response.data.user;
      
      // Update stored user data
      setToStorage(STORAGE_KEYS.USER_DATA, updatedUser);
      
      console.log('✅ Profile update successful, user data updated');
      
      return updatedUser;
    } catch (error: any) {
      console.error('❌ Profile update failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || error.message || 'Profile update failed');
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        setToStorage(STORAGE_KEYS.USER_DATA, state.user);
      }
    },
    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      state.lastLogin = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      // OAuth login
      .addCase(oauthLogin.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.accessToken = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
        state.user = action.payload.user;
        state.lastLogin = new Date().toISOString();
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.accessToken = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
        state.user = action.payload.user;
        state.lastLogin = new Date().toISOString();
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      })
      
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = action.payload.isAuthenticated;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      })
      
      // Refresh token
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
      })
      
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.error = null;
        state.lastLogin = null;
      })
      
      // Update profile
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { clearError, setLoading, updateUser, clearAuth } = authSlice.actions;
export default authSlice.reducer;
