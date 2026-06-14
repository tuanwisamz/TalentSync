import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (requiredRole && role !== requiredRole) {
    if (role === 'employer') return <Navigate to="/employer/dashboard" replace />;
    if (role === 'talent') return <Navigate to="/talent/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
}
