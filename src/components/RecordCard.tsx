
import { useState } from 'react';
import { FileText, Calendar, Download, MoreVertical, File, Trash2, Edit, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

type RecordType = 'bloodTest' | 'prescription' | 'imaging' | 'doctorNote' | 'other';

type RecordCardProps = {
  title: string;
  date: Date;
  doctor?: string;
  institution?: string;
  type: RecordType;
  fileSize?: string;
  className?: string;
  onView?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
};

const getTypeInfo = (type: RecordType) => {
  switch (type) {
    case 'bloodTest':
      return { icon: FileText, color: 'text-red-500', bg: 'bg-red-50' };
    case 'prescription':
      return { icon: File, color: 'text-emerald-500', bg: 'bg-emerald-50' };
    case 'imaging':
      return { icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-50' };
    case 'doctorNote':
      return { icon: FileText, color: 'text-amber-500', bg: 'bg-amber-50' };
    default:
      return { icon: FileText, color: 'text-gray-500', bg: 'bg-gray-50' };
  }
};

const RecordCard = ({ 
  title, 
  date, 
  doctor, 
  institution, 
  type, 
  fileSize = '1.2 MB',
  className,
  onView,
  onDownload,
  onDelete
}: RecordCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { icon: TypeIcon, color, bg } = getTypeInfo(type);
  
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
            <h3 className="font-medium text-gray-900 truncate">{title}</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onView}>
                  <Eye className="mr-2 h-4 w-4" />
                  <span>View</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  <span>Download</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <Calendar className="h-3.5 w-3.5 mr-1" />
            <span>{format(date, 'MMM d, yyyy')}</span>
          </div>
          
          {(doctor || institution) && (
            <p className="text-xs text-gray-500 mt-1 truncate">
              {doctor && <span>{doctor}</span>}
              {doctor && institution && <span> • </span>}
              {institution && <span>{institution}</span>}
            </p>
          )}
        </div>
      </div>
      
      <CardFooter className="py-2 px-4 bg-gray-50 text-xs text-gray-500 flex justify-between items-center">
        <span>{fileSize}</span>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2 text-xs" 
            onClick={onView}
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2 text-xs" 
            onClick={onDownload}
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
