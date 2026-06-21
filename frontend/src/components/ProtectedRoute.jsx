import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, isLoading } = useAuthStore();

    if (isLoading) {
        return <div style={{ textAlign: 'center', marginTop: '100px' }}>Loading...</div>;
    }

    // 1. If they aren't logged in at all, kick them to the login page
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // 2. If the route requires specific roles (like admin or seller) and they don't have it, kick them to the homepage
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    // 3. If they pass the checks, render the requested page
    return children;
};

export default ProtectedRoute;