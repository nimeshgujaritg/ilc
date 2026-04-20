import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import DashboardLayout from './components/DashboardLayout';
import CeoDashboard from './pages/CeoDashboard';
import AdminDashboard from './pages/AdminDashboard';
import EventsPage from './pages/EventsPage';
import MembersPage from './pages/MembersPage';

// Wraps any route that requires login
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

// Redirect already-logged-in users away from login page
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return children;
  return <Navigate to={user?.role === 'SUPER_ADMIN' ? '/admin-dashboard' : '/dashboard'} replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public: only accessible when logged OUT */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Protected: only accessible when logged IN */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<CeoDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/calendar" element={<div className="p-10 font-serif text-3xl text-[#2a0b38]">Calendar View — Coming Soon</div>} />
          <Route path="/resources" element={<div className="p-10 font-serif text-3xl text-[#2a0b38]">Resources — Coming Soon</div>} />
        </Route>

        {/* Catch-all: redirect unknown paths to login */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;