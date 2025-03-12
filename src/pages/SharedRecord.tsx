
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, FileText, Shield, AlertTriangle, Eye, Calendar, Clock } from 'lucide-react';
import { getRecordByQRCode, isQRCodeValid } from '@/lib/utils/qrCode';

const SharedRecord = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [record, setRecord] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [expiry, setExpiry] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecord = async () => {
      if (!id) {
        setError('Invalid QR code');
        setIsLoading(false);
        return;
      }
      
      try {
        // Validate QR code
        const isValid = await isQRCodeValid(id);
        if (!isValid) {
          setError('This QR code is invalid or has expired');
          setIsLoading(false);
          return;
        }
        
        // Get record
        const recordData = await getRecordByQRCode(id, user?.id);
        setRecord(recordData);
        
        // Get expiry time
        const { data: qrCode } = await supabase
          .from('qr_codes')
          .select('expires_at')
          .eq('id', id)
          .single();
        
        if (qrCode) {
          setExpiry(qrCode.expires_at);
        }
        
        toast({
          title: "Record accessed",
          description: "The medical record has been successfully accessed.",
        });
      } catch (error: any) {
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
    
    fetchRecord();
  }, [id, user]);

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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Shared Medical Record
            </h1>
            <p className="text-gray-600 mt-1">
              This medical record has been securely shared with you.
            </p>
          </div>
          
          {isLoading ? (
            <div className="bg-white rounded-xl shadow-md p-12 flex flex-col items-center">
              <Loader2 className="h-12 w-12 animate-spin text-medivault-600 mb-4" />
              <p className="text-gray-600">Loading medical record...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-xl shadow-md p-12">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                </div>
                
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  Unable to Access Record
                </h2>
                
                <p className="text-gray-600 mb-6">
                  {error}
                </p>
                
                <div className="flex justify-center flex-wrap gap-3">
                  <Button asChild>
                    <Link to="/">Go to Homepage</Link>
                  </Button>
                  
                  {!isAuthenticated && (
                    <Button variant="outline" asChild>
                      <Link to="/login">Log In</Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : record ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-semibold">{record.title}</h2>
                    <span className={`mt-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryBadgeClass(record.category)}`}>
                      {record.category.replace('_', ' ')}
                    </span>
                  </div>
                  
                  {expiry && (
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center text-amber-700 bg-amber-50 px-3 py-1 rounded-full text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        Expires: {new Date(expiry).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Document Preview</h3>
                    <div className="border rounded-md overflow-hidden h-80 bg-gray-100 flex items-center justify-center">
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
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                        )
                      ) : (
                        <FileText className="h-16 w-16 text-gray-400" />
                      )}
                    </div>
                    
                    <div className="mt-3 flex justify-end">
                      <Button onClick={() => window.open(record.file_url, '_blank')}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Full Document
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Record Details</h3>
                    <div className="bg-gray-50 rounded-md p-4 h-80 overflow-y-auto">
                      <div className="mb-4">
                        <p className="text-xs text-gray-500">Date Added</p>
                        <div className="flex items-center mt-1">
                          <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                          <p className="text-sm font-medium">
                            {new Date(record.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      {record.description && (
                        <div className="mb-4">
                          <p className="text-xs text-gray-500">Description</p>
                          <p className="text-sm mt-1">{record.description}</p>
                        </div>
                      )}
                      
                      {record.extracted_text && (
                        <div>
                          <p className="text-xs text-gray-500">Extracted Content</p>
                          <pre className="text-xs mt-1 bg-white p-3 rounded border whitespace-pre-wrap">
                            {record.extracted_text}
                          </pre>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 bg-medivault-50 p-3 rounded-md border border-medivault-100 flex items-start">
                      <Shield className="h-5 w-5 text-medivault-600 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-medivault-700 font-medium">Secure Shared Access</p>
                        <p className="text-xs text-medivault-600 mt-1">
                          This record has been securely shared with you. Your access has been logged and the patient can revoke access at any time.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">No Record Found</h2>
              <p className="text-gray-600">
                The requested record could not be found or has been removed.
              </p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SharedRecord;
