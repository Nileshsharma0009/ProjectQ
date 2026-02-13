import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, allowedRoles }) {
    // TODO: Check authentication and role
    const isAuthenticated = true; // Placeholder
    const userRole = 'student'; // Placeholder

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        return <Navigate to="/unauthorized" />;
    }

    return children;
}
