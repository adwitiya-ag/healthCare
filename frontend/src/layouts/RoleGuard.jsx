import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RoleGuard({ allowedRole, children }) {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRole && role !== allowedRole) {
    return <Navigate to={role === 'MANAGER' ? '/manager' : '/mr'} replace />;
  }

  return children;
}
