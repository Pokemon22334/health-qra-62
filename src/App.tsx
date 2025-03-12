
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

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/features" element={<Features />} />
          <Route path="/about" element={<About />} />
          <Route path="/get-started" element={<GetStarted />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/scan-qr" element={<ScanQR />} />
          <Route path="/shared-record/:id" element={<SharedRecord />} />
          <Route path="/public-records/:qrId" element={<PublicRecordsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/manage-qr" element={<ManageQR />} />
          <Route path="/emergency-profile" element={<EmergencyProfile />} />
          <Route path="/emergency-access/:userId" element={<EmergencyAccess />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;
