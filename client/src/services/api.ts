import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('voxly_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const message =
      err.response?.data?.error ||
      err.response?.data?.message ||
      err.message ||
      'An unexpected error occurred';

    // Auto-logout on 401 only for protected routes (not login/register)
    const url = err.config?.url || '';
    if (status === 401 && !url.includes('/auth/')) {
      localStorage.removeItem('voxly_token');
      localStorage.removeItem('voxly_auth');
      window.location.href = '/login';
      return Promise.reject(err);
    }

    toast.error(message);
    return Promise.reject(err);
  }
);

export default api;

// ─── Auth ──────────────────────────────────────────────────────
export const authApi = {
  register: (username: string, password: string) =>
    api.post('/auth/register', { username, password }),

  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
};

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
