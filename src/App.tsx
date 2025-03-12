
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from '@/components/ui/toaster';

import Index from './pages/Index';
import Features from './pages/Features';
import About from './pages/About';
import GetStarted from './pages/GetStarted';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ScanQR from './pages/ScanQR';
import SharedRecord from './pages/SharedRecord';
import SettingsPage from './pages/SettingsPage';
import NotFound from './pages/NotFound';
import PublicRecordsPage from './pages/PublicRecordsPage';
import ManageQR from './pages/ManageQR';
import EmergencyProfile from './pages/EmergencyProfile';
import EmergencyAccess from './pages/EmergencyAccess';
import AuthCallback from './pages/AuthCallback';

import './App.css';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/features" element={<Features />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/get-started" element={<GetStarted />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/emergency-profile" element={<EmergencyProfile />} />
          <Route path="/emergency-access/:userId" element={<EmergencyAccess />} />
          <Route path="/scan-qr" element={<ScanQR />} />
          <Route path="/manage-qr" element={<ManageQR />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          {/* Route for individual health record QR codes */}
          <Route path="/shared-record/:id" element={<SharedRecord />} />
          {/* Route for public QR collections */}
          <Route path="/public-records/:qrId" element={<PublicRecordsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
};

export default App;
