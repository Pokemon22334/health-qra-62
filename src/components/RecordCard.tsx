import { useState } from 'react';
import { FileText, Calendar, Download, MoreVertical, File, Trash2, Edit, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

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
      
      const { data: qrCodes, error: fetchError } = await supabase
        .from('qr_codes')
        .select('id')
        .eq('record_id', record.id);
      
      if (fetchError) throw fetchError;
      
      if (qrCodes && qrCodes.length > 0) {
        // Track success/failure for each deletion
        const deletionPromises = qrCodes.map(async qrCode => {
          try {
            // Update the QR code to mark it as revoked instead of deleting
            const { error } = await supabase
              .from('qr_codes')
              .update({ is_revoked: true })
              .eq('id', qrCode.id)
              .eq('created_by', record.user_id);
              
            return { id: qrCode.id, success: !error };
          } catch (error) {
            return { id: qrCode.id, success: false, error };
          }
        });
        
        const results = await Promise.all(deletionPromises);
        const successCount = results.filter(r => r.success).length;
        
        if (successCount === qrCodes.length) {
          toast({
            title: "Success",
            description: `Revoked ${successCount} QR code${successCount !== 1 ? 's' : ''}`,
          });
        } else {
          toast({
            title: "Partial Success",
            description: `Revoked ${successCount} of ${qrCodes.length} QR codes`,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Information",
          description: "No QR codes found for this record",
        });
      }
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error: any) {
      console.error('Error revoking QR codes:', error);
      toast({
        title: "Error",
        description: "Failed to revoke QR codes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
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
                <DropdownMenuItem 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>{isDeleting ? 'Deleting...' : 'Delete QR Codes'}</span>
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
            onClick={handleDownload}
            disabled={isLoading}
          >
            <Download className="h-3 w-3 mr-1" />
            {isLoading ? 'Loading...' : 'Download'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default RecordCard;

