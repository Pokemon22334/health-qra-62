
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, RotateCw } from "lucide-react";

interface TwoFactorAuthProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const TwoFactorAuth = ({ onSuccess, onCancel }: TwoFactorAuthProps) => {
  const { toast } = useToast();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  // Timer effect
  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);
  
  // Format time as MM:SS
  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };
  
  const handleInputChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    // Take only the last character if multiple characters are pasted
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    
    // Move to next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };
  
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();
    
    // If pasted data is a 6-digit number, fill all inputs
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setOtp(digits);
      inputRefs.current[5]?.focus();
    }
  };
  
  const handleResendOtp = () => {
    setCanResend(false);
    setTimeLeft(60);
    
    toast({
      title: "Verification code sent",
      description: "A new verification code has been sent to your device.",
    });
  };
  
  const handleVerify = () => {
    const otpValue = otp.join("");
    
    if (otpValue.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter all 6 digits of your verification code.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    // Simulate verification
    setTimeout(() => {
      setIsLoading(false);
      
      // For demo purposes - use "123456" as the correct OTP
      if (otpValue === "123456") {
        onSuccess();
      } else {
        toast({
          title: "Incorrect code",
          description: "The verification code you entered is incorrect. Please try again.",
          variant: "destructive",
        });
      }
    }, 1500);
  };
  
  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg animate-fade-in">
      <div className="flex justify-center mb-6">
        <div className="h-16 w-16 bg-medivault-100 rounded-full flex items-center justify-center">
          <Shield className="h-8 w-8 text-medivault-600" />
        </div>
      </div>
      
      <h2 className="text-2xl font-semibold text-gray-800 text-center mb-2">
        Two-Factor Authentication
      </h2>
      
      <p className="text-gray-600 text-center mb-8">
        We've sent a 6-digit verification code to your device. Enter the code below to continue.
      </p>
      
      <div className="flex justify-center gap-2 mb-8">
        {otp.map((digit, index) => (
          <Input
            key={index}
            type="text"
            value={digit}
            maxLength={1}
            onChange={(e) => handleInputChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            ref={(el) => (inputRefs.current[index] = el)}
            className="w-10 h-12 text-center text-xl font-semibold"
            autoFocus={index === 0}
          />
        ))}
      </div>
      
      <div className="flex flex-col gap-4">
        <Button 
          onClick={handleVerify} 
          className="w-full"
          disabled={isLoading || otp.join("").length !== 6}
        >
          {isLoading ? "Verifying..." : "Verify"}
        </Button>
        
        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onCancel}
            className="text-gray-600"
          >
            Back to Login
          </Button>
          
          <div className="text-sm text-gray-600 flex items-center">
            {canResend ? (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleResendOtp}
                className="text-medivault-600 flex items-center gap-1"
              >
                <RotateCw className="h-3.5 w-3.5" /> Resend Code
              </Button>
            ) : (
              <span>
                Resend in <span className="font-medium">{formatTime()}</span>
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          For demo purposes, the correct code is: <span className="font-medium">123456</span>
        </p>
      </div>
    </div>
  );
};

export default TwoFactorAuth;
