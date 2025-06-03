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
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role_id === 1;
  const isOrganizer = user?.role_id === 2;

  // Функция для обновления данных пользователя
  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }

    try {
      const response = await api.get('/auth/me');
      const userData = response.data;
      
      console.log('User data loaded:', userData); // Отладочная информация
      
      setUser(userData);
      setIsAuthenticated(true);
      return userData;
    } catch (error) {
      console.error('Failed to load user data:', error);
      // Если токен недействителен, очищаем его
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      console.log('Initializing auth, token:', token ? 'exists' : 'none'); // Отладка
      
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          await refreshUser();
        } catch (error) {
          console.log('Token validation failed:', error);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Отладочная информация при изменении пользователя
  useEffect(() => {
    if (user) {
      console.log('Auth state updated:', {
        user: user.username,
        role_id: user.role_id,
        isAdmin,
        isOrganizer,
        isAuthenticated
      });
    }
  }, [user, isAdmin, isOrganizer, isAuthenticated]);

  const login = async (credentials: LoginData) => {
    try {
      console.log('Attempting login for:', credentials.username);
      
      const response = await api.post('/auth/login', credentials);
      const { access_token } = response.data;
      
      console.log('Login successful, token received');
      
      localStorage.setItem('token', access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // Получаем данные пользователя
      await refreshUser();
      
      console.log('Login completed successfully');
    } catch (error) {
      console.error('Authentication failed:', error);
      throw new Error('Authentication failed');
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      console.log('Attempting registration for:', userData.username);
      
      await api.post('/auth/register', userData);
      
      console.log('Registration successful, attempting auto-login');
      
      // После успешной регистрации автоматически логинимся
      await login({
        username: userData.username,
        password: userData.password
      });
    } catch (error) {
      console.error('Registration failed:', error);
      throw new Error('Registration failed');
    }
  };

  const logout = () => {
    console.log('Logging out user:', user?.username);
    
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
    
    console.log('Logout completed');
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
      loading,
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