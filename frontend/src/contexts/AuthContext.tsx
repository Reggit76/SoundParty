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
  loading: boolean;
  isAdmin: boolean;
  isOrganizer: boolean;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  register: (userData: { username: string; fullname: string; email: string; password: string; confirm_password: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Вычисляемые свойства для ролей
  const isAdmin = user?.role_id === 1;
  const isOrganizer = user?.role_id === 2;

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          // Попробуем получить данные текущего пользователя
          await fetchCurrentUser();
        } catch (error) {
          // Если токен недействителен, очищаем его
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      // Здесь нужно будет добавить endpoint для получения текущего пользователя
      // Пока что используем заглушку
      const response = await api.get('/users/me'); // Этот endpoint нужно будет создать в backend
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    }
  };

  const login = async (credentials: { username: string; password: string }) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', {
        username: credentials.username,
        password: credentials.password
      });
      
      const { access_token } = response.data;
      
      localStorage.setItem('token', access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // После успешного входа получаем данные пользователя
      await fetchCurrentUser();
    } catch (error) {
      throw new Error('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: { 
    username: string; 
    fullname: string; 
    email: string; 
    password: string;
    confirm_password: string;
  }) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/register', {
        username: userData.username,
        fullname: userData.fullname,
        email: userData.email,
        password: userData.password,
        confirm_password: userData.confirm_password,
        role_id: 3 // По умолчанию роль пользователя
      });
      
      // После регистрации сразу авторизуем пользователя
      await login({ username: userData.username, password: userData.password });
    } catch (error) {
      throw new Error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      loading,
      isAdmin,
      isOrganizer,
      login, 
      register, 
      logout 
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