
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useHealthRecords } from '@/hooks/use-health-records';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, FileText, QrCode, Trash2, Eye, Download } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const HealthRecordsList = ({ refreshTrigger = 0 }) => {
  const { toast } = useToast();
  const { getHealthRecords, deleteHealthRecord, generateQRCodeForRecord, isLoading } = useHealthRecords();
  const [records, setRecords] = useState<any[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [qrCodeData, setQrCodeData] = useState<any>(null);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRecords();
  }, [refreshTrigger]);

  const fetchRecords = async () => {
    try {
      setLoadingRecords(true);
      const data = await getHealthRecords();
      setRecords(data || []);
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoadingRecords(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteHealthRecord(id);
      setRecords(records.filter(record => record.id !== id));
    } catch (error) {
      console.error('Error deleting record:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleGenerateQR = async (record: any) => {
    try {
      setSelectedRecord(record);
      const qrData = await generateQRCodeForRecord(record.id);
      setQrCodeData(qrData);
      setShowQRDialog(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const handlePreview = (record: any) => {
    setSelectedRecord(record);
    setShowPreviewDialog(true);
  };

  const handleDownload = (record: any) => {
    window.open(record.file_url, '_blank');
  };

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'blood_test': 
        return "💉";
      case 'xray_mri': 
        return "🔍";
      case 'prescription': 
        return "💊";
      case 'doctor_note': 
        return "📝";
      default: 
        return "📄";
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

  if (loadingRecords) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-medivault-600" />
        <span className="ml-2 text-gray-600">Loading records...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Your Health Records</h2>
      
      {records.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No records found</h3>
          <p className="text-gray-600 mb-4">
            You haven't uploaded any medical records yet.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Record
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Added
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {records.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-xl">{getCategoryIcon(record.category)}</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{record.title}</div>
                        {record.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">{record.description}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryBadgeClass(record.category)}`}>
                      {record.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(record.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handlePreview(record)}
                        className="text-gray-600"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDownload(record)}
                        className="text-blue-600"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleGenerateQR(record)}
                        className="text-medivault-600"
                      >
                        <QrCode className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDelete(record.id)}
                        className="text-red-600"
                        disabled={deletingId === record.id}
                      >
                        {deletingId === record.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Record: {selectedRecord?.title}</DialogTitle>
          </DialogHeader>
          
          {qrCodeData && (
            <div className="flex flex-col items-center py-4">
              <div className="bg-white p-2 rounded-lg border mb-4">
                <img src={qrCodeData.qrImageUrl} alt="QR Code" className="w-48 h-48" />
              </div>
              
              <div className="text-center mb-4">
                <p className="text-sm text-gray-500 mb-2">
                  This QR code will expire in 24 hours.
                </p>
                <div className="text-xs bg-yellow-50 text-yellow-800 p-2 rounded">
                  Expires on: {new Date(
                    new Date().getTime() + 24 * 60 * 60 * 1000
                  ).toLocaleString()}
                </div>
              </div>
              
              <div className="w-full mt-2">
                <p className="text-xs text-gray-500 mb-1">Shareable Link:</p>
                <div className="flex">
                  <input
                    type="text"
                    value={qrCodeData.shareableUrl}
                    readOnly
                    className="flex-1 text-sm p-2 border rounded-l-md bg-gray-50"
                  />
                  <Button
                    className="rounded-l-none"
                    onClick={() => {
                      navigator.clipboard.writeText(qrCodeData.shareableUrl);
                      toast({
                        title: "Link copied",
                        description: "The shareable link has been copied to your clipboard.",
                      });
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQRDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedRecord?.title}</DialogTitle>
          </DialogHeader>
          
          {selectedRecord && (
            <div className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Document Preview</h3>
                  <div className="border rounded-md overflow-hidden h-72 bg-gray-100 flex items-center justify-center">
                    {selectedRecord.file_url ? (
                      selectedRecord.file_url.endsWith('.pdf') ? (
                        <div className="text-center p-4">
                          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">PDF Document</p>
                          <Button 
                            variant="link" 
                            onClick={() => window.open(selectedRecord.file_url, '_blank')}
                            className="mt-2"
                          >
                            Open PDF
                          </Button>
                        </div>
                      ) : (
                        <img 
                          src={selectedRecord.file_url} 
                          alt={selectedRecord.title}
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
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Record Details</h3>
                  <div className="bg-gray-50 rounded-md p-4 h-72 overflow-y-auto">
                    <div className="mb-4">
                      <p className="text-xs text-gray-500">Category</p>
                      <p className="text-sm font-medium">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryBadgeClass(selectedRecord.category)}`}>
                          {selectedRecord.category.replace('_', ' ')}
                        </span>
                      </p>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-xs text-gray-500">Date Added</p>
                      <p className="text-sm font-medium">
                        {new Date(selectedRecord.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    
                    {selectedRecord.description && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500">Description</p>
                        <p className="text-sm">{selectedRecord.description}</p>
                      </div>
                    )}
                    
                    {selectedRecord.extracted_text && (
                      <div>
                        <p className="text-xs text-gray-500">Extracted Content</p>
                        <pre className="text-xs mt-1 bg-white p-2 rounded border whitespace-pre-wrap">
                          {selectedRecord.extracted_text}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
              Close
            </Button>
            <Button onClick={() => handleGenerateQR(selectedRecord)}>
              <QrCode className="h-4 w-4 mr-2" />
              Share via QR Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HealthRecordsList;
