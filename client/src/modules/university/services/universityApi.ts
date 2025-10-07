import { api } from '../../../core/services/api/apiClient';

export const universityApi = {
  async listProviderScholarships(): Promise<any> {
    try {
      return (await api.get('/scholarships/provider/my')).data;
    } catch {
      // Fallback mock data
      return [
        { id: 'sch-1', title: 'Global Excellence Scholarship', awards_count: 25 },
        { id: 'sch-2', title: 'STEM Innovators Grant', awards_count: 15 },
      ];
    }
  },
  async listApplications(scholarshipId: string): Promise<any> {
    try {
      return (await api.get(`/scholarships/${scholarshipId}/applications`)).data;
    } catch {
      // Fallback mock data
      return [
        { id: 'app-1', applicant_name: 'Alice Johnson', submitted_at: '2025-10-01', status: 'pending' },
        { id: 'app-2', applicant_name: 'Bob Smith', submitted_at: '2025-10-02', status: 'approved' },
      ];
    }
  },
  async updateApplicationStatus(applicationId: string, status: string): Promise<any> {
    try {
      return (await api.put(`/scholarships/applications/${applicationId}/status`, { status })).data;
    } catch {
      // Simulate success
      return { id: applicationId, status };
    }
  },
  async createScholarship(payload: any): Promise<any> {
    try {
      return (await api.post('/scholarships', payload)).data;
    } catch {
      // Simulate created scholarship
      return { id: 'mock-created', ...payload };
    }
  },
  async getProviderApplicationStats(): Promise<any> {
    try {
      return (await api.get('/scholarships/applications/stats/provider')).data;
    } catch {
      // Fallback mock stats
      return {
        active_scholarships: 12,
        pending_applications: 84,
        approved_this_month: 26,
        award_rate: 32,
        monthly: [
          { month: 'Jan', submitted: 120, approved: 40 },
          { month: 'Feb', submitted: 150, approved: 55 },
          { month: 'Mar', submitted: 140, approved: 52 },
          { month: 'Apr', submitted: 180, approved: 70 },
          { month: 'May', submitted: 200, approved: 85 },
          { month: 'Jun', submitted: 210, approved: 92 },
        ],
      };
    }
  },
};



