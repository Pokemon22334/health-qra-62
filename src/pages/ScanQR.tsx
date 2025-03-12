
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import QRCodeScanner from '@/components/QRCodeScanner';

const ScanQR = () => {
  const { isAuthenticated, isLoading, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to access this page.",
        variant: "destructive",
      });
      navigate('/login');
    }
    
    // Check if user is a doctor
    if (!isLoading && isAuthenticated && profile && profile.role !== 'doctor') {
      toast({
        title: "Access restricted",
        description: "This feature is only available to doctors.",
        variant: "destructive",
      });
      navigate('/dashboard');
    }
  }, [isLoading, isAuthenticated, navigate, toast, profile]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <NavBar />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 border-4 border-t-medivault-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Scan QR Code
          </h1>
          <p className="text-gray-600 mt-1">
            Scan a patient's QR code to access their shared medical record.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <QRCodeScanner />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ScanQR;
