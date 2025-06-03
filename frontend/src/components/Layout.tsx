import React, { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
  Divider,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home,
  Event,
  Place,
  Group,
  Person,
  BookOnline,
  Payment,
  EmojiEvents,
  AdminPanelSettings,
  ExitToApp,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const drawerWidth = 240;

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, logout, user, isAdmin, isOrganizer } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Основные пункты меню (доступны всем)
  const mainMenuItems = [
    { text: 'Главная', icon: <Home />, path: '/' },
    { text: 'Мероприятия', icon: <Event />, path: '/events' },
    { text: 'Площадки', icon: <Place />, path: '/venues' },
    { text: 'Команды', icon: <Group />, path: '/teams' },
  ];

  // Пункты меню для авторизованных пользователей
  const userMenuItems = [
    { text: 'Профиль', icon: <Person />, path: '/profile' },
    { text: 'Бронирования', icon: <BookOnline />, path: '/bookings' },
    { text: 'Платежи', icon: <Payment />, path: '/payments' },
    { text: 'Результаты', icon: <EmojiEvents />, path: '/event-results' },
  ];

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Sound Party
        </Typography>
      </Toolbar>
      <Divider />
      
      {/* Основные пункты меню */}
      <List>
        {mainMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={RouterLink}
              to={item.path}
              selected={location.pathname === item.path}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Пункты меню для авторизованных пользователей */}
      {isAuthenticated && (
        <>
          <Divider />
          <List>
            {userMenuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  component={RouterLink}
                  to={item.path}
                  selected={location.pathname === item.path}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </>
      )}

      {/* Информация о пользователе */}
      {isAuthenticated && user && (
        <>
          <Divider />
          <List>
            <ListItem>
              <ListItemText 
                primary={user.fullname}
                secondary={
                  isAdmin ? 'Администратор' : 
                  isOrganizer ? 'Организатор' : 
                  'Участник'
                }
                primaryTypographyProps={{ 
                  variant: 'body2',
                  fontWeight: 'bold'
                }}
                secondaryTypographyProps={{
                  color: isAdmin ? 'error.main' : isOrganizer ? 'warning.main' : 'primary.main'
                }}
              />
            </ListItem>
          </List>
        </>
      )}
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="открыть меню"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Sound Party
          </Typography>

          {/* Индикатор роли */}
          {isAuthenticated && isAdmin && (
            <Badge 
              badgeContent="ADMIN" 
              color="error" 
              sx={{ mr: 2 }}
            >
              <AdminPanelSettings />
            </Badge>
          )}

          {/* Кнопки авторизации */}
          {isAuthenticated ? (
            <Button 
              color="inherit" 
              onClick={logout}
              startIcon={<ExitToApp />}
            >
              Выйти
            </Button>
          ) : (
            <>
              <Button color="inherit" component={RouterLink} to="/login">
                Войти
              </Button>
              <Button color="inherit" component={RouterLink} to="/register">
                Регистрация
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* Мобильное меню */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>

        {/* Десктопное меню */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          marginLeft: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;