import React from 'react';
import { Container, Typography, Paper, Box, Alert } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { SxProps } from '@mui/system';
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
          Welcome to Sound Party
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Discover and book the best music venues for your events
        </Typography>
        
        {isAuthenticated && user && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Добро пожаловать, {user.fullname}! 
            {isAdmin && ' У вас есть права администратора.'}
            {isOrganizer && !isAdmin && ' У вас есть права организатора.'}
            {!isAdmin && !isOrganizer && ' Вы участник системы.'}
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
              Find Venues
            </Typography>
            <Typography>
              Explore our curated list of premium music venues perfect for your next event.
              {(isAdmin || isOrganizer) && ' Вы можете создавать и редактировать площадки.'}
            </Typography>
          </Paper>
        </Box>

        <Box sx={{ flex: { xs: '0 0 100%', md: '0 0 calc(33.333% - 32px)' } }}>
          <Paper sx={paperStyle}>
            <Typography variant="h5" component="h2" gutterBottom>
              Join Teams
            </Typography>
            <Typography>
              Connect with other music enthusiasts and form teams for collaborative events.
              {isAuthenticated && ' Вы можете создавать команды.'}
            </Typography>
          </Paper>
        </Box>

        <Box sx={{ flex: { xs: '0 0 100%', md: '0 0 calc(33.333% - 32px)' } }}>
          <Paper sx={paperStyle}>
            <Typography variant="h5" component="h2" gutterBottom>
              Book Events
            </Typography>
            <Typography>
              Easily schedule and manage your music events in just a few clicks.
              {(isAdmin || isOrganizer) && ' Вы можете создавать и управлять мероприятиями.'}
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default Home;