import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api/config';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/profile');
        const userRole = response.data.role_id;
        setIsAdmin(userRole === 1); // 1 = Администратор
        setError(null);
      } catch (err) {
        setError('Ошибка при проверке прав доступа');
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [isAuthenticated]);

  // Если пользователь не авторизован, перенаправляем на страницу входа
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Показываем загрузку пока проверяем права
  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Если произошла ошибка при проверке прав
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {error}
        </Alert>
      </Box>
    );
  }

  // Если пользователь не админ, показываем ошибку доступа
  if (!isAdmin) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          <strong>Доступ запрещен</strong>
          <br />
          У вас нет прав для просмотра этой страницы. 
          Только администраторы могут получить доступ к этому разделу.
        </Alert>
      </Box>
    );
  }

  // Если пользователь админ, показываем контент
  return <>{children}</>;
};

export default AdminRoute;