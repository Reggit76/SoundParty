import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

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

// Убираем автоматическое перенаправление на логин
// Пусть AuthContext сам обрабатывает 401 ошибки
api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);