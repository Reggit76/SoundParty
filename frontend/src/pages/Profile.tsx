import React from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Alert,
  Grid,
  Chip,
} from '@mui/material';
import {
  Person,
  Email,
  Badge,
  AdminPanelSettings,
  ManageAccounts,
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
        <Alert severity="error">Профиль не найден</Alert>
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
        return 'Неизвестно';
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Avatar
              sx={{ 
                width: 120, 
                height: 120, 
                mx: 'auto', 
                mb: 2,
                bgcolor: 'primary.main',
                fontSize: '3rem'
              }}
            >
              {user.fullname.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="h5" gutterBottom>
              {user.fullname}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Chip
                icon={
                  isAdmin ? <AdminPanelSettings /> : 
                  isOrganizer ? <ManageAccounts /> : 
                  <Person />
                }
                label={getRoleName(user.role_id)}
                color={getRoleColor(user.role_id) as any}
                variant="outlined"
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Информация о пользователе
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Person />
                </ListItemIcon>
                <ListItemText 
                  primary="Имя пользователя" 
                  secondary={user.username} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Email />
                </ListItemIcon>
                <ListItemText 
                  primary="Email" 
                  secondary={user.email} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Badge />
                </ListItemIcon>
                <ListItemText 
                  primary="ID пользователя" 
                  secondary={user.user_id} 
                />
              </ListItem>
            </List>

            {isAdmin && (
              <Box sx={{ mt: 3 }}>
                <Alert severity="info">
                  <Typography variant="body2">
                    У вас есть права администратора. Вы можете управлять всеми аспектами системы.
                  </Typography>
                </Alert>
              </Box>
            )}

            {isOrganizer && !isAdmin && (
              <Box sx={{ mt: 3 }}>
                <Alert severity="warning">
                  <Typography variant="body2">
                    У вас есть права организатора. Вы можете создавать и управлять мероприятиями.
                  </Typography>
                </Alert>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;