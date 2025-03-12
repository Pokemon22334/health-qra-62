
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import QRCodeManager from '@/components/dashboard/QRCodeManager';
import { Button } from '@/components/ui/button';
import { 
  QrCode, 
  ArrowLeft,
  Loader2, 
  AlertTriangle,
  RefreshCw,
  Download
} from 'lucide-react';

const ManageQR = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pageLoading, setPageLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const handleRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };
  
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        toast({
          title: "Authentication required",
          description: "Please log in to access QR code management.",
          variant: "destructive",
        });
        navigate('/login');
      } else {
        setPageLoading(false);
      }
    }
  }, [isLoading, isAuthenticated, navigate, toast]);

  // Always refresh when component mounts
  useEffect(() => {
    if (user) {
      handleRefresh();
    }
  }, [user]);

  if (isLoading || pageLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <NavBar />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin text-medivault-600 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Loading QR Management...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <NavBar />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center bg-red-50 p-6 rounded-lg border border-red-200 max-w-md">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-red-800 mb-2">Not Logged In</h3>
            <p className="text-sm text-red-700 mb-4">
              Please log in to access QR code management.
            </p>
            <div className="flex justify-center">
              <Button onClick={() => navigate('/login')} className="flex items-center">
                Go to Login
              </Button>
            </div>
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
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Button 
              variant="outline" 
              className="mr-4"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
          <div className="flex items-center">
            <QrCode className="h-6 w-6 text-medivault-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">QR Code Management</h1>
          </div>
          <div className="w-36">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              className="flex items-center justify-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <QRCodeManager refreshKey={refreshKey} onRefresh={handleRefresh} />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ManageQR;
