
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export const useHealthRecords = (userId?: string, refreshTrigger: number = 0) => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

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

  // Add the upload health record function
  const uploadHealthRecord = async (
    file: File,
    title: string,
    description: string,
    category: string
  ) => {
    try {
      if (!user) {
        throw new Error('You must be logged in to upload records');
      }
      
      setIsLoading(true);
      
      // First, upload the file to storage
      const fileName = `${user.id}/${Date.now()}-${file.name}`;
      const { data: fileData, error: uploadError } = await supabase.storage
        .from('health_records')
        .upload(fileName, file);
        
      if (uploadError) {
        throw new Error(`Error uploading file: ${uploadError.message}`);
      }
      
      // Get public URL for the file
      const { data: publicUrlData } = supabase.storage
        .from('health_records')
        .getPublicUrl(fileName);
        
      const fileUrl = publicUrlData.publicUrl;
      
      // Save record metadata to database
      const { data: recordData, error: recordError } = await supabase
        .from('health_records')
        .insert([
          {
            title,
            description,
            category,
            file_url: fileUrl,
            user_id: user.id
          }
        ])
        .select()
        .single();
        
      if (recordError) {
        throw new Error(`Error saving record metadata: ${recordError.message}`);
      }
      
      // Update local state
      setData(prevData => [recordData, ...prevData]);
      
      toast({
        title: 'Record uploaded',
        description: 'Your health record has been uploaded successfully.',
      });
      
      return recordData;
    } catch (err: any) {
      console.error('Error uploading health record:', err);
      
      toast({
        title: 'Upload failed',
        description: err.message || 'An error occurred while uploading your health record',
        variant: 'destructive',
      });
      
      throw err;
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
    await fetchRecords();
  };

  return {
    data,
    isLoading,
    error,
    refetch,
    uploadHealthRecord
  };
};
