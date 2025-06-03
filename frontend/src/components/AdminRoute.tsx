import React from 'react';
import { Navigate } from 'react-router-dom';
import { Box, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
  allowOrganizer?: boolean;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children, allowOrganizer = false }) => {
  const { isAuthenticated, isAdmin, isOrganizer, loading } = useAuth();

  // Если пользователь не авторизован, перенаправляем на страницу входа
  if (!isAuthenticated && !loading) {
    return <Navigate to="/login" replace />;
  }

  // Проверяем права доступа
  const hasAccess = allowOrganizer 
    ? isAdmin || isOrganizer // Админ или организатор
    : isAdmin; // Только админ

  // Если у пользователя нет прав, показываем ошибку доступа
  if (!hasAccess && !loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          <strong>Доступ запрещен</strong>
          <br />
          У вас нет прав для просмотра этой страницы. 
          {allowOrganizer 
            ? 'Только администраторы и организаторы могут получить доступ к этому разделу.'
            : 'Только администраторы могут получить доступ к этому разделу.'}
        </Alert>
      </Box>
    );
  }

  // Если у пользователя есть права, показываем контент
  return <>{children}</>;
};

export default AdminRoute;