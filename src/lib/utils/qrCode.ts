import { supabase } from '@/lib/supabase';

// Generate a QR code for a health record
export const generateQRCode = async (recordId: string, userId: string, expiryHours: number = 24) => {
  try {
    console.log('Generating QR code for record:', recordId, 'by user:', userId);
    
    // Calculate expiry time based on current time plus expiryHours
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + expiryHours);
    
    // Create a new QR code record in the database
    const { data, error } = await supabase
      .from('qr_codes')
      .insert({
        record_id: recordId,
        created_by: userId,
        expires_at: expiryDate.toISOString(),
        is_revoked: false, // Explicitly set to false
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating QR code record:', error);
      throw error;
    }
    
    if (!data) {
      throw new Error('Failed to create QR code');
    }
    
    console.log('QR code created successfully:', data);
    
    // Generate a URL for this QR code
    const shareableUrl = generateShareableLink(data.id);
    
    // Create a QR code image URL using a third-party service
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareableUrl)}`;
    
    return {
      qrCode: data,
      qrImageUrl,
      shareableUrl
    };
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

// Generate a shareable link for a QR code ID
export const generateShareableLink = (qrCodeId: string): string => {
  // Generate a shareable link using the current origin or a fallback
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://medivault.app';
  return `${origin}/shared-record/${qrCodeId}`;
};

// Get a record by QR code ID
export const getRecordByQRCode = async (qrCodeId: string, accessorId?: string) => {
  try {
    console.log('Fetching record for QR code:', qrCodeId);
    
    if (!qrCodeId) {
      throw new Error('No QR code ID provided');
    }
    
    // Get the QR code
    const { data: qrCode, error: qrError } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('id', qrCodeId as string)
      .single();
    
    if (qrError) {
      console.error('QR code not found:', qrError);
      throw new Error('QR code not found or invalid');
    }
    
    if (!qrCode) {
      throw new Error('QR code not found');
    }
    
    // Check if the QR code has expired
    const expiresAt = qrCode.expires_at ? new Date(qrCode.expires_at) : null;
    if (expiresAt && expiresAt < new Date()) {
      console.error('QR code expired:', qrCode.expires_at);
      throw new Error('QR code has expired');
    }
    
    // Check if the QR code has been revoked
    if (qrCode.is_revoked) {
      console.error('QR code has been revoked');
      throw new Error('QR code has been revoked');
    }
    
    console.log('QR code valid, fetching record:', qrCode.record_id);
    
    // Get the record
    const { data: record, error: recordError } = await supabase
      .from('health_records')
      .select('*')
      .eq('id', qrCode.record_id)
      .single();
    
    if (recordError) {
      console.error('Record not found:', recordError);
      throw new Error('The requested medical record could not be found');
    }
    
    if (!record) {
      throw new Error('The requested medical record could not be found');
    }

    // Verify the file URL is accessible
    if (record.file_url) {
      try {
        // Test if we can get the URL
        const fileUrlParts = record.file_url.split('/');
        const fileName = fileUrlParts[fileUrlParts.length - 1];
        
        // This is to verify the file exists, we don't need to use the result
        await supabase.storage
          .from('medical_records')
          .download(fileName);
      } catch (fileError) {
        console.error('Error verifying file access:', fileError);
        // Don't throw, just note that the file URL might be invalid
        console.warn('File may not be accessible:', record.file_url);
      }
    }
    
    // Log the access
    if (accessorId) {
      console.log('Logging access by user:', accessorId);
      try {
        await supabase
          .from('qr_code_access')
          .insert({
            qr_code_id: qrCodeId,
            accessed_by: accessorId,
          });
      } catch (accessError) {
        // Non-critical error, just log it
        console.error('Failed to log access:', accessError);
      }
    } else {
      console.log('Anonymous access - no user ID provided');
    }
    
    return record;
  } catch (error) {
    console.error('Error getting record by QR code:', error);
    throw error;
  }
};

// Revoke a QR code (and now also delete it)
export const revokeQRCode = async (qrCodeId: string, userId: string) => {
  try {
    // Check if the user owns this QR code
    const { data: qrCode, error: qrError } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('id', qrCodeId as string)
      .eq('created_by', userId as string)
      .single();
    
    if (qrError || !qrCode) {
      console.error('Error fetching QR code for revocation:', qrError);
      throw new Error('QR code not found or you do not have permission to revoke it');
    }
    
    // Delete the QR code instead of just revoking it
    const { error } = await supabase
      .from('qr_codes')
      .delete()
      .eq('id', qrCodeId as string);
    
    if (error) {
      console.error('Error deleting QR code:', error);
      throw error;
    }
    
    console.log('QR code deleted successfully:', qrCodeId);
    
    return true;
  } catch (error) {
    console.error('Error revoking/deleting QR code:', error);
    throw error;
  }
};

// Get all QR codes for a user
export const getUserQRCodes = async (userId: string) => {
  try {
    console.log('Fetching QR codes for user:', userId);
    
    const { data, error } = await supabase
      .from('qr_codes')
      .select(`
        *,
        health_records (
          id,
          title,
          category
        )
      `)
      .eq('created_by', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user QR codes:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error getting user QR codes:', error);
    throw error;
  }
};

// Format expiration time for display
export const formatExpirationTime = (date: string): string => {
  const expirationDate = new Date(date);
  return expirationDate.toLocaleString();
};

// Check if a QR code is valid
export const isQRCodeValid = async (qrCodeId: string): Promise<boolean> => {
  try {
    console.log('Checking if QR code is valid:', qrCodeId);
    
    const { data, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('id', qrCodeId as string)
      .single();
    
    if (error || !data) {
      console.error('Error checking QR code validity:', error);
      return false;
    }
    
    // Check if expired or revoked
    const isExpired = data.expires_at ? new Date(data.expires_at) < new Date() : false;
    const isValid = !isExpired && !data.is_revoked;
    
    console.log('QR code valid?', isValid, 'Expires:', data.expires_at, 'Revoked:', data.is_revoked);
    
    return isValid;
  } catch (error) {
    console.error('Exception checking QR code validity:', error);
    return false;
  }
};

// Get QR code access history
export const getQRCodeAccessHistory = async (qrCodeId: string) => {
  try {
    const { data, error } = await supabase
      .from('qr_code_access')
      .select(`
        *,
        profiles:accessed_by (
          id,
          name,
          email,
          role
        )
      `)
      .eq('qr_code_id', qrCodeId as string)
      .order('accessed_at', { ascending: false });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error getting QR code access history:', error);
    throw error;
  }
};
