
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Bell, 
  Settings, 
  Upload, 
  Calendar, 
  QrCode,
  User,
  Clock,
  Search,
  PlusCircle,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import QRCode from '@/components/QRCode';
import RecordCard from '@/components/RecordCard';
import MedicationTracker from '@/components/MedicationTracker';
import { toast } from 'sonner';

const mockRecords = [
  {
    id: '1',
    title: 'Complete Blood Count',
    date: new Date(2023, 2, 15),
    doctor: 'Dr. Smith',
    institution: 'General Hospital',
    type: 'bloodTest' as const,
    fileSize: '3.5 MB'
  },
  {
    id: '2',
    title: 'Annual Physical Results',
    date: new Date(2023, 1, 10),
    doctor: 'Dr. Johnson',
    institution: 'City Medical Center',
    type: 'doctorNote' as const,
    fileSize: '1.2 MB'
  },
  {
    id: '3',
    title: 'Chest X-Ray',
    date: new Date(2022, 11, 5),
    doctor: 'Dr. Williams',
    institution: 'Radiology Center',
    type: 'imaging' as const,
    fileSize: '8.7 MB'
  }
];

const Dashboard = () => {
  const [records] = useState(mockRecords);
  const [showQR, setShowQR] = useState(false);
  
  const handleViewRecord = () => {
    toast.info('Viewing record details');
  };
  
  const handleDownloadRecord = () => {
    toast.success('Record downloaded successfully');
  };
  
  const handleDeleteRecord = () => {
    toast.error('Record deleted');
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar />
      
      <main className="flex-grow pt-20">
        {/* Header Area */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 md:px-6 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Welcome, John!</h1>
                <p className="text-gray-600 mt-1">Manage your health records and medications</p>
              </div>
              
              <div className="flex items-center space-x-3 mt-4 md:mt-0">
                <Button variant="outline" size="sm">
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 md:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { title: 'Upload Record', icon: Upload, color: 'bg-medivault-100 text-medivault-600' },
                  { title: 'Schedule Visit', icon: Calendar, color: 'bg-green-100 text-green-600' },
                  { title: 'QR Access', icon: QrCode, color: 'bg-purple-100 text-purple-600', onClick: () => setShowQR(true) },
                  { title: 'Update Profile', icon: User, color: 'bg-amber-100 text-amber-600' }
                ].map((action, i) => {
                  const Icon = action.icon;
                  return (
                    <Button 
                      key={i} 
                      variant="outline" 
                      className="h-auto py-6 flex flex-col items-center justify-center gap-2 border border-gray-200 hover:border-gray-300 bg-white"
                      onClick={action.onClick}
                    >
                      <div className={`w-12 h-12 rounded-full ${action.color} flex items-center justify-center`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="font-medium">{action.title}</span>
                    </Button>
                  );
                })}
              </div>
              
              {/* Recent Records */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-medivault-500" />
                      Recent Health Records
                    </CardTitle>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/records">
                        View All
                        <ChevronRight className="ml-1 w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                  <CardDescription>
                    Your most recent medical documents and test results
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    {records.map(record => (
                      <RecordCard
                        key={record.id}
                        title={record.title}
                        date={record.date}
                        doctor={record.doctor}
                        institution={record.institution}
                        type={record.type}
                        fileSize={record.fileSize}
                        onView={handleViewRecord}
                        onDownload={handleDownloadRecord}
                        onDelete={handleDeleteRecord}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Upcoming Appointments */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                    Upcoming Appointments
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-center py-8 flex-col space-y-3 text-center">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <h3 className="font-medium text-gray-700">No upcoming appointments</h3>
                    <p className="text-gray-500 text-sm max-w-sm">
                      Schedule your next doctor's visit and get timely reminders.
                    </p>
                    <Button variant="outline" className="mt-2">
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Schedule Appointment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {showQR ? (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-xl flex items-center">
                        <QrCode className="w-5 h-5 mr-2 text-medivault-500" />
                        Doctor Access QR
                      </CardTitle>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowQR(false)}
                      >
                        Hide
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <QRCode userName="John Doe" />
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl flex items-center">
                      <User className="w-5 h-5 mr-2 text-gray-500" />
                      Health Profile
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-2xl font-medium">
                          JD
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <h3 className="font-medium text-lg">John Doe</h3>
                        <p className="text-gray-500 text-sm">42 years old • Male</p>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Blood Type</span>
                          <span className="font-medium">A+</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Height</span>
                          <span className="font-medium">5'10" (178cm)</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Weight</span>
                          <span className="font-medium">165 lbs (75kg)</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Allergies</span>
                          <span className="font-medium">Penicillin</span>
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <Button variant="outline" className="w-full">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Profile
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Medication Tracker */}
              <MedicationTracker />
              
              {/* Emergency Information */}
              <Card>
                <CardHeader className="bg-red-50 border-b border-red-100">
                  <CardTitle className="text-lg flex items-center text-red-800">
                    <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
                    Emergency Information
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="py-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Emergency Contact</h4>
                      <p className="text-sm">Jane Doe (Spouse) • (555) 123-4567</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Primary Physician</h4>
                      <p className="text-sm">Dr. Sarah Smith • (555) 987-6543</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Critical Conditions</h4>
                      <p className="text-sm">Diabetes Type 2, Hypertension</p>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="py-3 bg-gray-50">
                  <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Update Emergency Info
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
