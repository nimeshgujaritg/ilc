import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { ProtectedRoute, PublicRoute, RoleRoute } from './guards/RouteGuard';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import PendingApproval from './pages/PendingApproval';
import DashboardLayout from './components/DashboardLayout';
import CeoDashboard from './pages/CeoDashboard';
import CeoProfile from './pages/CeoProfile';
import EventsPage from './pages/EventsPage';
import ResourcesPage from './pages/ResourcesPage';
import EventDetailPage from './pages/EventDetailPage';
import MembersPage from './pages/MembersPage';
import AdminEventsPage from './pages/AdminEventsPage';
import CalendarPage from './pages/CalendarPage';
import AdminOverview from './pages/AdminOverview';
import AdminMembers from './pages/AdminMembers';
import AddMemberPage from './pages/AddMemberPage';
import BulkUploadPage from './pages/BulkUploadPage';
import AdminSpocs from './pages/AdminSpocs';
import AdminResourcesPage from './pages/AdminResourcesPage';
import AuditLogsPage from './pages/AuditLogsPage';

function App() {
  const { user } = useAuthStore();

  const getDefaultRoute = () => {
    if (!user) return '/';
    if (user.isFirstLogin) return '/reset-password';
    if (user.profileStatus !== 'APPROVED') return '/pending';
    return user.role === 'ADMIN' ? '/admin-dashboard' : '/dashboard';
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/reset-password" element={<ProtectedRoute><ResetPassword /></ProtectedRoute>} />
        <Route path="/pending" element={<ProtectedRoute><PendingApproval /></ProtectedRoute>} />
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/profile"           element={<CeoProfile />} />
          <Route path="/calendar"          element={<CalendarPage />} />
          <Route path="/dashboard"         element={<RoleRoute allowedRoles={['CEO']}><CeoDashboard /></RoleRoute>} />
          <Route path="/events"            element={<EventsPage />} />
          <Route path="/events/:id"        element={<EventDetailPage />} />
          <Route path="/members"           element={<MembersPage />} />
          <Route path="/glimpses"          element={<ResourcesPage />} />
          <Route path="/resources"         element={<ResourcesPage />} />
          <Route path="/admin-dashboard"   element={<RoleRoute allowedRoles={['ADMIN']}><AdminOverview /></RoleRoute>} />
          <Route path="/admin/events"      element={<RoleRoute allowedRoles={['ADMIN']}><AdminEventsPage /></RoleRoute>} />
          <Route path="/admin/members"     element={<RoleRoute allowedRoles={['ADMIN']}><AdminMembers /></RoleRoute>} />
          <Route path="/admin/add-member"  element={<RoleRoute allowedRoles={['ADMIN']}><AddMemberPage /></RoleRoute>} />
          <Route path="/admin/bulk-upload" element={<RoleRoute allowedRoles={['ADMIN']}><BulkUploadPage /></RoleRoute>} />
          <Route path="/admin/spocs"       element={<RoleRoute allowedRoles={['ADMIN']}><AdminSpocs /></RoleRoute>} />
          <Route path="/admin/audit-logs"  element={<RoleRoute allowedRoles={['ADMIN']}><AuditLogsPage /></RoleRoute>} />
          <Route path="/admin/resources"   element={<RoleRoute allowedRoles={['ADMIN']}><AdminResourcesPage /></RoleRoute>} />
        </Route>
        <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;