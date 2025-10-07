import { api } from '../../../core/services/api/apiClient';

export const visaApi = {
  async listServices(): Promise<any[]> {
    try {
      const res = await api.get('/visa');
      return (res.data as any) || [];
    } catch {
      return [
        { id: 'v1', title: 'Tourist Visa', country: 'USA', visa_type: 'Tourist' },
        { id: 'v2', title: 'Student Visa', country: 'UK', visa_type: 'Student' },
      ];
    }
  },
  async getService(id: string): Promise<any> {
    try {
      const res = await api.get(`/visa/${id}`);
      return res.data;
    } catch {
      return { id, title: 'Mock Visa Service', country: 'USA', visa_type: 'Tourist', description: 'Mock description' };
    }
  },
  async createService(payload: any): Promise<any> {
    try {
      const res = await api.post('/visa', payload);
      return res.data;
    } catch {
      return { id: 'mock-created', ...payload };
    }
  },
  async updateService(id: string, payload: any): Promise<any> {
    try {
      const res = await api.put(`/visa/${id}`, payload);
      return res.data;
    } catch {
      return { id, ...payload };
    }
  },
  async listApplicationsMy(): Promise<any[]> {
    try {
      const res = await api.get('/visa/applications/my');
      return (res.data as any) || [];
    } catch {
      return [
        { id: 'a1', applicant: 'Alice Johnson', status: 'pending', submitted_at: '2025-10-02' },
        { id: 'a2', applicant: 'Bob Smith', status: 'approved', submitted_at: '2025-10-01' },
      ];
    }
  },
  async updateApplication(applicationId: string, updateData: any): Promise<any> {
    try {
      const res = await api.put(`/visa/application/${applicationId}`, updateData);
      return res.data;
    } catch {
      return { id: applicationId, ...updateData };
    }
  },
  async apply(visaServiceId: string, applicationData: any, documents?: any): Promise<any> {
    try {
      const res = await api.post(`/visa/${visaServiceId}/apply`, { applicationData, documents: documents || {} });
      return res.data;
    } catch {
      return { application_id: 'mock-app', message: 'Mock application created successfully' };
    }
  },
  async statsMy(): Promise<any> {
    try {
      const res = await api.get('/visa/statistics/my');
      return res.data;
    } catch {
      return {
        active_services: 4,
        pending_applications: 18,
        approved_this_month: 12,
        approval_rate: 41,
        monthly: [
          { month: 'Jan', submitted: 80, approved: 30 },
          { month: 'Feb', submitted: 95, approved: 40 },
          { month: 'Mar', submitted: 110, approved: 45 },
          { month: 'Apr', submitted: 120, approved: 55 },
          { month: 'May', submitted: 140, approved: 60 },
          { month: 'Jun', submitted: 150, approved: 62 },
        ],
      };
    }
  },
};


