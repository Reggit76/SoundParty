import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api/config';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  register: (userData: { 
    username: string; 
    fullname: string; 
    email: string; 
    password: string; 
    confirm_password: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      // Здесь можно добавить запрос данных пользователя
    }
  }, []);

  const login = async (credentials: { username: string; password: string }) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const { access_token } = response.data;
      
      localStorage.setItem('token', access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      setIsAuthenticated(true);
    } catch (error) {
      throw new Error('Authentication failed');
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
      const response = await api.post('/auth/register', userData);
      // После успешной регистрации можно автоматически авторизовать пользователя
      // или перенаправить на страницу входа
      return response.data;
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
    <AuthContext.Provider value={{ isAuthenticated, user, login, register, logout }}>
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