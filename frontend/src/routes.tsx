import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import OrganizerRoute from './components/OrganaizerRoute';

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

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes - доступны всем авторизованным */}
      <Route
        path="/events"
        element={
          <ProtectedRoute>
            <Events />
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
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
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

      {/* Organizer/Admin only routes */}
      <Route
        path="/venues"
        element={
          <OrganizerRoute>
            <Venues />
          </OrganizerRoute>
        }
      />
      <Route
        path="/payments"
        element={
          <OrganizerRoute>
            <Payments />
          </OrganizerRoute>
        }
      />
      <Route
        path="/event-results"
        element={
          <OrganizerRoute>
            <EventResults />
          </OrganizerRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;