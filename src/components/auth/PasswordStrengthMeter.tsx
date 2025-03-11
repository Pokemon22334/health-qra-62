
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface PasswordStrengthMeterProps {
  password: string;
}

const PasswordStrengthMeter = ({ password }: PasswordStrengthMeterProps) => {
  const [strength, setStrength] = useState(0);
  const [message, setMessage] = useState("");
  
  useEffect(() => {
    calculateStrength(password);
  }, [password]);
  
  const calculateStrength = (password: string) => {
    // Start with a base score
    let strengthScore = 0;
    let feedback = [];
    
    if (password.length === 0) {
      setStrength(0);
      setMessage("");
      return;
    }
    
    // Length check
    if (password.length >= 8) {
      strengthScore += 1;
    } else {
      feedback.push("Use at least 8 characters");
    }
    
    // Complexity checks
    if (/[A-Z]/.test(password)) strengthScore += 1;
    else feedback.push("Add uppercase letters");
    
    if (/[a-z]/.test(password)) strengthScore += 1;
    else feedback.push("Add lowercase letters");
    
    if (/[0-9]/.test(password)) strengthScore += 1;
    else feedback.push("Add numbers");
    
    if (/[^A-Za-z0-9]/.test(password)) strengthScore += 1;
    else feedback.push("Add special characters");
    
    // Set the final strength score (0-4)
    setStrength(strengthScore);
    
    // Set appropriate message
    if (strengthScore === 0) setMessage("Very weak");
    else if (strengthScore === 1) setMessage("Weak");
    else if (strengthScore === 2) setMessage("Fair");
    else if (strengthScore === 3) setMessage("Good");
    else if (strengthScore === 4) setMessage("Strong");
    else setMessage("Very strong");
  };
  
  const getStrengthColor = () => {
    if (strength === 0 || strength === 1) return "bg-red-500";
    if (strength === 2) return "bg-orange-500";
    if (strength === 3) return "bg-yellow-500";
    return "bg-green-500";
  };
  
  return (
    <div className="mt-1 space-y-2">
      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={cn("h-full transition-all duration-300", getStrengthColor())}
          style={{ width: `${Math.max(5, (strength / 5) * 100)}%` }}
        />
      </div>
      
      {message && (
        <div className="flex justify-between items-center text-xs">
          <span className={cn(
            "font-medium",
            strength <= 1 ? "text-red-600" :
            strength === 2 ? "text-orange-600" :
            strength === 3 ? "text-yellow-600" :
            "text-green-600"
          )}>
            {message}
          </span>
          
          <span className="text-gray-500">
            {strength < 3 ? "Could be stronger" : ""}
          </span>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthMeter;
