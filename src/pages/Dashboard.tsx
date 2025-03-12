import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import RecordUpload from '@/components/dashboard/RecordUpload';
import HealthRecordsList from '@/components/dashboard/HealthRecordsList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Plus, 
  Calendar, 
  PillIcon, 
  QrCode,
  Shield,
  Loader2
} from 'lucide-react';

const Dashboard = () => {
  const { user, isAuthenticated, isLoading, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('records');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [pageLoading, setPageLoading] = useState(true);
  
  useEffect(() => {
    console.log('Auth state in Dashboard:', { isLoading, isAuthenticated, user, profile });
    
    if (!isLoading) {
      if (!isAuthenticated) {
        toast({
          title: "Authentication required",
          description: "Please log in to access your dashboard.",
          variant: "destructive",
        });
        navigate('/login');
      } else {
        setPageLoading(false);
      }
    }
  }, [isLoading, isAuthenticated, navigate, toast, user, profile]);

  const handleUploadComplete = () => {
    setShowUploadForm(false);
    setRefreshTrigger(prev => prev + 1);
  };

  if (isLoading || pageLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <NavBar />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin text-medivault-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your dashboard...</p>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {profile?.name || 'User'}
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your health records and share them securely with your healthcare providers.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="font-semibold text-lg text-gray-800">Dashboard</h2>
              </div>
              
              <nav className="p-4">
                <ul className="space-y-2">
                  <li>
                    <Button 
                      variant={activeTab === 'records' ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => setActiveTab('records')}
                    >
                      <FileText className="mr-2 h-5 w-5" />
                      Health Records
                    </Button>
                  </li>
                  <li>
                    <Button 
                      variant={activeTab === 'appointments' ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => setActiveTab('appointments')}
                    >
                      <Calendar className="mr-2 h-5 w-5" />
                      Appointments
                    </Button>
                  </li>
                  <li>
                    <Button 
                      variant={activeTab === 'medications' ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => setActiveTab('medications')}
                    >
                      <PillIcon className="mr-2 h-5 w-5" />
                      Medications
                    </Button>
                  </li>
                  <li>
                    <Button 
                      variant={activeTab === 'shared' ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => setActiveTab('shared')}
                    >
                      <QrCode className="mr-2 h-5 w-5" />
                      Shared Access
                    </Button>
                  </li>
                  <li>
                    <Button 
                      variant={activeTab === 'emergency' ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => setActiveTab('emergency')}
                    >
                      <Shield className="mr-2 h-5 w-5" />
                      Emergency Profile
                    </Button>
                  </li>
                </ul>
              </nav>
              
              <div className="p-4 mt-4">
                <Button 
                  className="w-full"
                  onClick={() => setShowUploadForm(true)}
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Add Medical Record
                </Button>
              </div>
            </div>
            
            <div className="bg-medivault-50 rounded-xl mt-6 p-4 border border-medivault-100">
              <div className="flex items-start mb-2">
                <QrCode className="h-5 w-5 text-medivault-600 mr-2 mt-0.5" />
                <h3 className="font-medium text-medivault-900">Quick Record Sharing</h3>
              </div>
              <p className="text-sm text-medivault-700 mb-3">
                Generate QR codes for any record to share securely with your healthcare providers.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-medivault-700 border-medivault-200 hover:bg-medivault-100"
                onClick={() => setActiveTab('shared')}
              >
                View Shared Records
              </Button>
            </div>
          </div>
          
          <div className="lg:col-span-9">
            {showUploadForm ? (
              <RecordUpload onUploadComplete={handleUploadComplete} />
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="records">Health Records</TabsTrigger>
                  <TabsTrigger value="appointments">Appointments</TabsTrigger>
                  <TabsTrigger value="medications">Medications</TabsTrigger>
                  <TabsTrigger value="shared">Shared Access</TabsTrigger>
                  <TabsTrigger value="emergency">Emergency Profile</TabsTrigger>
                </TabsList>
                
                <TabsContent value="records">
                  <HealthRecordsList refreshTrigger={refreshTrigger} />
                </TabsContent>
                
                <TabsContent value="appointments">
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6">Your Appointments</h2>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments scheduled</h3>
                      <p className="text-gray-600 mb-4">
                        You haven't scheduled any appointments yet.
                      </p>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Schedule Appointment
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="medications">
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6">Your Medications</h2>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                      <PillIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No medications added</h3>
                      <p className="text-gray-600 mb-4">
                        You haven't added any medications to track yet.
                      </p>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Medication
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="shared">
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6">Shared Record Access</h2>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                      <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No shared records</h3>
                      <p className="text-gray-600 mb-4">
                        You haven't shared any of your medical records yet.
                      </p>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Share a Record
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="emergency">
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6">Emergency Access Profile</h2>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                      <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No emergency profile set up</h3>
                      <p className="text-gray-600 mb-4">
                        Set up your emergency profile to make critical information available in case of emergencies.
                      </p>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Set Up Emergency Profile
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
