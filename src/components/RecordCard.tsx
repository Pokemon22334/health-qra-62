import { useState } from 'react';
import { FileText, Calendar, Download, MoreVertical, File, Trash2, Edit, Eye, QrCode, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label'; 
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { generateQRCode, deleteQRCode } from '@/lib/utils/qrCode';

interface RecordProps {
  id: string;
  title: string;
  description?: string;
  category: string;
  file_url: string;
  created_at: string;
  user_id: string;
  [key: string]: any;
}

interface RecordCardProps {
  record: RecordProps;
  onUpdate?: () => void;
  className?: string;
}

const getTypeInfo = (category: string) => {
  switch (category) {
    case 'blood_test':
      return { icon: FileText, color: 'text-red-500', bg: 'bg-red-50' };
    case 'prescription':
      return { icon: File, color: 'text-emerald-500', bg: 'bg-emerald-50' };
    case 'xray_mri':
      return { icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-50' };
    case 'doctor_note':
      return { icon: FileText, color: 'text-amber-500', bg: 'bg-amber-50' };
    default:
      return { icon: FileText, color: 'text-gray-500', bg: 'bg-gray-50' };
  }
};

const RecordCard = ({ 
  record,
  className,
  onUpdate
}: RecordCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [shareableUrl, setShareableUrl] = useState<string | null>(null);
  const [expiryHours, setExpiryHours] = useState<number>(24);
  const [qrGenerating, setQrGenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { icon: TypeIcon, color, bg } = getTypeInfo(record.category);
  const { toast } = useToast();
  
  const createdDate = new Date(record.created_at);

  const getFileUrl = async (fileUrl: string) => {
    try {
      const urlParts = fileUrl.split('medical_records/');
      if (urlParts.length !== 2) {
        throw new Error('Invalid file URL format');
      }
      
      const filePath = urlParts[1];
      console.log('Attempting to get file:', filePath);

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

      return data.signedUrl;
    } catch (error) {
      console.error('Error in getFileUrl:', error);
      throw error;
    }
  };
  
  const handleView = async () => {
    try {
      setIsLoading(true);
      
      if (!record.file_url) {
        throw new Error('File URL is missing');
      }
      
      console.log('Attempting to view file:', record.file_url);
      const signedUrl = await getFileUrl(record.file_url);
      window.open(signedUrl, '_blank');
    } catch (error: any) {
      console.error('Error viewing file:', error);
      toast({
        title: "Error",
        description: "Failed to open the file. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDownload = async () => {
    try {
      setIsLoading(true);
      
      if (!record.file_url) {
        throw new Error('File URL is missing');
      }
      
      const signedUrl = await getFileUrl(record.file_url);
      
      const link = document.createElement('a');
      link.href = signedUrl;
      link.download = record.title || 'medical-record';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Success",
        description: "File download started",
      });
    } catch (error: any) {
      console.error('Error downloading file:', error);
      toast({
        title: "Error",
        description: "Failed to download the file. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      console.log('Deleting QR code:', record.id);
      
      if (!record.user_id) {
        throw new Error('User ID is missing');
      }
      
      await deleteQRCode(record.id, record.user_id);
      
      toast({
        title: "Success",
        description: "QR code deleted successfully",
      });
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error: any) {
      console.error('Error deleting QR code:', error);
      toast({
        title: "Error",
        description: "Failed to delete QR code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleGenerateQR = async () => {
    setShowQRDialog(true);
  };
  
  const handleCreateQRCode = async () => {
    try {
      setQrGenerating(true);
      
      if (!record.user_id) {
        throw new Error('User ID is missing');
      }
      
      const result = await generateQRCode(record.id, record.user_id, expiryHours);
      
      setQrImageUrl(result.qrImageUrl);
      setShareableUrl(result.shareableUrl);
      
      toast({
        title: "QR Code Generated",
        description: "The QR code for this record has been created successfully.",
      });
    } catch (error: any) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Error",
        description: "Failed to generate QR code. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setQrGenerating(false);
    }
  };
  
  const handleDownloadQR = () => {
    if (!qrImageUrl) return;
    
    const link = document.createElement('a');
    link.href = qrImageUrl;
    link.download = `${record.title.replace(/\s+/g, '-').toLowerCase()}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "QR Downloaded",
      description: "The QR code has been downloaded.",
    });
  };
  
  const handleCopyLink = () => {
    if (!shareableUrl) return;
    
    navigator.clipboard.writeText(shareableUrl);
    
    toast({
      title: "Link Copied",
      description: "The shareable link has been copied to clipboard.",
    });
  };
  
  return (
    <>
      <Card 
        className={cn(
          "overflow-hidden transition-all duration-300 border-gray-100 hover:shadow-md group",
          isHovered && "border-medivault-200",
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="p-4 flex gap-4">
          <div className={cn("w-12 h-12 rounded-md flex items-center justify-center flex-shrink-0", bg)}>
            <TypeIcon className={cn("w-6 h-6", color)} />
          </div>
          
          <div className="flex-grow min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-gray-900 truncate">{record.title}</h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={handleView}
                    disabled={isLoading}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    <span>{isLoading ? 'Loading...' : 'View'}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleDownload}
                    disabled={isLoading}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    <span>{isLoading ? 'Loading...' : 'Download'}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleGenerateQR}>
                    <QrCode className="mr-2 h-4 w-4" />
                    <span>Generate QR Code</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <Calendar className="h-3.5 w-3.5 mr-1" />
              <span>{format(createdDate, 'MMM d, yyyy')}</span>
            </div>
            
            {record.description && (
              <p className="text-xs text-gray-500 mt-1 truncate">
                {record.description}
              </p>
            )}
          </div>
        </div>
        
        <CardFooter className="py-2 px-4 bg-gray-50 text-xs text-gray-500 flex justify-between items-center">
          <span>{record.category.replace('_', ' ')}</span>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-xs" 
              onClick={handleView}
              disabled={isLoading}
            >
              <Eye className="h-3 w-3 mr-1" />
              {isLoading ? 'Loading...' : 'View'}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-xs" 
              onClick={handleGenerateQR}
            >
              <QrCode className="h-3 w-3 mr-2" />
              QR Code
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-xs" 
              onClick={handleDownload}
              disabled={isLoading}
            >
              <Download className="h-3 w-3 mr-1" />
              {isLoading ? 'Loading...' : 'Download'}
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate QR Code</DialogTitle>
            <DialogDescription>
              Generate a QR code to share access to this health record.
            </DialogDescription>
          </DialogHeader>
          
          {!qrImageUrl ? (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">QR Code Expiration</Label>
                <Select 
                  defaultValue="24" 
                  onValueChange={(val) => setExpiryHours(parseInt(val))}
                >
                  <SelectTrigger id="expiry">
                    <SelectValue placeholder="Select expiration time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hour</SelectItem>
                    <SelectItem value="6">6 hours</SelectItem>
                    <SelectItem value="12">12 hours</SelectItem>
                    <SelectItem value="24">24 hours</SelectItem>
                    <SelectItem value="48">48 hours</SelectItem>
                    <SelectItem value="72">72 hours</SelectItem>
                    <SelectItem value="168">1 week</SelectItem>
                    <SelectItem value="720">30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Record Information</Label>
                <div className="p-3 bg-gray-50 rounded-md text-sm">
                  <p className="font-medium text-gray-900">{record.title}</p>
                  <p className="text-gray-600 text-xs mt-1">{record.category.replace('_', ' ')}</p>
                </div>
              </div>
              
              <DialogFooter className="mt-4 flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowQRDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateQRCode}
                  disabled={qrGenerating}
                >
                  {qrGenerating ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <QrCode className="h-4 w-4 mr-2" />
                      Generate QR Code
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="flex justify-center p-4">
                <div className="bg-white p-2 rounded-lg border border-gray-200">
                  <img src={qrImageUrl} alt="QR Code" className="w-48 h-48" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Shareable Link</Label>
                <div className="flex">
                  <Input 
                    value={shareableUrl || ''} 
                    readOnly 
                    className="rounded-r-none"
                  />
                  <Button 
                    variant="secondary" 
                    className="rounded-l-none" 
                    onClick={handleCopyLink}
                  >
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  This QR code will expire in {expiryHours} hour{expiryHours !== 1 ? 's' : ''}.
                </p>
              </div>
              
              <DialogFooter className="mt-4 flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={handleDownloadQR}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download QR
                </Button>
                <Button 
                  onClick={() => {
                    setShowQRDialog(false);
                    setQrImageUrl(null);
                    setShareableUrl(null);
                  }}
                >
                  Done
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RecordCard;
