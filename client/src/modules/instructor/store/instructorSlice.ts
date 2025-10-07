import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { instructorApi } from '../services/instructorApi';
import { InstructorProfile, InstructorStats, CourseSummary } from '../types';

interface InstructorState {
  profile: InstructorProfile | null;
  stats: InstructorStats | null;
  courses: CourseSummary[];
  liveSessions: any[];
  learners: any[];
  attendanceByClassId: Record<string, Array<{ studentId: string; status: 'present' | 'late' | 'absent' }>>;
  pollsByClassId: Record<string, any[]>;
  isLoading: boolean;
  error: string | null;
}

const initialState: InstructorState = {
  profile: null,
  stats: null,
  courses: [],
  liveSessions: [],
  learners: [],
  attendanceByClassId: {},
  pollsByClassId: {},
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

export const fetchAttendance = createAsyncThunk(
  'instructor/fetchAttendance',
  async (classId: string) => {
    const data = await instructorApi.getAttendance(classId);
    return { classId, data } as { classId: string; data: Array<{ studentId: string; status: 'present' | 'late' | 'absent' }> };
  }
);

export const upsertAttendance = createAsyncThunk(
  'instructor/upsertAttendance',
  async (args: { classId: string; records: Array<{ studentId: string; status: 'present' | 'late' | 'absent' }> }) => {
    await instructorApi.upsertAttendance(args.classId, args.records);
    return args;
  }
);

export const fetchPolls = createAsyncThunk(
  'instructor/fetchPolls',
  async (classId: string) => {
    const data = await instructorApi.listPolls(classId);
    return { classId, data } as { classId: string; data: any[] };
  }
);

export const createPoll = createAsyncThunk(
  'instructor/createPoll',
  async (args: { classId: string; question: string; options: string[] }) => {
    const poll = await instructorApi.createPoll(args.classId, { question: args.question, options: args.options });
    return { classId: args.classId, poll } as { classId: string; poll: any };
  }
);

export const votePoll = createAsyncThunk(
  'instructor/votePoll',
  async (args: { classId: string; pollId: string; optionIndex: number }) => {
    await instructorApi.votePoll(args.classId, args.pollId, { optionIndex: args.optionIndex });
    return args;
  }
);

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
      })
      .addCase(fetchAttendance.fulfilled, (state, action) => {
        state.attendanceByClassId[action.payload.classId] = action.payload.data;
      })
      .addCase(upsertAttendance.fulfilled, (state, action) => {
        state.attendanceByClassId[action.payload.classId] = action.payload.records;
      })
      .addCase(fetchPolls.fulfilled, (state, action) => {
        state.pollsByClassId[action.payload.classId] = action.payload.data;
      })
      .addCase(createPoll.fulfilled, (state, action) => {
        const list = state.pollsByClassId[action.payload.classId] || [];
        state.pollsByClassId[action.payload.classId] = [action.payload.poll, ...list];
      })
      .addCase(votePoll.fulfilled, (_state, _action) => {
        // No-op; assume realtime refresh elsewhere or optimistic UI handled in component
      });
  },
});

export const { setProfile } = instructorSlice.actions;
export default instructorSlice.reducer;


