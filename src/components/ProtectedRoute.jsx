import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ requireAdmin = false }) => {
    const { currentUser, userRole } = useAuth();

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    if (requireAdmin && userRole !== 'admin') {
        // If Admin is required but user isn't admin, redirect to their dashboard
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
