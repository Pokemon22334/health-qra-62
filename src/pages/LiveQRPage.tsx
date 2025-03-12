import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { 
  QrCode, 
  ArrowLeft,
  Loader2, 
  AlertTriangle,
  RefreshCw,
  Download,
  Share2,
  Shield,
  Eye,
  EyeOff,
  Info,
  Heart,
  FileText,
  Copy,
  Pill
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const LiveQRPage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pageLoading, setPageLoading] = useState(true);
  const [liveQrData, setLiveQrData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [recordsCount, setRecordsCount] = useState(0);
  const [medicationsCount, setMedicationsCount] = useState(0);
  const [hasEmergencyProfile, setHasEmergencyProfile] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [downloadingQr, setDownloadingQr] = useState(false);
  
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        toast({
          title: "Authentication required",
          description: "Please log in to access your Live QR code.",
          variant: "destructive",
        });
        navigate('/login');
      } else {
        loadUserQRCode();
        loadUserStats();
        setPageLoading(false);
      }
    }
  }, [isLoading, isAuthenticated, navigate, toast]);

  const loadUserQRCode = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('user_permanent_qr')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        const qrData = {
          ...data,
          shareableUrl: generateShareableLink(data.id),
          qrImageUrl: generateQRImageUrl(data.id)
        };
        setLiveQrData(qrData);
      }
    } catch (error: any) {
      console.error('Error loading QR code:', error);
      toast({
        title: 'Error loading QR code',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const loadUserStats = async () => {
    if (!user?.id) return;
    
    try {
      const { count: recordsCount, error: recordsError } = await supabase
        .from('health_records')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      if (recordsError) throw recordsError;
      setRecordsCount(recordsCount || 0);
      
      const { count: medsCount, error: medsError } = await supabase
        .from('medications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      if (medsError) throw medsError;
      setMedicationsCount(medsCount || 0);
      
      const { data: profile, error: profileError } = await supabase
        .from('emergency_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (profileError) throw profileError;
      setHasEmergencyProfile(!!profile);
      
    } catch (error: any) {
      console.error('Error loading user stats:', error);
    }
  };

  const generateLiveQR = async () => {
    if (!user) return;
    
    try {
      setIsGenerating(true);
      
      const { data: existingQR } = await supabase
        .from('user_permanent_qr')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (existingQR) {
        toast({
          title: 'QR Code already exists',
          description: 'You already have a permanent QR code. Loading it now.',
        });
        loadUserQRCode();
        setIsGenerating(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('user_permanent_qr')
        .insert({
          user_id: user.id,
          name: 'My Live Medical Profile',
          active: true
        })
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        const qrData = {
          ...data,
          shareableUrl: generateShareableLink(data.id),
          qrImageUrl: generateQRImageUrl(data.id)
        };
        
        setLiveQrData(qrData);
        setQrDialogOpen(true);
        
        toast({
          title: 'Live QR code generated',
          description: 'Your permanent QR code has been created successfully.',
        });
      }
    } catch (error: any) {
      console.error('Error generating QR code:', error);
      toast({
        title: 'Failed to generate QR code',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleQRActive = async (active: boolean) => {
    if (!liveQrData || !user) return;
    
    try {
      const { error } = await supabase
        .from('user_permanent_qr')
        .update({ active })
        .eq('id', liveQrData.id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setLiveQrData({ ...liveQrData, active });
      
      toast({
        title: active ? 'QR code activated' : 'QR code deactivated',
        description: active 
          ? 'Your Live QR code is now active and can be scanned.' 
          : 'Your Live QR code has been deactivated and cannot be scanned.',
      });
    } catch (error: any) {
      console.error('Error toggling QR status:', error);
      toast({
        title: 'Error updating QR code',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const generateShareableLink = (qrId: string): string => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://medivault.app';
    return `${origin}/live-profile/${qrId}`;
  };

  const generateQRImageUrl = (qrId: string): string => {
    const shareableUrl = generateShareableLink(qrId);
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shareableUrl)}`;
  };

  const viewQRCode = () => {
    if (liveQrData) {
      setQrDialogOpen(true);
    }
  };

  const downloadQRCode = () => {
    if (!liveQrData) return;
    
    setDownloadingQr(true);
    
    try {
      const link = document.createElement('a');
      link.href = liveQrData.qrImageUrl;
      link.download = 'medivault-live-qr.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'QR code downloaded',
        description: 'Your Live QR code has been downloaded.',
      });
    } catch (error) {
      console.error('Error downloading QR code:', error);
      toast({
        title: 'Download failed',
        description: 'Failed to download QR code image.',
        variant: 'destructive',
      });
    } finally {
      setDownloadingQr(false);
    }
  };

  const openShareDialog = () => {
    if (liveQrData) {
      setShareDialogOpen(true);
    }
  };

  const shareViaNavigator = async () => {
    if (!liveQrData) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My MediVault Live Medical Profile',
          text: 'Access my live medical records with this QR code',
          url: liveQrData.shareableUrl,
        });
        
        setShareDialogOpen(false);
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    if (!liveQrData) return;
    
    navigator.clipboard.writeText(liveQrData.shareableUrl);
    
    toast({
      title: 'Link copied',
      description: 'The shareable link has been copied to your clipboard.',
    });
    
    setShareDialogOpen(false);
  };

  if (isLoading || pageLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <NavBar />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin text-medivault-600 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Loading your Live QR code...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <NavBar />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center bg-red-50 p-6 rounded-lg border border-red-200 max-w-md">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-red-800 mb-2">Not Logged In</h3>
            <p className="text-sm text-red-700 mb-4">
              Please log in to access your Live QR code.
            </p>
            <div className="flex justify-center">
              <Button onClick={() => navigate('/login')} className="flex items-center">
                Go to Login
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const displayName = user?.user_metadata?.name || user?.user_metadata?.full_name || 'User';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Button 
              variant="outline" 
              className="mr-4"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
          <div className="flex items-center">
            <QrCode className="h-6 w-6 text-medivault-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">Live QR Medical Profile</h1>
          </div>
          <div className="w-36">
            <Button 
              variant="outline" 
              onClick={loadUserQRCode}
              className="flex items-center justify-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Live QR Profile</CardTitle>
                <CardDescription>
                  One QR code for all your medical information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {liveQrData ? (
                  <>
                    <div className="bg-white p-4 rounded-lg border border-gray-200 flex justify-center">
                      <img 
                        src={liveQrData.qrImageUrl} 
                        alt="Your Live QR Code" 
                        className="w-48 h-48 object-contain"
                      />
                    </div>
                    
                    <div className="flex justify-center space-x-2">
                      <Button 
                        onClick={viewQRCode}
                        className="flex items-center"
                      >
                        <QrCode className="mr-2 h-4 w-4" />
                        View QR
                      </Button>
                      <Button 
                        onClick={openShareDialog}
                        variant="outline"
                        className="flex items-center"
                      >
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                      </Button>
                    </div>
                    
                    <div className="border-t pt-4 mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <Label htmlFor="qr-active" className="flex items-center">
                            <Shield className="mr-2 h-4 w-4 text-gray-500" />
                            QR Code Active
                          </Label>
                          {liveQrData.active ? (
                            <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                              Active
                            </span>
                          ) : (
                            <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                              Inactive
                            </span>
                          )}
                        </div>
                        <Switch
                          id="qr-active"
                          checked={liveQrData.active}
                          onCheckedChange={toggleQRActive}
                        />
                      </div>
                      
                      <p className="text-xs text-gray-500 mt-1">
                        {liveQrData.active 
                          ? "Your QR code is active. Anyone with this QR code can view your shared medical information."
                          : "Your QR code is inactive. No one can access your medical information with this QR code."}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <QrCode className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      No Live QR Code Yet
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Generate your permanent QR code to share medical information with healthcare providers.
                    </p>
                    <Button 
                      onClick={generateLiveQR}
                      disabled={isGenerating}
                      className="w-full"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <QrCode className="mr-2 h-4 w-4" />
                          Generate Live QR Code
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Information Status</CardTitle>
                <CardDescription>
                  What information will be shared
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 text-blue-500 mr-2" />
                    <span className="text-sm">Medical Records</span>
                  </div>
                  <span className="text-sm font-medium">{recordsCount}</span>
                </div>
                
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                  <div className="flex items-center">
                    <Pill className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm">Medications</span>
                  </div>
                  <span className="text-sm font-medium">{medicationsCount}</span>
                </div>
                
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                  <div className="flex items-center">
                    <Heart className="h-4 w-4 text-red-500 mr-2" />
                    <span className="text-sm">Emergency Profile</span>
                  </div>
                  {hasEmergencyProfile ? (
                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded-full">Setup Complete</span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full">Not Set Up</span>
                  )}
                </div>
                
                {(!hasEmergencyProfile || recordsCount === 0 || medicationsCount === 0) && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
                    <div className="flex items-start">
                      <Info className="h-4 w-4 text-yellow-500 mr-2 mt-0.5" />
                      <div>
                        <span className="font-medium">Improve your profile</span>
                        <ul className="mt-1 ml-5 list-disc text-xs">
                          {!hasEmergencyProfile && (
                            <li className="mb-1">
                              <Button variant="link" className="h-auto p-0 text-xs" onClick={() => navigate('/emergency-profile')}>
                                Set up your emergency profile
                              </Button>
                            </li>
                          )}
                          {recordsCount === 0 && (
                            <li className="mb-1">
                              <Button variant="link" className="h-auto p-0 text-xs" onClick={() => navigate('/dashboard')}>
                                Upload some medical records
                              </Button>
                            </li>
                          )}
                          {medicationsCount === 0 && (
                            <li>
                              <Button variant="link" className="h-auto p-0 text-xs" onClick={() => navigate('/medications')}>
                                Add your medications
                              </Button>
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-8">
            <Card>
              <CardHeader>
                <CardTitle>Live QR Medical Profile</CardTitle>
                <CardDescription>
                  Your dynamic medical profile that updates in real-time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="about">
                  <TabsList className="mb-4">
                    <TabsTrigger value="about">About</TabsTrigger>
                    <TabsTrigger value="preview">Profile Preview</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="about" className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <h3 className="text-lg font-medium text-blue-900 mb-2 flex items-center">
                        <QrCode className="h-5 w-5 text-blue-600 mr-2" />
                        What is a Live QR Medical Profile?
                      </h3>
                      <p className="text-sm text-blue-800">
                        Your Live QR Medical Profile provides instant access to your essential medical information through a single, 
                        permanent QR code. Unlike regular QR codes, this one never changes but always displays your latest medical data 
                        whenever it's scanned.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <Shield className="h-4 w-4 text-medivault-600 mr-2" />
                          Security and Privacy
                        </h4>
                        <p className="text-sm text-gray-700">
                          You control who can access your profile by toggling the QR code on/off. When deactivated, your QR code 
                          cannot be used to access your information. Only the information you've added to MediVault will be visible.
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <RefreshCw className="h-4 w-4 text-medivault-600 mr-2" />
                          Always Up-to-Date
                        </h4>
                        <p className="text-sm text-gray-700">
                          Your QR code links to your current medical information. When you add new records, medications, 
                          or update your emergency profile, the changes are immediately reflected when someone scans your QR code.
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-2">What information is shared?</h4>
                      <ul className="text-sm text-gray-700 space-y-2">
                        <li className="flex items-start">
                          <FileText className="h-4 w-4 text-medivault-600 mr-2 mt-0.5" />
                          <span>Your medical records (lab reports, prescriptions, X-rays, etc.)</span>
                        </li>
                        <li className="flex items-start">
                          <Pill className="h-4 w-4 text-medivault-600 mr-2 mt-0.5" />
                          <span>Current medications and dosage information</span>
                        </li>
                        <li className="flex items-start">
                          <Heart className="h-4 w-4 text-medivault-600 mr-2 mt-0.5" />
                          <span>Emergency profile (allergies, conditions, emergency contacts)</span>
                        </li>
                      </ul>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="preview">
                    <div className="bg-white border rounded-lg overflow-hidden">
                      <div className="bg-medivault-50 p-4 border-b">
                        <div className="flex items-center">
                          <div className="mr-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src="" alt={displayName} />
                              <AvatarFallback className="bg-medivault-100 text-medivault-800">
                                {displayName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{displayName}'s Medical Profile</h3>
                            <p className="text-sm text-gray-600">Live and always up-to-date</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="divide-y">
                        <div className="p-4">
                          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-blue-600" />
                            Medical Records
                          </h4>
                          
                          {recordsCount > 0 ? (
                            <p className="text-sm text-gray-600">
                              {recordsCount} records available in your profile
                            </p>
                          ) : (
                            <div className="text-sm text-gray-500 italic">
                              No records available
                            </div>
                          )}
                        </div>
                        
                        <div className="p-4">
                          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                            <Pill className="h-4 w-4 mr-2 text-green-600" />
                            Current Medications
                          </h4>
                          
                          {medicationsCount > 0 ? (
                            <p className="text-sm text-gray-600">
                              {medicationsCount} medications in your profile
                            </p>
                          ) : (
                            <div className="text-sm text-gray-500 italic">
                              No medications listed
                            </div>
                          )}
                        </div>
                        
                        <div className="p-4">
                          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                            <Heart className="h-4 w-4 mr-2 text-red-600" />
                            Emergency Information
                          </h4>
                          
                          {hasEmergencyProfile ? (
                            <p className="text-sm text-gray-600">
                              Emergency profile is set up and available
                            </p>
                          ) : (
                            <div className="text-sm text-gray-500 italic">
                              No emergency profile available
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 text-center text-sm text-gray-600">
                        This is a preview of how your profile will appear when someone scans your QR code.
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="settings">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        {liveQrData && (
                          <div className="flex items-center justify-between p-3 border rounded-md">
                            <div className="flex items-center">
                              {liveQrData.active ? (
                                <Eye className="h-5 w-5 text-green-500 mr-2" />
                              ) : (
                                <EyeOff className="h-5 w-5 text-red-500 mr-2" />
                              )}
                              <div>
                                <Label className="font-medium">Profile Visibility</Label>
                                <p className="text-xs text-gray-500">
                                  {liveQrData.active 
                                    ? "Your profile is visible when someone scans your QR code" 
                                    : "Your profile is hidden from all QR code scans"}
                                </p>
                              </div>
                            </div>
                            <Switch
                              checked={liveQrData.active}
                              onCheckedChange={toggleQRActive}
                            />
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="font-medium text-gray-900 mb-3">Actions</h4>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            className="flex items-center"
                            onClick={() => navigate('/emergency-profile')}
                          >
                            <Heart className="mr-2 h-4 w-4 text-red-500" />
                            Emergency Profile
                          </Button>
                          
                          <Button
                            variant="outline"
                            className="flex items-center"
                            onClick={() => navigate('/medications')}
                          >
                            <Pill className="mr-2 h-4 w-4 text-green-500" />
                            Manage Medications
                          </Button>
                          
                          <Button
                            variant="outline"
                            className="flex items-center"
                            onClick={() => navigate('/dashboard')}
                          >
                            <FileText className="mr-2 h-4 w-4 text-blue-500" />
                            Medical Records
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Your Live QR Code</DialogTitle>
            <DialogDescription>
              This QR code provides access to your medical information in real-time.
            </DialogDescription>
          </DialogHeader>
          
          {liveQrData && (
            <div className="flex flex-col items-center py-4">
              <div className="bg-white p-3 rounded-lg border mb-4">
                <img src={liveQrData.qrImageUrl} alt="QR Code" className="w-64 h-64" />
              </div>
              
              <div className="text-center mb-4">
                <p className="font-medium">Live Medical Profile</p>
                <p className="text-sm text-gray-500 mt-1">
                  Share this QR code with healthcare providers for instant access.
                </p>
                
                <div className="mt-2 text-xs bg-yellow-50 text-yellow-800 p-2 rounded flex items-center justify-center">
                  <Shield className="h-3 w-3 mr-1" />
                  Access can be disabled anytime by deactivating your QR code.
                </div>
              </div>
              
              <div className="w-full mt-2">
                <p className="text-xs text-gray-500 mb-1">Shareable Link:</p>
                <div className="flex">
                  <input
                    type="text"
                    value={liveQrData.shareableUrl}
                    readOnly
                    className="flex-1 text-sm p-2 border rounded-l-md bg-gray-50"
                  />
                  <Button
                    className="rounded-l-none"
                    onClick={copyToClipboard}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <Button 
                  variant="outline" 
                  onClick={downloadQRCode}
                  disabled={downloadingQr}
                >
                  {downloadingQr ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Download QR
                </Button>
                
                <Button onClick={openShareDialog}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Your Medical Profile</DialogTitle>
            <DialogDescription>
              Share your Live QR code with healthcare providers or trusted individuals.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <Button
              className="flex items-center justify-start"
              onClick={shareViaNavigator}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share via device options
            </Button>
            
            <Button
              variant="outline"
              className="flex items-center justify-start"
              onClick={copyToClipboard}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy link to clipboard
            </Button>
            
            <Button
              variant="outline"
              className="flex items-center justify-start"
              onClick={downloadQRCode}
              disabled={downloadingQr}
            >
              {downloadingQr ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Download QR Code Image
            </Button>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default LiveQRPage;
