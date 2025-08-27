import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute({ children }) {
    const { user, loading, connectionError } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading Application...</p>
                </div>
            </div>
        );
    }

    // Show connection error if there's one
    if (connectionError) {
        return (
            <div className="flex h-screen items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
                <div className="text-center max-w-md mx-auto p-6">
                    <div className="text-red-600 text-6xl mb-4">⚠️</div>
                    <h2 className="text-xl font-semibold text-slate-800 mb-2">Connection Issue</h2>
                    <p className="text-slate-600 mb-4">{connectionError}</p>
                    <div className="space-y-2">
                        <button 
                            onClick={() => window.location.reload()}
                            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Refresh Page
                        </button>
                        <p className="text-sm text-slate-500">
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
