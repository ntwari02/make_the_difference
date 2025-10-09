import { api } from '../../../core/services/api/apiClient';

export const visaApi = {
  async listApplications(): Promise<any[]> {
    try {
      return (await api.get('/visa/applications')).data;
    } catch {
      return [
        { id: 'va-1', applicant_name: 'Alice Johnson', submitted_at: '2025-10-02', status: 'pending' },
        { id: 'va-2', applicant_name: 'Bob Smith', submitted_at: '2025-10-01', status: 'review' },
      ];
    }
  },
  async updateApplicationStatus(applicationId: string, status: string): Promise<any> {
    try {
      return (await api.put(`/visa/applications/${applicationId}/status`, { status })).data;
    } catch {
      return { id: applicationId, status };
    }
  },
  async listReviewQueue(): Promise<any[]> {
    try {
      return (await api.get('/visa/review-queue')).data;
    } catch {
      return [
        { id: 'rq-1', applicant_name: 'Carol', priority: 'high' },
        { id: 'rq-2', applicant_name: 'David', priority: 'normal' },
      ];
    }
  },
  async listInbox(): Promise<any[]> {
    try {
      return (await api.get('/visa/inbox')).data;
    } catch {
      return [
        { id: 'm-1', from: 'Applicant Alice', subject: 'Document Upload', received_at: '2025-10-02' },
        { id: 'm-2', from: 'Applicant Bob', subject: 'Status Inquiry', received_at: '2025-10-01' },
      ];
    }
  },
};



