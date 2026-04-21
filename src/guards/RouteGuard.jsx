import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// Blocks logged-out users
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return children;
};

// Blocks logged-in users from seeing login page
export const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return children;
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