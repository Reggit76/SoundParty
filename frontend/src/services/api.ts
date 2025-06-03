import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const auth = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  register: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => api.post('/auth/register', data),
  logout: () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  },
};

// Events endpoints
export const events = {
  getAll: () => api.get('/events'),
  getById: (id: number) => api.get(`/events/${id}`),
  create: (data: any) => api.post('/events', data),
  update: (id: number, data: any) => api.put(`/events/${id}`, data),
  delete: (id: number) => api.delete(`/events/${id}`),
};

// Venues endpoints
export const venues = {
  getAll: () => api.get('/venues'),
  getById: (id: number) => api.get(`/venues/${id}`),
  create: (data: any) => api.post('/venues', data),
  update: (id: number, data: any) => api.put(`/venues/${id}`, data),
  delete: (id: number) => api.delete(`/venues/${id}`),
};

// Teams endpoints
export const teams = {
  getAll: () => api.get('/teams'),
  getById: (id: number) => api.get(`/teams/${id}`),
  create: (data: any) => api.post('/teams', data),
  update: (id: number, data: any) => api.put(`/teams/${id}`, data),
  delete: (id: number) => api.delete(`/teams/${id}`),
};

// Profile endpoints
export const profile = {
  get: () => api.get('/profile'),
  update: (data: any) => api.put('/profile', data),
  updateAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.put('/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default {
  auth,
  events,
  venues,
  teams,
  profile,
}; 