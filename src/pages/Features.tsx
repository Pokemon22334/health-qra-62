
import { Link } from 'react-router-dom';
import { ArrowRight, Brain, CloudCog, FileText, Lock, ShieldCheck, Stethoscope, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { cn } from '@/lib/utils';

const Features = () => {
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
                  Feature-Rich
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-6">
                Powerful Features for Smarter Health Management
              </h1>
              <p className="text-xl text-gray-600">
                Securely store, track, and share your medical data effortlessly with MediVault's comprehensive suite of features.
              </p>
            </div>
          </div>
        </section>
        
        {/* Features Grid Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  title: "QR-Based Doctor Access",
                  description: "Doctors scan a QR code to access your records securely during consultations, with time-limited permissions.",
                  icon: QrCode,
                  iconColor: "text-medivault-600",
                  iconBg: "bg-medivault-100"
                },
                {
                  title: "Secure Health Record Storage",
                  description: "Upload & organize medical reports, prescriptions, and test results in one secure location.",
                  icon: FileText,
                  iconColor: "text-green-600",
                  iconBg: "bg-green-100"
                },
                {
                  title: "AI-Powered Health Insights",
                  description: "View trends in blood pressure, blood sugar, and other health metrics with intelligent visualizations.",
                  icon: Brain,
                  iconColor: "text-purple-600",
                  iconBg: "bg-purple-100"
                },
                {
                  title: "Emergency Profile",
                  description: "Store crucial information like allergies, blood type, and emergency contacts for quick access in critical situations.",
                  icon: AlertCircle,
                  iconColor: "text-red-600",
                  iconBg: "bg-red-100"
                },
                {
                  title: "Medication Tracker",
                  description: "Set reminders for medicines and treatments to ensure you never miss an important dose.",
                  icon: Clock,
                  iconColor: "text-amber-600",
                  iconBg: "bg-amber-100"
                },
                {
                  title: "Doctor Notes & Visit History",
                  description: "Keep a comprehensive record of past visits, diagnoses, and doctor recommendations.",
                  icon: Stethoscope,
                  iconColor: "text-blue-600",
                  iconBg: "bg-blue-100"
                },
                {
                  title: "End-to-End Encryption",
                  description: "Advanced security mechanisms and role-based access ensure your health data remains private and protected.",
                  icon: ShieldCheck,
                  iconColor: "text-indigo-600",
                  iconBg: "bg-indigo-100"
                },
                {
                  title: "Cloud Sync & Multi-Device",
                  description: "Access your health records from any device, with real-time synchronization across all your devices.",
                  icon: CloudCog,
                  iconColor: "text-teal-600",
                  iconBg: "bg-teal-100"
                }
              ].map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div 
                    key={index} 
                    className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center mb-4", feature.iconBg)}>
                      <Icon className={cn("w-6 h-6", feature.iconColor)} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 flex-grow">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
        
        {/* Feature Spotlight */}
        <section className="py-16 bg-gradient-to-br from-medivault-50 to-blue-50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">Feature Spotlight</h2>
              <p className="text-lg text-gray-600">
                Discover how MediVault transforms healthcare management with these standout features.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* QR Code Feature */}
              <div className="bg-white rounded-xl overflow-hidden shadow-md">
                <div className="p-8 flex flex-col h-full">
                  <div className={cn("w-14 h-14 rounded-lg flex items-center justify-center mb-6", "bg-medivault-100")}>
                    <QrCode className={cn("w-8 h-8", "text-medivault-600")} />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">QR-Based Doctor Access</h3>
                  <p className="text-gray-600 mb-6">
                    Generate a secure QR code that gives healthcare providers instant access to your relevant medical information during appointments.
                  </p>
                  <ul className="space-y-3 mb-6">
                    {[
                      "Time-limited access with automatic expiration",
                      "Control which records doctors can view",
                      "Track all access attempts in your security log",
                      "Revoke access instantly if needed"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-medivault-100 flex items-center justify-center mt-1">
                          <div className="w-2 h-2 bg-medivault-500 rounded-full" />
                        </div>
                        <span className="ml-3 text-gray-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Security Feature */}
              <div className="bg-white rounded-xl overflow-hidden shadow-md">
                <div className="p-8 flex flex-col h-full">
                  <div className={cn("w-14 h-14 rounded-lg flex items-center justify-center mb-6", "bg-indigo-100")}>
                    <Lock className={cn("w-8 h-8", "text-indigo-600")} />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">Enterprise-Grade Security</h3>
                  <p className="text-gray-600 mb-6">
                    Your health data deserves the highest level of protection. MediVault employs advanced security measures to keep your information safe.
                  </p>
                  <ul className="space-y-3 mb-6">
                    {[
                      "End-to-end encryption for all stored data",
                      "Two-factor authentication (2FA) for account security",
                      "HIPAA-compliant data practices",
                      "Detailed access logs and security alerts"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center mt-1">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                        </div>
                        <span className="ml-3 text-gray-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-medivault-600 to-medivault-800 text-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-semibold mb-4">
                Ready to Experience MediVault?
              </h2>
              <p className="text-xl text-medivault-50 mb-8">
                Join thousands of users who are taking control of their health data with MediVault.
              </p>
              
              <Button size="lg" className="bg-white text-medivault-700 hover:bg-medivault-50">
                <Link to="/signup">
                  Get Started Today
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

// Since QrCode isn't available in lucide-react directly, we'll implement it
const QrCode = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="5" height="5" x="3" y="3" rx="1" />
      <rect width="5" height="5" x="16" y="3" rx="1" />
      <rect width="5" height="5" x="3" y="16" rx="1" />
      <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
      <path d="M21 21v.01" />
      <path d="M12 7v3a2 2 0 0 1-2 2H7" />
      <path d="M3 12h.01" />
      <path d="M12 3h.01" />
      <path d="M12 16v.01" />
      <path d="M16 12h1" />
      <path d="M21 12v.01" />
      <path d="M12 21v-1" />
    </svg>
  );
};

export default Features;
