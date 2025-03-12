
import { supabase } from '@/lib/supabase';

export const getUserPermanentQR = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_permanent_qr')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) throw error;
    
    if (data) {
      // Generate shareable URL and QR code image URL
      const shareableUrl = generateLiveQRLink(data.id);
      const qrImageUrl = generateQRImageUrl(data.id);
      
      return {
        ...data,
        shareableUrl,
        qrImageUrl
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user permanent QR:', error);
    throw error;
  }
};

export const generateLiveQRLink = (qrId: string): string => {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://medivault.app';
  return `${origin}/live-profile/${qrId}`;
};

export const generateQRImageUrl = (qrId: string): string => {
  const shareableUrl = generateLiveQRLink(qrId);
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shareableUrl)}`;
};
