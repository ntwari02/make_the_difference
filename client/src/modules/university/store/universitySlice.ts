import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { universityApi } from '../services/universityApi';

interface UniversityState {
  scholarships: any[];
  applications: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: UniversityState = {
  scholarships: [],
  applications: [],
  isLoading: false,
  error: null,
};

export const fetchProviderScholarships = createAsyncThunk('university/fetchScholarships', async () => {
  const data = await universityApi.listProviderScholarships();
  return Array.isArray(data) ? data : (Array.isArray((data as any)?.data) ? (data as any).data : []);
});

const universitySlice = createSlice({
  name: 'university',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProviderScholarships.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProviderScholarships.fulfilled, (state, action) => {
        state.isLoading = false;
        state.scholarships = action.payload as any[];
      })
      .addCase(fetchProviderScholarships.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load scholarships';
      });
  },
});

export default universitySlice.reducer;



