
import { supabase } from '@/lib/supabase';

// Generate a QR code for a health record
export const generateQRCode = async (recordId: string, userId: string, expiryHours: number = 24) => {
  try {
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
      })
      .select()
      .single();
    
    if (error) throw error;
    
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
  // In production, this would use your actual domain
  return `${window.location.origin}/shared-record/${qrCodeId}`;
};

// Get a record by QR code ID
export const getRecordByQRCode = async (qrCodeId: string, accessorId?: string) => {
  try {
    // Get the QR code
    const { data: qrCode, error: qrError } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('id', qrCodeId)
      .single();
    
    if (qrError) throw qrError;
    
    // Check if the QR code has expired
    if (new Date(qrCode.expires_at) < new Date()) {
      throw new Error('QR code has expired');
    }
    
    // Check if the QR code has been revoked
    if (qrCode.is_revoked) {
      throw new Error('QR code has been revoked');
    }
    
    // Get the record
    const { data: record, error: recordError } = await supabase
      .from('health_records')
      .select('*')
      .eq('id', qrCode.record_id)
      .single();
    
    if (recordError) throw recordError;
    
    // Log the access
    if (accessorId) {
      await supabase
        .from('qr_code_access')
        .insert({
          qr_code_id: qrCodeId,
          accessed_by: accessorId,
        });
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
    
    if (qrError) throw qrError;
    
    // Update the QR code to revoke it
    const { error } = await supabase
      .from('qr_codes')
      .update({ is_revoked: true })
      .eq('id', qrCodeId);
    
    if (error) throw error;
    
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
    const { data, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('id', qrCodeId)
      .single();
    
    if (error) return false;
    
    // Check if expired or revoked
    return new Date(data.expires_at) > new Date() && !data.is_revoked;
  } catch (error) {
    return false;
  }
};
