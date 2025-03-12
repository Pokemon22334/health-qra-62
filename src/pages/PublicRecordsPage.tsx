
import { useEffect, useState } from 'react';
import { HeartPulse, Shield, Loader2, AlertTriangle } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import PublicRecordsList from '@/components/PublicRecordsList';
import { getPublicQRCodeById } from '@/lib/utils/publicQrCode';

const PublicRecordsPage = () => {
  const { qrId } = useParams<{ qrId: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  
  useEffect(() => {
    const checkQRCodeValidity = async () => {
      try {
        if (qrId) {
          setIsLoading(true);
          
          // Use getPublicQRCodeById to check if the QR code exists and is valid
          const qrCodeData = await getPublicQRCodeById(qrId);
          
          console.log('QR code data:', qrCodeData);
          
          if (!qrCodeData) {
            console.error('QR code not found');
            setIsValid(false);
            return;
          }
          
          // Check if expired
          if (qrCodeData.expires_at) {
            const expiresAt = new Date(qrCodeData.expires_at);
            if (expiresAt < new Date()) {
              console.error('QR code has expired:', expiresAt.toISOString());
              setIsValid(false);
              return;
            }
          }
          
          // Check if the QR code is active
          if (!qrCodeData.is_active) {
            console.error('QR code is not active');
            setIsValid(false);
            return;
          }
          
          console.log('QR code is valid');
          setIsValid(true);
        } else {
          console.error('No QR ID provided');
          setIsValid(false);
        }
      } catch (error) {
        console.error('Error checking QR code validity:', error);
        setIsValid(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkQRCodeValidity();
  }, [qrId]);
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <HeartPulse className="h-8 w-8 text-medivault-600" />
            <span className="ml-2 text-xl font-semibold text-gray-800">MediVault</span>
          </Link>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="bg-white rounded-xl shadow-md p-8 mb-6 flex flex-col items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-medivault-600 mb-4" />
              <p className="text-gray-600">Checking record access...</p>
            </div>
          ) : isValid === false ? (
            <div className="bg-white rounded-xl shadow-md p-8 mb-6 flex flex-col items-center justify-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid or Expired QR Code</h2>
              <p className="text-gray-600 text-center max-w-md">
                This QR code is either invalid, has expired, or has been revoked by the owner.
                Please contact the person who shared this with you for an updated link.
              </p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Shared Medical Information
                </h1>
                <p className="text-gray-600 mb-4">
                  This medical information has been securely shared with you.
                </p>
                
                <PublicRecordsList />
              </div>
              
              <div className="bg-medivault-50 rounded-lg border border-medivault-100 p-4 text-sm text-medivault-700 flex items-start">
                <Shield className="h-5 w-5 text-medivault-600 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-medivault-800">Secure Sharing</p>
                  <p>
                    MediVault ensures all shared records are securely accessible.
                    No login is required to view these specific records. For more information,
                    visit <Link to="/" className="text-medivault-600 hover:underline">MediVault</Link>.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} MediVault. All rights reserved.</p>
            <p className="mt-1">Secure storage and sharing for your medical records.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicRecordsPage;
