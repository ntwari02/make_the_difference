import { api } from '../../../core/services/api/apiClient';
import { SecurityQuestion, SecurityQuestionAnswer } from '../../../core/types';

// Security Questions API service
export const securityQuestionsApi = {
  // Get all available security questions
  getAvailableQuestions: async (): Promise<SecurityQuestion[]> => {
    const response = await api.get<SecurityQuestion[]>('/security-questions');
    return response.data.data;
  },

  // Get security questions by category
  getQuestionsByCategory: async (category: string): Promise<SecurityQuestion[]> => {
    const response = await api.get<SecurityQuestion[]>(`/security-questions/category/${category}`);
    return response.data.data;
  },

  // Check if user has security questions set up
  checkUserSetup: async (): Promise<boolean> => {
    const response = await api.get('/security-questions/check');
    return response.data.data.hasQuestions;
  },

  // Get user's security questions
  getUserQuestions: async (): Promise<SecurityQuestion[]> => {
    const response = await api.get<SecurityQuestion[]>('/security-questions/user');
    return response.data.data;
  },

  // Set up security questions
  setupSecurityQuestions: async (questions: SecurityQuestionAnswer[]): Promise<void> => {
    await api.post('/security-questions/setup', { questions });
  },

  // Update specific security question answer
  updateSecurityQuestion: async (questionId: string, answer: string): Promise<void> => {
    await api.patch(`/security-questions/user/${questionId}`, { answer });
  },

  // Delete user's security questions
  deleteSecurityQuestions: async (): Promise<void> => {
    await api.delete('/security-questions/user');
  },

  // Get user's questions for password reset (public endpoint)
  getResetQuestions: async (email: string): Promise<SecurityQuestion[]> => {
    const response = await api.get<SecurityQuestion[]>(`/security-questions/reset/${email}`);
    return response.data.data;
  },

  // Verify security question answers for password reset
  verifyAnswers: async (email: string, answers: SecurityQuestionAnswer[]): Promise<{ token: string; expiresAt: string }> => {
    const response = await api.post('/security-questions/verify', {
      email,
      answers,
    });
    return response.data.data;
  },
};

export default securityQuestionsApi;
