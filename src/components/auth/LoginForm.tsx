
import { useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock, Mail, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import SocialLogin from "@/components/auth/SocialLogin";

interface LoginFormProps {
  onSuccessfulLogin: () => void;
}

const LoginForm = ({ onSuccessfulLogin }: LoginFormProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login verification
    setTimeout(() => {
      setIsLoading(false);
      
      // For demo purposes, show 2FA after successful credential check
      if (email && password.length >= 6) {
        // Mock 2FA requirement check (in a real app, this would be server-side)
        onSuccessfulLogin();
      } else {
        setLoginAttempts(prev => prev + 1);
        
        // Brute force protection
        if (loginAttempts >= 4) {
          toast({
            title: "Account temporarily locked",
            description: "Too many failed attempts. Please try again later.",
            variant: "destructive",
          });
          return;
        }
        
        toast({
          title: "Login failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        });
      }
    }, 1500);
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg animate-fade-in" style={{ animationDelay: "150ms" }}>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Log In</h2>
        <p className="text-gray-600 mt-1">Access your medical records securely</p>
      </div>
      
      <form onSubmit={handleLogin} className="space-y-5">
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
              className="pl-10"
              required
            />
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </label>
            <Link to="/forgot-password" className="text-sm text-medivault-600 hover:text-medivault-700">
              Forgot Password?
            </Link>
          </div>
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
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember"
            checked={rememberMe}
            onCheckedChange={(checked) => 
              setRememberMe(checked === true)
            }
          />
          <label
            htmlFor="remember"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Remember me on this device
          </label>
        </div>
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Log In"}
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
        New to MediVault?{" "}
        <Link to="/signup" className="font-semibold text-medivault-600 hover:text-medivault-500">
          Sign up here
        </Link>
      </p>
      
      {loginAttempts > 0 && (
        <div className="mt-4 p-3 bg-red-50 rounded-md flex items-start space-x-2">
          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">
              Login attempt failed
            </p>
            <p className="text-xs text-red-700 mt-1">
              {5 - loginAttempts} attempts remaining before temporary lock
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginForm;
