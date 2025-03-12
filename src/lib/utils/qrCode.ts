
import { supabase } from '@/lib/supabase';

export const generateQRCode = async (recordId: string, userId: string, expiresAt?: Date): Promise<string> => {
  try {
    // Insert a new QR code record
    const { data, error } = await supabase
      .from('qr_codes')
      .insert({
        record_id: recordId,
        created_by: userId,
        expires_at: expiresAt ? expiresAt.toISOString() : null
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
    
    // Return the QR code ID
    return data.id;
  } catch (error) {
    console.error('Error in generateQRCode:', error);
    throw error;
  }
};

export const isQRCodeValid = async (qrCodeId: string): Promise<boolean> => {
  try {
    // Check if the QR code exists and is not revoked
    const { data, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('id', qrCodeId)
      .eq('is_revoked', false)
      .single();
    
    if (error) {
      console.error('Error checking QR code validity:', error);
      return false;
    }
    
    if (!data) {
      return false;
    }
    
    // Check if the QR code has expired
    if (data.expires_at) {
      const expiresAt = new Date(data.expires_at);
      if (expiresAt < new Date()) {
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error in isQRCodeValid:', error);
    return false;
  }
};

export const getRecordByQRCode = async (qrCodeId: string, userId?: string): Promise<any> => {
  try {
    console.log('Getting record for QR code:', qrCodeId);
    
    // Get the QR code record
    const { data: qrCode, error: qrError } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('id', qrCodeId)
      .eq('is_revoked', false)
      .single();
    
    if (qrError) {
      console.error('Error getting QR code:', qrError);
      throw new Error('QR code not found or has been revoked');
    }
    
    // Check if the QR code has expired
    if (qrCode.expires_at) {
      const expiresAt = new Date(qrCode.expires_at);
      if (expiresAt < new Date()) {
        throw new Error('This QR code has expired');
      }
    }
    
    // Get the associated record
    const { data: record, error: recordError } = await supabase
      .from('health_records')
      .select('*')
      .eq('id', qrCode.record_id)
      .single();
    
    if (recordError) {
      console.error('Error getting record:', recordError);
      throw new Error('Medical record not found');
    }
    
    // Log the access
    try {
      if (userId) {
        await supabase
          .from('qr_code_access')
          .insert({
            qr_code_id: qrCodeId,
            accessed_by: userId
          });
      } else {
        // Log access without user ID for anonymous access
        await supabase
          .from('qr_code_access')
          .insert({
            qr_code_id: qrCodeId,
            accessed_by: null
          });
      }
    } catch (logError) {
      console.error('Error logging QR code access:', logError);
      // Non-critical error, continue
    }
    
    return record;
  } catch (error) {
    console.error('Error in getRecordByQRCode:', error);
    throw error;
  }
};

export const revokeQRCode = async (qrCodeId: string, userId: string): Promise<void> => {
  try {
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
    
    if (qrCode.created_by !== userId) {
      throw new Error('You do not have permission to revoke this QR code');
    }
    
    // Revoke the QR code
    const { error } = await supabase
      .from('qr_codes')
      .update({ is_revoked: true })
      .eq('id', qrCodeId);
    
    if (error) {
      console.error('Error revoking QR code:', error);
      throw new Error('Failed to revoke QR code');
    }
  } catch (error) {
    console.error('Error in revokeQRCode:', error);
    throw error;
  }
};

export const getQRCodesForUser = async (userId: string): Promise<any[]> => {
  try {
    // Get all QR codes created by the user
    const { data, error } = await supabase
      .from('qr_codes')
      .select(`
        *,
        health_records:record_id (
          title,
          description,
          category
        )
      `)
      .eq('created_by', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error getting QR codes:', error);
      throw new Error('Failed to get QR codes');
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getQRCodesForUser:', error);
    throw error;
  }
};

export const getQRCodeShareLink = (qrCodeId: string): string => {
  // For production, use a deployed domain
  const baseUrl = window.location.origin;
  return `${baseUrl}/shared-record/${qrCodeId}`;
};
