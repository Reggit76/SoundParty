import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api/config';

interface User {
  user_id: number;
  username: string;
  fullname: string;
  email: string;
  role_id: number;
}

interface RegisterData {
  username: string;
  fullname: string;
  email: string;
  password: string;
  confirm_password: string;
}

interface LoginData {
  username: string;
  password: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isAdmin: boolean;
  isOrganizer: boolean;
  login: (credentials: LoginData) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role_id === 1;
  const isOrganizer = user?.role_id === 2;

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const response = await api.get('/auth/me');
          setUser(response.data);
          setIsAuthenticated(true);
        } catch (error) {
          // Токен недействителен, удаляем его
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginData) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const { access_token } = response.data;
      
      localStorage.setItem('token', access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // Получаем данные пользователя
      const userResponse = await api.get('/auth/me');
      setUser(userResponse.data);
      setIsAuthenticated(true);
    } catch (error) {
      throw new Error('Authentication failed');
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      await api.post('/auth/register', userData);
      
      // После успешной регистрации автоматически логинимся
      await login({
        username: userData.username,
        password: userData.password
      });
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
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      isAdmin, 
      isOrganizer, 
      login, 
      register, 
      logout, 
      loading 
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