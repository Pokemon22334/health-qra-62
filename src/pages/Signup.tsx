
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import SignupForm from "@/components/auth/SignupForm";
import SignupHero from "@/components/auth/SignupHero";

const Signup = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-medivault-50 via-white to-blue-50">
        <NavBar />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-pulse text-lg text-gray-600">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  // If user is already authenticated, don't render signup page
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-medivault-50 via-white to-blue-50">
      <NavBar />
      
      <main className="flex-grow container mx-auto px-4 py-20 md:py-28">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          <SignupHero />
          <SignupForm />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Signup;
