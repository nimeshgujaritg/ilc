import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { ProtectedRoute, PublicRoute, RoleRoute } from './guards/RouteGuard';

import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import PendingApproval from './pages/PendingApproval';
import DashboardLayout from './components/DashboardLayout';
import CeoDashboard from './pages/CeoDashboard';
import AdminDashboard from './pages/AdminDashboard';
import EventsPage from './pages/EventsPage';
import MembersPage from './pages/MembersPage';

function App() {
  const { user } = useAuthStore();

  // Determine where to send user after login
  const getDefaultRoute = () => {
    if (!user) return '/';
    if (user.isFirstLogin) return '/reset-password';
    if (user.profileStatus !== 'APPROVED') return '/pending';
    return user.role === 'ADMIN' ? '/admin-dashboard' : '/dashboard';
  };

  return (
    <BrowserRouter>
      <Routes>

        {/* Public — login page */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Force password reset */}
        <Route
          path="/reset-password"
          element={
            <ProtectedRoute>
              <ResetPassword />
            </ProtectedRoute>
          }
        />

        {/* Pending approval */}
        <Route
          path="/pending"
          element={
            <ProtectedRoute>
              <PendingApproval />
            </ProtectedRoute>
          }
        />

        {/* Protected dashboard routes */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={
            <RoleRoute allowedRoles={['CEO']}>
              <CeoDashboard />
            </RoleRoute>
          } />
          <Route path="/admin-dashboard" element={
            <RoleRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </RoleRoute>
          } />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/resources" element={
            <div className="p-10 font-serif text-3xl text-[#2a0b38]">
              Resources — Coming Soon
            </div>
          } />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;