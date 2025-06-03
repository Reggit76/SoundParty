import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api/config';

interface User {
  user_id: number;
  username: string;
  fullname: string;
  email: string;
  role_id: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Проверяем токен при загрузке приложения
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Устанавливаем токен в заголовки
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Получаем данные пользователя
          const response = await api.get('/profile');
          setUser(response.data);
          setIsAuthenticated(true);
        } catch (error) {
          // Если токен недействителен, удаляем его
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
          setIsAuthenticated(false);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      // Используем правильный формат для API
      const loginData = {
        username: credentials.email, // API ожидает username, а не email
        password: credentials.password,
      };

      const response = await api.post('/login', loginData);
      const { access_token } = response.data;
      
      // Сохраняем токен
      localStorage.setItem('token', access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // Получаем данные пользователя
      const userResponse = await api.get('/profile');
      setUser(userResponse.data);
      setIsAuthenticated(true);
    } catch (error: any) {
      throw new Error('Неверный логин или пароль');
    }
  };

  const register = async (userData: { name: string; email: string; password: string }) => {
    try {
      // Генерируем username из email (до символа @)
      const username = userData.email.split('@')[0];
      
      const registerData = {
        username: username,
        fullname: userData.name,
        email: userData.email,
        password: userData.password,
        confirm_password: userData.password,
        role_id: 3, // Обычный пользователь
      };

      await api.post('/register', registerData);
      
      // После регистрации автоматически логинимся
      await login({ email: userData.email, password: userData.password });
    } catch (error: any) {
      throw new Error('Ошибка регистрации. Возможно, пользователь с таким email уже существует.');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  };

  const refreshUser = async () => {
    try {
      const response = await api.get('/profile');
      setUser(response.data);
    } catch (error) {
      // Если не удалось обновить данные пользователя, разлогиниваем
      logout();
    }
  };

  // Показываем загрузку при инициализации
  if (loading) {
    return null; // Или можно показать спиннер
  }

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      login, 
      register, 
      logout, 
      refreshUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};