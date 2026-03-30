// frontend/src/App.jsx - FIXED VERSION WITH ERROR BOUNDARY

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PhotographerProvider } from './context/PhotographerContext';
import ErrorBoundary from './components/ErrorBoundary';
import NotFound from './pages/NotFound';
import { tokenStorage, authAPI } from './utils/apiService';

// ==================== LAZY LOAD COMPONENTS ====================
// This prevents loading all components at once
const Login = React.lazy(() => import('./pages/Login'));
const Signup = React.lazy(() => import('./pages/Signup'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const ProjectDetail = React.lazy(() => import('./pages/ProjectDetail'));
const ClientView = React.lazy(() => import('./pages/ClientView'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const Pricing = React.lazy(() => import('./pages/Pricing'));
const CreateSlideshow = React.lazy(() => import('./pages/CreateSlideshow'));
const SlideshowPlayer = React.lazy(() => import('./pages/SlideshowPlayer'));
const PhotoTimeline = React.lazy(() => import('./pages/PhotoTimeline'));
const PeopleTagger = React.lazy(() => import('./pages/PeopleTagger'));
const InstagramStoryGenerator = React.lazy(() => import('./pages/InstagramStoryGenerator'));
const ClaimAnniversaryPhotoshoot = React.lazy(() => import('./pages/ClaimAnniversaryPhotoshoot'));

// ==================== LOADING COMPONENT ====================

const Loading = () => (
  <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
      <p className="text-gray-400">Loading...</p>
    </div>
  </div>
);

// ==================== PROTECTED ROUTE COMPONENT ====================

const ProtectedRoute = ({ children }) => {
  const token = tokenStorage.get();
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// ==================== TOKEN VALIDATION HOOK ====================

const useTokenValidation = () => {
  useEffect(() => {
    const validateToken = async () => {
      const token = tokenStorage.get();
      if (token) {
        try {
          // Verify token is still valid
          await authAPI.getProfile(token);
          console.log('✅ Token validated');
        } catch (error) {
          console.error('❌ Token invalid or expired');
          tokenStorage.remove();
          window.location.href = '/login';
        }
      }
    };

    validateToken();
  }, []);
};

// ==================== MAIN APP COMPONENT ====================

function AppContent() {
  useTokenValidation();

  return (
    <React.Suspense fallback={<Loading />}>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/client/:shareToken" element={<ClientView />} />
        <Route path="/claim-photoshoot/:projectId" element={<ClaimAnniversaryPhotoshoot />} />

        {/* PROTECTED ROUTES */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/project/:projectId"
          element={
            <ProtectedRoute>
              <ProjectDetail />
            </ProtectedRoute>
          }
        />

        {/* FEATURE #1: SLIDESHOW ROUTES */}
        <Route
          path="/project/:projectId/slideshow/create"
          element={
            <ProtectedRoute>
              <CreateSlideshow />
            </ProtectedRoute>
          }
        />

        <Route
          path="/slideshow/:slideshowId"
          element={
            <ProtectedRoute>
              <SlideshowPlayer />
            </ProtectedRoute>
          }
        />

        {/* FEATURE #2: TIMELINE ROUTE */}
        <Route
          path="/project/:projectId/timeline"
          element={
            <ProtectedRoute>
              <PhotoTimeline />
            </ProtectedRoute>
          }
        />

        {/* FEATURE #3: PEOPLE TAGGING ROUTE */}
        <Route
          path="/project/:projectId/people"
          element={
            <ProtectedRoute>
              <PeopleTagger />
            </ProtectedRoute>
          }
        />

        {/* FEATURE #4: INSTAGRAM STORY GENERATOR ROUTE */}
        <Route
          path="/project/:projectId/stories"
          element={
            <ProtectedRoute>
              <InstagramStoryGenerator />
            </ProtectedRoute>
          }
        />

        {/* ADMIN ROUTE */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* 404 ROUTE */}
        <Route path="*" element={<NotFound />} />

        {/* DEFAULT ROUTE */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </React.Suspense>
  );
}

// ==================== MAIN APP EXPORT ====================

function App() {
  return (
    <ErrorBoundary>
      <PhotographerProvider>
        <Router>
          <AppContent />
        </Router>
      </PhotographerProvider>
    </ErrorBoundary>
  );
}

export default App;
