import { supabase } from '@/lib/supabase';

export const generateQRCode = async (recordId: string, userId: string, expiryHours: number = 24) => {
  try {
    console.log('Generating QR code for record:', recordId, 'by user:', userId);
    
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + expiryHours);
    
    const { data, error } = await supabase
      .from('qr_codes')
      .insert({
        record_id: recordId,
        created_by: userId,
        expires_at: expiryDate.toISOString(),
        is_revoked: false,
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
    
    const shareableUrl = generateShareableLink(data.id);
    
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

export const generateShareableLink = (qrCodeId: string): string => {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://medivault.app';
  return `${origin}/shared-record/${qrCodeId}`;
};

export const getRecordByQRCode = async (qrCodeId: string, accessorId?: string) => {
  try {
    console.log('Fetching record for QR code:', qrCodeId);
    
    if (!qrCodeId) {
      throw new Error('No QR code ID provided');
    }
    
    const { data: qrCodes, error: qrError } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('id', qrCodeId);
    
    if (qrError) {
      console.error('Error fetching QR code:', qrError);
      throw new Error('QR code not found or invalid');
    }
    
    if (!qrCodes || qrCodes.length === 0) {
      console.error('QR code not found');
      throw new Error('QR code not found');
    }
    
    const qrCode = qrCodes[0];
    
    const expiresAt = qrCode.expires_at ? new Date(qrCode.expires_at) : null;
    if (expiresAt && expiresAt < new Date()) {
      console.error('QR code expired:', qrCode.expires_at);
      throw new Error('QR code has expired');
    }
    
    if (qrCode.is_revoked) {
      console.error('QR code has been revoked');
      throw new Error('QR code has been revoked');
    }
    
    console.log('QR code valid, fetching record:', qrCode.record_id);
    
    const { data: records, error: recordError } = await supabase
      .from('health_records')
      .select('*')
      .eq('id', qrCode.record_id);
    
    if (recordError) {
      console.error('Error fetching record:', recordError);
      throw new Error('The requested medical record could not be found');
    }
    
    if (!records || records.length === 0) {
      console.error('Record not found');
      throw new Error('The requested medical record could not be found');
    }
    
    const record = records[0];

    if (record.file_url) {
      try {
        const fileUrlParts = record.file_url.split('/');
        const fileName = fileUrlParts[fileUrlParts.length - 1];
        
        await supabase.storage
          .from('medical_records')
          .download(fileName);
      } catch (fileError) {
        console.error('Error verifying file access:', fileError);
        console.warn('File may not be accessible:', record.file_url);
      }
    }
    
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
        console.error('Failed to log access:', accessError);
      }
    } else {
      console.log('Anonymous access - no user ID provided');
      try {
        await supabase
          .from('qr_code_access')
          .insert({
            qr_code_id: qrCodeId,
            accessed_by: null,
          });
      } catch (anonAccessError) {
        console.error('Failed to log anonymous access:', anonAccessError);
      }
    }
    
    return record;
  } catch (error) {
    console.error('Error getting record by QR code:', error);
    throw error;
  }
};

export const revokeQRCode = async (qrId: string, userId: string) => {
  try {
    const { data: qrCode, error: qrError } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('id', qrId)
      .eq('created_by', userId)
      .maybeSingle();
    
    if (qrError || !qrCode) {
      console.error('Error fetching QR code for revocation:', qrError);
      throw new Error('QR code not found or you do not have permission to revoke it');
    }
    
    const { error: updateError } = await supabase
      .from('qr_codes')
      .update({ is_revoked: true })
      .eq('id', qrId)
      .eq('created_by', userId);
    
    if (updateError) {
      console.error('Error revoking QR code:', updateError);
      throw updateError;
    }
    
    console.log('QR code revoked successfully:', qrId);
    return true;
  } catch (error) {
    console.error('Error revoking QR code:', error);
    throw error;
  }
};

export const deleteQRCode = async (qrId: string, userId: string) => {
  try {
    const { data: qrCode, error: qrError } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('id', qrId)
      .eq('created_by', userId)
      .maybeSingle();
    
    if (qrError || !qrCode) {
      console.error('Error fetching QR code:', qrError);
      throw new Error('QR code not found or you do not have permission to delete it');
    }
    
    const { error: accessLogError } = await supabase
      .from('qr_code_access')
      .delete()
      .eq('qr_code_id', qrId);
    
    if (accessLogError) {
      console.error('Error deleting access logs:', accessLogError);
    }
    
    const { error: deleteError } = await supabase
      .from('qr_codes')
      .delete()
      .eq('id', qrId)
      .eq('created_by', userId);
    
    if (deleteError) {
      console.error('Error deleting QR code:', deleteError);
      throw deleteError;
    }
    
    console.log('QR code deleted successfully:', qrId);
    return true;
  } catch (error) {
    console.error('Error deleting QR code:', error);
    throw error;
  }
};

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

export const formatExpirationTime = (date: string): string => {
  const expirationDate = new Date(date);
  return expirationDate.toLocaleString();
};

export const isQRCodeValid = async (qrCodeId: string): Promise<boolean> => {
  try {
    console.log('Checking if QR code is valid:', qrCodeId);
    
    const { data, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('id', qrCodeId);
    
    if (error) {
      console.error('Error checking QR code validity:', error);
      return false;
    }
    
    if (!data || data.length === 0) {
      console.error('QR code not found');
      return false;
    }
    
    const qrCode = data[0];
    
    const expiresAt = new Date(qrCode.expires_at);
    const now = new Date();
    const isExpired = expiresAt < now;
    const isValid = !isExpired && !qrCode.is_revoked;
    
    console.log('QR code valid?', isValid, 'Expires:', qrCode.expires_at, 'Revoked:', qrCode.is_revoked);
    console.log('Current time:', now.toISOString(), 'Expiry time:', expiresAt.toISOString());
    
    return isValid;
  } catch (error) {
    console.error('Exception checking QR code validity:', error);
    return false;
  }
};

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

