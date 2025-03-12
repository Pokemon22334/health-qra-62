
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
        .eq('user_id', userId as string)
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
      console.log('Uploading file to storage bucket:', file.name);
      
      // Create folder structure with user ID and timestamp
      const timestamp = Date.now();
      const fileName = `${user.id}/${timestamp}-${file.name}`;
      
      // Verify storage access and bucket existence
      try {
        const { data: bucketInfo, error: storageError } = await supabase
          .storage
          .from('medical_records')
          .getPublicUrl('test.txt'); // Just to test the bucket without creating a file
          
        if (storageError) {
          console.error('Storage access error:', storageError);
          throw new Error(`Storage access error: ${storageError.message}`);
        }
      } catch (bucketError: any) {
        console.error('Bucket verification error:', bucketError);
        throw new Error(`Storage bucket verification failed: ${bucketError.message}`);
      }
      
      // Upload file with specific options
      const { data: fileData, error: uploadError } = await supabase.storage
        .from('medical_records')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw new Error(`Error uploading file: ${uploadError.message}`);
      }
      
      console.log('File uploaded successfully:', fileData?.path);
      
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('medical_records')
        .getPublicUrl(fileName);
        
      const fileUrl = publicUrlData.publicUrl;
      console.log('File public URL:', fileUrl);
      
      // Save record metadata to database
      const { data: recordData, error: recordError } = await supabase
        .from('health_records')
        .insert({
          title,
          description,
          category,
          file_url: fileUrl,
          user_id: user.id
        })
        .select()
        .single();
        
      if (recordError) {
        console.error('Record metadata error:', recordError);
        throw new Error(`Error saving record metadata: ${recordError.message}`);
      }
      
      console.log('Record saved successfully:', recordData);
      
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
