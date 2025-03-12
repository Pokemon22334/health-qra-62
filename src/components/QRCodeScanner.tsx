
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { QrCode, Eye, AlertTriangle, Scan, FileText, Clock } from 'lucide-react';
import { isQRCodeValid, getRecordByQRCode } from '@/lib/utils/qrCode';

const QRCodeScanner = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [qrCodeId, setQrCodeId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [record, setRecord] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [accessTime, setAccessTime] = useState<string | null>(null);

  const handleQRCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!qrCodeId) {
      toast({
        title: "QR code required",
        description: "Please enter a QR code ID or URL.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      setRecord(null);
      
      // Extract QR code ID if it's a URL
      let id = qrCodeId;
      if (qrCodeId.includes('/shared-record/')) {
        id = qrCodeId.split('/shared-record/')[1];
      }
      
      console.log('Processing QR code:', id);
      
      // Validate QR code
      const isValid = await isQRCodeValid(id);
      if (!isValid) {
        setError('This QR code is invalid or has expired');
        toast({
          title: "Invalid QR code",
          description: "This QR code is either invalid, expired, or has been revoked.",
          variant: "destructive",
        });
        return;
      }
      
      // Get record
      const recordData = await getRecordByQRCode(id, user?.id);
      setRecord(recordData);
      setAccessTime(new Date().toLocaleString());
      
      toast({
        title: "Record accessed",
        description: "The medical record has been successfully accessed.",
      });
    } catch (error: any) {
      console.error('QR code error:', error);
      setError(error.message || 'Failed to access record');
      toast({
        title: "Failed to access record",
        description: error.message || 'An error occurred while accessing the record',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch(category) {
      case 'blood_test': 
        return "bg-red-100 text-red-800";
      case 'xray_mri': 
        return "bg-blue-100 text-blue-800";
      case 'prescription': 
        return "bg-green-100 text-green-800";
      case 'doctor_note': 
        return "bg-yellow-100 text-yellow-800";
      default: 
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center mb-6">
        <QrCode className="h-6 w-6 text-medivault-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-800">Access Shared Medical Record</h2>
      </div>
      
      <form onSubmit={handleQRCodeSubmit} className="mb-6">
        <div className="flex space-x-2">
          <div className="flex-1">
            <Input
              value={qrCodeId}
              onChange={(e) => setQrCodeId(e.target.value)}
              placeholder="Enter QR code ID or paste shared link"
              disabled={isLoading}
              className="flex-1"
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Loading..." : "Access Record"}
          </Button>
        </div>
        
        {error && (
          <div className="mt-2 p-2 bg-red-50 text-red-700 text-sm rounded flex items-start">
            <AlertTriangle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 mb-2">
            Scan a QR code or enter the code ID to access a shared medical record
          </p>
          <Button variant="outline" className="text-medivault-600" disabled>
            <Scan className="h-4 w-4 mr-2" />
            Scan QR Code
            <span className="text-xs ml-2 bg-yellow-100 text-yellow-800 px-1 rounded">Coming soon</span>
          </Button>
        </div>
      </form>
      
      {record && (
        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{record.title}</h3>
              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryBadgeClass(record.category)}`}>
                {record.category.replace('_', ' ')}
              </span>
            </div>
            
            {accessTime && (
              <div className="mb-4 text-xs flex items-center text-gray-500">
                <Clock className="h-3 w-3 mr-1" />
                <span>Accessed: {accessTime}</span>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Document Preview</h4>
                <div className="border rounded-md overflow-hidden h-64 bg-gray-100 flex items-center justify-center">
                  {record.file_url ? (
                    record.file_url.endsWith('.pdf') ? (
                      <div className="text-center p-4">
                        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">PDF Document</p>
                        <Button 
                          variant="link" 
                          onClick={() => window.open(record.file_url, '_blank')}
                          className="mt-2"
                        >
                          Open PDF
                        </Button>
                      </div>
                    ) : (
                      <img 
                        src={record.file_url} 
                        alt={record.title}
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />
                    )
                  ) : (
                    <FileText className="h-16 w-16 text-gray-400" />
                  )}
                </div>
                
                <div className="mt-2 flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => window.open(record.file_url, '_blank')}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Full Document
                  </Button>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Record Details</h4>
                <div className="bg-gray-50 rounded-md p-4 h-64 overflow-y-auto">
                  {record.description && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500">Description</p>
                      <p className="text-sm">{record.description}</p>
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <p className="text-xs text-gray-500">Date Added</p>
                    <p className="text-sm font-medium">
                      {new Date(record.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {record.extracted_text && (
                    <div>
                      <p className="text-xs text-gray-500">Extracted Content</p>
                      <pre className="text-xs mt-1 bg-white p-2 rounded border whitespace-pre-wrap">
                        {record.extracted_text}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-4 bg-medivault-50 p-3 rounded-md border border-medivault-100">
              <p className="text-sm text-medivault-700">
                <strong>Note:</strong> This record has been shared securely. The access will be logged for the patient to review.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QRCodeScanner;
