import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// Teaching: ProtectedRoute now saves the intended URL before redirecting to login.
// After login, user is sent to where they originally wanted to go.
// We use localStorage to persist the redirect URL across the page reload.
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    // Save where user was trying to go
    const intendedPath = location.pathname + location.search;
    if (intendedPath !== '/') {
      localStorage.setItem('ilc_redirect', intendedPath);
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

// Blocks logged-in users from seeing login page
export const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return children;

  // Check for saved redirect URL
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

// Blocks access based on role
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