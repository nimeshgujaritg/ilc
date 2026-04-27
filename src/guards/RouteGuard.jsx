import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    const intendedPath = location.pathname + location.search;
    if (intendedPath !== '/') {
      localStorage.setItem('ilc_redirect', intendedPath);
    }
    return <Navigate to="/" replace />;
  }

  if (user?.isFirstLogin && location.pathname !== '/reset-password') {
    return <Navigate to="/reset-password" replace />;
  }

  const protectedDashboardRoutes = [
    '/dashboard', '/admin-dashboard', '/events', '/members',
    '/resources', '/glimpses', '/calendar', '/profile',
    '/admin/events', '/admin/members', '/admin/add-member',
    '/admin/bulk-upload', '/admin/spocs', '/admin/audit-logs',
    '/admin/resources'
  ];

  const isProtectedRoute = protectedDashboardRoutes.some(
    route => location.pathname.startsWith(route)
  );

  if (isProtectedRoute && user?.profileStatus !== 'APPROVED') {
    return <Navigate to="/pending" replace />;
  }

  return children;
};

export const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return children;
  const savedRedirect = localStorage.getItem('ilc_redirect');
  if (savedRedirect) {
    localStorage.removeItem('ilc_redirect');
    return <Navigate to={savedRedirect} replace />;
  }
  return (
    <Navigate
      to={user?.role === 'ADMIN' ? '/admin-dashboard' : '/dashboard'}
      replace
    />
  );
};

export const RoleRoute = ({ children, allowedRoles }) => {
  const { user } = useAuthStore();
  if (!allowedRoles.includes(user?.role)) {
    return (
      <Navigate
        to={user?.role === 'ADMIN' ? '/admin-dashboard' : '/dashboard'}
        replace
      />
    );
  }
  return children;
};