
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import SignupForm from "@/components/auth/SignupForm";
import SignupHero from "@/components/auth/SignupHero";

const Signup = () => {
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
