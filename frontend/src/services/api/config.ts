import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor для добавления токена к запросам
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Отладочная информация в режиме разработки
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        data: config.data
      });
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Interceptor для обработки ответов и ошибок
api.interceptors.response.use(
  (response) => {
    // Отладочная информация в режиме разработки
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Response: ${response.status} ${response.config.url}`, response.data);
    }
    
    return response;
  },
  (error) => {
    // Отладочная информация
    console.error('API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data,
      message: error.message
    });

    // Обработка различных типов ошибок
    if (error.response?.status === 401) {
      console.log('Unauthorized access detected, clearing token');
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      
      // Не перенаправляем автоматически, пусть AuthContext сам обрабатывает
      // window.location.href = '/login';
    }

    // Обработка других ошибок
    if (error.response?.status === 403) {
      console.log('Access forbidden');
    }

    if (error.response?.status >= 500) {
      console.error('Server error occurred');
    }

    return Promise.reject(error);
  }
);