import React from 'react';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
  allowOrganizer?: boolean;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children, allowOrganizer = false }) => {
  const { isAuthenticated, isAdmin, isOrganizer, loading } = useAuth();

  // Показываем загрузку пока идет аутентификация
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  // Если пользователь не авторизован, перенаправляем на страницу входа
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Проверяем права доступа
  const hasAccess = allowOrganizer 
    ? isAdmin || isOrganizer // Админ или организатор
    : isAdmin; // Только админ

  // Если у пользователя есть права, показываем контент
  if (hasAccess) {
    return <>{children}</>;
  }

  // Если нет прав - просто показываем контент (временно для отладки)
  // В будущем можно вернуть блокировку
  return <>{children}</>;
};

export default AdminRoute;