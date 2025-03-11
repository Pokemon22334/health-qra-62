
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import TwoFactorAuth from "@/components/auth/TwoFactorAuth";
import LoginForm from "@/components/auth/LoginForm";
import LoginHero from "@/components/auth/LoginHero";

const Login = () => {
  const { toast } = useToast();
  const [show2FA, setShow2FA] = useState(false);

  const handleSuccessfulLogin = () => {
    setShow2FA(true);
  };

  const handleSuccessful2FA = () => {
    toast({
      title: "Login successful",
      description: "Redirecting to your dashboard...",
    });
    
    // In a real app, we would redirect to the dashboard here
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-medivault-50 via-white to-blue-50">
      <NavBar />
      
      <main className="flex-grow container mx-auto px-4 py-20 md:py-28">
        {!show2FA ? (
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
            <LoginHero />
            <LoginForm onSuccessfulLogin={handleSuccessfulLogin} />
          </div>
        ) : (
          <TwoFactorAuth onSuccess={handleSuccessful2FA} onCancel={() => setShow2FA(false)} />
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Login;
