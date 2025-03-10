
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="relative overflow-hidden pt-20">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-medivault-50 via-white to-blue-50 -z-10" />
      
      {/* Decorative Blobs */}
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-medivault-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-subtle" />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse-subtle" style={{ animationDelay: '1s' }} />
      
      <div className="container mx-auto px-4 md:px-6 py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block mb-6 animate-fade-in">
            <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-medivault-100 text-medivault-800">
              <span className="mr-2 h-2 w-2 rounded-full bg-medivault-500"></span>
              Introducing MediVault
            </span>
          </div>
          
          <h1 className="font-semibold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-balance mb-6 text-gray-900 animate-fade-in" style={{ animationDelay: '150ms' }}>
            Your Health,{" "}
            <span className="relative">
              <span className="text-medivault-600">One QR</span>
              <span className="absolute -bottom-1 left-0 right-0 h-1 bg-medivault-400 opacity-40"></span>
            </span>
            {" "}Away
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '300ms' }}>
            Securely store, manage, and share your medical history with medical professionals through a simple QR code. Take control of your health data in one convenient place.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in" style={{ animationDelay: '450ms' }}>
            <Button size="lg" className="button-hover-effect" asChild>
              <Link to="/get-started">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="button-hover-effect">
              <Link to="/features">Learn More</Link>
            </Button>
          </div>
        </div>
        
        {/* Hero Image */}
        <div className="mt-16 animate-fade-in-up max-w-4xl mx-auto" style={{ animationDelay: '600ms' }}>
          <div className="relative rounded-xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-tr from-medivault-800/20 to-black/0 z-10" />
            <img 
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
              alt="MediVault Dashboard Preview" 
              className="w-full object-cover aspect-[16/9]"
            />
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium text-medivault-800 z-20">
              Dashboard Preview
            </div>
          </div>
          
          {/* Floating QR Code Sample */}
          <div className="absolute -bottom-6 -right-10 md:bottom-10 md:right-24 w-24 h-24 md:w-32 md:h-32 bg-white rounded-lg shadow-xl p-2 rotate-6 hidden md:block">
            <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
              <svg className="w-3/4 h-3/4" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M30 30H40V40H30V30ZM50 30H60V40H50V30ZM30 50H40V60H30V50ZM60 50H70V60H60V50ZM50 50H60V60H50V50ZM30 70H40V80H30V70Z" fill="currentColor" className="text-medivault-800" />
                <rect x="30" y="30" width="40" height="50" stroke="currentColor" strokeWidth="4" className="text-medivault-800" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
    </div>
  );
};

export default Hero;
