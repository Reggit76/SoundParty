import axios from 'axios';

// В Docker окружении используем относительный путь (nginx будет проксировать)
// В разработке используем прямой адрес backend
const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api/v1'  // Для Docker - nginx проксирует
  : 'http://localhost:8000/api/v1'; // Для разработки

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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