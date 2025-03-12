
import { supabase } from '@/lib/supabase';

// Upload file to storage bucket
export const uploadFileToStorage = async (
  file: File,
  userId: string,
  folderName = 'medical_records'
) => {
  try {
    // Create file path using user ID and timestamp for uniqueness
    const filePath = `${userId}/${Date.now()}_${file.name}`;
    
    // Upload file to storage
    const { data, error } = await supabase.storage
      .from(folderName)
      .upload(filePath, file);
    
    if (error) throw error;
    
    // Get public URL for the file
    const { data: publicUrlData } = supabase.storage
      .from(folderName)
      .getPublicUrl(filePath);
    
    return {
      filePath,
      publicUrl: publicUrlData.publicUrl
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Delete file from storage bucket
export const deleteFileFromStorage = async (
  filePath: string,
  folderName = 'medical_records'
) => {
  try {
    const { error } = await supabase.storage
      .from(folderName)
      .remove([filePath]);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

// Extract file path from public URL
export const getFilePathFromUrl = (url: string): string | null => {
  try {
    // Parse URL to extract file path
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/');
    
    // Get the last segments which should be the file path
    // Format: /storage/v1/object/public/bucket_name/userId/timestamp_filename
    const relevantPath = pathSegments.slice(5).join('/'); // Skip the initial storage parts
    
    return relevantPath;
  } catch (error) {
    console.error('Error extracting file path from URL:', error);
    return null;
  }
};
