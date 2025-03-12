
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export const useQRCodes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Generate a QR code for a health record
  const generateQRCodeForRecord = async (recordId: string, expiryHours = 24) => {
    try {
      setIsLoading(true);
      
      if (!user) {
        throw new Error('You must be logged in to generate QR codes');
      }
      
      // Calculate expiry date
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + expiryHours);
      
      const { data: qrCode, error } = await supabase
        .from('qr_codes')
        .insert({
          record_id: recordId,
          created_by: user.id,
          expires_at: expiryDate.toISOString()
        })
        .select()
        .single();
        
      if (error) throw error;
      
      toast({
        title: 'QR code generated successfully',
        description: 'You can now share this QR code with your healthcare provider.',
      });
      
      return qrCode;
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
      
      // Verify the user owns the QR code
      const { data: qrCode, error: qrError } = await supabase
        .from('qr_codes')
        .select('created_by')
        .eq('id', qrCodeId)
        .single();
      
      if (qrError) {
        console.error('Error getting QR code:', qrError);
        throw new Error('QR code not found');
      }
      
      if (qrCode.created_by !== user.id) {
        throw new Error('You do not have permission to revoke this QR code');
      }
      
      // Revoke the QR code by setting is_revoked to true
      const { error } = await supabase
        .from('qr_codes')
        .update({ is_revoked: true })
        .eq('id', qrCodeId);
      
      if (error) {
        console.error('Error revoking QR code:', error);
        throw new Error('Failed to revoke QR code');
      }
      
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
    generateQRCodeForRecord,
    getQRCodes,
    revokeQRCodeById
  };
};
