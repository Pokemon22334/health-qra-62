
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, FileText, Download, Calendar, AlertTriangle } from 'lucide-react';
import { getPublicRecordsByQRId, getPublicQRCodeById } from '@/lib/utils/publicQrCode';

const PublicRecordsList = () => {
  const { qrId } = useParams<{ qrId: string }>();
  const [records, setRecords] = useState<any[]>([]);
  const [qrCode, setQrCode] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!qrId) {
          setError('Invalid QR code');
          return;
        }
        
        // Get QR code details
        const qrCodeData = await getPublicQRCodeById(qrId);
        setQrCode(qrCodeData);
        
        // Get associated records
        const recordsData = await getPublicRecordsByQRId(qrId);
        setRecords(recordsData);
      } catch (error: any) {
        console.error('Error fetching public records:', error);
        setError(error.message || 'Failed to load records');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecords();
  }, [qrId]);

  const handleDownload = (fileUrl: string) => {
    window.open(fileUrl, '_blank');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-medivault-600 mr-2" />
        <span>Loading medical records...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-800 mb-2">Access Error</h3>
        <p className="text-red-600 mb-4">{error}</p>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No records available</h3>
        <p className="text-gray-600">
          There are no medical records associated with this QR code.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {qrCode && qrCode.label && (
        <div className="bg-medivault-50 border border-medivault-100 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-medium text-medivault-900">{qrCode.label}</h2>
          {qrCode.expires_at && (
            <p className="text-sm text-medivault-700 mt-1">
              <Calendar className="inline-block h-4 w-4 mr-1" />
              Expires: {new Date(qrCode.expires_at).toLocaleDateString()}
            </p>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {records.map((record) => (
          <Card key={record.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900 mr-2">{record.title}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${getCategoryBadgeClass(record.category)}`}>
                    {record.category.replace('_', ' ')}
                  </span>
                </div>
                
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                  {record.description || 'No description provided'}
                </p>
                
                <div className="flex items-center text-xs text-gray-500 mb-4">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>Added: {new Date(record.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="border-t border-gray-100 bg-gray-50 p-3 flex justify-end">
                <Button size="sm" variant="outline" onClick={() => handleDownload(record.file_url)}>
                  <Download className="h-4 w-4 mr-2" />
                  <span>Download</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PublicRecordsList;
