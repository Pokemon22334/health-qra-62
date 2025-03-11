
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { api, HealthRecord } from '@/services/api';
import { generateQRCodeURL } from '@/lib/utils/qrCode';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  Share, 
  MoreVertical, 
  Trash, 
  Edit, 
  Download, 
  QrCode, 
  Loader2 
} from 'lucide-react';

interface HealthRecordsListProps {
  refreshTrigger?: number;
}

const HealthRecordsList = ({ refreshTrigger = 0 }: HealthRecordsListProps) => {
  const { toast } = useToast();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, [refreshTrigger]);

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const data = await api.getRecords();
      setRecords(data);
    } catch (error) {
      console.error('Error fetching records:', error);
      toast({
        title: "Error",
        description: "Failed to load your health records. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    try {
      await api.deleteRecord(recordId);
      setRecords(records.filter(record => record.id !== recordId));
      toast({
        title: "Record deleted",
        description: "The health record has been permanently removed.",
      });
    } catch (error) {
      console.error('Error deleting record:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete the record. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateQRCode = async (record: HealthRecord) => {
    setSelectedRecord(record);
    setIsGeneratingQR(true);
    setShowQRDialog(true);
    
    try {
      // Generate QR code for the record (in a real app, this would be done server-side)
      const response = await api.generateQRCode(record.id);
      
      // Generate QR code image URL
      const qrCodeImageUrl = generateQRCodeURL(response.qr_url);
      setQrCodeUrl(qrCodeImageUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "QR code generation failed",
        description: "Could not generate QR code for the record. Please try again.",
        variant: "destructive",
      });
      setShowQRDialog(false);
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const handleViewDetails = (record: HealthRecord) => {
    setSelectedRecord(record);
    setShowDetailsDialog(true);
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'blood_test': return 'Blood Test';
      case 'xray_mri': return 'X-Ray / MRI';
      case 'prescription': return 'Prescription';
      case 'doctor_note': return 'Doctor\'s Note';
      default: return 'Other';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'blood_test': return 'bg-red-100 text-red-800';
      case 'xray_mri': return 'bg-purple-100 text-purple-800';
      case 'prescription': return 'bg-green-100 text-green-800';
      case 'doctor_note': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-medivault-600" />
        <span className="ml-2 text-gray-600">Loading your health records...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Your Health Records</h2>
        <Button 
          variant="outline" 
          onClick={fetchRecords} 
          size="sm"
        >
          Refresh
        </Button>
      </div>
      
      {records.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No health records found</h3>
          <p className="text-gray-600 mb-4">
            You haven't uploaded any medical records yet. Start by uploading your first record.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {records.map((record) => (
            <Card key={record.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium mb-2 ${getCategoryColor(record.category)}`}>
                      {getCategoryLabel(record.category)}
                    </span>
                    <CardTitle className="text-lg">{record.title}</CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewDetails(record)}>
                        <FileText className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleGenerateQRCode(record)}>
                        <QrCode className="mr-2 h-4 w-4" />
                        Generate QR Code
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Record
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteRecord(record.id)}
                        className="text-red-600 hover:text-red-700 focus:text-red-700"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription>
                  {record.description.length > 100
                    ? record.description.substring(0, 100) + '...'
                    : record.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2 pt-0">
                <div className="w-full h-40 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                  <img 
                    src={record.file_url || '/placeholder.svg'} 
                    alt={record.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <span className="text-xs text-gray-500">Added {formatDate(record.created_at)}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleGenerateQRCode(record)}
                >
                  <Share className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Medical Record</DialogTitle>
            <DialogDescription>
              Scan this QR code to securely share "{selectedRecord?.title}" with your healthcare provider.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center justify-center p-4">
            {isGeneratingQR ? (
              <div className="flex flex-col items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-medivault-600 mb-4" />
                <p className="text-gray-600">Generating secure QR code...</p>
              </div>
            ) : (
              <>
                <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code" 
                    className="w-64 h-64"
                  />
                </div>
                <p className="text-sm text-center text-gray-500 mt-2">
                  This QR code will expire in 24 hours. Only authorized healthcare providers will be able to access this record.
                </p>
              </>
            )}
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setShowQRDialog(false)}>
              Close
            </Button>
            <Button disabled={isGeneratingQR}>
              <Download className="mr-2 h-4 w-4" />
              Download QR Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Record Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedRecord?.title}</DialogTitle>
            <DialogDescription>
              {getCategoryLabel(selectedRecord?.category || 'other')} • Added {selectedRecord && formatDate(selectedRecord.created_at)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div>
              <div className="w-full aspect-square bg-gray-100 rounded-md flex items-center justify-center overflow-hidden mb-4">
                <img 
                  src={selectedRecord?.file_url || '/placeholder.svg'} 
                  alt={selectedRecord?.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-sm font-medium mb-1">Description</h3>
              <p className="text-sm text-gray-600 mb-4">
                {selectedRecord?.description || 'No description provided.'}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Extracted Information</h3>
              <ScrollArea className="h-[250px] rounded-md border p-4">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                  {selectedRecord?.extracted_text || 'No text extracted from this document.'}
                </pre>
              </ScrollArea>
            </div>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <Button
              variant="outline" 
              onClick={() => setShowDetailsDialog(false)}
            >
              Close
            </Button>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button onClick={() => {
                setShowDetailsDialog(false);
                handleGenerateQRCode(selectedRecord!);
              }}>
                <Share className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HealthRecordsList;
