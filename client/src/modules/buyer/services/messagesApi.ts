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
  sendMessage: async (conversationId: string, payload: { content: string; messageType?: string; fileUrl?: string; category?: string; priority?: string; parentMessageId?: string }) => {
    const { data } = await api.post(`/buyer/messages/${conversationId}`, payload);
    return data.data || data;
  },
  deleteConversation: async (conversationId: string): Promise<void> => {
    await api.delete(`/buyer/messages/${conversationId}`);
  },
  uploadAttachments: async (conversationId: string, files: File[]): Promise<string[]> => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    const { data } = await api.upload(`/buyer/messages/${conversationId}/attachments`, formData);
    return data.data?.urls || data.data?.files?.map((f: any) => f.url) || [];
  },
};

export default buyerMessagesApi;


