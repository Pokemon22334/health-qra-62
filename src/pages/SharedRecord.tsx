
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, ChevronLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import { getRecordByQRCode } from '@/lib/utils/qrCode';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

const SharedRecord = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [record, setRecord] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (!id) {
          setError('Invalid QR code');
          return;
        }
        
        // Fetch the record using the QR code ID
        const recordData = await getRecordByQRCode(id, user?.id);
        setRecord(recordData);
      } catch (err: any) {
        console.error('Error fetching record:', err);
        setError(err.message || 'Failed to access record');
        
        toast({
          title: 'Error accessing record',
          description: err.message || 'The record could not be accessed',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecord();
  }, [id, user, toast]);

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Home
            </Link>
          </Button>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 max-w-3xl mx-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-medivault-600 animate-spin mb-4" />
              <p className="text-gray-600">Loading medical record...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="bg-red-50 rounded-lg p-4 mb-6">
                <h3 className="text-red-800 font-medium">Access Error</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
              <p className="text-gray-600 mt-4">
                This QR code may have expired or been revoked by the owner.
              </p>
            </div>
          ) : record ? (
            <div>
              <div className="flex items-center border-b border-gray-200 pb-4 mb-4">
                <FileText className="h-6 w-6 text-medivault-600 mr-3" />
                <h1 className="text-2xl font-semibold text-gray-800">{record.title}</h1>
              </div>
              
              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Category</h3>
                  <p className="mt-1 text-gray-800 capitalize">{record.category.replace('_', ' ')}</p>
                </div>
                
                {record.description && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Description</h3>
                    <p className="mt-1 text-gray-800">{record.description}</p>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date Added</h3>
                  <p className="mt-1 text-gray-800">
                    {new Date(record.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              
              {record.extracted_text && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Extracted Text</h3>
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">{record.extracted_text}</pre>
                  </div>
                </div>
              )}
              
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Document</h3>
                <div className="border border-gray-200 rounded-md overflow-hidden">
                  {record.file_url.endsWith('.pdf') ? (
                    <div className="p-4 bg-gray-50 text-center">
                      <p className="text-gray-600 mb-2">PDF Document</p>
                      <Button asChild>
                        <a href={record.file_url} target="_blank" rel="noopener noreferrer">
                          View PDF
                        </a>
                      </Button>
                    </div>
                  ) : (
                    <img
                      src={record.file_url}
                      alt={record.title}
                      className="w-full object-contain max-h-96"
                    />
                  )}
                </div>
              </div>
              
              <div className="mt-8 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
                <p>
                  This record has been securely shared via MediVault.
                  <br />
                  Access is temporary and may expire after 24 hours.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No record found.</p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SharedRecord;
