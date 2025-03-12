
import { supabase } from '@/lib/supabase';

// Generate a public QR code for all user's health records
export const generatePublicQRCode = async (userId: string, label?: string, expiryDays?: number) => {
  try {
    console.log('Generating public QR code for user:', userId);
    
    // Calculate expiry time if provided
    let expiresAt = null;
    if (expiryDays) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiryDays);
    }
    
    // Create a new public QR code record
    const { data: qrCode, error: qrError } = await supabase
      .from('public_qr_codes')
      .insert({
        user_id: userId,
        label: label || 'My Medical Records',
        expires_at: expiresAt
      })
      .select()
      .single();
    
    if (qrError) {
      console.error('Error creating public QR code:', qrError);
      throw qrError;
    }
    
    // Get all health records for the user
    const { data: records, error: recordsError } = await supabase
      .from('health_records')
      .select('id')
      .eq('user_id', userId);
    
    if (recordsError) {
      console.error('Error fetching user records:', recordsError);
      throw recordsError;
    }
    
    // If user has records, link them to the QR code
    if (records && records.length > 0) {
      const publicRecords = records.map(record => ({
        qr_id: qrCode.id,
        user_id: userId,
        record_id: record.id
      }));
      
      // Insert links between QR code and records
      const { error: linkError } = await supabase
        .from('public_medical_records')
        .insert(publicRecords);
      
      if (linkError) {
        console.error('Error linking records to QR code:', linkError);
        throw linkError;
      }
    }
    
    // Generate shareabe URL and QR code
    const shareableUrl = generatePublicShareableLink(qrCode.id);
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareableUrl)}`;
    
    return {
      qrCode,
      qrImageUrl,
      shareableUrl,
      recordCount: records?.length || 0
    };
  } catch (error) {
    console.error('Error generating public QR code:', error);
    throw error;
  }
};

// Get a public QR code by ID
export const getPublicQRCodeById = async (qrId: string) => {
  try {
    console.log('Getting public QR code by ID:', qrId);
    
    const { data, error } = await supabase
      .from('public_qr_codes')
      .select('*')
      .eq('id', qrId)
      .maybeSingle(); // Using maybeSingle instead of single to avoid error if no record found
    
    if (error) {
      console.error('Error fetching QR code:', error);
      throw error;
    }
    
    if (!data) {
      console.error('No QR code found with ID:', qrId);
      throw new Error('QR code not found');
    }
    
    return data;
  } catch (error) {
    console.error('Error getting public QR code:', error);
    throw error;
  }
};

// Get all records shared via a public QR code
export const getPublicRecordsByQRId = async (qrId: string) => {
  try {
    console.log('Getting public records by QR ID:', qrId);
    
    // First verify the QR code is active and not expired
    const { data: qrCode, error: qrError } = await supabase
      .from('public_qr_codes')
      .select('*')
      .eq('id', qrId)
      .eq('is_active', true)
      .maybeSingle(); // Using maybeSingle instead of single
    
    if (qrError) {
      console.error('Error checking QR code:', qrError);
      throw qrError;
    }
    
    if (!qrCode) {
      console.error('QR code not found or inactive:', qrId);
      throw new Error('QR code not found or inactive');
    }
    
    // Check expiration
    if (qrCode.expires_at && new Date(qrCode.expires_at) < new Date()) {
      console.error('QR code has expired:', qrId);
      throw new Error('QR code has expired');
    }
    
    // Get all record IDs linked to this QR code
    const { data: publicRecords, error: linkError } = await supabase
      .from('public_medical_records')
      .select('record_id')
      .eq('qr_id', qrId);
    
    if (linkError) {
      console.error('Error fetching public record links:', linkError);
      throw linkError;
    }
    
    if (!publicRecords || publicRecords.length === 0) {
      console.log('No records found for QR code:', qrId);
      return [];
    }
    
    // Get the actual health records
    const recordIds = publicRecords.map(record => record.record_id);
    const { data: records, error: recordsError } = await supabase
      .from('health_records')
      .select('*')
      .in('id', recordIds)
      .order('created_at', { ascending: false });
    
    if (recordsError) {
      console.error('Error fetching health records:', recordsError);
      throw recordsError;
    }
    
    return records || [];
  } catch (error) {
    console.error('Error getting public records by QR ID:', error);
    throw error;
  }
};

// Generate a shareable link for a public QR code
export const generatePublicShareableLink = (qrId: string): string => {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://medivault.app';
  return `${origin}/public-records/${qrId}`;
};

// Deactivate a public QR code
export const deactivatePublicQRCode = async (qrId: string, userId: string) => {
  try {
    const { error } = await supabase
      .from('public_qr_codes')
      .update({ is_active: false })
      .eq('id', qrId)
      .eq('user_id', userId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deactivating public QR code:', error);
    throw error;
  }
};

// Get all public QR codes for a user
export const getUserPublicQRCodes = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('public_qr_codes')
      .select(`
        *,
        public_medical_records:public_medical_records(count)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(qr => ({
      ...qr,
      recordCount: Array.isArray(qr.public_medical_records) ? qr.public_medical_records.length : 0,
      isExpired: qr.expires_at && new Date(qr.expires_at) < new Date(),
      shareableUrl: generatePublicShareableLink(qr.id),
      qrImageUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(generatePublicShareableLink(qr.id))}`
    }));
  } catch (error) {
    console.error('Error getting user public QR codes:', error);
    throw error;
  }
};
