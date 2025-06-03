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
  CardActions,
  CardMedia,
} from '@mui/material';
import { 
  Place,
  Group,
  Event,
  MusicNote,
  TrendingUp,
  EmojiEvents,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <Place sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Найти площадки',
      description: 'Исследуйте наш тщательно отобранный список премиальных музыкальных площадок, идеально подходящих для вашего следующего мероприятия.',
      action: () => navigate('/venues'),
      buttonText: 'Просмотреть площадки'
    },
    {
      icon: <Group sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Присоединиться к командам',
      description: 'Свяжитесь с другими любителями музыки и формируйте команды для совместных мероприятий и соревнований.',
      action: () => navigate('/teams'),
      buttonText: 'Найти команды'
    },
    {
      icon: <Event sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Забронировать мероприятия',
      description: 'Легко планируйте и управляйте вашими музыкальными мероприятиями всего в несколько кликов.',
      action: () => navigate('/events'),
      buttonText: 'Посмотреть мероприятия'
    }
  ];

  const stats = [
    { icon: <MusicNote />, label: 'Площадок', value: '50+' },
    { icon: <Group />, label: 'Активных команд', value: '200+' },
    { icon: <Event />, label: 'Мероприятий проведено', value: '1000+' },
    { icon: <EmojiEvents />, label: 'Призеров', value: '500+' },
  ];

  return (
    <Container maxWidth="lg">
      {/* Главный заголовок */}
      <Box sx={{ mt: 4, mb: 6, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
          Добро пожаловать в 
          <Box component="span" sx={{ color: 'primary.main', ml: 1 }}>
            Sound Party
          </Box>
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Откройте и забронируйте лучшие музыкальные площадки для ваших мероприятий
        </Typography>
        
        {!isAuthenticated && (
          <Box sx={{ mt: 3 }}>
            <Button 
              variant="contained" 
              size="large" 
              onClick={() => navigate('/register')}
              sx={{ mr: 2 }}
            >
              Присоединиться
            </Button>
            <Button 
              variant="outlined" 
              size="large" 
              onClick={() => navigate('/events')}
            >
              Посмотреть мероприятия
            </Button>
          </Box>
        )}
      </Box>

      {/* Статистика */}
      <Box sx={{ mb: 6 }}>
        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                <Box sx={{ color: 'primary.main', mb: 1 }}>
                  {stat.icon}
                </Box>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Основные функции */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom textAlign="center" fontWeight="bold">
          Что мы предлагаем
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3,
                }
              }}>
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 3 }}>
                  <Box sx={{ mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" component="h3" gutterBottom fontWeight="bold">
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                  <Button 
                    variant="contained" 
                    onClick={feature.action}
                    fullWidth
                    sx={{ mx: 2 }}
                  >
                    {feature.buttonText}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Призыв к действию */}
      <Paper sx={{ 
        p: 4, 
        textAlign: 'center', 
        background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
        color: 'white',
        mb: 4
      }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Готовы начать?
        </Typography>
        <Typography variant="h6" paragraph>
          Присоединяйтесь к нашему сообществу и откройте мир музыкальных возможностей
        </Typography>
        <Box sx={{ mt: 3 }}>
          {isAuthenticated ? (
            <Button 
              variant="contained" 
              size="large" 
              color="secondary"
              onClick={() => navigate('/events')}
              sx={{ 
                bgcolor: 'white', 
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'grey.100'
                }
              }}
            >
              Перейти к мероприятиям
            </Button>
          ) : (
            <>
              <Button 
                variant="contained" 
                size="large" 
                onClick={() => navigate('/register')}
                sx={{ 
                  mr: 2,
                  bgcolor: 'white', 
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'grey.100'
                  }
                }}
              >
                Зарегистрироваться
              </Button>
              <Button 
                variant="outlined" 
                size="large" 
                onClick={() => navigate('/login')}
                sx={{ 
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'grey.300',
                    bgcolor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                Войти
              </Button>
            </>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default Home;