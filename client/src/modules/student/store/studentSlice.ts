import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface EnrollmentState {
  enrollments: any[];
  favorites: any[];
  recommendations: any[];
  loading: boolean;
  error: string | null;
}

const initialState: EnrollmentState = {
  enrollments: [],
  favorites: [],
  recommendations: [],
  loading: false,
  error: null,
};

const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) { state.loading = action.payload; },
    setError(state, action: PayloadAction<string | null>) { state.error = action.payload; },
    setEnrollments(state, action: PayloadAction<any[]>) { state.enrollments = action.payload; },
    setFavorites(state, action: PayloadAction<any[]>) { state.favorites = action.payload; },
    setRecommendations(state, action: PayloadAction<any[]>) { state.recommendations = action.payload; },
  }
});

export const { setLoading, setError, setEnrollments, setFavorites, setRecommendations } = studentSlice.actions;
export default studentSlice.reducer;


