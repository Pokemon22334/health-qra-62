
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { generateQRCode, revokeQRCode } from '@/lib/utils/qrCode';

export const useHealthRecords = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Get all health records for the current user
  const getHealthRecords = async () => {
    try {
      setIsLoading(true);
      
      if (!user) {
        throw new Error('You must be logged in to access records');
      }
      
      const { data, error } = await supabase
        .from('health_records')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        toast({
          title: 'Failed to fetch records',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
      
      return data;
    } catch (error: any) {
      toast({
        title: 'Failed to fetch records',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Get a specific health record by ID
  const getHealthRecord = async (id: string) => {
    try {
      setIsLoading(true);
      
      if (!user) {
        throw new Error('You must be logged in to access records');
      }
      
      const { data, error } = await supabase
        .from('health_records')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        toast({
          title: 'Failed to fetch record',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
      
      return data;
    } catch (error: any) {
      toast({
        title: 'Failed to fetch record',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Upload a health record
  const uploadHealthRecord = async (
    file: File,
    title: string,
    description: string,
    category: 'blood_test' | 'xray_mri' | 'prescription' | 'doctor_note' | 'other'
  ) => {
    try {
      setIsLoading(true);
      
      if (!user) {
        throw new Error('You must be logged in to upload records');
      }
      
      // Create file path using user ID for isolation
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      
      // Upload file to storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from('medical_records')
        .upload(filePath, file);
      
      if (storageError) {
        toast({
          title: 'Failed to upload file',
          description: storageError.message,
          variant: 'destructive',
        });
        throw storageError;
      }
      
      // Get public URL for the file
      const { data: publicURL } = supabase.storage
        .from('medical_records')
        .getPublicUrl(filePath);
      
      // Extract text (simulated for demo)
      const extractedText = category === 'prescription' 
        ? 'PRESCRIPTION\nPatient: John Doe\nMedication: Amoxicillin\nDosage: 500mg\nFrequency: 3 times daily\nDoctor: Dr. Smith'
        : 'Sample extracted text from document';
      
      // Create health record in database
      const { data, error } = await supabase
        .from('health_records')
        .insert({
          user_id: user.id,
          title,
          description,
          category,
          file_url: publicURL.publicUrl,
          extracted_text: extractedText
        })
        .select()
        .single();
      
      if (error) {
        toast({
          title: 'Failed to create record',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
      
      toast({
        title: 'Record uploaded successfully',
        description: 'Your medical record has been saved securely.',
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: 'Failed to upload record',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a health record
  const deleteHealthRecord = async (id: string) => {
    try {
      setIsLoading(true);
      
      if (!user) {
        throw new Error('You must be logged in to delete records');
      }
      
      // Get the record to find the file path
      const { data: record, error: recordError } = await supabase
        .from('health_records')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
      
      if (recordError) {
        toast({
          title: 'Failed to find record',
          description: recordError.message,
          variant: 'destructive',
        });
        throw recordError;
      }
      
      // Extract the file path from the URL
      const fileUrl = record.file_url;
      const filePath = fileUrl.split('/').pop();
      
      // Delete the record from the database
      const { error } = await supabase
        .from('health_records')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        toast({
          title: 'Failed to delete record',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
      
      // Try to delete the file from storage (best effort)
      try {
        if (filePath) {
          await supabase.storage
            .from('medical_records')
            .remove([`${user.id}/${filePath}`]);
        }
      } catch (storageError) {
        console.error('Error deleting file from storage:', storageError);
        // Continue anyway since the record is deleted
      }
      
      toast({
        title: 'Record deleted successfully',
        description: 'Your medical record has been permanently deleted.',
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: 'Failed to delete record',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Generate a QR code for a health record
  const generateQRCodeForRecord = async (recordId: string) => {
    try {
      setIsLoading(true);
      
      if (!user) {
        throw new Error('You must be logged in to generate QR codes');
      }
      
      const result = await generateQRCode(recordId, user.id);
      
      toast({
        title: 'QR code generated successfully',
        description: 'You can now share this QR code with your healthcare provider.',
      });
      
      return result;
    } catch (error: any) {
      toast({
        title: 'Failed to generate QR code',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Get all QR codes for the current user
  const getQRCodes = async () => {
    try {
      setIsLoading(true);
      
      if (!user) {
        throw new Error('You must be logged in to access QR codes');
      }
      
      const { data, error } = await supabase
        .from('qr_codes')
        .select(`
          *,
          health_records (
            id,
            title,
            category
          ),
          qr_code_access (
            id,
            accessed_at,
            accessed_by,
            profiles (
              id,
              name,
              role
            )
          )
        `)
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        toast({
          title: 'Failed to fetch QR codes',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
      
      return data;
    } catch (error: any) {
      toast({
        title: 'Failed to fetch QR codes',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Revoke a QR code
  const revokeQRCodeById = async (qrCodeId: string) => {
    try {
      setIsLoading(true);
      
      if (!user) {
        throw new Error('You must be logged in to revoke QR codes');
      }
      
      await revokeQRCode(qrCodeId, user.id);
      
      toast({
        title: 'QR code revoked successfully',
        description: 'This QR code can no longer be used to access your record.',
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: 'Failed to revoke QR code',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    getHealthRecords,
    getHealthRecord,
    uploadHealthRecord,
    deleteHealthRecord,
    generateQRCodeForRecord,
    getQRCodes,
    revokeQRCodeById
  };
};
