import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, Typography } from '@mui/material';

interface OrganizerRouteProps {
  children: React.ReactNode;
}

const OrganizerRoute: React.FC<OrganizerRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 1 - админ, 2 - организатор
  if (!user || (user.role_id !== 1 && user.role_id !== 2)) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="60vh"
        flexDirection="column"
      >
        <Typography variant="h5" color="error" gutterBottom>
          Доступ запрещен
        </Typography>
        <Typography variant="body1" color="text.secondary">
          У вас нет прав для просмотра этой страницы.
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
};

export default OrganizerRoute;