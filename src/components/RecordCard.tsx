
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
  [key: string]: any; // Allow other properties
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
  const { icon: TypeIcon, color, bg } = getTypeInfo(record.category);
  const { toast } = useToast();
  
  // Format the date from string to Date object
  const createdDate = new Date(record.created_at);
  
  const handleView = async () => {
    try {
      if (!record.file_url) {
        toast({
          title: "File Not Available",
          description: "The file URL is missing or invalid.",
          variant: "destructive",
        });
        return;
      }
      
      // Check if the URL is a Supabase storage URL
      if (record.file_url.includes('supabase')) {
        // Extract the path from the URL
        const urlParts = record.file_url.split('/');
        const fileName = urlParts.slice(urlParts.indexOf('medical_records') + 1).join('/');
        
        // Get a fresh public URL
        const { data } = supabase.storage
          .from('medical_records')
          .getPublicUrl(fileName);
          
        if (data?.publicUrl) {
          window.open(data.publicUrl, '_blank');
        } else {
          window.open(record.file_url, '_blank');
        }
      } else {
        // Regular URL
        window.open(record.file_url, '_blank');
      }
    } catch (error) {
      console.error('Error opening file:', error);
      toast({
        title: "Error",
        description: "Failed to open the file. Please try again later.",
        variant: "destructive",
      });
    }
  };
  
  const handleDownload = async () => {
    try {
      if (!record.file_url) {
        toast({
          title: "File Not Available",
          description: "The file URL is missing or invalid.",
          variant: "destructive",
        });
        return;
      }
      
      // Check if the URL is a Supabase storage URL
      if (record.file_url.includes('supabase')) {
        // Extract the path from the URL
        const urlParts = record.file_url.split('/');
        const fileName = urlParts.slice(urlParts.indexOf('medical_records') + 1).join('/');
        const fileNameDisplay = fileName.split('/').pop() || 'file';
        
        // Get a fresh public URL
        const { data } = supabase.storage
          .from('medical_records')
          .getPublicUrl(fileName);
          
        if (data?.publicUrl) {
          const link = document.createElement('a');
          link.href = data.publicUrl;
          link.download = fileNameDisplay;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          const link = document.createElement('a');
          link.href = record.file_url;
          link.download = record.title || 'medical-record';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else {
        // Regular URL
        const link = document.createElement('a');
        link.href = record.file_url;
        link.download = record.title || 'medical-record';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Error",
        description: "Failed to download the file. Please try again later.",
        variant: "destructive",
      });
    }
  };
  
  const handleDelete = () => {
    // Delete record logic (to be implemented)
    console.log('Delete record:', record.id);
    // After deletion, trigger update
    if (onUpdate) onUpdate();
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
                <DropdownMenuItem onClick={handleView}>
                  <Eye className="mr-2 h-4 w-4" />
                  <span>View</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  <span>Download</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
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
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2 text-xs" 
            onClick={handleDownload}
          >
            <Download className="h-3 w-3 mr-1" />
            Download
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default RecordCard;
