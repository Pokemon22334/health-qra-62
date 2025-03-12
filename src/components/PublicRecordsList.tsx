import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, FileText, Download, Calendar, AlertTriangle, HeartPulse, Phone } from 'lucide-react';
import { getPublicRecordsByQRId, getPublicQRCodeById } from '@/lib/utils/publicQrCode';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

const PublicRecordsList = () => {
  const { qrId } = useParams<{ qrId: string }>();
  const [records, setRecords] = useState<any[]>([]);
  const [emergencyProfile, setEmergencyProfile] = useState<any>(null);
  const [qrCode, setQrCode] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingFiles, setLoadingFiles] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!qrId) {
          setError('Invalid QR code');
          return;
        }
        
        console.log('Fetching records for QR ID:', qrId);
        
        const qrCodeData = await getPublicQRCodeById(qrId);
        setQrCode(qrCodeData);
        
        if (!qrCodeData) {
          setError('QR code not found or inactive');
          toast({
            title: 'QR Code Error',
            description: 'This QR code could not be found or has been deactivated',
            variant: 'destructive',
          });
          return;
        }
        
        if (qrCodeData.expires_at) {
          const expiresAt = new Date(qrCodeData.expires_at);
          if (expiresAt < new Date()) {
            setError('This QR code has expired');
            toast({
              title: 'QR Code Expired',
              description: 'This QR code has expired and is no longer valid',
              variant: 'destructive',
            });
            return;
          }
        }
        
        if (!qrCodeData.is_active) {
          setError('This QR code has been deactivated');
          toast({
            title: 'QR Code Inactive',
            description: 'This QR code has been deactivated by the owner',
            variant: 'destructive',
          });
          return;
        }
        
        const data = await getPublicRecordsByQRId(qrId);
        
        if (data.records) {
          console.log('Retrieved records:', data.records.length);
          setRecords(data.records);
        }
        
        if (data.emergencyProfile) {
          console.log('Retrieved emergency profile');
          setEmergencyProfile(data.emergencyProfile);
        }
        
        if (data.records.length === 0 && !data.emergencyProfile) {
          toast({
            title: 'No Data',
            description: 'No medical records or emergency profile are associated with this QR code',
          });
        }
      } catch (error: any) {
        console.error('Error fetching public records:', error);
        setError(error.message || 'Failed to load records');
        toast({
          title: 'Error Loading Records',
          description: error.message || 'Failed to load records',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecords();
  }, [qrId, toast]);

  const getFileUrl = async (fileUrl: string, recordId: string) => {
    try {
      setLoadingFiles(prev => ({ ...prev, [recordId]: true }));
      
      let filePath;
      if (fileUrl.includes('storage/v1/object/public/medical_records/')) {
        const parts = fileUrl.split('medical_records/');
        if (parts.length !== 2) {
          throw new Error('Invalid file URL format');
        }
        filePath = parts[1];
      } else if (fileUrl.includes('storage/v1/object/sign/medical_records/')) {
        const signedUrlMatch = fileUrl.match(/\/storage\/v1\/object\/sign\/medical_records\/([^?]+)/);
        if (!signedUrlMatch || !signedUrlMatch[1]) {
          throw new Error('Invalid signed URL format');
        }
        filePath = signedUrlMatch[1];
      } else {
        const parts = fileUrl.split('medical_records/');
        if (parts.length !== 2) {
          throw new Error('Could not parse file path from URL: ' + fileUrl);
        }
        filePath = parts[1];
      }
      
      console.log('Attempting to get file with path:', filePath);

      const { data, error } = await supabase.storage
        .from('medical_records')
        .createSignedUrl(filePath, 60);

      if (error) {
        console.error('Error getting signed URL:', error);
        throw error;
      }

      if (!data?.signedUrl) {
        throw new Error('No signed URL generated');
      }

      console.log('Successfully generated signed URL');
      return data.signedUrl;
    } catch (error: any) {
      console.error('Error in getFileUrl:', error);
      throw new Error(`File access error: ${error.message || 'Could not access file'}`);
    } finally {
      setLoadingFiles(prev => ({ ...prev, [recordId]: false }));
    }
  };

  const handleFileView = async (fileUrl: string, recordId: string) => {
    try {
      if (!fileUrl) {
        toast({
          title: 'File Error',
          description: 'The file URL is invalid or unavailable',
          variant: 'destructive',
        });
        return;
      }
      
      console.log('Attempting to view file with URL:', fileUrl);
      
      const signedUrl = await getFileUrl(fileUrl, recordId);
      window.open(signedUrl, '_blank');
    } catch (err: any) {
      console.error('Error opening file:', err);
      toast({
        title: 'File Access Error',
        description: err.message || 'Unable to access the file. It may have been moved or deleted.',
        variant: 'destructive',
      });
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    if (!category) return "bg-gray-100 text-gray-800";
    
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
        <Button asChild variant="outline">
          <Link to="/">Return to Home</Link>
        </Button>
      </div>
    );
  }

  if (records.length === 0 && !emergencyProfile) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No records available</h3>
        <p className="text-gray-600">
          There are no medical records associated with this QR code.
        </p>
        <Button asChild className="mt-4" variant="outline">
          <Link to="/">Return to Home</Link>
        </Button>
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
      
      {emergencyProfile && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-red-800 flex items-center">
              <HeartPulse className="h-5 w-5 mr-2 text-red-600" />
              Emergency Medical Profile
            </h2>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700"
              onClick={() => window.open(`/emergency-access/${qrCode.user_id}`, '_blank')}
            >
              View Full Profile
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-md p-3 shadow-sm">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Critical Information</h3>
              {emergencyProfile.blood_type && (
                <div className="mb-2">
                  <span className="text-xs text-gray-500">Blood Type:</span>
                  <p className="font-medium">{emergencyProfile.blood_type}</p>
                </div>
              )}
              {emergencyProfile.allergies && (
                <div className="mb-2">
                  <span className="text-xs text-gray-500">Allergies:</span>
                  <p className="text-sm">{emergencyProfile.allergies}</p>
                </div>
              )}
              {emergencyProfile.conditions && (
                <div>
                  <span className="text-xs text-gray-500">Medical Conditions:</span>
                  <p className="text-sm">{emergencyProfile.conditions}</p>
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-md p-3 shadow-sm">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Emergency Contacts</h3>
              {emergencyProfile.emergency_contact_1_name ? (
                <div className="mb-2">
                  <p className="font-medium">{emergencyProfile.emergency_contact_1_name}</p>
                  <p className="text-xs text-gray-500">{emergencyProfile.emergency_contact_1_relationship}</p>
                  <p className="text-sm flex items-center">
                    <Phone className="h-3 w-3 mr-1 text-gray-400" />
                    {emergencyProfile.emergency_contact_1_phone}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No emergency contacts provided</p>
              )}
              
              {emergencyProfile.emergency_contact_2_name && (
                <div>
                  <p className="font-medium">{emergencyProfile.emergency_contact_2_name}</p>
                  <p className="text-xs text-gray-500">{emergencyProfile.emergency_contact_2_relationship}</p>
                  <p className="text-sm flex items-center">
                    <Phone className="h-3 w-3 mr-1 text-gray-400" />
                    {emergencyProfile.emergency_contact_2_phone}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {records.length > 0 && (
        <>
          <h3 className="text-lg font-medium text-gray-800 mb-3">Shared Medical Records</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {records.map((record) => (
              <Card key={record.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900 mr-2">{record.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getCategoryBadgeClass(record.category)}`}>
                        {record.category?.replace('_', ' ') || 'Unknown'}
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
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleFileView(record.file_url, record.id)}
                      disabled={!record.file_url || loadingFiles[record.id]}
                    >
                      {loadingFiles[record.id] ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          View
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PublicRecordsList;
