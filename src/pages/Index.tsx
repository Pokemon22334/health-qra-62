
import { Link } from 'react-router-dom';
import { ArrowRight, Check, ShieldCheck, Smartphone, User, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NavBar from '@/components/NavBar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Footer from '@/components/Footer';
import { cn } from '@/lib/utils';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow">
        <Hero />
        
        <Features />
        
        {/* How It Works Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-block mb-4">
                <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-medivault-100 text-medivault-800">
                  <span className="mr-2 h-2 w-2 rounded-full bg-medivault-500"></span>
                  Simple Process
                </span>
              </div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">
                How MediVault Works
              </h2>
              <p className="text-lg text-gray-600">
                MediVault simplifies health record management in just a few steps.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  title: "Create Your Account",
                  description: "Sign up and set up your secure profile with basic health information and emergency contacts.",
                  icon: User,
                  iconBg: "bg-blue-100",
                  iconColor: "text-blue-600"
                },
                {
                  title: "Upload Your Records",
                  description: "Upload and categorize your medical documents, prescriptions, and test results.",
                  icon: FileText,
                  iconBg: "bg-green-100",
                  iconColor: "text-green-600"
                },
                {
                  title: "Share via QR Code",
                  description: "Generate a secure QR code for doctors to instantly access your relevant medical history.",
                  icon: Smartphone,
                  iconBg: "bg-medivault-100",
                  iconColor: "text-medivault-600"
                }
              ].map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={i} className="relative">
                    {i < 2 && (
                      <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-medivault-100 z-0 -ml-4">
                        <div className="absolute right-0 top-1/2 -mt-1 -mr-2 w-3 h-3 transform rotate-45 border-t-2 border-r-2 border-medivault-300"></div>
                      </div>
                    )}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 relative z-10">
                      <div className="absolute -top-5 left-6 w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-lg font-semibold text-medivault-600">
                        {i + 1}
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
          </div>
        </section>
        
        {/* Testimonials */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">
                What Our Users Say
              </h2>
              <p className="text-lg text-gray-600">
                Discover how MediVault is transforming healthcare management for our users.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  quote: "MediVault has changed how I manage my health. I can easily share my medical history with new doctors without repeating tests.",
                  author: "Sarah Johnson",
                  role: "Patient with Chronic Condition"
                },
                {
                  quote: "As a doctor, the QR code feature saves tremendous time. I can focus on treating patients rather than paperwork and data collection.",
                  author: "Dr. Michael Chen",
                  role: "Cardiologist"
                },
                {
                  quote: "Managing my family's health records in one place is a game-changer. The medication reminders ensure we never miss important doses.",
                  author: "Robert Williams",
                  role: "Parent of Three"
                }
              ].map((testimonial, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex flex-col h-full">
                    <div className="mb-4 text-medivault-500">
                      {Array(5).fill(0).map((_, i) => (
                        <span key={i} className="text-xl">★</span>
                      ))}
                    </div>
                    <blockquote className="flex-grow">
                      <p className="text-gray-700 italic">"{testimonial.quote}"</p>
                    </blockquote>
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <p className="font-medium text-gray-900">{testimonial.author}</p>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
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
              
              <div className="space-y-4 sm:space-y-0 sm:flex sm:justify-center sm:space-x-4">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-medivault-700">
                  <Link to="/features">Learn More</Link>
                </Button>
                <Button size="lg" className="bg-white text-medivault-700 hover:bg-medivault-50">
                  <Link to="/signup">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              
              <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                {[
                  { text: "End-to-End Encryption", icon: ShieldCheck },
                  { text: "HIPAA Compliant", icon: ShieldCheck },
                  { text: "24/7 Support", icon: Check },
                  { text: "Free Basic Plan", icon: Check }
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-center justify-center sm:justify-start">
                      <Icon className="w-5 h-5 mr-2 text-medivault-200" />
                      <span className="text-sm">{item.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
