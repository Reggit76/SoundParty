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
  login: (credentials: { username: string; password: string }) => Promise<void>;
  register: (userData: { username: string; fullname: string; email: string; password: string; confirm_password: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      // При наличии токена можно попытаться получить данные пользователя
      // или декодировать их из токена
    }
    setLoading(false);
  }, []);

  const login = async (credentials: { username: string; password: string }) => {
    try {
      const response = await api.post('/login', {
        username: credentials.username,
        password: credentials.password
      });
      
      const { access_token } = response.data;
      
      localStorage.setItem('token', access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // Здесь можно добавить запрос для получения данных пользователя
      // Или декодировать токен чтобы получить базовую информацию
      setUser({
        user_id: 1, // Временно, нужно получать из API
        username: credentials.username,
        fullname: 'User Name',
        email: 'user@example.com',
        role_id: 3 // Временно, нужно получать из API
      });
      setIsAuthenticated(true);
    } catch (error) {
      throw new Error('Authentication failed');
    }
  };

  const register = async (userData: { username: string; fullname: string; email: string; password: string; confirm_password: string }) => {
    try {
      const response = await api.post('/register', {
        username: userData.username,
        fullname: userData.fullname,
        email: userData.email,
        password: userData.password,
        confirm_password: userData.confirm_password,
        role_id: 3 // По умолчанию обычный пользователь
      });
      
      const { access_token } = response.data;
      
      localStorage.setItem('token', access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      setUser({
        user_id: response.data.user_id || 1,
        username: userData.username,
        fullname: userData.fullname,
        email: userData.email,
        role_id: 3
      });
      setIsAuthenticated(true);
    } catch (error) {
      throw new Error('Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, register, logout }}>
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