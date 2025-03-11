
import { Shield, Lock } from "lucide-react";

const SignupHero = () => {
  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        Join MediVault – Securely Store & Access Your Health Records
      </h1>
      <p className="text-lg text-gray-600 mb-6">
        Sign up in just a few clicks and take control of your medical history.
      </p>
      
      <div className="relative w-full rounded-lg overflow-hidden shadow-xl mt-8 hidden md:block">
        <div className="absolute inset-0 bg-gradient-to-tr from-medivault-700/20 to-transparent z-10" />
        <img 
          src="https://images.unsplash.com/photo-1584982751601-97dcc096659c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
          alt="Doctor and patient with digital health record" 
          className="w-full object-cover md:h-[400px]"
        />
      </div>
      
      <div className="mt-8 grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm text-center">
          <Shield className="h-6 w-6 mx-auto text-medivault-600 mb-2" />
          <h3 className="text-sm font-medium text-gray-800">Secure & Encrypted</h3>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm text-center">
          <Lock className="h-6 w-6 mx-auto text-medivault-600 mb-2" />
          <h3 className="text-sm font-medium text-gray-800">HIPAA Compliant</h3>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm text-center">
          <Shield className="h-6 w-6 mx-auto text-medivault-600 mb-2" />
          <h3 className="text-sm font-medium text-gray-800">GDPR Compliant</h3>
        </div>
      </div>
    </div>
  );
};

export default SignupHero;
