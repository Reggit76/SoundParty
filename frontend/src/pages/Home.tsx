import React from 'react';
import { Container, Typography, Paper, Box, Alert, Button } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { SxProps } from '@mui/system';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const paperStyle: SxProps<Theme> = {
  p: 3,
  display: 'flex',
  flexDirection: 'column',
  height: 240,
};

const Home: React.FC = () => {
  const { isAuthenticated, user, isAdmin, isOrganizer } = useAuth();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Добро пожаловать в Sound Party
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Откройте для себя лучшие музыкальные площадки и организуйте незабываемые мероприятия
        </Typography>
        
        {isAuthenticated && user && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Добро пожаловать, {user.fullname}! 
            {isAdmin && ' У вас есть права администратора.'}
            {isOrganizer && !isAdmin && ' У вас есть права организатора.'}
            {!isAdmin && !isOrganizer && ' Вы участник системы.'}
          </Alert>
        )}

        {!isAuthenticated && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography>
                Чтобы получить доступ ко всем функциям системы, пожалуйста, войдите в систему или зарегистрируйтесь.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  variant="outlined" 
                  size="small" 
                  component={RouterLink} 
                  to="/login"
                >
                  Войти
                </Button>
                <Button 
                  variant="contained" 
                  size="small" 
                  component={RouterLink} 
                  to="/register"
                >
                  Регистрация
                </Button>
              </Box>
            </Box>
          </Alert>
        )}
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 4,
        }}
      >
        <Box sx={{ flex: { xs: '0 0 100%', md: '0 0 calc(33.333% - 32px)' } }}>
          <Paper sx={paperStyle}>
            <Typography variant="h5" component="h2" gutterBottom>
              Площадки
            </Typography>
            <Typography sx={{ flexGrow: 1 }}>
              Изучите наш каталог премиальных музыкальных площадок, идеально подходящих для ваших мероприятий.
              {(isAdmin || isOrganizer) && ' Вы можете создавать и редактировать площадки.'}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Button variant="outlined" component={RouterLink} to="/venues">
                Смотреть площадки
              </Button>
            </Box>
          </Paper>
        </Box>

        <Box sx={{ flex: { xs: '0 0 100%', md: '0 0 calc(33.333% - 32px)' } }}>
          <Paper sx={paperStyle}>
            <Typography variant="h5" component="h2" gutterBottom>
              Команды
            </Typography>
            <Typography sx={{ flexGrow: 1 }}>
              Присоединяйтесь к другим любителям музыки и создавайте команды для совместного участия в мероприятиях.
              {isAuthenticated && ' Вы можете создавать команды и приглашать участников.'}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Button variant="outlined" component={RouterLink} to="/teams">
                Смотреть команды
              </Button>
            </Box>
          </Paper>
        </Box>

        <Box sx={{ flex: { xs: '0 0 100%', md: '0 0 calc(33.333% - 32px)' } }}>
          <Paper sx={paperStyle}>
            <Typography variant="h5" component="h2" gutterBottom>
              Мероприятия
            </Typography>
            <Typography sx={{ flexGrow: 1 }}>
              Легко планируйте и управляйте своими музыкальными мероприятиями всего в несколько кликов.
              {(isAdmin || isOrganizer) && ' Вы можете создавать и управлять мероприятиями.'}
              {isAuthenticated && !isAdmin && !isOrganizer && ' Вы можете регистрироваться на мероприятия.'}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Button variant="outlined" component={RouterLink} to="/events">
                Смотреть мероприятия
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default Home;