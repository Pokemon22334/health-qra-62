
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Upload, 
  Shield, 
  QrCode, 
  Bell, 
  User, 
  CheckCircle, 
  Lock, 
  Globe, 
  Cloud
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { cn } from '@/lib/utils';

const GetStarted = () => {
  const [activeStep, setActiveStep] = useState(1);

  // Animation for steps hover
  const handleStepHover = (stepNumber: number) => {
    setActiveStep(stepNumber);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-16">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-medivault-50 via-white to-blue-50 -z-10" />
          
          {/* Decorative Elements */}
          <div className="absolute top-1/4 right-1/5 w-64 h-64 bg-medivault-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-subtle" />
          
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <div className="flex-1 text-center md:text-left max-w-2xl mx-auto md:mx-0">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4 animate-fade-in">
                  Get Started with MediVault in Minutes
                </h1>
                <p className="text-xl text-gray-600 mb-8 animate-fade-in" style={{ animationDelay: '150ms' }}>
                  Your health records, securely stored and instantly accessible – all in one place.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start mb-8 animate-fade-in" style={{ animationDelay: '300ms' }}>
                  <Button size="lg" className="button-hover-effect" asChild>
                    <Link to="/signup">
                      Sign Up Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" className="button-hover-effect" asChild>
                    <Link to="/features">Learn More</Link>
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 relative animate-fade-in-up" style={{ animationDelay: '450ms' }}>
                <div className="relative z-10 bg-white rounded-xl shadow-xl overflow-hidden p-2 border border-gray-100">
                  <img 
                    src="https://images.unsplash.com/photo-1584982751601-97dcc096659c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                    alt="Person using MediVault" 
                    className="w-full h-auto rounded-lg"
                  />
                  
                  {/* QR Code Overlay */}
                  <div className="absolute -bottom-6 -right-6 w-24 h-24 md:w-32 md:h-32 bg-white rounded-lg shadow-xl p-2 rotate-6">
                    <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                      <svg className="w-4/5 h-4/5" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M30 30H40V40H30V30ZM50 30H60V40H50V30ZM30 50H40V60H30V50ZM60 50H70V60H60V50ZM50 50H60V60H50V50ZM30 70H40V80H30V70Z" fill="currentColor" className="text-medivault-800" />
                        <rect x="30" y="30" width="40" height="50" stroke="currentColor" strokeWidth="4" className="text-medivault-800" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* How It Works Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-semibold text-gray-900 mb-6">
                How It Works in 5 Simple Steps
              </h2>
              <p className="text-lg text-gray-600">
                MediVault makes it easy to manage your health records in just a few steps
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 max-w-5xl mx-auto">
              {[
                {
                  title: "Create Your Free Account",
                  description: "Sign up in under a minute with just your email",
                  icon: User,
                  iconBg: "bg-blue-100",
                  iconColor: "text-blue-600"
                },
                {
                  title: "Upload Your Medical Records",
                  description: "Store prescriptions, reports, and medical history",
                  icon: Upload,
                  iconBg: "bg-green-100",
                  iconColor: "text-green-600"
                },
                {
                  title: "Secure & Encrypt Data",
                  description: "Privacy-focused, end-to-end encryption",
                  icon: Shield,
                  iconBg: "bg-purple-100",
                  iconColor: "text-purple-600"
                },
                {
                  title: "Generate Your Unique QR Code",
                  description: "Share health data securely with doctors",
                  icon: QrCode,
                  iconBg: "bg-medivault-100",
                  iconColor: "text-medivault-600"
                },
                {
                  title: "Track Health & Medications",
                  description: "Set reminders, access insights and trends",
                  icon: Bell,
                  iconBg: "bg-amber-100",
                  iconColor: "text-amber-600"
                }
              ].map((step, i) => {
                const Icon = step.icon;
                return (
                  <div 
                    key={i} 
                    className="relative"
                    onMouseEnter={() => handleStepHover(i + 1)}
                    onFocus={() => handleStepHover(i + 1)}
                  >
                    {i < 4 && (
                      <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gray-200 z-0 -ml-4">
                        {activeStep > i + 1 && (
                          <div className="absolute inset-0 bg-medivault-500 transition-all duration-500" style={{ width: '100%' }}></div>
                        )}
                        <div className="absolute right-0 top-1/2 -mt-1 -mr-2 w-3 h-3 transform rotate-45 border-t-2 border-r-2 border-gray-300"></div>
                      </div>
                    )}
                    <div className={cn(
                      "bg-white rounded-xl p-6 shadow-sm border transition-all duration-300",
                      activeStep === i + 1 ? "border-medivault-300 shadow-md transform -translate-y-1" : "border-gray-100"
                    )}>
                      <div className={cn(
                        "absolute -top-5 left-6 w-10 h-10 rounded-full bg-white shadow-sm border flex items-center justify-center text-lg font-semibold transition-colors duration-300",
                        activeStep >= i + 1 ? "border-medivault-500 text-medivault-600" : "border-gray-200 text-gray-400"
                      )}>
                        {activeStep > i + 1 ? <CheckCircle className="w-5 h-5 text-medivault-500" /> : i + 1}
                      </div>
                      <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center mb-4 mt-4", step.iconBg)}>
                        <Icon className={cn("w-6 h-6", step.iconColor)} />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="text-center mt-16">
              <Button size="lg" className="button-hover-effect" asChild>
                <Link to="/signup">
                  Get Started Today
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
        
        {/* Testimonials Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">
                See What Our Users Say
              </h2>
              <p className="text-lg text-gray-600">
                Discover how MediVault is transforming healthcare management
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: "Sarah Johnson",
                  role: "Patient with Chronic Condition",
                  quote: "MediVault has simplified my healthcare journey. I no longer worry about losing important medical records or repeating tests.",
                  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
                },
                {
                  name: "Dr. Michael Chen",
                  role: "Cardiologist",
                  quote: "As a doctor, the QR code feature saves precious time during consultations. I can focus on treating my patients better.",
                  avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
                },
                {
                  name: "Robert Williams",
                  role: "Parent of Three",
                  quote: "Managing my family's health records in one place is a game-changer. The medication reminders are especially helpful for my kids.",
                  avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
                }
              ].map((testimonial, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                  <div className="flex flex-col h-full">
                    <div className="mb-4 text-medivault-500">
                      {Array(5).fill(0).map((_, j) => (
                        <span key={j} className="text-xl">★</span>
                      ))}
                    </div>
                    <blockquote className="flex-grow">
                      <p className="text-gray-700 italic">"{testimonial.quote}"</p>
                    </blockquote>
                    <div className="mt-6 pt-6 border-t border-gray-200 flex items-center">
                      <img 
                        src={testimonial.avatar} 
                        alt={testimonial.name} 
                        className="w-10 h-10 rounded-full mr-4 object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{testimonial.name}</p>
                        <p className="text-sm text-gray-600">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Security & Trust Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">
                Your Data is 100% Secure & Private
              </h2>
              <p className="text-lg text-gray-600">
                We prioritize your privacy with industry-leading security measures
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                {
                  title: "End-to-End Encryption",
                  description: "Your health data is encrypted at rest and in transit, ensuring maximum security",
                  icon: Lock,
                  iconBg: "bg-medivault-100",
                  iconColor: "text-medivault-600"
                },
                {
                  title: "HIPAA & GDPR Compliant",
                  description: "Adhering to the highest international standards for health data protection",
                  icon: Globe,
                  iconBg: "bg-green-100",
                  iconColor: "text-green-600"
                },
                {
                  title: "Cloud Backup & Multi-Device",
                  description: "Access your health records from any device with secure cloud synchronization",
                  icon: Cloud,
                  iconBg: "bg-blue-100",
                  iconColor: "text-blue-600"
                }
              ].map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div key={i} className="bg-gray-50 rounded-xl p-8 border border-gray-100 hover:shadow-md transition-shadow duration-300">
                    <div className={cn("w-14 h-14 rounded-lg flex items-center justify-center mb-6", feature.iconBg)}>
                      <Icon className={cn("w-7 h-7", feature.iconColor)} />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
        
        {/* Final Call-to-Action */}
        <section className="py-20 bg-gradient-to-br from-medivault-600 to-medivault-800 text-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-semibold mb-4">
                Ready to Take Control of Your Health?
              </h2>
              <p className="text-xl text-medivault-50 mb-8">
                Join thousands of users who trust MediVault with their health records
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button size="lg" className="bg-white text-medivault-700 hover:bg-medivault-50 button-hover-effect" asChild>
                  <Link to="/signup">
                    Sign Up Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 button-hover-effect" asChild>
                  <Link to="/features">
                    Explore Features
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Sticky CTA (Mobile Only) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-200 shadow-lg z-50">
          <Button className="w-full button-hover-effect" asChild>
            <Link to="/signup">
              Sign Up Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default GetStarted;
