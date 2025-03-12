
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { QrCode, Download, Share2, Copy, Loader2, Trash2, Clock } from 'lucide-react';
import { generatePublicQRCode, getUserPublicQRCodes, deactivatePublicQRCode } from '@/lib/utils/publicQrCode';

const PublicQRCodeGenerator = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userQRCodes, setUserQRCodes] = useState<any[]>([]);
  const [qrCodeData, setQrCodeData] = useState<any>(null);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [qrFormOpen, setQrFormOpen] = useState(false);
  const [qrLabel, setQrLabel] = useState('My Medical Records');
  const [expiry, setExpiry] = useState('never');
  const [customDays, setCustomDays] = useState(30);

  // Load user's existing QR codes
  const loadUserQRCodes = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const codes = await getUserPublicQRCodes(user.id);
      setUserQRCodes(codes);
    } catch (error) {
      console.error('Error loading QR codes:', error);
      toast({
        title: 'Failed to load QR codes',
        description: 'Could not retrieve your existing QR codes.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate a new public QR code
  const handleGenerateQR = async () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'You must be logged in to generate QR codes.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsGenerating(true);
      
      // Calculate expiry days
      let expiryDays: number | undefined = undefined;
      if (expiry === '7') expiryDays = 7;
      if (expiry === '30') expiryDays = 30;
      if (expiry === '90') expiryDays = 90;
      if (expiry === 'custom') expiryDays = customDays;
      
      const data = await generatePublicQRCode(user.id, qrLabel, expiryDays);
      setQrCodeData(data);
      setShowQRDialog(true);
      setQrFormOpen(false);
      
      // Refresh the list
      await loadUserQRCodes();
      
      toast({
        title: 'QR code generated',
        description: `Your public QR code for ${data.recordCount} records has been created.`,
      });
    } catch (error: any) {
      console.error('Error generating QR code:', error);
      toast({
        title: 'Failed to generate QR code',
        description: error.message || 'An error occurred while generating the QR code.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Deactivate a QR code
  const handleDeactivateQR = async (qrId: string) => {
    if (!user) return;
    
    try {
      await deactivatePublicQRCode(qrId, user.id);
      
      // Update the local state
      setUserQRCodes(prev => 
        prev.map(qr => qr.id === qrId ? { ...qr, is_active: false } : qr)
      );
      
      toast({
        title: 'QR code deactivated',
        description: 'The QR code has been deactivated and is no longer accessible.',
      });
    } catch (error: any) {
      console.error('Error deactivating QR code:', error);
      toast({
        title: 'Failed to deactivate QR code',
        description: error.message || 'An error occurred while deactivating the QR code.',
        variant: 'destructive',
      });
    }
  };

  // Download QR code as image
  const handleDownloadQR = (qrImageUrl: string, label: string) => {
    const link = document.createElement('a');
    link.href = qrImageUrl;
    link.download = `${label.replace(/\s+/g, '-').toLowerCase()}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy shareable link to clipboard
  const handleCopyLink = (shareableUrl: string) => {
    navigator.clipboard.writeText(shareableUrl);
    toast({
      title: 'Link copied',
      description: 'The shareable link has been copied to your clipboard.',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Public QR Codes</h2>
        
        <Dialog open={qrFormOpen} onOpenChange={setQrFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => loadUserQRCodes()}>
              <QrCode className="h-4 w-4 mr-2" />
              Generate Public QR
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Generate Public QR Code</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="qr-label">QR Code Label</Label>
                <Input
                  id="qr-label"
                  value={qrLabel}
                  onChange={(e) => setQrLabel(e.target.value)}
                  placeholder="My Medical Records"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="qr-expiry">Expiration</Label>
                <Select value={expiry} onValueChange={setExpiry}>
                  <SelectTrigger id="qr-expiry">
                    <SelectValue placeholder="Select expiration period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never expires</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {expiry === 'custom' && (
                <div className="space-y-2">
                  <Label htmlFor="custom-days">Custom Days</Label>
                  <Input
                    id="custom-days"
                    type="number"
                    min="1"
                    max="365"
                    value={customDays}
                    onChange={(e) => setCustomDays(parseInt(e.target.value) || 30)}
                  />
                </div>
              )}
              
              <div className="bg-yellow-50 p-3 rounded-md text-sm text-yellow-800">
                <p className="font-medium">Important Note</p>
                <p>
                  This will create a public QR code that allows anyone to access all your medical records 
                  without requiring authentication. Use this feature carefully.
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setQrFormOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleGenerateQR} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <QrCode className="h-4 w-4 mr-2" />
                    Generate QR Code
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-medivault-600 mr-2" />
          <span>Loading QR codes...</span>
        </div>
      ) : userQRCodes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userQRCodes.map((qr) => (
            <Card key={qr.id} className={`overflow-hidden ${!qr.is_active || qr.isExpired ? 'opacity-60' : ''}`}>
              <CardContent className="p-0">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium text-gray-900">{qr.label || 'Medical Records'}</h3>
                    <div className="flex items-center">
                      {!qr.is_active && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full mr-2">
                          Inactive
                        </span>
                      )}
                      {qr.isExpired && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                          Expired
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-white p-2 rounded-lg border mr-4">
                      <img src={qr.qrImageUrl} alt="QR Code" className="w-24 h-24" />
                    </div>
                    
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-2">
                        Shares {qr.recordCount} medical records
                      </p>
                      
                      <div className="text-xs text-gray-500 mb-2 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>Created: {new Date(qr.created_at).toLocaleDateString()}</span>
                      </div>
                      
                      {qr.expires_at && (
                        <div className="text-xs text-gray-500 mb-2 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>Expires: {new Date(qr.expires_at).toLocaleDateString()}</span>
                        </div>
                      )}
                      
                      <div className="flex space-x-2 mt-3">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleCopyLink(qr.shareableUrl)}
                          className="text-medivault-600"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy Link
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDownloadQR(qr.qrImageUrl, qr.label || 'MediVault')}
                          className="text-blue-600"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                        
                        {qr.is_active && !qr.isExpired && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDeactivateQR(qr.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Revoke
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No public QR codes</h3>
          <p className="text-gray-600 mb-4">
            You haven't created any public QR codes for your medical records yet.
          </p>
          <Button onClick={() => setQrFormOpen(true)}>
            <QrCode className="h-4 w-4 mr-2" />
            Generate QR Code
          </Button>
        </div>
      )}
      
      {/* QR Code Display Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code Generated</DialogTitle>
          </DialogHeader>
          
          {qrCodeData && (
            <div className="flex flex-col items-center py-4">
              <div className="bg-white p-3 rounded-lg border mb-4">
                <img src={qrCodeData.qrImageUrl} alt="QR Code" className="w-48 h-48" />
              </div>
              
              <div className="text-center mb-4">
                <p className="font-medium">{qrCodeData.qrCode.label || 'My Medical Records'}</p>
                <p className="text-sm text-gray-500 mt-1">
                  This QR code provides access to {qrCodeData.recordCount} medical records.
                </p>
                
                {qrCodeData.qrCode.expires_at && (
                  <div className="mt-2 text-xs bg-yellow-50 text-yellow-800 p-2 rounded flex items-center justify-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Expires on: {new Date(qrCodeData.qrCode.expires_at).toLocaleDateString()}
                  </div>
                )}
              </div>
              
              <div className="w-full mt-2">
                <p className="text-xs text-gray-500 mb-1">Shareable Link:</p>
                <div className="flex">
                  <input
                    type="text"
                    value={qrCodeData.shareableUrl}
                    readOnly
                    className="flex-1 text-sm p-2 border rounded-l-md bg-gray-50"
                  />
                  <Button
                    className="rounded-l-none"
                    onClick={() => handleCopyLink(qrCodeData.shareableUrl)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <Button variant="outline" onClick={() => handleDownloadQR(qrCodeData.qrImageUrl, qrCodeData.qrCode.label || 'MediVault')}>
                  <Download className="h-4 w-4 mr-2" />
                  Download QR
                </Button>
                <Button onClick={() => window.open(qrCodeData.shareableUrl, '_blank')}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Open Link
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PublicQRCodeGenerator;
