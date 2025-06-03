import React from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Alert,
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Debug: React.FC = () => {
  const { 
    isAuthenticated, 
    user, 
    isAdmin, 
    isOrganizer, 
    loading,
    refreshUser
  } = useAuth();

  const handleRefreshUser = async () => {
    try {
      await refreshUser();
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const debugData = [
    { key: 'Статус загрузки', value: loading ? 'Загружается...' : 'Загружено' },
    { key: 'Авторизован', value: isAuthenticated ? 'Да' : 'Нет' },
    { key: 'ID пользователя', value: user?.user_id || 'N/A' },
    { key: 'Имя пользователя', value: user?.username || 'N/A' },
    { key: 'Полное имя', value: user?.fullname || 'N/A' },
    { key: 'Email', value: user?.email || 'N/A' },
    { key: 'ID роли', value: user?.role_id || 'N/A' },
    { key: 'Администратор', value: isAdmin ? 'Да' : 'Нет' },
    { key: 'Организатор', value: isOrganizer ? 'Да' : 'Нет' },
    { key: 'Токен в localStorage', value: localStorage.getItem('token') ? 'Есть' : 'Нет' },
  ];

  const getRoleColor = (roleId: number | undefined) => {
    switch (roleId) {
      case 1:
        return 'error';
      case 2:
        return 'warning';
      case 3:
        return 'success';
      default:
        return 'default';
    }
  };

  const getRoleName = (roleId: number | undefined) => {
    switch (roleId) {
      case 1:
        return 'Администратор';
      case 2:
        return 'Организатор';
      case 3:
        return 'Участник';
      default:
        return 'Неизвестная роль';
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Отладочная информация
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefreshUser}
          disabled={!isAuthenticated}
        >
          Обновить данные
        </Button>
      </Box>

      {process.env.NODE_ENV === 'production' && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Эта страница предназначена только для разработки и должна быть скрыта в продакшене.
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Информация о пользователе
        </Typography>
        
        {user && (
          <Box sx={{ mb: 2 }}>
            <Chip
              label={getRoleName(user.role_id)}
              color={getRoleColor(user.role_id) as any}
              size="medium"
            />
          </Box>
        )}

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Параметр</strong></TableCell>
                <TableCell><strong>Значение</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {debugData.map((row) => (
                <TableRow key={row.key}>
                  <TableCell>{row.key}</TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      fontFamily="monospace"
                      color={row.value === 'N/A' ? 'text.secondary' : 'text.primary'}
                    >
                      {row.value}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Права доступа
        </Typography>
        
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><strong>Страница/Действие</strong></TableCell>
              <TableCell><strong>Доступ</strong></TableCell>
              <TableCell><strong>Причина</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Площадки (просмотр)</TableCell>
              <TableCell>
                <Chip label="Разрешено" color="success" size="small" />
              </TableCell>
              <TableCell>Доступно всем</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Площадки (создание/редактирование)</TableCell>
              <TableCell>
                <Chip 
                  label={isAdmin || isOrganizer ? "Разрешено" : "Запрещено"} 
                  color={isAdmin || isOrganizer ? "success" : "error"} 
                  size="small" 
                />
              </TableCell>
              <TableCell>
                {isAdmin || isOrganizer 
                  ? "Есть права администратора или организатора" 
                  : "Нужны права администратора или организатора"
                }
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Управление пользователями</TableCell>
              <TableCell>
                <Chip 
                  label={isAdmin ? "Разрешено" : "Запрещено"} 
                  color={isAdmin ? "success" : "error"} 
                  size="small" 
                />
              </TableCell>
              <TableCell>
                {isAdmin 
                  ? "Есть права администратора" 
                  : "Нужны права администратора"
                }
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Команды (создание)</TableCell>
              <TableCell>
                <Chip 
                  label={isAuthenticated ? "Разрешено" : "Запрещено"} 
                  color={isAuthenticated ? "success" : "error"} 
                  size="small" 
                />
              </TableCell>
              <TableCell>
                {isAuthenticated 
                  ? "Авторизованный пользователь" 
                  : "Требуется авторизация"
                }
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>

      {user && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            JSON данные пользователя
          </Typography>
          <Box
            component="pre"
            sx={{
              backgroundColor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem',
              fontFamily: 'monospace',
            }}
          >
            {JSON.stringify(user, null, 2)}
          </Box>
        </Paper>
      )}
    </Container>
  );
};

export default Debug;