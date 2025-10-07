import { api } from '../../../core/services/api/apiClient';
import { InstructorProfile, InstructorStats, CourseSummary } from '../types';

export const instructorApi = {
  async getProfile(): Promise<InstructorProfile> {
    const res = await api.get('/elearning/instructor/me');
    return res.data;
  },

  async updateProfile(payload: Partial<InstructorProfile>): Promise<InstructorProfile> {
    const res = await api.put('/elearning/instructor/me', payload);
    return res.data;
  },

  async getStats(): Promise<InstructorStats> {
    // Backend exposes: GET /api/elearning/me/instructor/analytics
    const res = await api.get('/elearning/me/instructor/analytics');
    return res.data;
  },

  async listCourses(): Promise<CourseSummary[]> {
    // Public/instructor-filtered list; further filtering can be added if backend supports owner=me
    const res = await api.get('/elearning/courses');
    return res.data;
  },

  // Advanced features stubs
  async listLiveSessions(): Promise<any[]> {
    // Backend: GET /api/online-classes with filters
    const res = await api.get('/online-classes', { params: { scope: 'mine' } });
    return res.data;
  },
  async createLiveSession(payload: any): Promise<any> {
    // Backend: POST /api/online-classes (instructor/admin)
    const res = await api.post('/online-classes', payload);
    return res.data;
  },
  async listLearners(): Promise<any[]> {
    // Backend: GET /api/elearning/students (instructor/admin)
    const res = await api.get('/elearning/students');
    return res.data;
  },
  async getAttendance(classId: string): Promise<any[]> {
    // Backend: GET /api/online-classes/:classId/attendance (instructor/admin)
    const res = await api.get(`/online-classes/${classId}/attendance`);
    return res.data;
  },
  async upsertAttendance(classId: string, records: Array<{ studentId: string; status: 'present' | 'late' | 'absent' }>): Promise<any> {
    // Backend: POST /api/online-classes/:classId/attendance with array of records
    const res = await api.post(`/online-classes/${classId}/attendance`, { records });
    return res.data;
  },
  async listPolls(classId: string): Promise<any[]> {
    // Backend: GET /api/online-classes/:classId/polls
    const res = await api.get(`/online-classes/${classId}/polls`);
    return res.data;
  },
  async createPoll(classId: string, payload: { question: string; options: string[] }): Promise<any> {
    // Backend: POST /api/online-classes/:classId/polls
    const res = await api.post(`/online-classes/${classId}/polls`, payload);
    return res.data;
  },
  async votePoll(classId: string, pollId: string, payload: { optionIndex: number }): Promise<any> {
    // Backend: POST /api/online-classes/:classId/polls/:pollId/vote
    const res = await api.post(`/online-classes/${classId}/polls/${pollId}/vote`, payload);
    return res.data;
  },
  async listMyCertificates(): Promise<any[]> {
    // Backend: GET /api/certificates/my-certificates
    const res = await api.get('/certificates/my-certificates');
    return res.data;
  },
  async generateCertificate(enrollmentId: string, payload: any): Promise<any> {
    // Backend: POST /api/certificates/enrollment/:enrollmentId
    const res = await api.post(`/certificates/enrollment/${enrollmentId}`, payload);
    return res.data;
  },
};


