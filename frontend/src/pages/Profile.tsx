import React from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Person,
  Email,
  Badge,
  AdminPanelSettings,
  EventNote,
  Group as GroupIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Profile: React.FC = () => {
  const { user, loading, isAdmin, isOrganizer } = useAuth();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography color="error">Пользователь не найден</Typography>
      </Box>
    );
  }

  const getRoleName = (roleId: number) => {
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

  const getRoleColor = (roleId: number) => {
    switch (roleId) {
      case 1:
        return 'error';
      case 2:
        return 'warning';
      case 3:
        return 'primary';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Профиль пользователя
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ flexGrow: 1 }}>
            {user.fullname}
          </Typography>
          <Chip
            icon={isAdmin ? <AdminPanelSettings /> : isOrganizer ? <EventNote /> : <GroupIcon />}
            label={getRoleName(user.role_id)}
            color={getRoleColor(user.role_id) as any}
            variant="filled"
          />
        </Box>

        <List>
          <ListItem>
            <ListItemIcon>
              <Person />
            </ListItemIcon>
            <ListItemText primary="Имя пользователя" secondary={user.username} />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <Badge />
            </ListItemIcon>
            <ListItemText primary="Полное имя" secondary={user.fullname} />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <Email />
            </ListItemIcon>
            <ListItemText primary="Email" secondary={user.email} />
          </ListItem>
        </List>

        {isAdmin && (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
            <Typography variant="body2" color="error.contrastText">
              <AdminPanelSettings sx={{ mr: 1, verticalAlign: 'middle' }} />
              У вас есть права администратора. Вы можете создавать и редактировать все данные в системе.
            </Typography>
          </Box>
        )}

        {isOrganizer && !isAdmin && (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
            <Typography variant="body2" color="warning.contrastText">
              <EventNote sx={{ mr: 1, verticalAlign: 'middle' }} />
              У вас есть права организатора. Вы можете создавать и редактировать мероприятия и площадки.
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Profile;