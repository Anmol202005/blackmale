import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const emailService = {
  generateAlias: async () => {
    const response = await api.post('/api/aliases/generate');
    return response.data;
  },

  getMessages: async (email) => {
    const response = await api.get(`/api/mail/${email}`);
    return response.data;
  },

  getMessage: async (messageId) => {
    const response = await api.get(`/api/mail/message/${messageId}`);
    return response.data;
  },

  markAsRead: async (messageId) => {
    const response = await api.put(`/api/mail/${messageId}/read`);
    return response.data;
  },

  deleteAlias: async (email) => {
    const response = await api.delete(`/api/aliases/${email}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/api/stats');
    return response.data;
  }
};

export default api;