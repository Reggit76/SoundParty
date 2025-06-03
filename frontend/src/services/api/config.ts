import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Перехватчик запросов - добавляем токен авторизации
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

// Перехватчик ответов - обрабатываем ошибки авторизации
api.interceptors.response.use(
  (response) => {
    // Если ответ содержит массив данных напрямую, оборачиваем в объект
    if (Array.isArray(response.data)) {
      return {
        ...response,
        data: {
          data: response.data,
          success: true
        }
      };
    }
    
    // Если ответ не содержит поле data, добавляем его
    if (response.data && !response.data.hasOwnProperty('data')) {
      return {
        ...response,
        data: {
          data: response.data,
          success: true
        }
      };
    }
    
    return response;
  },
  (error) => {
    // Если получили 401 ошибку (Unauthorized)
    if (error.response?.status === 401) {
      // Удаляем токен из localStorage
      localStorage.removeItem('token');
      
      // Удаляем заголовок авторизации
      delete api.defaults.headers.common['Authorization'];
      
      // Перенаправляем на страницу входа (только если не на публичной странице)
      const currentPath = window.location.pathname;
      const publicPaths = ['/', '/login', '/register'];
      
      if (!publicPaths.includes(currentPath)) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;