
import { Shield, Lock } from "lucide-react";

const LoginHero = () => {
  return (
    <div className="order-2 md:order-1 animate-fade-in">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        Welcome Back to MediVault
      </h1>
      <p className="text-lg text-gray-600 mb-6">
        Log in to access your secure health records and QR code sharing.
      </p>
      
      <div className="relative w-full rounded-lg overflow-hidden shadow-xl mt-8 hidden md:block">
        <div className="absolute inset-0 bg-gradient-to-tr from-medivault-700/20 to-transparent z-10" />
        <img 
          src="https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
          alt="Doctor scanning QR code" 
          className="w-full object-cover md:h-[400px]"
        />
      </div>
      
      <div className="flex items-center mt-8 space-x-6">
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-medivault-600" />
          <span className="text-sm text-gray-600">End-to-End Encrypted</span>
        </div>
        <div className="flex items-center space-x-2">
          <Lock className="h-5 w-5 text-medivault-600" />
          <span className="text-sm text-gray-600">HIPAA Compliant</span>
        </div>
      </div>
    </div>
  );
};

export default LoginHero;
