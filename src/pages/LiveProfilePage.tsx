
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  HeartPulse, 
  FileText, 
  Pill, 
  Heart, 
  AlertTriangle, 
  Loader2, 
  Shield, 
  Download,
  Phone,
  ClipboardList,
  User,
  CalendarDays
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

const LiveProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [emergencyProfile, setEmergencyProfile] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  useEffect(() => {
    if (!id) {
      setError('No profile ID provided');
      setIsLoading(false);
      return;
    }
    
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Fetching data for permanent QR with ID:', id);
        
        // Get the permanent QR code data
        const { data: qrData, error: qrError } = await supabase
          .from('user_permanent_qr')
          .select('*')
          .eq('id', id)
          .eq('active', true)
          .maybeSingle();
        
        if (qrError) {
          console.error('Error fetching QR data:', qrError);
          throw qrError;
        }
        
        if (!qrData) {
          console.error('No QR data found or QR is inactive');
          setError('This QR code is invalid or has been deactivated');
          setIsLoading(false);
          return;
        }
        
        console.log('Found QR data:', qrData);
        setProfileData(qrData);
        
        // Get user profile data
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', qrData.user_id)
          .maybeSingle();
        
        if (userError) {
          console.error('Error fetching user profile:', userError);
        } else if (userData) {
          console.log('Found user profile:', userData);
          setUserProfile(userData);
        }
        
        // Get health records
        const { data: recordsData, error: recordsError } = await supabase
          .from('health_records')
          .select('*')
          .eq('user_id', qrData.user_id)
          .order('created_at', { ascending: false });
        
        if (recordsError) {
          console.error('Error fetching health records:', recordsError);
          throw recordsError;
        }
        
        console.log('Fetched records:', recordsData?.length || 0);
        setRecords(recordsData || []);
        
        // Get medications
        const { data: medsData, error: medsError } = await supabase
          .from('medications')
          .select('*')
          .eq('user_id', qrData.user_id)
          .order('created_at', { ascending: false });
        
        if (medsError) {
          console.error('Error fetching medications:', medsError);
          throw medsError;
        }
        
        console.log('Fetched medications:', medsData?.length || 0);
        setMedications(medsData || []);
        
        // Get emergency profile
        const { data: emergencyData, error: emergencyError } = await supabase
          .from('emergency_profiles')
          .select('*')
          .eq('user_id', qrData.user_id)
          .maybeSingle();
        
        if (emergencyError) {
          console.error('Error fetching emergency profile:', emergencyError);
        } else if (emergencyData) {
          console.log('Found emergency profile');
          setEmergencyProfile(emergencyData);
        }
        
        // Log the access
        try {
          await supabase
            .from('emergency_access_logs')
            .insert({
              profile_id: qrData.id,
              ip_address: null
            });
            
          console.log('Access logged successfully');
        } catch (logError) {
          console.error('Failed to log access:', logError);
          // Non-critical error, just continue
        }
      } catch (error: any) {
        console.error('Error fetching profile data:', error);
        setError(error.message || 'Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfileData();
  }, [id]);

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'blood_test': return 'Blood Test';
      case 'prescription': return 'Prescription';
      case 'xray_mri': return 'X-Ray / MRI';
      case 'doctor_note': return 'Doctor Note';
      default: return category.replace('_', ' ');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white shadow-md">
          <div className="container mx-auto px-4 py-4 flex items-center">
            <HeartPulse className="h-8 w-8 text-medivault-600" />
            <span className="ml-2 text-xl font-semibold text-gray-800">MediVault</span>
          </div>
        </header>
        
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-medivault-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Medical Profile</h2>
            <p className="text-gray-600">Please wait while we retrieve the latest medical information...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white shadow-md">
          <div className="container mx-auto px-4 py-4 flex items-center">
            <HeartPulse className="h-8 w-8 text-medivault-600" />
            <span className="ml-2 text-xl font-semibold text-gray-800">MediVault</span>
          </div>
        </header>
        
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Unavailable</h2>
            <p className="text-gray-600 mb-4">
              {error || "This medical profile is unavailable or has been deactivated by the owner."}
            </p>
            <Link to="/">
              <Button variant="outline">
                Return to Homepage
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const displayName = userProfile?.name || 'MediVault User';
  const hasEmergencyContacts = !!(
    emergencyProfile?.emergency_contact_1_name || 
    emergencyProfile?.emergency_contact_2_name
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <HeartPulse className="h-8 w-8 text-medivault-600" />
            <span className="ml-2 text-xl font-semibold text-gray-800">MediVault</span>
          </div>
          
          <div className="flex items-center">
            <Badge variant="outline" className="mr-2 px-2 py-1 border-green-500 text-green-700">
              Live Medical Profile
            </Badge>
            <Badge variant="secondary" className="px-2 py-1">
              <Shield className="h-3 w-3 mr-1" />
              Secured
            </Badge>
          </div>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6 bg-white rounded-xl shadow-md overflow-hidden">
          <div className="md:flex">
            <div className="p-6 bg-medivault-50 flex items-center justify-between md:flex-col md:justify-start md:w-1/4">
              <div className="flex items-center md:flex-col text-center">
                <Avatar className="h-16 w-16 md:h-24 md:w-24 md:mb-4">
                  <AvatarFallback className="bg-medivault-100 text-medivault-800 text-xl md:text-3xl">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-4 md:ml-0">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900">{displayName}</h1>
                  <p className="text-sm text-gray-600">Medical Profile</p>
                </div>
              </div>
              
              {hasEmergencyContacts && (
                <div className="md:mt-6 bg-red-50 rounded-lg p-3 text-center w-full hidden md:block">
                  <h3 className="text-sm font-semibold text-red-800 flex items-center justify-center">
                    <Phone className="h-4 w-4 mr-1 text-red-600" />
                    Emergency Contacts
                  </h3>
                  {emergencyProfile?.emergency_contact_1_name && (
                    <div className="mt-2 text-xs">
                      <div className="font-medium text-gray-900">{emergencyProfile.emergency_contact_1_name}</div>
                      <div className="text-gray-700">{emergencyProfile.emergency_contact_1_phone}</div>
                      <div className="text-gray-500 text-xs">{emergencyProfile.emergency_contact_1_relationship}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="p-6 md:w-3/4">
              <Tabs defaultValue="emergency" className="w-full">
                <TabsList className="mb-4 w-full justify-start">
                  <TabsTrigger value="emergency">
                    <Heart className="h-4 w-4 mr-2 text-red-500" />
                    Emergency
                  </TabsTrigger>
                  <TabsTrigger value="records">
                    <FileText className="h-4 w-4 mr-2 text-blue-500" />
                    Records
                  </TabsTrigger>
                  <TabsTrigger value="medications">
                    <Pill className="h-4 w-4 mr-2 text-green-500" />
                    Medications
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="emergency" className="space-y-4">
                  {emergencyProfile ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {emergencyProfile.blood_type && (
                          <div className="bg-red-50 p-3 rounded-md border border-red-100">
                            <h3 className="text-sm font-medium text-red-900 mb-1">Blood Type</h3>
                            <p className="text-2xl font-bold text-red-700">{emergencyProfile.blood_type}</p>
                          </div>
                        )}
                        
                        <div className="md:hidden">
                          {hasEmergencyContacts && (
                            <div className="bg-red-50 rounded-md p-3 border border-red-100">
                              <h3 className="text-sm font-medium text-red-900 mb-1 flex items-center">
                                <Phone className="h-4 w-4 mr-1 text-red-600" />
                                Emergency Contact
                              </h3>
                              {emergencyProfile?.emergency_contact_1_name && (
                                <div>
                                  <div className="font-medium">{emergencyProfile.emergency_contact_1_name}</div>
                                  <div className="text-sm">{emergencyProfile.emergency_contact_1_phone}</div>
                                  <div className="text-xs text-gray-600">{emergencyProfile.emergency_contact_1_relationship}</div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {emergencyProfile.allergies && (
                          <Card>
                            <CardHeader className="py-3 px-4">
                              <CardTitle className="text-base font-medium flex items-center">
                                <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                                Allergies
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="py-2 px-4 text-sm">
                              {emergencyProfile.allergies}
                            </CardContent>
                          </Card>
                        )}
                        
                        {emergencyProfile.conditions && (
                          <Card>
                            <CardHeader className="py-3 px-4">
                              <CardTitle className="text-base font-medium flex items-center">
                                <ClipboardList className="h-4 w-4 mr-2 text-amber-500" />
                                Medical Conditions
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="py-2 px-4 text-sm">
                              {emergencyProfile.conditions}
                            </CardContent>
                          </Card>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4 mt-2">
                        {emergencyProfile.primary_physician && (
                          <Card>
                            <CardHeader className="py-3 px-4">
                              <CardTitle className="text-base font-medium flex items-center">
                                <User className="h-4 w-4 mr-2 text-blue-500" />
                                Primary Physician
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="py-2 px-4 text-sm">
                              <div>{emergencyProfile.primary_physician}</div>
                              {emergencyProfile.primary_physician_phone && (
                                <div className="text-gray-600">{emergencyProfile.primary_physician_phone}</div>
                              )}
                            </CardContent>
                          </Card>
                        )}
                        
                        {emergencyProfile.medical_notes && (
                          <Card>
                            <CardHeader className="py-3 px-4">
                              <CardTitle className="text-base font-medium flex items-center">
                                <ClipboardList className="h-4 w-4 mr-2 text-gray-500" />
                                Additional Medical Information
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="py-2 px-4 text-sm">
                              {emergencyProfile.medical_notes}
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
                      <Heart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No Emergency Profile</h3>
                      <p className="text-gray-500 text-sm">
                        The owner has not set up their emergency medical profile yet.
                      </p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="records">
                  {records.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-900">Medical Records</h3>
                        <Badge variant="outline" className="px-2 py-1">
                          {records.length} {records.length === 1 ? 'Record' : 'Records'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {records.map((record) => (
                          <Card key={record.id} className="overflow-hidden">
                            <CardHeader className="py-3 px-4">
                              <div className="flex justify-between items-start">
                                <CardTitle className="text-base font-medium">
                                  {record.title}
                                </CardTitle>
                                <Badge variant="secondary" className="ml-2">
                                  {getCategoryLabel(record.category)}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="py-2 px-4">
                              {record.description && (
                                <p className="text-sm text-gray-600 mb-2">{record.description}</p>
                              )}
                              <div className="flex items-center justify-between">
                                <div className="text-xs text-gray-500 flex items-center">
                                  <CalendarDays className="h-3 w-3 mr-1" />
                                  {formatDate(record.created_at)}
                                </div>
                                
                                {record.file_url && (
                                  <a 
                                    href={record.file_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 flex items-center hover:text-blue-800"
                                  >
                                    <Download className="h-3 w-3 mr-1" />
                                    View File
                                  </a>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No Medical Records</h3>
                      <p className="text-gray-500 text-sm">
                        No health records have been added to this profile yet.
                      </p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="medications">
                  {medications.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-900">Current Medications</h3>
                        <Badge variant="outline" className="px-2 py-1">
                          {medications.length} {medications.length === 1 ? 'Medication' : 'Medications'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        {medications.map((med) => (
                          <Card key={med.id}>
                            <CardContent className="p-4">
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                <div>
                                  <h4 className="font-medium text-gray-900 flex items-center">
                                    <Pill className="h-4 w-4 text-green-600 mr-2" />
                                    {med.name}
                                  </h4>
                                  <div className="text-sm text-gray-700 mt-1">
                                    {med.dosage} • {med.frequency}
                                  </div>
                                </div>
                                
                                <div className="mt-2 md:mt-0 md:ml-4 text-xs text-gray-500">
                                  <div className="flex items-center">
                                    <span className="font-medium">Start:</span> 
                                    <span className="ml-1">{new Date(med.start_date).toLocaleDateString()}</span>
                                  </div>
                                  {med.end_date && (
                                    <div className="flex items-center mt-1">
                                      <span className="font-medium">End:</span> 
                                      <span className="ml-1">{new Date(med.end_date).toLocaleDateString()}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {med.notes && (
                                <div className="mt-3 pt-3 border-t text-sm text-gray-600">
                                  {med.notes}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
                      <Pill className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No Medications</h3>
                      <p className="text-gray-500 text-sm">
                        No medications have been added to this profile yet.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
        
        <div className="bg-medivault-50 rounded-lg border border-medivault-100 p-4 text-sm text-medivault-700 flex items-start">
          <Shield className="h-5 w-5 text-medivault-600 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-medivault-800">Secure Medical Information</p>
            <p>
              This information is provided through MediVault's secure Live QR system. The owner of this profile has 
              chosen to make this information available to you for medical purposes. This information is always up-to-date
              and reflects the latest records added to the system.
            </p>
          </div>
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} MediVault. All rights reserved.</p>
            <p className="mt-1">Secure storage and sharing for medical records.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LiveProfilePage;
