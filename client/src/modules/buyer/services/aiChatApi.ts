import { api } from '../../../core/services/api/apiClient';

const aiChatApi = {
  async sendMessage(payload: { message: string; sessionId?: string }) {
    const { data } = await api.post('/ai/chat/message', payload);
    return data.data || data;
  },
  async getSuggestions() {
    const { data } = await api.get('/ai/chat/suggestions');
    return data.data || data;
  },
};

export default aiChatApi;


