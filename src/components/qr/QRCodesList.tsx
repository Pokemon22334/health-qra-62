
import React, { useState, useEffect } from 'react';
import { QrCode, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQRCodes } from '@/hooks/use-qr-codes';
import QRCodeComponent from '@/components/qr/QRCodeComponent';

const QRCodesList = () => {
  const { getQRCodes, isLoading } = useQRCodes();
  const [qrCodes, setQRCodes] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchQRCodes = async () => {
    try {
      setIsRefreshing(true);
      const data = await getQRCodes();
      setQRCodes(data || []);
    } catch (error) {
      console.error('Error fetching QR codes:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchQRCodes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => {
    fetchQRCodes();
  };

  const handleRevoke = () => {
    fetchQRCodes();
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <QrCode className="h-6 w-6 text-medivault-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-800">Shared QR Codes</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading || isRefreshing}
        >
          {isRefreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </div>

      {isLoading && !isRefreshing ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-medivault-600 animate-spin mb-4" />
          <p className="text-gray-600">Loading QR codes...</p>
        </div>
      ) : qrCodes.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-gray-700 font-medium mb-1">No QR Codes Yet</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-4">
            You haven't shared any medical records using QR codes. Share a record to generate a QR code.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {qrCodes.map((qrCode) => (
            <QRCodeComponent
              key={qrCode.id}
              qrCode={qrCode}
              onRevoke={handleRevoke}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default QRCodesList;
