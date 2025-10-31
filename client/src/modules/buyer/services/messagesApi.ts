import { api } from '../../../core/services/api/apiClient';

export const buyerMessagesApi = {
  getConversations: async (params?: { page?: number; limit?: number; search?: string }) => {
    const { data } = await api.get('/buyer/messages', { params });
    return data.data || data;
  },
  getThread: async (conversationId: string) => {
    const { data } = await api.get(`/buyer/messages/${conversationId}`);
    return data.data || data;
  },
  sendMessage: async (conversationId: string, payload: { content: string; messageType?: string; fileUrl?: string; category?: string; priority?: string }) => {
    const { data } = await api.post(`/buyer/messages/${conversationId}`, payload);
    return data.data || data;
  },
};

export default buyerMessagesApi;


