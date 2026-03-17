import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute({ children }) {
    const { user, loading, connectionError } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-base-950">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-content-muted mx-auto mb-4"></div>
                    <p className="text-content-muted">Loading Application...</p>
                </div>
            </div>
        );
    }

    // Show connection error if there's one
    if (connectionError) {
        return (
            <div className="flex h-screen items-center justify-center bg-base-950">
                <div className="text-center max-w-md mx-auto p-6">
                    <div className="text-error-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-xl font-semibold text-content-primary mb-2">Connection Issue</h2>
                    <p className="text-content-secondary mb-4">{connectionError}</p>
                    <div className="space-y-2">
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-content-primary text-base-950 px-4 py-2 rounded-sm hover:bg-content-primary transition-colors"
                        >
                            Refresh Page
                        </button>
                        <p className="text-sm text-content-muted">
                            If the problem persists, check your internet connection and try again.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}
