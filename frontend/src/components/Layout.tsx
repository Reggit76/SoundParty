import React from 'react';
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
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const drawerWidth = 240;

// Роли: 1 - админ, 2 - организатор, 3 - пользователь
const getMenuItems = (userRole?: number) => {
  const baseItems = [
    { text: 'Главная', icon: <Home />, path: '/', roles: [1, 2, 3] },
    { text: 'Мероприятия', icon: <Event />, path: '/events', roles: [1, 2, 3] },
    { text: 'Команды', icon: <Group />, path: '/teams', roles: [1, 2, 3] },
    { text: 'Мои бронирования', icon: <BookOnline />, path: '/bookings', roles: [1, 2, 3] },
    { text: 'Профиль', icon: <Person />, path: '/profile', roles: [1, 2, 3] },
  ];

  const organizerItems = [
    { text: 'Площадки', icon: <Place />, path: '/venues', roles: [1, 2] },
    { text: 'Платежи', icon: <Payment />, path: '/payments', roles: [1, 2] },
    { text: 'Результаты', icon: <EmojiEvents />, path: '/event-results', roles: [1, 2] },
  ];

  const allItems = [...baseItems, ...organizerItems];
  
  if (!userRole) {
    return baseItems.filter(item => item.roles.includes(3));
  }

  return allItems.filter(item => item.roles.includes(userRole));
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const location = useLocation();
  const { isAuthenticated, logout, user } = useAuth();

  const menuItems = getMenuItems(user?.role_id);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <div>
      <Toolbar />
      <List>
        {menuItems.map((item) => (
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
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Sound Party
          </Typography>
          {isAuthenticated ? (
            <Button color="inherit" onClick={logout}>
              Выход
            </Button>
          ) : (
            <>
              <Button color="inherit" component={RouterLink} to="/login">
                Вход
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