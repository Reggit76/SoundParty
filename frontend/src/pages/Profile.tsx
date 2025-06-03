import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Avatar,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Tab,
  Tabs,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
} from '@mui/material';
import {
  Person,
  Email,
  Badge,
  Group,
  Event,
  Edit,
  AdminPanelSettings,
  Groups,
  EmojiEvents,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { api } from '../services/api/config';

interface UserProfile {
  user_id: number;
  username: string;
  fullname: string;
  email: string;
  role_id: number;
}

interface Team {
  team_id: number;
  name: string;
  rating: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editData, setEditData] = useState({
    fullname: '',
    email: '',
  });

  const { showSuccess, showError } = useNotification();
  const { user } = useAuth();

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const [profileResponse, teamsResponse] = await Promise.all([
        api.get('/profile'),
        api.get('/profile/teams'),
      ]);
      setProfile(profileResponse.data);
      setTeams(teamsResponse.data);
      setError(null);
    } catch (err: any) {
      setError('Не удалось загрузить данные профиля');
      showError('Ошибка при загрузке профиля');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEditProfile = () => {
    if (profile) {
      setEditData({
        fullname: profile.fullname,
        email: profile.email,
      });
      setEditDialogOpen(true);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const response = await api.put('/profile', editData);
      setProfile(response.data);
      setEditDialogOpen(false);
      showSuccess('Профиль успешно обновлен');
    } catch (err: any) {
      showError('Ошибка при обновлении профиля');
    }
  };

  const getRoleName = (roleId: number) => {
    switch (roleId) {
      case 1:
        return 'Администратор';
      case 2:
        return 'Организатор';
      case 3:
        return 'Пользователь';
      default:
        return 'Неизвестная роль';
    }
  };

  const isAdmin = profile?.role_id === 1;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !profile) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error || 'Профиль не найден'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={4}>
        {/* Левая панель - основная информация */}
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
              {profile.fullname.charAt(0).toUpperCase()}
            </Avatar>
            
            <Typography variant="h5" gutterBottom>
              {profile.fullname}
            </Typography>
            
            <Chip 
              label={getRoleName(profile.role_id)}
              color={isAdmin ? 'error' : 'primary'}
              variant="outlined"
              sx={{ mb: 2 }}
            />
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button 
                variant="contained" 
                startIcon={<Edit />}
                onClick={handleEditProfile}
                fullWidth
              >
                Редактировать профиль
              </Button>
              
              {isAdmin && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<AdminPanelSettings />}
                  fullWidth
                  onClick={() => {/* Навигация к админ панели */}}
                >
                  Админ панель
                </Button>
              )}
            </Box>
          </Paper>

          {/* Контактная информация */}
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Контактная информация
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <Person />
                </ListItemIcon>
                <ListItemText 
                  primary="Имя пользователя" 
                  secondary={profile.username} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Email />
                </ListItemIcon>
                <ListItemText 
                  primary="Email" 
                  secondary={profile.email} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Badge />
                </ListItemIcon>
                <ListItemText 
                  primary="Роль" 
                  secondary={getRoleName(profile.role_id)} 
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Правая панель - вкладки с данными */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ width: '100%' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab icon={<Person />} label="Основная информация" />
              <Tab icon={<Groups />} label="Мои команды" />
              <Tab icon={<Event />} label="Мои мероприятия" />
            </Tabs>

            {/* Вкладка "Мои команды" */}
            <TabPanel value={tabValue} index={0}>
              {teams.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <Typography variant="h6" color="text.secondary">
                    Вы не состоите ни в одной команде
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Присоединитесь к команде или создайте свою собственную
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {teams.map((team) => (
                    <Grid item xs={12} sm={6} key={team.team_id}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {team.name}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1}>
                            <EmojiEvents color="primary" fontSize="small" />
                            <Typography variant="body2" color="text.secondary">
                              Рейтинг: {team.rating}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </TabPanel>

            {/* Вкладка "Мероприятия" */}
            <TabPanel value={tabValue} index={1}>
              <Box textAlign="center" py={4}>
                <Typography variant="h6" color="text.secondary">
                  Раздел в разработке
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Здесь будут отображаться ваши мероприятия
                </Typography>
              </Box>
            </TabPanel>

            {/* Вкладка "Достижения" */}
            <TabPanel value={tabValue} index={2}>
              <Box textAlign="center" py={4}>
                <Typography variant="h6" color="text.secondary">
                  Раздел в разработке
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Здесь будут отображаться ваши достижения
                </Typography>
              </Box>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>

      {/* Диалог редактирования профиля */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Редактировать профиль</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Полное имя"
              value={editData.fullname}
              onChange={(e) => setEditData({ ...editData, fullname: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={editData.email}
              onChange={(e) => setEditData({ ...editData, email: e.target.value })}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            Отмена
          </Button>
          <Button onClick={handleSaveProfile} variant="contained">
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;