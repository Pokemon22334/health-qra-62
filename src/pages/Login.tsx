
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import LoginForm from "@/components/auth/LoginForm";
import LoginHero from "@/components/auth/LoginHero";
import TwoFactorAuth from "@/components/auth/TwoFactorAuth";

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [showTwoFactorAuth, setShowTwoFactorAuth] = useState(false);
  
  // If user is already authenticated, redirect to dashboard
  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  const handleSuccessfulLogin = (requires2FA = false) => {
    if (requires2FA) {
      setShowTwoFactorAuth(true);
    } else {
      navigate('/dashboard');
    }
  };

  const handleTwoFactorSuccess = () => {
    navigate('/dashboard');
  };

  const handleCancelTwoFactor = () => {
    setShowTwoFactorAuth(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-medivault-50 via-white to-blue-50">
      <NavBar />
      
      <main className="flex-grow container mx-auto px-4 py-20 md:py-28">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          {showTwoFactorAuth ? (
            <div className="md:col-span-2">
              <TwoFactorAuth 
                onSuccess={handleTwoFactorSuccess} 
                onCancel={handleCancelTwoFactor}
              />
            </div>
          ) : (
            <>
              <LoginHero />
              <LoginForm onSuccessfulLogin={handleSuccessfulLogin} />
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Login;
