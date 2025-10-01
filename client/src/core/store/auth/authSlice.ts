import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, LoginCredentials, RegisterCredentials, AuthResponse } from '../../types';
import { api } from '../../services/api/apiClient';
import { setToStorage, getFromStorage, removeFromStorage } from '../../../shared/utils';
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
    try {
      // Map email to identifier for backend compatibility
      const loginPayload = {
        identifier: credentials.email,
        password: credentials.password,
        remember_me: credentials.remember_me
      };
      const response = await api.post<AuthResponse>('/auth/login', loginPayload);
      const { access_token, refresh_token, user } = response.data;
      
      // Store tokens and user data
      setToStorage(STORAGE_KEYS.ACCESS_TOKEN, access_token);
      setToStorage(STORAGE_KEYS.REFRESH_TOKEN, refresh_token);
      setToStorage(STORAGE_KEYS.USER_DATA, user);
      setToStorage('last_login', new Date().toISOString());
      
      return { access_token, refresh_token, user };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (credentials: RegisterCredentials, { rejectWithValue }) => {
    try {
      const response = await api.post<AuthResponse>('/auth/register', credentials);
      const { access_token, refresh_token, user } = response.data;
      
      // Store tokens and user data
      setToStorage(STORAGE_KEYS.ACCESS_TOKEN, access_token);
      setToStorage(STORAGE_KEYS.REFRESH_TOKEN, refresh_token);
      setToStorage(STORAGE_KEYS.USER_DATA, user);
      setToStorage('last_login', new Date().toISOString());
      
      return { access_token, refresh_token, user };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Registration failed');
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
      
      const response = await api.post<AuthResponse>('/auth/refresh', {
        refresh_token: refreshTokenValue,
      });
      
      const { access_token, refresh_token: newRefreshToken } = response.data.data;
      
      // Update stored tokens
      setToStorage(STORAGE_KEYS.ACCESS_TOKEN, access_token);
      setToStorage(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
      
      return { access_token, refresh_token: newRefreshToken };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Token refresh failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // Call logout endpoint
      await api.post('/auth/logout');
      
      // Clear stored data
      removeFromStorage(STORAGE_KEYS.ACCESS_TOKEN);
      removeFromStorage(STORAGE_KEYS.REFRESH_TOKEN);
      removeFromStorage(STORAGE_KEYS.USER_DATA);
      removeFromStorage('last_login');
      
      return null;
    } catch (error: any) {
      // Even if logout fails on server, clear local data
      removeFromStorage(STORAGE_KEYS.ACCESS_TOKEN);
      removeFromStorage(STORAGE_KEYS.REFRESH_TOKEN);
      removeFromStorage(STORAGE_KEYS.USER_DATA);
      removeFromStorage('last_login');
      
      return null;
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData: Partial<User>, { rejectWithValue }) => {
    try {
      const response = await api.patch<User>(`/users/${userData.id}`, userData);
      const updatedUser = response.data.data;
      
      // Update stored user data
      setToStorage(STORAGE_KEYS.USER_DATA, updatedUser);
      
      return updatedUser;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Profile update failed');
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
        state.isAuthenticated = true;
        state.accessToken = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
        state.user = action.payload.user;
        state.lastLogin = new Date().toISOString();
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
