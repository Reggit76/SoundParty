import React from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Button, 
  Grid,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import { 
  Event as EventIcon, 
  Group as GroupIcon, 
  BookOnline as BookIcon,
  EmojiEvents as TrophyIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const features = [
    {
      icon: <EventIcon sx={{ fontSize: 40 }} />,
      title: 'Мероприятия',
      description: 'Участвуйте в музыкальных мероприятиях и соревнованиях',
      action: () => navigate('/events'),
      available: true
    },
    {
      icon: <GroupIcon sx={{ fontSize: 40 }} />,
      title: 'Команды',
      description: 'Создавайте команды и приглашайте друзей',
      action: () => navigate('/teams'),
      available: isAuthenticated
    },
    {
      icon: <BookIcon sx={{ fontSize: 40 }} />,
      title: 'Бронирования',
      description: 'Управляйте своими заявками на участие',
      action: () => navigate('/bookings'),
      available: isAuthenticated
    },
    {
      icon: <TrophyIcon sx={{ fontSize: 40 }} />,
      title: 'Результаты',
      description: 'Просматривайте результаты соревнований',
      action: () => navigate('/event-results'),
      available: isAuthenticated && user && (user.role_id === 1 || user.role_id === 2)
    }
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 6, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Sound Party
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Платформа для организации музыкальных мероприятий и соревнований
        </Typography>
        {!isAuthenticated && (
          <Box sx={{ mt: 4 }}>
            <Button 
              variant="contained" 
              size="large" 
              onClick={() => navigate('/register')}
              sx={{ mr: 2 }}
            >
              Регистрация
            </Button>
            <Button 
              variant="outlined" 
              size="large" 
              onClick={() => navigate('/login')}
            >
              Войти
            </Button>
          </Box>
        )}
      </Box>

      <Grid container spacing={4}>
        {features.filter(feature => feature.available).map((feature, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease-in-out'
              }}
              onClick={feature.action}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Box sx={{ color: 'primary.main', mb: 2 }}>
                  {feature.icon}
                </Box>
                <Typography variant="h6" component="h2" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button size="small" color="primary">
                  Перейти
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {isAuthenticated && user && (
        <Paper sx={{ mt: 6, p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Добро пожаловать, {user.fullname}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {user.role_id === 1 && 'Вы вошли как администратор'}
            {user.role_id === 2 && 'Вы вошли как организатор'}
            {user.role_id === 3 && 'Вы вошли как участник'}
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default Home;