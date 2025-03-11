
import { useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock, Mail, Shield, User, Phone, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import SocialLogin from "@/components/auth/SocialLogin";
import PasswordStrengthMeter from "@/components/auth/PasswordStrengthMeter";

const Signup = () => {
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const passwordsMatch = !confirmPassword || password === confirmPassword;
  
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  
  const isEmailValid = !email || validateEmail(email);
  
  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreeToTerms) {
      toast({
        title: "Please agree to terms",
        description: "You must agree to the terms and privacy policy",
        variant: "destructive",
      });
      return;
    }
    
    if (!passwordsMatch) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    // Simulate signup process
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Account created successfully!",
        description: "Welcome to MediVault! Redirecting to setup your profile...",
      });
      
      // In a real app, we would redirect to onboarding or dashboard
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    }, 2000);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-medivault-50 via-white to-blue-50">
      <NavBar />
      
      <main className="flex-grow container mx-auto px-4 py-20 md:py-28">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          {/* Hero Section (Left Side) */}
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
          
          {/* Signup Form (Right Side) */}
          <div className="bg-white p-8 rounded-xl shadow-lg animate-fade-in" style={{ animationDelay: "150ms" }}>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Create Your Account</h2>
              <p className="text-gray-600 mt-1">Join thousands of users managing their health data</p>
            </div>
            
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`pl-10 ${!isEmailValid ? 'border-red-500' : ''}`}
                    required
                  />
                  {email && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      {isEmailValid ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                {!isEmailValid && email && (
                  <p className="text-xs text-red-500 mt-1">Please enter a valid email address</p>
                )}
              </div>
              
              <div className="space-y-1">
                <label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Phone Number <span className="text-gray-500 text-xs">(Optional, for 2FA)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                
                {password && <PasswordStrengthMeter password={password} />}
              </div>
              
              <div className="space-y-1">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`pl-10 ${!passwordsMatch && confirmPassword ? 'border-red-500' : ''}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {!passwordsMatch && confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
                )}
              </div>
              
              <div className="flex items-start space-x-2 mt-4">
                <Checkbox
                  id="terms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
                  className="mt-1"
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I agree to the{" "}
                  <Link to="/terms" className="text-medivault-600 hover:underline">Terms of Service</Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-medivault-600 hover:underline">Privacy Policy</Link>
                </label>
              </div>
              
              <Button type="submit" className="w-full mt-6" disabled={isLoading || !isEmailValid || !passwordsMatch}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
            
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or continue with</span>
                </div>
              </div>
              
              <SocialLogin />
            </div>
            
            <p className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-medivault-600 hover:text-medivault-500">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Signup;
