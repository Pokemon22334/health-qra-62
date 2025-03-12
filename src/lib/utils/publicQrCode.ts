
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
        expires_at: expiresAt ? expiresAt.toISOString() : null
      })
      .select()
      .single();
    
    if (qrError) {
      console.error('Error creating public QR code:', qrError);
      throw qrError;
    }
    
    if (!qrCode) {
      throw new Error('Failed to create QR code');
    }
    
    console.log('QR code created successfully:', qrCode);
    
    // Get all health records for the user
    const { data: records, error: recordsError } = await supabase
      .from('health_records')
      .select('id')
      .eq('user_id', userId);
    
    if (recordsError) {
      console.error('Error fetching user records:', recordsError);
      throw recordsError;
    }
    
    console.log('Found records to link to QR code:', records?.length || 0);
    
    // If user has records, link them to the QR code
    if (records && records.length > 0) {
      // Process each record individually to avoid type errors
      const linkErrorMessages = [];
      
      for (const record of records) {
        const { error: linkError } = await supabase
          .from('public_medical_records')
          .insert({
            qr_id: qrCode.id,
            user_id: userId,
            record_id: record.id
          });
        
        if (linkError) {
          console.error('Error linking record to QR code:', linkError);
          linkErrorMessages.push(linkError.message);
        }
      }
      
      if (linkErrorMessages.length > 0) {
        console.warn(`Failed to link ${linkErrorMessages.length} records. First error: ${linkErrorMessages[0]}`);
      } else {
        console.log('Successfully linked records to QR code');
      }
    }
    
    // Generate shareable URL and QR code
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
    console.log('Getting QR code details for:', qrId);
    const { data, error } = await supabase
      .from('public_qr_codes')
      .select('*')
      .eq('id', qrId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching QR code:', error);
      throw error;
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
    console.log('Fetching public records for QR ID:', qrId);
    
    if (!qrId) {
      throw new Error('QR code ID is required');
    }
    
    // First verify the QR code is active and not expired
    const { data: qrCode, error: qrError } = await supabase
      .from('public_qr_codes')
      .select('*')
      .eq('id', qrId)
      .eq('is_active', true)
      .maybeSingle();
    
    if (qrError) {
      console.error('Error fetching QR code:', qrError);
      throw new Error('Error retrieving QR code information');
    }
    
    if (!qrCode) {
      console.error('QR code not found or inactive:', qrId);
      throw new Error('QR code not found or inactive');
    }
    
    // Check expiration
    const expiresAt = qrCode?.expires_at ? new Date(qrCode.expires_at) : null;
    if (expiresAt && expiresAt < new Date()) {
      console.error('QR code has expired:', qrId, expiresAt);
      throw new Error('QR code has expired');
    }
    
    console.log('QR code is valid, fetching linked records');
    
    // Get all record IDs linked to this QR code
    const { data: publicRecords, error: linkError } = await supabase
      .from('public_medical_records')
      .select('record_id')
      .eq('qr_id', qrId);
    
    if (linkError) {
      console.error('Error fetching record links:', linkError);
      throw linkError;
    }
    
    if (!publicRecords || publicRecords.length === 0) {
      console.log('No records found for QR code:', qrId);
      return [];
    }
    
    // Extract record IDs
    const recordIds = publicRecords.map(record => record.record_id);
    console.log('Found record IDs:', recordIds);
    
    // Get the actual health records
    const { data: records, error: recordsError } = await supabase
      .from('health_records')
      .select('*')
      .in('id', recordIds)
      .order('created_at', { ascending: false });
    
    if (recordsError) {
      console.error('Error fetching health records:', recordsError);
      throw recordsError;
    }
    
    console.log('Successfully retrieved', records?.length || 0, 'records');
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
    
    if (error) {
      console.error('Error deactivating QR code:', error);
      throw error;
    }
    
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
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user QR codes:', error);
      throw error;
    }
    
    if (!data) return [];
    
    // Process each QR code to add additional information
    const processedQrCodes = [];
    
    for (const qr of data) {
      // For each QR code, count the associated records
      const { data: recordLinks, error: countError } = await supabase
        .from('public_medical_records')
        .select('id')
        .eq('qr_id', qr.id);
      
      const recordCount = recordLinks?.length || 0;
      
      // Check if expired
      const expiresAt = qr.expires_at ? new Date(qr.expires_at) : null;
      const isExpired = expiresAt ? expiresAt < new Date() : false;
      
      // Generate shareable link and QR image URL
      const shareableUrl = generatePublicShareableLink(qr.id);
      const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareableUrl)}`;
      
      processedQrCodes.push({
        ...qr,
        recordCount,
        isExpired,
        shareableUrl,
        qrImageUrl
      });
    }
    
    return processedQrCodes;
  } catch (error) {
    console.error('Error getting user public QR codes:', error);
    throw error;
  }
};
