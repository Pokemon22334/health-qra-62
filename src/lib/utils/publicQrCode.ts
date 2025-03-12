
import { supabase } from '@/lib/supabase';

export const getPublicQRCodeById = async (qrId: string) => {
  try {
    console.log('Getting public QR code by ID:', qrId);
    
    const { data, error } = await supabase
      .from('public_qr_codes')
      .select('*')
      .eq('id', qrId)
      .maybeSingle(); // Use maybeSingle instead of single to prevent errors
    
    if (error) {
      console.error('Error getting public QR code:', error);
      throw new Error('Failed to load the QR code details');
    }
    
    if (!data) {
      console.warn('No QR code found with ID:', qrId);
      throw new Error('QR code not found');
    }

    console.log('QR code retrieved:', data);
    return data;
  } catch (error: any) {
    console.error('Error in getPublicQRCodeById:', error.message);
    throw error;
  }
};

export const getPublicRecordsByQRId = async (qrId: string) => {
  try {
    console.log('Getting public records by QR ID:', qrId);
    
    // Check if QR code exists first
    try {
      await getPublicQRCodeById(qrId);
    } catch (error) {
      console.error('QR Code does not exist or is invalid:', error);
      throw new Error('This shared link is invalid or has expired');
    }
    
    // Get the public medical records associated with the QR code
    const { data: publicRecords, error: recordsError } = await supabase
      .from('public_medical_records')
      .select('*')
      .eq('qr_id', qrId);
    
    if (recordsError) {
      console.error('Error getting public records:', recordsError);
      throw new Error('Failed to load the shared records');
    }
    
    if (!publicRecords || publicRecords.length === 0) {
      console.warn('No public records found for QR ID:', qrId);
      return [];
    }
    
    console.log('Number of public records found:', publicRecords.length);
    
    // Get the actual health records based on the record_ids
    const recordIds = publicRecords.map(pr => pr.record_id);
    
    const { data: healthRecords, error: healthRecordsError } = await supabase
      .from('health_records')
      .select('*')
      .in('id', recordIds);
    
    if (healthRecordsError) {
      console.error('Error getting health records:', healthRecordsError);
      throw new Error('Failed to load the actual health records');
    }
    
    console.log('Retrieved health records:', healthRecords?.length || 0);
    return healthRecords || [];
  } catch (error: any) {
    console.error('Error in getPublicRecordsByQRId:', error.message);
    throw error;
  }
};

export const createPublicQRCode = async (userId: string, label?: string, expiresAt?: Date) => {
  try {
    console.log('Creating public QR code for user:', userId);
    
    const { data, error } = await supabase
      .from('public_qr_codes')
      .insert([
        {
          user_id: userId,
          label: label || 'My Medical Records',
          expires_at: expiresAt ? expiresAt.toISOString() : null
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating public QR code:', error);
      throw new Error('Failed to create QR code');
    }
    
    console.log('Created new public QR code:', data);
    return data;
  } catch (error: any) {
    console.error('Error in createPublicQRCode:', error.message);
    throw error;
  }
};

export const linkRecordToPublicQR = async (qrId: string, userId: string, recordId: string) => {
  try {
    console.log('Linking record to public QR:', { qrId, userId, recordId });
    
    // First check if the record is already linked
    const { data: existingLinks, error: checkError } = await supabase
      .from('public_medical_records')
      .select('*')
      .eq('qr_id', qrId)
      .eq('record_id', recordId);
    
    if (checkError) {
      console.error('Error checking existing links:', checkError);
      throw new Error('Failed to check if record is already shared');
    }
    
    // If the record is already linked, skip
    if (existingLinks && existingLinks.length > 0) {
      console.log('Record already linked to QR code');
      return existingLinks[0];
    }
    
    // Create new link
    const { data, error } = await supabase
      .from('public_medical_records')
      .insert([
        {
          qr_id: qrId,
          user_id: userId,
          record_id: recordId
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Error linking record to public QR:', error);
      throw new Error('Failed to share record');
    }
    
    console.log('Successfully linked record to QR code:', data);
    return data;
  } catch (error: any) {
    console.error('Error in linkRecordToPublicQR:', error.message);
    throw error;
  }
};

export const unlinkRecordFromPublicQR = async (qrId: string, recordId: string) => {
  try {
    console.log('Unlinking record from public QR:', { qrId, recordId });
    
    const { data, error } = await supabase
      .from('public_medical_records')
      .delete()
      .eq('qr_id', qrId)
      .eq('record_id', recordId)
      .select();
    
    if (error) {
      console.error('Error unlinking record from public QR:', error);
      throw new Error('Failed to remove shared access');
    }
    
    console.log('Successfully unlinked record from QR code');
    return true;
  } catch (error: any) {
    console.error('Error in unlinkRecordFromPublicQR:', error.message);
    throw error;
  }
};

export const getQRCodesForUser = async (userId: string) => {
  try {
    console.log('Getting QR codes for user:', userId);
    
    const { data, error } = await supabase
      .from('public_qr_codes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error getting QR codes for user:', error);
      throw new Error('Failed to load your QR codes');
    }
    
    console.log('Retrieved QR codes:', data?.length || 0);
    return data || [];
  } catch (error: any) {
    console.error('Error in getQRCodesForUser:', error.message);
    throw error;
  }
};

export const getRecordsLinkedToQR = async (qrId: string) => {
  try {
    console.log('Getting records linked to QR:', qrId);
    
    const { data: publicRecords, error: publicError } = await supabase
      .from('public_medical_records')
      .select('*')
      .eq('qr_id', qrId);
    
    if (publicError) {
      console.error('Error getting public records for QR:', publicError);
      throw new Error('Failed to load shared records');
    }
    
    if (!publicRecords || publicRecords.length === 0) {
      console.log('No records linked to QR code');
      return [];
    }
    
    const recordIds = publicRecords.map(pr => pr.record_id);
    
    const { data: records, error: recordsError } = await supabase
      .from('health_records')
      .select('*')
      .in('id', recordIds);
    
    if (recordsError) {
      console.error('Error getting health records:', recordsError);
      throw new Error('Failed to load the health records details');
    }
    
    console.log('Retrieved linked records:', records?.length || 0);
    return records || [];
  } catch (error: any) {
    console.error('Error in getRecordsLinkedToQR:', error.message);
    throw error;
  }
};
