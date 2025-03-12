
import { Button } from '@/components/ui/button';
import { QrCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LiveQRButton = () => {
  const navigate = useNavigate();
  
  return (
    <Button 
      variant="outline"
      className="w-full bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100 transition"
      onClick={() => navigate('/live-qr')}
    >
      <QrCode className="mr-2 h-5 w-5" />
      My Live QR Code
    </Button>
  );
};

export default LiveQRButton;
