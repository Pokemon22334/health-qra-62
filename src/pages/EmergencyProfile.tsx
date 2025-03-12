import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { 
  AlertTriangle, 
  Heart, 
  Droplet, 
  AlertCircle, 
  Pill, 
  Activity, 
  Scissors, 
  Phone,
  FileDown,
  Copy,
  Save,
  Loader
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const emergencyProfileSchema = z.object({
  bloodType: z.string().optional(),
  allergies: z.string().optional(),
  conditions: z.string().optional(),
  medications: z.string().optional(),
  surgeries: z.string().optional(),
  emergencyContact1Name: z.string().min(1, {
    message: "Emergency contact name is required.",
  }),
  emergencyContact1Phone: z.string().min(6, {
    message: "Valid phone number is required.",
  }),
  emergencyContact1Relationship: z.string().min(1, {
    message: "Relationship is required.",
  }),
  emergencyContact2Name: z.string().optional(),
  emergencyContact2Phone: z.string().optional(),
  emergencyContact2Relationship: z.string().optional(),
  medicalNotes: z.string().optional(),
  insuranceProvider: z.string().optional(),
  insuranceNumber: z.string().optional(),
  primaryPhysician: z.string().optional(),
  primaryPhysicianPhone: z.string().optional(),
});

type EmergencyProfileFormValues = z.infer<typeof emergencyProfileSchema>;

interface EmergencyProfileData {
  id: string;
  user_id: string;
  blood_type: string | null;
  allergies: string | null;
  conditions: string | null;
  medications: string | null;
  surgeries: string | null;
  emergency_contact_1_name: string;
  emergency_contact_1_phone: string;
  emergency_contact_1_relationship: string;
  emergency_contact_2_name: string | null;
  emergency_contact_2_phone: string | null;
  emergency_contact_2_relationship: string | null;
  medical_notes: string | null;
  insurance_provider: string | null;
  insurance_number: string | null;
  primary_physician: string | null;
  primary_physician_phone: string | null;
  created_at: string;
  updated_at: string;
}

const EmergencyProfile = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<EmergencyProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [qrCode, setQrCode] = useState<{ qrImageUrl: string; shareableUrl: string } | null>(null);

  const form = useForm<EmergencyProfileFormValues>({
    resolver: zodResolver(emergencyProfileSchema),
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
      medicalNotes: '',
      insuranceProvider: '',
      insuranceNumber: '',
      primaryPhysician: '',
      primaryPhysicianPhone: '',
    },
  });

  const fetchEmergencyProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('emergency_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching emergency profile:', error);
        if (error.code !== 'PGRST116') {
          toast({
            title: 'Error fetching profile',
            description: 'Could not load your emergency profile.',
            variant: 'destructive',
          });
        }
        return;
      }
      
      if (data) {
        setProfileData(data);
        
        form.reset({
          bloodType: data.blood_type || '',
          allergies: data.allergies || '',
          conditions: data.conditions || '',
          medications: data.medications || '',
          surgeries: data.surgeries || '',
          emergencyContact1Name: data.emergency_contact_1_name || '',
          emergencyContact1Phone: data.emergency_contact_1_phone || '',
          emergencyContact1Relationship: data.emergency_contact_1_relationship || '',
          emergencyContact2Name: data.emergency_contact_2_name || '',
          emergencyContact2Phone: data.emergency_contact_2_phone || '',
          emergencyContact2Relationship: data.emergency_contact_2_relationship || '',
          medicalNotes: data.medical_notes || '',
          insuranceProvider: data.insurance_provider || '',
          insuranceNumber: data.insurance_number || '',
          primaryPhysician: data.primary_physician || '',
          primaryPhysicianPhone: data.primary_physician_phone || '',
        });
      }
    } catch (err) {
      console.error('Error in fetchEmergencyProfile:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveEmergencyProfile = async (data: EmergencyProfileFormValues) => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      const profileData = {
        user_id: user.id,
        blood_type: data.bloodType || null,
        allergies: data.allergies || null,
        conditions: data.conditions || null,
        medications: data.medications || null,
        surgeries: data.surgeries || null,
        emergency_contact_1_name: data.emergencyContact1Name,
        emergency_contact_1_phone: data.emergencyContact1Phone,
        emergency_contact_1_relationship: data.emergencyContact1Relationship,
        emergency_contact_2_name: data.emergencyContact2Name || null,
        emergency_contact_2_phone: data.emergencyContact2Phone || null,
        emergency_contact_2_relationship: data.emergencyContact2Relationship || null,
        medical_notes: data.medicalNotes || null,
        insurance_provider: data.insuranceProvider || null,
        insurance_number: data.insuranceNumber || null,
        primary_physician: data.primaryPhysician || null,
        primary_physician_phone: data.primaryPhysicianPhone || null,
        updated_at: new Date().toISOString(),
      };
      
      let result;
      if (profileData?.id) {
        result = await supabase
          .from('emergency_profiles')
          .update(profileData)
          .eq('id', profileData.id)
          .select();
      } else {
        result = await supabase
          .from('emergency_profiles')
          .insert(profileData)
          .select();
      }
      
      if (result.error) {
        throw result.error;
      }
      
      toast({
        title: 'Profile saved',
        description: 'Your emergency profile has been saved successfully.',
      });
      
      fetchEmergencyProfile();
    } catch (err: any) {
      console.error('Error saving emergency profile:', err);
      toast({
        title: 'Error saving profile',
        description: err.message || 'An error occurred while saving your emergency profile.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const generateEmergencyQRCode = async () => {
    if (!user) return;
    
    try {
      const origin = window.location.origin;
      const emergencyUrl = `${origin}/emergency-access/${user.id}`;
      
      const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(emergencyUrl)}`;
      
      setQrCode({
        qrImageUrl,
        shareableUrl: emergencyUrl
      });
      
      setShareDialogOpen(true);
    } catch (err: any) {
      console.error('Error generating QR code:', err);
      toast({
        title: 'QR Code Error',
        description: 'Could not generate emergency QR code.',
        variant: 'destructive',
      });
    }
  };

  const copyShareableLink = async () => {
    if (!qrCode?.shareableUrl) return;
    
    try {
      await navigator.clipboard.writeText(qrCode.shareableUrl);
      toast({
        title: 'Link copied',
        description: 'Emergency profile link copied to clipboard.',
      });
    } catch (err) {
      console.error('Error copying to clipboard:', err);
      toast({
        title: 'Copy failed',
        description: 'Could not copy link to clipboard.',
        variant: 'destructive',
      });
    }
  };

  const downloadQRCode = () => {
    if (!qrCode?.qrImageUrl) return;
    
    const link = document.createElement('a');
    link.href = qrCode.qrImageUrl;
    link.download = 'emergency-profile-qr.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (isLoading) return;
    
    if (!isAuthenticated) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to access your emergency profile.',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }
    
    fetchEmergencyProfile();
  }, [isLoading, isAuthenticated, user]);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <NavBar />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <Loader className="h-10 w-10 animate-spin text-medivault-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading emergency profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Heart className="mr-2 h-6 w-6 text-red-500" />
              Emergency Profile
            </h1>
            <p className="text-gray-600 mt-1">
              Add critical medical information for emergency situations
            </p>
          </div>
          
          <div className="flex mt-4 md:mt-0 space-x-3">
            <Button 
              variant="outline" 
              onClick={generateEmergencyQRCode}
              className="flex items-center"
            >
              Generate QR Code
            </Button>
            
            <Button 
              onClick={form.handleSubmit(saveEmergencyProfile)}
              disabled={saving}
              className="flex items-center"
            >
              {saving ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="p-4 mb-6 bg-red-50 border border-red-100 rounded-lg">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-800">Important Information</h3>
                <p className="text-sm text-red-700 mt-1">
                  This emergency profile contains critical medical information that can be accessed in emergency situations. 
                  Keep this information accurate and up-to-date for medical professionals.
                </p>
              </div>
            </div>
          </div>
          
          <Form {...form}>
            <form>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="mb-6 grid grid-cols-3 w-full max-w-md">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="contacts">Contacts</TabsTrigger>
                  <TabsTrigger value="additional">Additional</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="bloodType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Droplet className="h-4 w-4 mr-1 text-red-500" />
                            Blood Type
                          </FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select blood type" />
                              </SelectTrigger>
                            </FormControl>
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
                          <FormDescription>
                            Your blood type for transfusions
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="allergies"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1 text-amber-500" />
                            Allergies
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Medications, food, environmental allergies"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            List all known allergies and reactions
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="conditions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Activity className="h-4 w-4 mr-1 text-blue-500" />
                            Medical Conditions
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Diabetes, heart disease, asthma, etc."
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Chronic conditions and diagnoses
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="medications"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Pill className="h-4 w-4 mr-1 text-purple-500" />
                            Current Medications
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Medication names, dosages, and frequency"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Medications and dosages you take regularly
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="surgeries"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Scissors className="h-4 w-4 mr-1 text-gray-500" />
                            Previous Surgeries
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Previous surgeries and procedures with dates"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Surgical history and procedures
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="contacts">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-green-500" />
                          Primary Emergency Contact
                        </CardTitle>
                        <CardDescription>
                          Person to contact first in an emergency
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="emergencyContact1Name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Contact name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="emergencyContact1Phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input placeholder="Phone number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="emergencyContact1Relationship"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Relationship</FormLabel>
                              <FormControl>
                                <Input placeholder="Spouse, parent, etc." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-blue-500" />
                          Secondary Emergency Contact
                        </CardTitle>
                        <CardDescription>
                          Additional person to contact
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="emergencyContact2Name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Contact name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="emergencyContact2Phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input placeholder="Phone number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="emergencyContact2Relationship"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Relationship</FormLabel>
                              <FormControl>
                                <Input placeholder="Friend, sibling, etc." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="additional">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="medicalNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medical Notes & Instructions</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Special instructions for emergency responders"
                              className="resize-none h-32"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Special considerations or instructions for care providers
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="insuranceProvider"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Insurance Provider</FormLabel>
                            <FormControl>
                              <Input placeholder="Insurance company name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="insuranceNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Insurance Policy/Member Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Member ID number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="primaryPhysician"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Physician Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doctor's name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="primaryPhysicianPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Physician Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="Doctor's phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="mt-6 flex justify-end">
                <Button 
                  type="button"
                  onClick={form.handleSubmit(saveEmergencyProfile)}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Profile
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
        
        <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Emergency Profile QR Code</DialogTitle>
              <DialogDescription>
                Share this QR code for quick access to your emergency medical information in critical situations.
              </DialogDescription>
            </DialogHeader>
            {qrCode && (
              <div className="flex flex-col items-center justify-center p-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
                  <img 
                    src={qrCode.qrImageUrl} 
                    alt="Emergency Profile QR Code" 
                    className="w-48 h-48"
                  />
                </div>
                <p className="text-xs text-center text-gray-500 mb-4">
                  This QR code provides access to your emergency profile. 
                  Keep it accessible for emergency personnel.
                </p>
              </div>
            )}
            <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={copyShareableLink}
                className="sm:w-auto w-full"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Link
              </Button>
              <Button 
                type="button"
                onClick={downloadQRCode}
                className="sm:w-auto w-full"
              >
                <FileDown className="mr-2 h-4 w-4" />
                Download QR
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      
      <Footer />
    </div>
  );
};

export default EmergencyProfile;
