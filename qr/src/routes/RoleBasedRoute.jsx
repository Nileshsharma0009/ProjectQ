import { Navigate, Outlet } from 'react-router-dom';

export default function RoleBasedRoute({ requiredRole }) {
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (requiredRole && user.role !== requiredRole) {
        // Simple unauthorized redirect, or could be a specific 403 page
        return <Navigate to="/" />;
    }

    return <Outlet />;
}
