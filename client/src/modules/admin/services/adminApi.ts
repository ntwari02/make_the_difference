import { api } from '../../../core/services/api/apiClient';

export const adminApi = {
  // Dashboard
  async getOverview(params?: { period?: string }) {
    const res = await api.get('/admin/dashboard/overview', { params });
    return res.data?.data ?? res.data;
  },
  async getAlerts() {
    const res = await api.get('/admin/dashboard/alerts');
    return res.data?.data ?? res.data;
  },
  async getRecentActivity(params?: { limit?: number }) {
    const res = await api.get('/admin/dashboard/activity/recent', { params });
    return res.data?.data ?? res.data;
  },

  // Users
  async listUsers(params: any) {
    const res = await api.get('/admin/users', { params });
    return res.data;
  },
  async createUser(payload: any) {
    const res = await api.post('/admin/users', payload);
    return res.data;
  },
  async updateUser(userId: string, payload: any) {
    const res = await api.patch(`/admin/users/${userId}`, payload);
    return res.data;
  },
  async updateUserStatus(userId: string, payload: { action: 'activate'|'deactivate'|'suspend'; reason?: string; duration?: string }) {
    const res = await api.patch(`/admin/users/${userId}/status`, payload);
    return res.data;
  },
  async getUserActivity(userId: string) {
    const res = await api.get(`/admin/users/${userId}/activity`);
    return res.data?.data ?? res.data;
  },
  async getUserSessions(userId: string) {
    const res = await api.get(`/admin/users/${userId}/sessions`);
    return res.data?.data ?? res.data;
  },
  async revokeUserSessions(userId: string) {
    const res = await api.delete(`/admin/users/${userId}/sessions`);
    return res.data;
  },
  async bulkUpdateUserStatus(payload: { user_ids: string[]; action: string; reason?: string }) {
    const res = await api.post('/admin/bulk/users/update-status', payload);
    return res.data;
  },

  // Analytics
  async getAnalyticsOverview(params?: { period?: string }) {
    const res = await api.get('/admin/analytics/overview', { params });
    return res.data?.data ?? res.data;
  },
  async getEcommerceAnalytics(params?: { period?: string }) {
    const res = await api.get('/admin/analytics/ecommerce', { params });
    return res.data?.data ?? res.data;
  },
  async getElearningAnalytics(params?: { period?: string }) {
    const res = await api.get('/admin/analytics/elearning', { params });
    return res.data?.data ?? res.data;
  },
  async getClassesAnalytics(params?: { period?: string }) {
    const res = await api.get('/admin/analytics/online-classes', { params });
    return res.data?.data ?? res.data;
  },
  async getCertificatesAnalytics(params?: { period?: string }) {
    const res = await api.get('/admin/analytics/certificates', { params });
    return res.data?.data ?? res.data;
  },

  // Moderation
  async getFlaggedContent(params?: any) {
    const res = await api.get('/admin/content/flagged', { params });
    return res.data?.data ?? res.data;
  },
  async moderateContent(contentId: string, payload: { action: string; reason?: string; moderator_notes?: string }) {
    const res = await api.patch(`/admin/content/${contentId}/moderate`, payload);
    return res.data;
  },
  async removeContent(contentId: string, payload: { reason: string }) {
    const res = await api.delete(`/admin/content/${contentId}`, { data: payload as any });
    return res.data;
  },
  async bulkModerateContent(payload: { content_ids: string[]; action: string; reason?: string; moderator_notes?: string }) {
    const res = await api.post('/admin/bulk/content/moderate', payload);
    return res.data;
  },

  // Settings & Flags
  async getSystemSettings() {
    const res = await api.get('/admin/settings');
    return res.data?.data ?? res.data;
  },
  async updateSystemSettings(payload: any) {
    const res = await api.patch('/admin/settings', payload);
    return res.data;
  },
  async getFeatureFlags() {
    const res = await api.get('/admin/feature-flags');
    return res.data?.data ?? res.data;
  },
  async updateFeatureFlag(flagId: string, payload: { is_enabled?: boolean; target_percentage?: number; description?: string }) {
    const res = await api.patch(`/admin/feature-flags/${flagId}`, payload);
    return res.data;
  },

  // Audit & Events
  async getAuditLogs(params?: any) {
    const res = await api.get('/admin/audit-logs', { params });
    return res.data;
  },
  async getSystemEvents(params?: any) {
    const res = await api.get('/admin/system-events', { params });
    return res.data;
  },

  // Emergency
  async emergencySuspendUser(payload: { user_id: string; reason?: string; duration?: string }) {
    const res = await api.post('/admin/emergency/suspend-user', payload);
    return res.data;
  },
  async emergencyRemoveContent(payload: { content_id: string; content_type: string; reason: string }) {
    const res = await api.post('/admin/emergency/remove-content', payload);
    return res.data;
  },
  async toggleMaintenanceMode(payload: { enabled: boolean; message?: string }) {
    const res = await api.patch('/admin/maintenance-mode', payload);
    return res.data;
  },
  async sendBulkNotifications(payload: { user_ids: string[]; title: string; message: string; notification_type?: string; channels?: string[] }) {
    const res = await api.post('/admin/bulk/notifications/send', payload);
    return res.data;
  },
};



