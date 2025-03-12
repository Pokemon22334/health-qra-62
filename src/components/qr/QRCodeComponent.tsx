
import React, { useState } from 'react';
import { format } from 'date-fns';
import { FileText, Download, Trash2, Clock, Eye, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useQRCodes } from '@/hooks/use-qr-codes';

interface QRCodeComponentProps {
  qrCode: any;
  onRevoke: () => void;
}

const QRCodeComponent: React.FC<QRCodeComponentProps> = ({ qrCode, onRevoke }) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false);
  const { revokeQRCodeById, isLoading } = useQRCodes();
  
  const isExpired = new Date(qrCode.expires_at) < new Date();
  const expiresIn = new Date(qrCode.expires_at).getTime() - new Date().getTime();
  const hoursRemaining = Math.max(0, Math.floor(expiresIn / (1000 * 60 * 60)));
  
  const shareableUrl = `${window.location.origin}/shared-record/${qrCode.id}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareableUrl)}`;
  
  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.href = qrImageUrl;
    link.download = `medivault-qr-${qrCode.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleRevokeQR = async () => {
    try {
      await revokeQRCodeById(qrCode.id);
      onRevoke();
      setIsRevokeDialogOpen(false);
    } catch (error) {
      console.error('Error revoking QR code:', error);
    }
  };
  
  const accessCount = qrCode.qr_code_access?.length || 0;
  
  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <FileText className="h-5 w-5 text-medivault-600 mr-2" />
            <h3 className="font-medium text-gray-800 truncate">
              {qrCode.health_records?.title || 'Medical Record'}
            </h3>
          </div>
          <p className="text-sm text-gray-500 mt-1 capitalize">
            {qrCode.health_records?.category?.replace('_', ' ') || 'Document'}
          </p>
        </div>
        
        <div className="p-4 bg-gray-50 flex justify-center">
          <div className="relative">
            <img 
              src={qrImageUrl}
              alt="QR Code" 
              className={`w-40 h-40 ${(isExpired || qrCode.is_revoked) ? 'opacity-30' : ''}`}
            />
            {(isExpired || qrCode.is_revoked) && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-red-100 rounded-full p-2">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4 space-y-2">
          <div className="flex items-center text-sm">
            <Clock className="h-4 w-4 text-gray-400 mr-1" />
            <span className="text-gray-600">
              {qrCode.is_revoked ? (
                'Revoked'
              ) : isExpired ? (
                'Expired'
              ) : (
                `Expires in ${hoursRemaining} hours`
              )}
            </span>
          </div>
          
          <div className="flex items-center text-sm">
            <Eye className="h-4 w-4 text-gray-400 mr-1" />
            <span className="text-gray-600">
              {accessCount === 0 ? 'No accesses yet' : `Accessed ${accessCount} ${accessCount === 1 ? 'time' : 'times'}`}
            </span>
          </div>
          
          <div className="pt-2 flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => setIsDetailsOpen(true)}
            >
              Details
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownloadQR}
              disabled={isExpired || qrCode.is_revoked}
            >
              <Download className="h-4 w-4" />
            </Button>
            
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                disabled={isExpired || qrCode.is_revoked || isLoading}
                onClick={() => setIsRevokeDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
          </div>
        </div>
      </div>
      
      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code Details</DialogTitle>
            <DialogDescription>
              Information about this shared medical record
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Record</h4>
              <p className="text-gray-900">{qrCode.health_records?.title}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Created</h4>
              <p className="text-gray-900">
                {format(new Date(qrCode.created_at), 'PPP p')}
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Expires</h4>
              <p className={`${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
                {format(new Date(qrCode.expires_at), 'PPP p')}
                {isExpired && ' (Expired)'}
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Status</h4>
              <p className={`${qrCode.is_revoked ? 'text-red-600' : 'text-gray-900'}`}>
                {qrCode.is_revoked ? 'Revoked' : 'Active'}
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Shareable Link</h4>
              <p className="text-gray-900 text-sm break-all">{shareableUrl}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Access History</h4>
              {accessCount === 0 ? (
                <p className="text-gray-500 italic">No accesses yet</p>
              ) : (
                <ul className="mt-2 text-sm space-y-2">
                  {qrCode.qr_code_access?.map((access: any) => (
                    <li key={access.id} className="bg-gray-50 p-2 rounded">
                      <p className="text-gray-700">
                        {access.profiles?.name || 'Anonymous user'}
                        {access.profiles?.role && (
                          <span className="text-medivault-600 ml-1">
                            ({access.profiles.role})
                          </span>
                        )}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {format(new Date(access.accessed_at), 'PPP p')}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownloadQR}
              disabled={isExpired || qrCode.is_revoked}
            >
              <Download className="h-4 w-4 mr-2" />
              Download QR
            </Button>
            
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => {
                setIsDetailsOpen(false);
                setIsRevokeDialogOpen(true);
              }}
              disabled={isExpired || qrCode.is_revoked || isLoading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Revoke Access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Revoke Confirmation Dialog */}
      <AlertDialog open={isRevokeDialogOpen} onOpenChange={setIsRevokeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke QR Code Access</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently revoke access to your medical record through this QR code.
              Anyone who tries to access it will receive an error.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevokeQR}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Revoking...' : 'Revoke Access'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default QRCodeComponent;
