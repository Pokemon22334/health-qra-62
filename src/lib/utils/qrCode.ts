
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
      .eq('id', qrCodeId)
      .single();
    
    if (qrError) {
      console.error('QR code not found:', qrError);
      throw new Error('QR code not found or invalid');
    }
    
    // Check if the QR code has expired
    if (new Date(qrCode.expires_at) < new Date()) {
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

    // Verify the storage bucket exists and file is accessible
    if (record.file_url) {
      const bucketName = 'medical_records';
      try {
        // Test accessing the file
        const { data: fileExists } = await supabase
          .storage
          .from(bucketName)
          .createSignedUrl(record.file_url.split(`${bucketName}/`)[1], 60);
        
        if (!fileExists) {
          console.warn('File not found in storage:', record.file_url);
          record.file_url = null; // Clear invalid URL
        }
      } catch (fileError) {
        console.error('Error verifying file access:', fileError);
        record.file_url = null; // Clear invalid URL
      }
    }
    
    // Log the access
    if (accessorId) {
      console.log('Logging access by user:', accessorId);
      await supabase
        .from('qr_code_access')
        .insert({
          qr_code_id: qrCodeId,
          accessed_by: accessorId,
        });
    } else {
      console.log('Anonymous access - no user ID provided');
    }
    
    return record;
  } catch (error) {
    console.error('Error getting record by QR code:', error);
    throw error;
  }
};

// Revoke a QR code
export const revokeQRCode = async (qrCodeId: string, userId: string) => {
  try {
    // Check if the user owns this QR code
    const { data: qrCode, error: qrError } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('id', qrCodeId)
      .eq('created_by', userId)
      .single();
    
    if (qrError) {
      console.error('Error fetching QR code for revocation:', qrError);
      throw new Error('QR code not found or you do not have permission to revoke it');
    }
    
    // Update the QR code to revoke it
    const { error } = await supabase
      .from('qr_codes')
      .update({ is_revoked: true })
      .eq('id', qrCodeId);
    
    if (error) {
      console.error('Error revoking QR code:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error revoking QR code:', error);
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
      .eq('id', qrCodeId)
      .single();
    
    if (error) {
      console.error('Error checking QR code validity:', error);
      return false;
    }
    
    // Check if expired or revoked
    const isValid = new Date(data.expires_at) > new Date() && !data.is_revoked;
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
      .eq('qr_code_id', qrCodeId)
      .order('accessed_at', { ascending: false });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error getting QR code access history:', error);
    throw error;
  }
};
