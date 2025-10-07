import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { instructorApi } from '../services/instructorApi';
import { InstructorProfile, InstructorStats, CourseSummary } from '../types';

interface InstructorState {
  profile: InstructorProfile | null;
  stats: InstructorStats | null;
  courses: CourseSummary[];
  liveSessions: any[];
  learners: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: InstructorState = {
  profile: null,
  stats: null,
  courses: [],
  liveSessions: [],
  learners: [],
  isLoading: false,
  error: null,
};

export const fetchInstructorProfile = createAsyncThunk('instructor/fetchProfile', async () => {
  return await instructorApi.getProfile();
});

export const fetchInstructorStats = createAsyncThunk('instructor/fetchStats', async () => {
  return await instructorApi.getStats();
});

export const fetchInstructorCourses = createAsyncThunk('instructor/fetchCourses', async () => {
  return await instructorApi.listCourses();
});

export const fetchLiveSessions = createAsyncThunk('instructor/fetchLiveSessions', async () => {
  return await instructorApi.listLiveSessions();
});

export const fetchLearners = createAsyncThunk('instructor/fetchLearners', async () => {
  return await instructorApi.listLearners();
});

const instructorSlice = createSlice({
  name: 'instructor',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<InstructorProfile>) => {
      state.profile = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInstructorProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInstructorProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
      })
      .addCase(fetchInstructorProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.error && action.error.message) || 'Failed to load profile';
      })
      .addCase(fetchInstructorStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(fetchInstructorCourses.fulfilled, (state, action) => {
        state.courses = action.payload;
      })
      .addCase(fetchLiveSessions.fulfilled, (state, action) => {
        const payload: any = action.payload as any;
        state.liveSessions = Array.isArray(payload) ? payload : (Array.isArray(payload?.data) ? payload.data : []);
      })
      .addCase(fetchLearners.fulfilled, (state, action) => {
        state.learners = action.payload as any[];
      });
  },
});

export const { setProfile } = instructorSlice.actions;
export default instructorSlice.reducer;


