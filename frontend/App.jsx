// frontend/src/App.jsx - PhotoHub Pro v2.0 Complete App with All 6 Features

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PhotographerProvider } from './context/PhotographerContext';

// Existing Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProjectDetail from './pages/ProjectDetail';
import ClientView from './pages/ClientView';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/AdminDashboard';
import Pricing from './pages/Pricing';

// NEW Feature Pages
import SlideshowPlayer from './pages/SlideshowPlayer';
import CreateSlideshow from './pages/CreateSlideshow';
import PhotoTimeline from './pages/PhotoTimeline';
import PeopleTagger from './pages/PeopleTagger';
import InstagramStoryGenerator from './pages/InstagramStoryGenerator';
import ClaimAnniversaryPhotoshoot from './pages/ClaimAnniversaryPhotoshoot';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  useEffect(() => {
    console.log('🎬 PhotoHub Pro v2.0 - All 6 Features Loaded');
    console.log('✅ Features:');
    console.log('  1. Slideshow with Music');
    console.log('  2. Photo Timeline');
    console.log('  3. People Tagging');
    console.log('  4. Instagram Story Generator');
    console.log('  5. Anniversary Reminders');
    console.log('  6. Free Anniversary Photoshoots');
  }, []);

  return (
    <Router>
      <PhotographerProvider>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/login" element={<Login />} />
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

          {/* DEFAULT ROUTE */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </PhotographerProvider>
    </Router>
  );
}

export default App;
