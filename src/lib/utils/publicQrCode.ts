import { supabase } from '@/lib/supabase';

// Update the function signature to include emergency profile
export const generatePublicQRCode = async (
  userId: string, 
  label?: string, 
  expiryDays?: number, 
  specificRecordIds: string[] = [],
  includeEmergencyProfile: boolean = false
) => {
  try {
    console.log('Generating public QR code for user:', userId);
    const hasSpecificRecords = specificRecordIds.length > 0;
    
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
        expires_at: expiresAt ? expiresAt.toISOString() : null,
        include_emergency_profile: includeEmergencyProfile
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
    
    // Get health records for the user based on specific record IDs or all records
    let records;
    let recordsError;
    
    if (hasSpecificRecords) {
      console.log('Fetching specific records:', specificRecordIds);
      const { data, error } = await supabase
        .from('health_records')
        .select('id')
        .eq('user_id', userId)
        .in('id', specificRecordIds);
      records = data;
      recordsError = error;
    } else {
      console.log('Fetching all user records');
      const { data, error } = await supabase
        .from('health_records')
        .select('id')
        .eq('user_id', userId);
      records = data;
      recordsError = error;
    }
    
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
      recordCount: records?.length || 0,
      includesEmergencyProfile: includeEmergencyProfile
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
    
    // Extract record IDs
    const recordIds = publicRecords?.map(record => record.record_id) || [];
    console.log('Found record IDs:', recordIds);
    
    let records = [];
    if (recordIds.length > 0) {
      // Get the actual health records
      const { data: healthRecords, error: recordsError } = await supabase
        .from('health_records')
        .select('*')
        .in('id', recordIds)
        .order('created_at', { ascending: false });
      
      if (recordsError) {
        console.error('Error fetching health records:', recordsError);
        throw recordsError;
      }
      
      records = healthRecords || [];
      console.log('Successfully retrieved', records.length, 'records');
      
      // Ensure file URLs are publicly accessible
      if (records.length > 0) {
        // Process each record to ensure public URL access
        for (let i = 0; i < records.length; i++) {
          const record = records[i];
          
          // Check if file_url contains a supabase storage URL
          if (record.file_url && record.file_url.includes('storage/v1/object/public')) {
            // URL is already public, no need to modify
            console.log('Record has public URL:', record.id);
          } else if (record.file_url && record.file_url.includes('storage/v1/object/sign')) {
            // Convert signed URL to public URL if needed
            try {
              const filePathMatch = record.file_url.match(/\/storage\/v1\/object\/sign\/([^?]+)/);
              if (filePathMatch && filePathMatch[1]) {
                const filePath = filePathMatch[1];
                const publicUrl = supabase.storage.from('medical_records').getPublicUrl(filePath).data.publicUrl;
                records[i] = { ...record, file_url: publicUrl };
                console.log('Converted to public URL:', record.id);
              }
            } catch (urlError) {
              console.error('Error converting to public URL:', urlError);
              // Keep the original URL if conversion fails
            }
          }
        }
      }
    }
    
    // Check if emergency profile is included
    let emergencyProfile = null;
    if (qrCode.include_emergency_profile) {
      console.log('Fetching emergency profile for user:', qrCode.user_id);
      
      try {
        const { data: profile, error: profileError } = await supabase
          .from('emergency_profiles')
          .select('*')
          .eq('user_id', qrCode.user_id)
          .maybeSingle();
          
        if (profileError) {
          console.error('Error fetching emergency profile:', profileError);
        } else if (profile) {
          emergencyProfile = profile;
          console.log('Emergency profile found');
        }
      } catch (profileError) {
        console.error('Exception fetching emergency profile:', profileError);
      }
    }
    
    return {
      records: records || [],
      emergencyProfile
    };
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

// Delete a public QR code (changed from deactivate)
export const deletePublicQRCode = async (qrId: string, userId: string) => {
  try {
    // Verify ownership first
    const { data: qrCode, error: verifyError } = await supabase
      .from('public_qr_codes')
      .select('id')
      .eq('id', qrId)
      .eq('user_id', userId)
      .single();
      
    if (verifyError || !qrCode) {
      console.error('Error verifying QR code ownership:', verifyError);
      throw new Error('QR code not found or you do not have permission to delete it');
    }
    
    // Delete related records first (to maintain referential integrity)
    const { error: linkError } = await supabase
      .from('public_medical_records')
      .delete()
      .eq('qr_id', qrId);
      
    if (linkError) {
      console.error('Error deleting QR code record links:', linkError);
      // Continue with deletion attempt even if link deletion fails
    }
    
    // Delete the QR code
    const { error } = await supabase
      .from('public_qr_codes')
      .delete()
      .eq('id', qrId)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error deleting QR code:', error);
      throw error;
    }
    
    console.log('Public QR code deleted successfully:', qrId);
    return true;
  } catch (error) {
    console.error('Error deleting public QR code:', error);
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
