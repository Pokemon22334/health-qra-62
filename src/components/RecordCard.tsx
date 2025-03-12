
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Calendar, Download, Trash2, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

export interface RecordCardProps {
  record: any; // The health record object
  onUpdate?: () => Promise<void>; // Callback after record updates or deletions
  isPublic?: boolean; // Is this being shown in a public context
  canShare?: boolean; // Can this record be shared
  onShare?: (record: any) => void; // Callback for sharing
}

const RecordCard: React.FC<RecordCardProps> = ({ 
  record,
  onUpdate,
  isPublic = false,
  canShare = false,
  onShare
}) => {
  const { toast } = useToast();

  // Format the date to a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Handle file download
  const handleDownload = () => {
    if (record.file_url) {
      window.open(record.file_url, '_blank');
    } else {
      toast({
        title: 'Download failed',
        description: 'File URL is not available.',
        variant: 'destructive',
      });
    }
  };

  // Handle record deletion
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this record?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('health_records')
        .delete()
        .eq('id', record.id);

      if (error) throw error;

      toast({
        title: 'Record deleted',
        description: 'The health record has been removed successfully.',
      });

      if (onUpdate) {
        await onUpdate();
      }
    } catch (error: any) {
      console.error('Error deleting record:', error);
      toast({
        title: 'Deletion failed',
        description: error.message || 'Failed to delete the record.',
        variant: 'destructive',
      });
    }
  };

  // Handle record sharing
  const handleShare = () => {
    if (onShare) {
      onShare(record);
    }
  };

  // Get the appropriate badge color based on category
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
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
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
          
          <div className="flex items-center text-xs text-gray-500">
            <Calendar className="h-3 w-3 mr-1" />
            <span>Added: {formatDate(record.created_at)}</span>
          </div>
        </div>
        
        <div className="border-t border-gray-100 bg-gray-50 p-3 flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            <span>Download</span>
          </Button>
          
          {!isPublic && (
            <>
              {canShare && (
                <Button size="sm" variant="outline" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  <span>Share</span>
                </Button>
              )}
              
              <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                <span>Delete</span>
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecordCard;
