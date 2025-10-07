import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: `${API_BASE_URL}/elearning`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export interface CourseLite { id: string; title: string; thumbnail?: string; progress?: number; }
export interface Enrollment { id: string; course_id: string; progress: number; status: string; }

export const studentApi = {
  // Discovery
  search: async (q: string) => {
    const { data } = await api.get('/courses/search', { params: { q } });
    return data.data || data;
  },
  recommendations: async () => {
    const { data } = await api.get('/recommendations');
    return data.data || data;
  },
  trending: async () => {
    const { data } = await api.get('/trending');
    return data.data || data;
  },

  // Enrollments
  enroll: async (courseId: string) => {
    const { data } = await api.post(`/courses/${courseId}/enroll`);
    return data.data || data;
  },
  myEnrollments: async () => {
    const { data } = await api.get('/enrollments');
    return data.data || data;
  },
  getEnrollment: async (courseId: string) => {
    const { data } = await api.get(`/courses/${courseId}/enrollment`);
    return data.data || data;
  },
  updateLessonProgress: async (lessonId: string, progress: number) => {
    const { data } = await api.put(`/lessons/${lessonId}/progress`, { progress });
    return data.data || data;
  },

  // Reviews
  addReview: async (courseId: string, payload: { rating: number; comment?: string }) => {
    const { data } = await api.post(`/courses/${courseId}/reviews`, payload);
    return data.data || data;
  },
  listReviews: async (courseId: string) => {
    const { data } = await api.get(`/courses/${courseId}/reviews`);
    return data.data || data;
  },

  // Favorites
  addFavorite: async (courseId: string) => {
    const { data } = await api.post(`/courses/${courseId}/favorite`);
    return data.data || data;
  },
  removeFavorite: async (courseId: string) => {
    const { data } = await api.delete(`/courses/${courseId}/favorite`);
    return data.data || data;
  },
  listFavorites: async () => {
    const { data } = await api.get('/me/favorites');
    return data.data || data;
  },

  // Instructor/Admin
  listStudents: async (params?: any) => {
    const { data } = await api.get('/students', { params });
    return data.data || data;
  },
  // Live classes (mounted under /api/online-classes)
  live: {
    listUpcoming: async () => {
      const { data } = await axios.get(`${API_BASE_URL}/online-classes/upcoming`);
      return data.data || data;
    },
    myClasses: async () => {
      const { data } = await axios.get(`${API_BASE_URL}/online-classes/my`);
      return data.data || data;
    },
    getClass: async (classId: string) => {
      const { data } = await axios.get(`${API_BASE_URL}/online-classes/${classId}`);
      return data.data || data;
    },
  },
  // E-learning payments
  payments: {
    purchaseCourse: async (payload: { courseId: string; amount: number; paymentMethod: string; paymentMethodId?: string }) => {
      const { data } = await axios.post(`${API_BASE_URL}/elearning-payments/course`, payload);
      return data.data || data;
    },
    subscribe: async (payload: { subscriptionType: string; amount: number; paymentMethod: string; paymentMethodId?: string; billingCycle?: string }) => {
      const { data } = await axios.post(`${API_BASE_URL}/elearning-payments/subscription`, payload);
      return data.data || data;
    },
    certificate: async (payload: { certificateId: string; amount: number; paymentMethod: string; paymentMethodId?: string }) => {
      const { data } = await axios.post(`${API_BASE_URL}/elearning-payments/certificate`, payload);
      return data.data || data;
    },
    history: async () => {
      const { data } = await axios.get(`${API_BASE_URL}/elearning-payments/history`);
      return data.data || data;
    },
  },
  certificates: {
    listMy: async () => {
      const { data } = await axios.get(`${API_BASE_URL}/certificates/my`);
      return data.data || data;
    },
  },
};

export default studentApi;


