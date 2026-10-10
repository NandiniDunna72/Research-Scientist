import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ResearchProvider } from './context/ResearchContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';

// Existing Pages (100% Preserved)
import { Dashboard } from './pages/Dashboard';
import { NewResearch } from './pages/NewResearch';
import { MyResearch } from './pages/MyResearch';
import { PaperCollection } from './pages/PaperCollection';
import { PaperAnalysis } from './pages/PaperAnalysis';
import { ResearchGaps } from './pages/ResearchGaps';
import { LiteratureReview } from './pages/LiteratureReview';
import { MethodologyPage } from './pages/MethodologyPage';
import { ComparisonPage } from './pages/ComparisonPage';
import { ArchitecturePage } from './pages/ArchitecturePage';
import { DocumentationPage } from './pages/DocumentationPage';
import { PresentationPage } from './pages/PresentationPage';
import { SettingsPage } from './pages/SettingsPage';
import { EmptyState } from './components/ui/EmptyState';
import { AlertCircle, Sparkles } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

// Root Route handler: Show Landing Page if unauthenticated, or redirect to Dashboard if authenticated
const RootRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

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
          Initializing Academic Workspace...
        </p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <LandingPage />;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ResearchProvider>
          <BrowserRouter>
            <Routes>
              {/* Root Entry: Landing Page (with Paper + Thread animation & Auth) */}
              <Route path="/" element={<RootRoute />} />

              {/* Protected Existing Application Routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                {/* Existing Dashboard */}
                <Route path="dashboard" element={<Dashboard />} />

                {/* Existing Research Projects */}
                <Route path="research" element={<MyResearch />} />
                <Route path="research/new" element={<NewResearch />} />

                {/* Existing Project Pipeline Routes */}
                <Route path="research/:id" element={<Navigate to="papers" replace />} />
                <Route path="research/:id/topic" element={<Navigate to="papers" replace />} />
                <Route path="research/:id/papers" element={<PaperCollection />} />
                <Route path="research/:id/analysis" element={<PaperAnalysis />} />
                <Route path="research/:id/gaps" element={<ResearchGaps />} />
                <Route path="research/:id/questions" element={<ResearchGaps defaultTab="questions" />} />
                <Route path="research/:id/literature" element={<LiteratureReview />} />

                <Route path="research/:id/methodology" element={<MethodologyPage />} />
                <Route path="research/:id/comparison" element={<ComparisonPage />} />
                <Route path="research/:id/architecture" element={<ArchitecturePage />} />
                <Route path="research/:id/documentation" element={<DocumentationPage />} />
                <Route path="research/:id/presentation" element={<PresentationPage />} />

                {/* Existing Settings */}
                <Route path="settings" element={<SettingsPage />} />

                {/* 404 Route */}
                <Route
                  path="*"
                  element={
                    <div className="py-16">
                      <EmptyState
                        icon={AlertCircle}
                        title="Page Not Found"
                        description="The research module or route you are looking for does not exist."
                        actionText="Return to Dashboard"
                        onAction={() => window.location.assign('/dashboard')}
                      />
                    </div>
                  }
                />
              </Route>

              {/* Catch-all redirect to root */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ResearchProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
