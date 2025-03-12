
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Pages
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import NotFound from '@/pages/NotFound';
import About from '@/pages/About';
import Features from '@/pages/Features';
import GetStarted from '@/pages/GetStarted';
import SettingsPage from '@/pages/SettingsPage';
import AuthCallback from '@/pages/AuthCallback';
import ManageQR from '@/pages/ManageQR';
import SharedRecord from '@/pages/SharedRecord';
import ScanQR from '@/pages/ScanQR';
import PublicRecordsPage from '@/pages/PublicRecordsPage';
import EmergencyProfile from '@/pages/EmergencyProfile';
import EmergencyAccess from '@/pages/EmergencyAccess';
import MedicationsPage from '@/pages/MedicationsPage';

// Components
import { Toaster } from '@/components/ui/toaster';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/about" element={<About />} />
            <Route path="/features" element={<Features />} />
            <Route path="/get-started" element={<GetStarted />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/manage-qr" element={<ManageQR />} />
            <Route path="/shared-record/:id" element={<SharedRecord />} />
            <Route path="/scan-qr" element={<ScanQR />} />
            <Route path="/public-records/:qrId" element={<PublicRecordsPage />} />
            <Route path="/emergency-profile" element={<EmergencyProfile />} />
            <Route path="/emergency-access/:profileId" element={<EmergencyAccess />} />
            <Route path="/medications" element={<MedicationsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
