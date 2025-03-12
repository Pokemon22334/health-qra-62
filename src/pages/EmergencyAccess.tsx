
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
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
  Loader,
  ArrowLeft,
  Shield
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
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const EmergencyAccess = () => {
  const { profileId } = useParams<{ profileId: string }>();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessLogged, setAccessLogged] = useState(false);

  // Fetch emergency profile data
  useEffect(() => {
    const fetchEmergencyProfile = async () => {
      if (!profileId) {
        setError('No user ID provided');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Get the emergency profile
        const { data, error } = await supabase
          .from('emergency_profiles')
          .select('*')
          .eq('user_id', profileId)
          .single();
        
        if (error) {
          console.error('Error fetching emergency profile:', error);
          setError('Could not load emergency profile');
          return;
        }
        
        if (!data) {
          setError('Emergency profile not found');
          return;
        }
        
        setProfile(data);
        
        // Log the access if not already done
        if (!accessLogged) {
          try {
            await supabase
              .from('emergency_access_logs')
              .insert({
                profile_id: data.id,
                accessed_at: new Date().toISOString(),
                ip_address: 'anonymous', // For privacy, we're not storing actual IP
              });
            
            setAccessLogged(true);
          } catch (logError) {
            console.error('Error logging access:', logError);
            // Non-critical error, just continue
          }
        }
      } catch (err) {
        console.error('Error in fetchEmergencyProfile:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEmergencyProfile();
  }, [profileId]);

  // Generate PDF of emergency profile
  const generatePDF = () => {
    // This would require a PDF generation library
    // For now, just show a toast message
    toast({
      title: 'PDF Generation',
      description: 'PDF download functionality will be available soon.',
    });
  };

  if (loading) {
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

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <NavBar />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md w-full">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 text-center mb-2">
              Emergency Profile Not Available
            </h2>
            <p className="text-red-700 text-center mb-6">
              {error || 'The requested emergency profile could not be found.'}
            </p>
            <div className="flex justify-center">
              <Link to="/">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Return to Home
                </Button>
              </Link>
            </div>
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
        <div className="bg-red-600 text-white p-4 rounded-lg mb-6 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Heart className="h-6 w-6 mr-2" />
              <h1 className="text-xl font-bold">EMERGENCY MEDICAL PROFILE</h1>
            </div>
            <Badge variant="outline" className="bg-white text-red-600 border-white">
              MEDICAL ALERT
            </Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="md:col-span-1 bg-white shadow-md border-l-4 border-l-red-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center text-red-700">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Critical Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Blood Type</p>
                  <p className="text-lg font-semibold">{profile.blood_type || 'Not specified'}</p>
                </div>
                
                <Separator />
                
                <div>
                  <p className="text-sm font-medium text-gray-500 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1 text-amber-500" />
                    Allergies
                  </p>
                  <p className="whitespace-pre-line">
                    {profile.allergies || 'No allergies recorded'}
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <p className="text-sm font-medium text-gray-500 flex items-center">
                    <Activity className="h-4 w-4 mr-1 text-blue-500" />
                    Medical Conditions
                  </p>
                  <p className="whitespace-pre-line">
                    {profile.conditions || 'No conditions recorded'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Medical Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                <div>
                  <p className="text-sm font-medium text-gray-500 flex items-center">
                    <Pill className="h-4 w-4 mr-1 text-purple-500" />
                    Current Medications
                  </p>
                  <p className="whitespace-pre-line">
                    {profile.medications || 'No medications recorded'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500 flex items-center">
                    <Scissors className="h-4 w-4 mr-1 text-gray-500" />
                    Previous Surgeries
                  </p>
                  <p className="whitespace-pre-line">
                    {profile.surgeries || 'No surgeries recorded'}
                  </p>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div>
                <p className="text-sm font-medium text-gray-500">Medical Notes & Instructions</p>
                <p className="mt-1 p-3 bg-gray-50 rounded-md whitespace-pre-line">
                  {profile.medical_notes || 'No special instructions recorded'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Phone className="h-5 w-5 mr-2 text-green-600" />
                Emergency Contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile.emergency_contact_1_name ? (
                <div className="mb-4 p-3 border border-green-100 bg-green-50 rounded-md">
                  <p className="font-semibold">{profile.emergency_contact_1_name}</p>
                  <p className="text-sm text-gray-700">
                    {profile.emergency_contact_1_relationship}
                  </p>
                  <p className="text-sm font-medium mt-1">
                    {profile.emergency_contact_1_phone}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 italic">No primary contact recorded</p>
              )}
              
              {profile.emergency_contact_2_name && (
                <div className="p-3 border border-blue-100 bg-blue-50 rounded-md">
                  <p className="font-semibold">{profile.emergency_contact_2_name}</p>
                  <p className="text-sm text-gray-700">
                    {profile.emergency_contact_2_relationship}
                  </p>
                  <p className="text-sm font-medium mt-1">
                    {profile.emergency_contact_2_phone}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Healthcare Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Insurance Provider</p>
                  <p>{profile.insurance_provider || 'Not specified'}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Insurance Number</p>
                  <p>{profile.insurance_number || 'Not specified'}</p>
                </div>
                
                <Separator />
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Primary Physician</p>
                  <p>{profile.primary_physician || 'Not specified'}</p>
                  {profile.primary_physician_phone && (
                    <p className="text-sm">{profile.primary_physician_phone}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500 italic">
            <Shield className="h-4 w-4 inline mr-1" />
            This information is provided for emergency purposes only. 
            Last updated: {new Date(profile.updated_at).toLocaleDateString()}
          </p>
          
          <Button onClick={generatePDF} variant="outline">
            <FileDown className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default EmergencyAccess;
