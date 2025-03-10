
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Shield, 
  User, 
  FileText, 
  Smartphone, 
  Lock, 
  Users, 
  Clock 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { cn } from '@/lib/utils';

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow pt-20">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-medivault-50 via-white to-blue-50 -z-10" />
          
          {/* Decorative Elements */}
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-medivault-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
          <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10" />
          
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-block mb-4">
                <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-medivault-100 text-medivault-800">
                  <span className="mr-2 h-2 w-2 rounded-full bg-medivault-500"></span>
                  Our Mission
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-6">
                Empowering Your Health with Digital Records
              </h1>
              <p className="text-xl text-gray-600">
                MediVault is transforming healthcare by giving patients control over their health data 
                through secure, accessible digital records.
              </p>
            </div>
          </div>
        </section>
        
        {/* Mission & Vision */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <blockquote className="text-2xl md:text-3xl font-medium text-center text-medivault-700 mb-10 italic">
                "We believe in a world where patients have full control over their health data."
              </blockquote>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-12">
                <div className="bg-gray-50 p-8 rounded-xl">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Our Mission</h3>
                  <p className="text-gray-600">
                    To create a secure platform that empowers patients to manage their health records 
                    efficiently while providing seamless sharing capabilities with healthcare professionals.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-8 rounded-xl">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Our Vision</h3>
                  <p className="text-gray-600">
                    A healthcare ecosystem where medical information flows securely and instantaneously 
                    between patients and providers, leading to better outcomes and personalized care.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* How It Works */}
        <section className="py-20 bg-gradient-to-br from-medivault-50 to-blue-50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">
                How MediVault Works
              </h2>
              <p className="text-lg text-gray-600">
                Our platform simplifies health record management in just a few steps.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                {
                  title: "Sign Up & Upload Records",
                  description: "Create your account and upload your medical documents, prescriptions, and test results.",
                  icon: User,
                  iconBg: "bg-blue-100",
                  iconColor: "text-blue-600"
                },
                {
                  title: "Organize Your Health Data",
                  description: "Categorize your records and get AI-powered insights about your health trends.",
                  icon: FileText,
                  iconBg: "bg-green-100",
                  iconColor: "text-green-600"
                },
                {
                  title: "Generate a QR Code",
                  description: "Create a secure, time-limited QR code for doctors to access your relevant medical history.",
                  icon: Smartphone,
                  iconBg: "bg-medivault-100",
                  iconColor: "text-medivault-600"
                },
                {
                  title: "Manage & Track Treatments",
                  description: "Keep track of medications, appointments, and follow-ups all in one place.",
                  icon: Clock,
                  iconBg: "bg-amber-100",
                  iconColor: "text-amber-600"
                }
              ].map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={i} className="relative">
                    {i < 3 && (
                      <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-medivault-100 z-0 -ml-4">
                        <div className="absolute right-0 top-1/2 -mt-1 -mr-2 w-3 h-3 transform rotate-45 border-t-2 border-r-2 border-medivault-300"></div>
                      </div>
                    )}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 relative z-10 h-full">
                      <div className="absolute -top-5 left-6 w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-lg font-semibold text-medivault-600">
                        {i + 1}
                      </div>
                      <div className={cn("w-14 h-14 rounded-lg flex items-center justify-center mb-4 mt-4", step.iconBg)}>
                        <Icon className={cn("w-7 h-7", step.iconColor)} />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
        
        {/* Security & Privacy */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-block mb-4">
                <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-purple-100 text-purple-800">
                  <Shield className="w-4 h-4 mr-1" />
                  Security First
                </span>
              </div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">
                Our Commitment to Security & Privacy
              </h2>
              <p className="text-lg text-gray-600">
                Your health data deserves the highest level of protection. Here's how we ensure it.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-medivault-100 flex items-center justify-center mb-6">
                  <Lock className="w-8 h-8 text-medivault-600" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">End-to-End Encryption</h3>
                <p className="text-gray-600">
                  All your medical data is encrypted from the moment it leaves your device until it's accessed by authorized healthcare providers.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">Role-Based Access Control</h3>
                <p className="text-gray-600">
                  Our platform ensures that only authorized healthcare providers can access the specific health information you choose to share.
                </p>
              </div>
            </div>
            
            <div className="mt-16 text-center">
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                MediVault is designed with HIPAA compliance in mind, prioritizing the security and privacy of your sensitive health information.
              </p>
              <Button className="bg-medivault-600 hover:bg-medivault-700" asChild>
                <Link to="/features">
                  Learn more about our security features
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-medivault-600 to-medivault-800 text-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-semibold mb-4">
                Ready to Take Control of Your Health Data?
              </h2>
              <p className="text-xl text-medivault-50 mb-8">
                Join MediVault today and experience a new way to manage your health records.
              </p>
              
              <Button size="lg" className="bg-white text-medivault-700 hover:bg-medivault-50">
                <Link to="/signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
