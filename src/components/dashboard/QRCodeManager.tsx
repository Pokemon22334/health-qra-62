
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  QrCode, 
  Download, 
  Copy, 
  Loader2, 
  Trash2, 
  Clock, 
  FileText,
  RefreshCw
} from 'lucide-react';
import { 
  getUserQRCodes, 
  deleteQRCode,
  generateShareableLink,
  formatExpirationTime
} from '@/lib/utils/qrCode';
import { 
  getUserPublicQRCodes, 
  deletePublicQRCode, 
  generatePublicShareableLink 
} from '@/lib/utils/publicQrCode';

interface QRCodeManagerProps {
  refreshKey?: number;
  onRefresh?: () => void;
}

const QRCodeManager = ({ refreshKey = 0, onRefresh }: QRCodeManagerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [publicQRCodes, setPublicQRCodes] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    
    const loadQRCodes = async () => {
      try {
        setIsLoading(true);
        
        const publicCodes = await getUserPublicQRCodes(user.id);
        setPublicQRCodes(publicCodes);
        
      } catch (error: any) {
        console.error('Error loading QR codes:', error);
        toast({
          title: 'Failed to load QR codes',
          description: error.message || 'Could not retrieve your QR codes',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadQRCodes();
  }, [user, toast, refreshKey]);

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleDeletePublicQR = async (qrId: string) => {
    if (!user) return;
    
    try {
      await deletePublicQRCode(qrId, user.id);
      
      setPublicQRCodes(prev => prev.filter(qr => qr.id !== qrId));
      
      toast({
        title: 'Public QR code deleted',
        description: 'The public QR code has been successfully deleted.',
      });
      
      // Force refresh to ensure sync with server
      handleRefresh();
    } catch (error: any) {
      console.error('Error deleting public QR code:', error);
      toast({
        title: 'Failed to delete QR code',
        description: error.message || 'An error occurred while deleting the QR code.',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadQR = (qrImageUrl: string, label: string) => {
    const link = document.createElement('a');
    link.href = qrImageUrl;
    link.download = `${label.replace(/\s+/g, '-').toLowerCase()}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyLink = (shareableUrl: string) => {
    navigator.clipboard.writeText(shareableUrl);
    toast({
      title: 'Link copied',
      description: 'The shareable link has been copied to your clipboard.',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">QR Code Management</h2>
        <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-medivault-600 mr-2" />
          <span>Loading QR codes...</span>
        </div>
      ) : publicQRCodes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {publicQRCodes.map((qr) => (
            <Card key={qr.id} className={`overflow-hidden ${!qr.is_active || qr.isExpired ? 'opacity-60' : ''}`}>
              <CardContent className="p-0">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium text-gray-900">{qr.label || 'Medical Records'}</h3>
                    <div className="flex items-center">
                      {!qr.is_active && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full mr-2">
                          Inactive
                        </span>
                      )}
                      {qr.isExpired && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                          Expired
                        </span>
                      )}
                      {qr.is_active && !qr.isExpired && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-white p-2 rounded-lg border mr-4">
                      <img src={qr.qrImageUrl} alt="QR Code" className="w-24 h-24" />
                    </div>
                    
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-2">
                        Shares {qr.recordCount} medical records
                      </p>
                      
                      <div className="text-xs text-gray-500 mb-2 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>Created: {new Date(qr.created_at).toLocaleDateString()}</span>
                      </div>
                      
                      {qr.expires_at && (
                        <div className="text-xs text-gray-500 mb-2 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>Expires: {new Date(qr.expires_at).toLocaleDateString()}</span>
                        </div>
                      )}
                      
                      <div className="flex space-x-2 mt-3">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleCopyLink(qr.shareableUrl)}
                          className="text-medivault-600"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy Link
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDownloadQR(qr.qrImageUrl, qr.label || 'MediVault')}
                          className="text-blue-600"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeletePublicQR(qr.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No QR codes found</h3>
          <p className="text-gray-600 mb-4">
            You haven't created any public QR codes for your medical records yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default QRCodeManager;
