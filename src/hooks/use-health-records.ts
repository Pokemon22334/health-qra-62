
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

export const useHealthRecords = (userId?: string, refreshTrigger: number = 0) => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchRecords = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching health records for user:', userId);
      
      const { data: records, error: fetchError } = await supabase
        .from('health_records')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (fetchError) {
        console.error('Error fetching health records:', fetchError);
        throw new Error(fetchError.message);
      }
      
      console.log('Fetched records:', records?.length || 0);
      setData(records || []);
    } catch (err: any) {
      console.error('Error in useHealthRecords:', err);
      setError(err instanceof Error ? err : new Error(err.message || 'Failed to fetch health records'));
      
      toast({
        title: 'Failed to load records',
        description: err.message || 'An error occurred while loading your health records',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchRecords();
    } else {
      setIsLoading(false);
    }
  }, [userId, refreshTrigger]);

  const refetch = async () => {
    return fetchRecords();
  };

  return {
    data,
    isLoading,
    error,
    refetch,
  };
};
