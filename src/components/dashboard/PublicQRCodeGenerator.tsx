import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  createPublicQRCode,
  getQRCodesForUser,
  unlinkRecordFromPublicQR
} from '@/lib/utils/publicQrCode';
import QRCodeComponent from '@/components/qr/QRCodeComponent';
import { QRCodesList } from '@/components/qr/QRCodesList';

const PublicQRCodeGenerator = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [qrCodes, setQRCodes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchQRCodes();
    }
  }, [user]);

  const fetchQRCodes = async () => {
    setIsLoading(true);
    try {
      const codes = await getQRCodesForUser(user.id);
      setQRCodes(codes);
    } catch (error: any) {
      toast({
        title: 'Error fetching QR codes',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateQRCode = async () => {
    setIsCreating(true);
    try {
      const newQRCode = await createPublicQRCode(user.id);
      setQRCodes(prevQRCodes => [...prevQRCodes, newQRCode]);
      toast({
        title: 'QR Code Created',
        description: 'New public QR code has been successfully created.',
      });
    } catch (error: any) {
      toast({
        title: 'Error creating QR code',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleUnlinkRecord = async (qrId: string, recordId: string) => {
    setIsLoading(true);
    try {
      await unlinkRecordFromPublicQR(qrId, recordId);
      toast({
        title: 'Record Unlinked',
        description: 'Record has been successfully unlinked from the QR code.',
      });
      fetchQRCodes(); // Refresh QR codes to reflect changes
    } catch (error: any) {
      toast({
        title: 'Error unlinking record',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Public QR Codes</h2>
        <Button onClick={handleCreateQRCode} disabled={isCreating}>
          {isCreating ? 'Creating...' : 'Create New QR Code'}
        </Button>
      </div>

      {isLoading ? (
        <p>Loading QR Codes...</p>
      ) : (
        <QRCodesList
          qrCodes={qrCodes}
          onUnlinkRecord={handleUnlinkRecord}
          isLoading={isLoading}
          fetchQRCodes={fetchQRCodes}
        />
      )}
    </div>
  );
};

export default PublicQRCodeGenerator;
