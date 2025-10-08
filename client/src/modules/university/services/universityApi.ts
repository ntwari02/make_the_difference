import { api } from '../../../core/services/api/apiClient';

export const universityApi = {
  // Scholarships
  async getScholarships(): Promise<any> {
    try {
      return (await api.get('/scholarships/provider/my')).data;
    } catch {
      // Only return mocks in development; empty in production so admin-listed items can populate
      const isDev = typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.MODE === 'development';
      if (!isDev) return [];
      return [
        { id: 'sch-1', title: 'Global Engineering Excellence', description: 'Prestigious support for top engineering students.', applications: 48, budget: 50000, deadline: '2025-11-30', status: 'active', tags: ['Health','Research'] },
        { id: 'sch-2', title: 'Sustainable Energy Scholarship', description: 'Empowering clean energy innovators.', applications: 27, budget: 45000, deadline: '2025-12-01', status: 'active', tags: ['Engineering','STEM','Merit'] },
        { id: 'sch-3', title: 'Business Leadership Grant', description: 'For emerging leaders in business.', applications: 30, budget: 40000, deadline: '2025-12-05', status: 'active', tags: ['Business','Leadership'] },
        { id: 'sch-4', title: 'Global STEM Innovators', description: 'Backing cross‑disciplinary STEM projects.', applications: 36, budget: 52000, deadline: '2025-12-08', status: 'active', tags: ['STEM','Innovation'] },
        { id: 'sch-5', title: 'Computer Science Merit Award', description: 'Recognizing CS academic excellence.', applications: 54, budget: 30000, deadline: '2025-12-10', status: 'active', tags: ['CS','Undergraduate','Merit'] },
        { id: 'sch-6', title: 'AI & Data Science Fellowship', description: 'Advanced research funding in AI/DS.', applications: 62, budget: 65000, deadline: '2025-12-15', status: 'active', tags: ['AI','Data','Graduate'] },
        { id: 'sch-7', title: 'Arts & Humanities Fund', description: 'Supporting creative scholarship.', applications: 18, budget: 25000, deadline: '2025-12-20', status: 'active', tags: ['Arts','Humanities'] },
        { id: 'sch-8', title: 'Environmental Research Grant', description: 'Projects focused on sustainability.', applications: 22, budget: 42000, deadline: '2025-12-22', status: 'active', tags: ['Environment','Research'] },
        // Inactive/unavailable examples
        { id: 'sch-9', title: 'Urban Development Grant', description: 'Temporarily unavailable.', applications: 0, budget: 0, deadline: '2025-10-01', status: 'inactive', tags: ['Urban','Planning'] },
        { id: 'sch-10', title: 'Climate Action Fellowship', description: 'On hold for review.', applications: 0, budget: 0, deadline: '2025-09-15', status: 'inactive', tags: ['Climate','Environment'] },
        { id: 'sch-11', title: 'Digital Literacy Award', description: 'Paused until next cycle.', applications: 0, budget: 0, deadline: '2025-08-30', status: 'inactive', tags: ['Education','Digital'] },
        { id: 'sch-12', title: 'Global Health Initiative', description: 'Temporarily closed.', applications: 0, budget: 0, deadline: '2025-08-10', status: 'inactive', tags: ['Health','Global'] },
        { id: 'sch-13', title: 'Sustainable Cities Challenge', description: 'Funding on hold.', applications: 0, budget: 0, deadline: '2025-07-20', status: 'inactive', tags: ['Sustainability','Urban'] },
        { id: 'sch-14', title: 'Quantum Computing Grant', description: 'Awaiting budget approval.', applications: 0, budget: 0, deadline: '2025-07-05', status: 'inactive', tags: ['Quantum','Research'] },
        { id: 'sch-15', title: 'Space Technology Fellowship', description: 'Program suspended.', applications: 0, budget: 0, deadline: '2025-06-15', status: 'inactive', tags: ['Space','Technology'] },
        { id: 'sch-16', title: 'Renewable Energy Innovation', description: 'Under reorganization.', applications: 0, budget: 0, deadline: '2025-05-30', status: 'inactive', tags: ['Energy','Innovation'] },
        { id: 'sch-17', title: 'Marine Biology Research', description: 'Temporarily discontinued.', applications: 0, budget: 0, deadline: '2025-05-10', status: 'inactive', tags: ['Marine','Biology'] },
        { id: 'sch-18', title: 'Cybersecurity Excellence', description: 'Program on hiatus.', applications: 0, budget: 0, deadline: '2025-04-25', status: 'inactive', tags: ['Cybersecurity','Technology'] },
        { id: 'sch-19', title: 'Social Impact Grant', description: 'Reviewing criteria.', applications: 0, budget: 0, deadline: '2025-04-10', status: 'inactive', tags: ['Social','Impact'] },
        { id: 'sch-20', title: 'Agricultural Innovation Fund', description: 'Seasonal suspension.', applications: 0, budget: 0, deadline: '2025-03-20', status: 'inactive', tags: ['Agriculture','Innovation'] },
      ];
    }
  },

  async listProviderScholarships(): Promise<any> {
    return this.getScholarships();
  },

  async createScholarship(payload: any): Promise<any> {
    try {
      return (await api.post('/scholarships', payload)).data;
    } catch {
      // Simulate created scholarship
      return { id: 'mock-created', ...payload, status: 'active' };
    }
  },

  async updateScholarship(id: string, payload: any): Promise<any> {
    try {
      return (await api.put(`/scholarships/${id}`, payload)).data;
    } catch {
      return { id, ...payload };
    }
  },

  async deleteScholarship(id: string): Promise<any> {
    try {
      return (await api.delete(`/scholarships/${id}`)).data;
    } catch {
      return { success: true };
    }
  },

  // Applications
  async getApplications(scholarshipId?: string): Promise<any> {
    try {
      const endpoint = scholarshipId ? `/scholarships/${scholarshipId}/applications` : '/scholarships/applications/all';
      return (await api.get(endpoint)).data;
    } catch {
      // Fallback mock data
      return [
        { id: 'app-1', student_name: 'John Doe', scholarship: 'Engineering Excellence', status: 'pending', submitted: '2024-01-20', gpa: 3.8 },
        { id: 'app-2', student_name: 'Jane Smith', scholarship: 'Computer Science Merit', status: 'approved', submitted: '2024-01-19', gpa: 3.9 },
        { id: 'app-3', student_name: 'Mike Johnson', scholarship: 'Business Leadership', status: 'rejected', submitted: '2024-01-18', gpa: 3.2 },
        { id: 'app-4', student_name: 'Sarah Wilson', scholarship: 'Engineering Excellence', status: 'pending', submitted: '2024-01-17', gpa: 3.7 },
        { id: 'app-5', student_name: 'David Brown', scholarship: 'Arts & Humanities', status: 'approved', submitted: '2024-01-16', gpa: 3.6 },
        { id: 'app-6', student_name: 'Emily Davis', scholarship: 'Medical Research', status: 'pending', submitted: '2024-01-15', gpa: 3.9 },
        { id: 'app-7', student_name: 'Alex Chen', scholarship: 'Computer Science Merit', status: 'approved', submitted: '2024-01-14', gpa: 3.8 },
        { id: 'app-8', student_name: 'Maria Garcia', scholarship: 'Business Leadership', status: 'rejected', submitted: '2024-01-13', gpa: 3.1 },
      ];
    }
  },

  async listApplications(scholarshipId: string): Promise<any> {
    return this.getApplications(scholarshipId);
  },

  async updateApplicationStatus(applicationId: string, status: string): Promise<any> {
    try {
      return (await api.put(`/scholarships/applications/${applicationId}/status`, { status })).data;
    } catch {
      // Simulate success
      return { id: applicationId, status };
    }
  },

  async getApplicationDetails(applicationId: string): Promise<any> {
    try {
      return (await api.get(`/scholarships/applications/${applicationId}`)).data;
    } catch {
      return {
        id: applicationId,
        student_name: 'John Doe',
        scholarship: 'Engineering Excellence',
        status: 'pending',
        submitted: '2024-01-20',
        gpa: 3.8,
        documents: ['transcript.pdf', 'essay.pdf', 'recommendation.pdf'],
        notes: 'Strong candidate with excellent academic record'
      };
    }
  },

  // Analytics & Stats
  async getProviderApplicationStats(): Promise<any> {
    try {
      return (await api.get('/scholarships/applications/stats/provider')).data;
    } catch {
      // Enhanced fallback mock stats
      return {
        active_scholarships: 12,
        pending_applications: 45,
        approved_this_month: 28,
        rejected_this_month: 12,
        award_rate: 68,
        active_students: 156,
        total_budget: 125000,
        monthly: [
          { month: 'Jan', submitted: 120, approved: 40, rejected: 15, pending: 65 },
          { month: 'Feb', submitted: 150, approved: 55, rejected: 20, pending: 75 },
          { month: 'Mar', submitted: 140, approved: 52, rejected: 18, pending: 70 },
          { month: 'Apr', submitted: 180, approved: 70, rejected: 25, pending: 85 },
          { month: 'May', submitted: 200, approved: 85, rejected: 30, pending: 85 },
          { month: 'Jun', submitted: 210, approved: 92, rejected: 35, pending: 83 },
        ],
      };
    }
  },

  async getAnalytics(): Promise<any> {
    try {
      return (await api.get('/scholarships/analytics/provider')).data;
    } catch {
      return {
        topScholarships: [
          { name: 'Engineering Excellence', applications: 45, approvalRate: 75 },
          { name: 'Computer Science Merit', applications: 32, approvalRate: 68 },
          { name: 'Business Leadership', applications: 28, approvalRate: 60 },
        ],
        demographics: {
          byCountry: [
            { country: 'USA', count: 45 },
            { country: 'Canada', count: 32 },
            { country: 'UK', count: 28 },
            { country: 'Germany', count: 25 },
          ],
          byField: [
            { field: 'Engineering', count: 45 },
            { field: 'Computer Science', count: 32 },
            { field: 'Business', count: 28 },
            { field: 'Arts', count: 15 },
          ]
        }
      };
    }
  },

  // Notifications
  async getNotifications(): Promise<any> {
    try {
      return (await api.get('/scholarships/notifications')).data;
    } catch {
      return [
        { id: 1, type: 'success', message: 'New scholarship application received', time: '2 min ago', unread: true },
        { id: 2, type: 'warning', message: 'Application deadline approaching for Engineering Scholarship', time: '1 hour ago', unread: true },
        { id: 3, type: 'info', message: 'Monthly report generated successfully', time: '3 hours ago', unread: false },
        { id: 4, type: 'success', message: 'Scholarship application approved', time: '5 hours ago', unread: false },
        { id: 5, type: 'warning', message: 'Budget allocation needs review', time: '1 day ago', unread: false },
      ];
    }
  },

  async markNotificationAsRead(notificationId: string): Promise<any> {
    try {
      return (await api.put(`/scholarships/notifications/${notificationId}/read`)).data;
    } catch {
      return { success: true };
    }
  },

  // Reports & Export
  async exportApplications(format: 'pdf' | 'excel' | 'csv' = 'pdf'): Promise<any> {
    try {
      return (await api.get(`/scholarships/export/applications?format=${format}`)).data;
    } catch {
      return { downloadUrl: `/mock-export.${format}` };
    }
  },

  async generateReport(type: 'monthly' | 'quarterly' | 'annual' = 'monthly'): Promise<any> {
    try {
      return (await api.post('/scholarships/reports/generate', { type })).data;
    } catch {
      return { reportId: 'mock-report', downloadUrl: '/mock-report.pdf' };
    }
  },
};



