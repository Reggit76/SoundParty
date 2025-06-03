import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Events from './pages/Events';
import Venues from './pages/Venues';
import Teams from './pages/Teams';
import Profile from './pages/Profile';
import Bookings from './pages/Bookings';
import Payments from './pages/Payments';
import EventResults from './pages/EventResults';

// Admin Pages
import AdminUsers from './pages/admin/AdminUsers';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Публичные маршруты */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Защищенные маршруты (доступны всем авторизованным пользователям) */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teams"
        element={
          <ProtectedRoute>
            <Teams />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookings"
        element={
          <ProtectedRoute>
            <Bookings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events"
        element={
          <ProtectedRoute>
            <Events />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payments"
        element={
          <ProtectedRoute>
            <Payments />
          </ProtectedRoute>
        }
      />

      {/* Маршруты для организаторов и администраторов */}
      <Route
        path="/venues"
        element={
          <AdminRoute allowOrganizer>
            <Venues />
          </AdminRoute>
        }
      />
      <Route
        path="/event-results"
        element={
          <AdminRoute allowOrganizer>
            <EventResults />
          </AdminRoute>
        }
      />

      {/* Административные маршруты (только для админов) */}
      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <AdminUsers />
          </AdminRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;