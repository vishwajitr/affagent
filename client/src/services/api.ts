import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.error ||
      err.response?.data?.message ||
      err.message ||
      'An unexpected error occurred';
    toast.error(message);
    return Promise.reject(err);
  }
);

export default api;

// ─── Contacts ─────────────────────────────────────────────────
export const contactsApi = {
  getAll: (params: { page?: number; limit?: number; status?: string; search?: string }) =>
    api.get('/contacts', { params }),

  getStats: () => api.get('/contacts/stats'),

  uploadCSV: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/contacts/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  delete: (id: string) => api.delete(`/contacts/${id}`),
};

// ─── Config ───────────────────────────────────────────────────
export const configApi = {
  getStatus: () => api.get('/config/status'),
};

// ─── Campaigns ────────────────────────────────────────────────
export const campaignsApi = {
  getAll: () => api.get('/campaigns'),

  getById: (id: string) => api.get(`/campaigns/${id}`),

  create: (data: { name: string; script: string }) => api.post('/campaigns', data),

  start: (id: string) => api.post(`/campaigns/${id}/start`),

  delete: (id: string) => api.delete(`/campaigns/${id}`),
};
