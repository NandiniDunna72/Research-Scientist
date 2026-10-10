import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles } from 'lucide-react';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-200">
        <div className="relative flex items-center justify-center mb-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center animate-pulse">
            <Sparkles className="w-6 h-6 text-indigo-400" />
          </div>
          <div className="absolute inset-0 rounded-2xl border-2 border-indigo-500/60 border-t-transparent animate-spin" />
        </div>
        <p className="text-xs font-mono uppercase tracking-widest text-slate-400">
          Loading Academic Session...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
