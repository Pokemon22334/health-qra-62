
import { useState } from 'react';
import { Clock, Lock, Copy, Check, Share2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

type QRCodeProps = {
  userName?: string;
};

const QRCode = ({ userName = "John Doe" }: QRCodeProps) => {
  const [copied, setCopied] = useState(false);
  const [accessDuration, setAccessDuration] = useState('24h');
  const [fullAccess, setFullAccess] = useState(false);
  
  const handleCopy = () => {
    // In a real app, this would copy a sharing URL
    setCopied(true);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleRegenerateQR = () => {
    toast.success('QR Code regenerated');
    // In a real app, this would generate a new QR code
  };

  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden shadow-md">
      <CardHeader className="bg-gradient-to-r from-medivault-600 to-medivault-700 text-white">
        <CardTitle className="flex items-center justify-between">
          <span>Access QR Code</span>
          <Lock size={18} />
        </CardTitle>
        <CardDescription className="text-medivault-100">
          Share this QR code with healthcare providers
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="bg-gray-50 rounded-lg p-5 flex items-center justify-center mb-6">
          {/* This would be a real QR code in production */}
          <div className="w-48 h-48 relative">
            <svg viewBox="0 0 100 100" className="w-full h-full text-medivault-800">
              <path fillRule="evenodd" clipRule="evenodd" d="M30 30H40V40H30V30ZM50 30H60V40H50V30ZM30 50H40V60H30V50ZM60 50H70V60H60V50ZM50 50H60V60H50V50ZM30 70H40V80H30V70Z" fill="currentColor" />
              <rect x="30" y="30" width="40" height="50" stroke="currentColor" strokeWidth="4" />
            </svg>
            
            {/* Center logo */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <div className="w-8 h-8 bg-medivault-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold text-xs">M</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock size={16} />
              <span>Access Duration</span>
            </div>
            <Select value={accessDuration} onValueChange={setAccessDuration}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="24 hours" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">1 hour</SelectItem>
                <SelectItem value="6h">6 hours</SelectItem>
                <SelectItem value="24h">24 hours</SelectItem>
                <SelectItem value="48h">48 hours</SelectItem>
                <SelectItem value="7d">7 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Share2 size={16} />
              <span>Full Record Access</span>
            </div>
            <Switch 
              checked={fullAccess}
              onCheckedChange={setFullAccess}
            />
          </div>
          
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md">
            <p>
              This QR code was generated for <span className="font-medium text-gray-700">{userName}</span> and 
              will expire in <span className="font-medium text-gray-700">
                {accessDuration === '1h' ? '1 hour' :
                 accessDuration === '6h' ? '6 hours' :
                 accessDuration === '24h' ? '24 hours' :
                 accessDuration === '48h' ? '48 hours' : '7 days'}
              </span>.
            </p>
          </div>
        </div>
      </CardContent>
      
      <Separator />
      
      <CardFooter className="flex justify-between p-4">
        <Button variant="outline" size="sm" onClick={handleRegenerateQR}>
          <RefreshCw size={14} className="mr-1" />
          Regenerate
        </Button>
        <Button size="sm" onClick={handleCopy}>
          {copied ? (
            <>
              <Check size={14} className="mr-1" />
              Copied
            </>
          ) : (
            <>
              <Copy size={14} className="mr-1" />
              Copy Link
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QRCode;
