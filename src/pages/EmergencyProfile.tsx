import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Heart, User, Phone, Activity, Pill, AlertTriangle, Shield, BadgeAlert, Stethoscope, QrCode, Copy, Download } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EmergencyProfileData {
  id?: string;
  user_id: string;
  blood_type: string | null;
  allergies: string | null;
  conditions: string | null;
  medications: string | null;
  surgeries: string | null;
  emergency_contact_1_name: string | null;
  emergency_contact_1_phone: string | null;
  emergency_contact_1_relationship: string | null;
  emergency_contact_2_name: string | null;
  emergency_contact_2_phone: string | null;
  emergency_contact_2_relationship: string | null;
  primary_physician: string | null;
  primary_physician_phone: string | null;
  insurance_provider: string | null;
  insurance_number: string | null;
  medical_notes: string | null;
  created_at: string;
  updated_at: string;
}

const EmergencyProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<EmergencyProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('basic');
  const [shareableUrl, setShareableUrl] = useState<string | null>(null);
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      bloodType: '',
      allergies: '',
      conditions: '',
      medications: '',
      surgeries: '',
      emergencyContact1Name: '',
      emergencyContact1Phone: '',
      emergencyContact1Relationship: '',
      emergencyContact2Name: '',
      emergencyContact2Phone: '',
      emergencyContact2Relationship: '',
      primaryPhysician: '',
      primaryPhysicianPhone: '',
      insuranceProvider: '',
      insuranceNumber: '',
      medicalNotes: ''
    }
  });

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/emergency-profile' } });
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchEmergencyProfile = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('emergency_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching emergency profile:', error);
          return;
        }
        
        if (data) {
          setProfileData(data);
          
          setValue('bloodType', data.blood_type || '');
          setValue('allergies', data.allergies || '');
          setValue('conditions', data.conditions || '');
          setValue('medications', data.medications || '');
          setValue('surgeries', data.surgeries || '');
          setValue('emergencyContact1Name', data.emergency_contact_1_name || '');
          setValue('emergencyContact1Phone', data.emergency_contact_1_phone || '');
          setValue('emergencyContact1Relationship', data.emergency_contact_1_relationship || '');
          setValue('emergencyContact2Name', data.emergency_contact_2_name || '');
          setValue('emergencyContact2Phone', data.emergency_contact_2_phone || '');
          setValue('emergencyContact2Relationship', data.emergency_contact_2_relationship || '');
          setValue('primaryPhysician', data.primary_physician || '');
          setValue('primaryPhysicianPhone', data.primary_physician_phone || '');
          setValue('insuranceProvider', data.insurance_provider || '');
          setValue('insuranceNumber', data.insurance_number || '');
          setValue('medicalNotes', data.medical_notes || '');
        }
      } catch (error) {
        console.error('Error in fetchEmergencyProfile:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmergencyProfile();
  }, [user, setValue]);

  useEffect(() => {
    if (user) {
      const origin = window.location.origin;
      const url = `${origin}/emergency-access/${user.id}`;
      setShareableUrl(url);
      
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
      setQrImageUrl(qrUrl);
    }
  }, [user]);

  const generateShareableLinks = (userId: string) => {
    const origin = window.location.origin;
    const url = `${origin}/emergency-access/${userId}`;
    setShareableUrl(url);
    
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
    setQrImageUrl(qrUrl);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The emergency access link has been copied to your clipboard."
    });
  };

  const downloadQRCode = () => {
    if (!qrImageUrl) return;
    
    const link = document.createElement('a');
    link.href = qrImageUrl;
    link.download = 'emergency-profile-qr.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const saveEmergencyProfile = async (data: any) => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      const profileDataToSave = {
        user_id: user.id,
        blood_type: data.bloodType || null,
        allergies: data.allergies || null,
        conditions: data.conditions || null,
        medications: data.medications || null,
        surgeries: data.surgeries || null,
        emergency_contact_1_name: data.emergencyContact1Name || null,
        emergency_contact_1_phone: data.emergencyContact1Phone || null,
        emergency_contact_1_relationship: data.emergencyContact1Relationship || null,
        emergency_contact_2_name: data.emergencyContact2Name || null,
        emergency_contact_2_phone: data.emergencyContact2Phone || null,
        emergency_contact_2_relationship: data.emergencyContact2Relationship || null,
        primary_physician: data.primaryPhysician || null,
        primary_physician_phone: data.primaryPhysicianPhone || null,
        insurance_provider: data.insuranceProvider || null,
        insurance_number: data.insuranceNumber || null,
        medical_notes: data.medicalNotes || null,
        updated_at: new Date().toISOString()
      };
      
      let result;
      if (profileData) {
        result = await supabase
          .from('emergency_profiles')
          .update(profileDataToSave)
          .eq('id', profileData.id)
          .select();
      } else {
        result = await supabase
          .from('emergency_profiles')
          .insert(profileDataToSave)
          .select();
      }
      
      if (result.error) {
        throw result.error;
      }
      
      setProfileData(result.data[0]);
      
      if (!shareableUrl) {
        generateShareableLinks(user.id);
      }
      
      toast({
        title: "Profile Saved",
        description: "Your emergency profile has been saved successfully."
      });
    } catch (error: any) {
      console.error('Error saving emergency profile:', error);
      toast({
        title: "Error",
        description: error.message || "An error occurred while saving your emergency profile.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-medivault-200 mb-4" />
              <div className="h-4 w-48 bg-medivault-100 rounded mb-3" />
              <div className="h-4 w-32 bg-medivault-100 rounded" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Heart className="text-red-500 mr-2 h-6 w-6" />
                Emergency Medical Profile
              </h1>
              <p className="text-gray-600 mt-1">
                Add critical medical information for emergency situations
              </p>
            </div>
            
            {shareableUrl && (
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard(shareableUrl)}
                  className="flex items-center gap-1"
                >
                  <Copy className="h-4 w-4" />
                  Copy Link
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={downloadQRCode}
                  className="flex items-center gap-1"
                >
                  <Download className="h-4 w-4" />
                  Download QR
                </Button>
              </div>
            )}
          </div>
          
          {qrImageUrl && (
            <Card className="mb-6 border-medivault-100">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                    <img 
                      src={qrImageUrl} 
                      alt="Emergency Profile QR Code" 
                      className="w-32 h-32"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-medium flex items-center gap-1 mb-2">
                      <QrCode className="h-5 w-5 text-medivault-600" />
                      Emergency Access QR Code
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      This QR code gives immediate access to your critical medical information in case of emergency.
                      Share it with family members or print it for your wallet.
                    </p>
                    
                    {shareableUrl && (
                      <div className="flex items-center gap-2">
                        <input 
                          type="text" 
                          value={shareableUrl}
                          readOnly
                          className="flex-1 text-sm p-2 border rounded-l-md"
                        />
                        <Button 
                          size="sm" 
                          onClick={() => copyToClipboard(shareableUrl)}
                          className="rounded-l-none"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <form onSubmit={handleSubmit(saveEmergencyProfile)}>
            <Tabs 
              defaultValue="basic" 
              value={activeTab}
              onValueChange={setActiveTab}
              className="mb-6"
            >
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="basic" className="flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  Critical Information
                </TabsTrigger>
                <TabsTrigger value="contacts" className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Emergency Contacts
                </TabsTrigger>
                <TabsTrigger value="healthcare" className="flex items-center gap-1">
                  <Stethoscope className="h-4 w-4" />
                  Healthcare Details
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      Medical Information
                    </CardTitle>
                    <CardDescription>
                      Add your critical medical information that emergency responders need to know
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="bloodType">Blood Type</Label>
                        <Select 
                          onValueChange={(value) => setValue('bloodType', value)} 
                          defaultValue={profileData?.blood_type || ''}
                        >
                          <SelectTrigger id="bloodType">
                            <SelectValue placeholder="Select blood type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A+">A+</SelectItem>
                            <SelectItem value="A-">A-</SelectItem>
                            <SelectItem value="B+">B+</SelectItem>
                            <SelectItem value="B-">B-</SelectItem>
                            <SelectItem value="AB+">AB+</SelectItem>
                            <SelectItem value="AB-">AB-</SelectItem>
                            <SelectItem value="O+">O+</SelectItem>
                            <SelectItem value="O-">O-</SelectItem>
                            <SelectItem value="Unknown">Unknown</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="allergies" className="flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        Allergies
                      </Label>
                      <Textarea 
                        id="allergies" 
                        placeholder="List any allergies to medications, food, or other substances"
                        {...register('allergies')}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="conditions" className="flex items-center gap-1">
                        <Activity className="h-4 w-4 text-blue-500" />
                        Medical Conditions
                      </Label>
                      <Textarea 
                        id="conditions" 
                        placeholder="List any chronic conditions, disabilities, or diagnoses"
                        {...register('conditions')}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="medications" className="flex items-center gap-1">
                        <Pill className="h-4 w-4 text-purple-500" />
                        Current Medications
                      </Label>
                      <Textarea 
                        id="medications" 
                        placeholder="List medications you take regularly, including dosages"
                        {...register('medications')}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="surgeries" className="flex items-center gap-1">
                        <BadgeAlert className="h-4 w-4 text-gray-500" />
                        Previous Surgeries
                      </Label>
                      <Textarea 
                        id="surgeries" 
                        placeholder="List any previous surgeries or medical procedures"
                        {...register('surgeries')}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="contacts" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-500" />
                      Emergency Contacts
                    </CardTitle>
                    <CardDescription>
                      Add contacts who should be notified in case of emergency
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="font-medium">Primary Emergency Contact</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="emergencyContact1Name">Name</Label>
                          <Input 
                            id="emergencyContact1Name"
                            placeholder="Full name"
                            {...register('emergencyContact1Name')}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="emergencyContact1Relationship">Relationship</Label>
                          <Input 
                            id="emergencyContact1Relationship"
                            placeholder="e.g., Spouse, Parent, Child"
                            {...register('emergencyContact1Relationship')}
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="emergencyContact1Phone" className="flex items-center gap-1">
                            <Phone className="h-4 w-4 text-green-500" />
                            Phone Number
                          </Label>
                          <Input 
                            id="emergencyContact1Phone"
                            placeholder="Phone number"
                            {...register('emergencyContact1Phone')}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4 space-y-4">
                      <h3 className="font-medium">Secondary Emergency Contact</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="emergencyContact2Name">Name</Label>
                          <Input 
                            id="emergencyContact2Name"
                            placeholder="Full name"
                            {...register('emergencyContact2Name')}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="emergencyContact2Relationship">Relationship</Label>
                          <Input 
                            id="emergencyContact2Relationship"
                            placeholder="e.g., Spouse, Parent, Child"
                            {...register('emergencyContact2Relationship')}
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="emergencyContact2Phone" className="flex items-center gap-1">
                            <Phone className="h-4 w-4 text-green-500" />
                            Phone Number
                          </Label>
                          <Input 
                            id="emergencyContact2Phone"
                            placeholder="Phone number"
                            {...register('emergencyContact2Phone')}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="healthcare" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Stethoscope className="h-5 w-5 text-teal-500" />
                      Healthcare Information
                    </CardTitle>
                    <CardDescription>
                      Add information about your healthcare providers and insurance
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="font-medium">Primary Physician</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="primaryPhysician">Name</Label>
                          <Input 
                            id="primaryPhysician"
                            placeholder="Doctor's name"
                            {...register('primaryPhysician')}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="primaryPhysicianPhone">Phone</Label>
                          <Input 
                            id="primaryPhysicianPhone"
                            placeholder="Office phone number"
                            {...register('primaryPhysicianPhone')}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4 space-y-4">
                      <h3 className="font-medium">Insurance Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                          <Input 
                            id="insuranceProvider"
                            placeholder="Insurance company name"
                            {...register('insuranceProvider')}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="insuranceNumber">Policy/Member Number</Label>
                          <Input 
                            id="insuranceNumber"
                            placeholder="Insurance policy number"
                            {...register('insuranceNumber')}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4 space-y-2">
                      <Label htmlFor="medicalNotes" className="flex items-center gap-1">
                        <Shield className="h-4 w-4 text-indigo-500" />
                        Additional Medical Notes or Instructions
                      </Label>
                      <Textarea 
                        id="medicalNotes" 
                        placeholder="Add any additional information that emergency responders should know"
                        {...register('medicalNotes')}
                        className="min-h-24"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                disabled={saving}
                className="bg-medivault-600 hover:bg-medivault-700"
              >
                {saving ? 'Saving...' : 'Save Emergency Profile'}
              </Button>
            </div>
          </form>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default EmergencyProfile;
