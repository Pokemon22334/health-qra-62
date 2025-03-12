
import { useState, useEffect } from 'react';
import { FileText, Download, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useHealthRecords } from '@/hooks/use-health-records';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import RecordCard from '@/components/RecordCard';

interface HealthRecordsListProps {
  refreshTrigger?: number;
}

const HealthRecordsList = ({ refreshTrigger = 0 }: HealthRecordsListProps) => {
  const { user } = useAuth();
  const { data: records, isLoading, error, refetch } = useHealthRecords(user?.id, refreshTrigger);
  const { toast } = useToast();
  const [loadingRetry, setLoadingRetry] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (error && retryCount < 3) {
      console.error('Error loading health records:', error);
      // Auto-retry on first error
      const retryTimer = setTimeout(() => {
        handleRetry();
      }, 2000);
      
      return () => clearTimeout(retryTimer);
    }
  }, [error, retryCount]);

  const handleRetry = async () => {
    try {
      setLoadingRetry(true);
      setRetryCount(prev => prev + 1);
      await refetch();
      toast({
        title: "Refreshed",
        description: "Your records have been refreshed.",
      });
    } catch (err) {
      console.error('Error during retry:', err);
      toast({
        title: "Refresh failed",
        description: "Could not refresh your records. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoadingRetry(false);
    }
  };

  if (isLoading || loadingRetry) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="flex flex-col items-center justify-center h-40">
          <Loader2 className="h-10 w-10 text-medivault-500 animate-spin mb-4" />
          <p className="text-gray-500 text-center">
            {loadingRetry ? 'Refreshing your records...' : 'Loading your health records...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="flex flex-col items-center justify-center h-40 text-center">
          <AlertTriangle className="h-10 w-10 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Couldn't load your records</h3>
          <p className="text-gray-500 mb-4 max-w-md">
            We encountered an error while trying to load your health records. This might be a temporary issue.
          </p>
          <Button 
            onClick={handleRetry} 
            variant="default"
            className="flex items-center gap-2"
            disabled={loadingRetry}
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!records || records.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No health records found</h3>
          <p className="text-gray-600 mb-4">
            You haven't uploaded any health records yet. Upload your first record to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Your Health Records</h2>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={handleRetry}
          disabled={loadingRetry}
        >
          {loadingRetry ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </>
          )}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {records.map((record) => (
          <RecordCard key={record.id} record={record} onUpdate={handleRetry} />
        ))}
      </div>
    </div>
  );
};

export default HealthRecordsList;
