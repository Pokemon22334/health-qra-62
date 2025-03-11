
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Lock, CheckSquare, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

const GetStarted = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    {
      id: 1,
      title: "Create Your Free Account",
      description: "Sign up in under a minute with just your email.",
      icon: "👤",
    },
    {
      id: 2,
      title: "Upload Your Medical Records",
      description: "Store prescriptions, reports, and medical history securely.",
      icon: "📋",
    },
    {
      id: 3,
      title: "Secure & Encrypt Your Data",
      description: "Privacy-focused with end-to-end encryption.",
      icon: "🔒",
    },
    {
      id: 4,
      title: "Generate Your Unique QR Code",
      description: "Share health data securely with doctors.",
      icon: "📱",
    },
    {
      id: 5,
      title: "Track Your Health & Medications",
      description: "Set reminders and access insights.",
      icon: "💊",
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const testimonials = [
    {
      id: 1,
      name: "Sarah M.",
      role: "Fitness Coach",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      text: "MediVault has made it so easy to share my health data with specialists. The QR code feature is genius!"
    },
    {
      id: 2,
      name: "James L.",
      role: "Software Engineer",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      text: "As someone who sees multiple specialists, having all my records in one place has been a game-changer."
    },
    {
      id: 3,
      name: "Elena T.",
      role: "Retired Teacher",
      image: "https://randomuser.me/api/portraits/women/68.jpg",
      text: "The medication reminders have helped me stay on track with my treatment plan. Highly recommend!"
    }
  ];

  const handleStepHover = (stepId: number) => {
    setActiveStep(stepId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <NavBar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-24 md:py-32">
          <motion.div 
            className="max-w-5xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Get Started with MediVault in Minutes
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Your health records, securely stored and instantly accessible – all in one place.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700"
                onClick={() => navigate("/signup")}
              >
                Sign Up Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-6"
                onClick={() => navigate("/features")}
              >
                Learn More
              </Button>
            </div>
            
            <div className="relative mt-12 w-full max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/30 to-transparent z-10" />
              <img 
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
                alt="Person using MediVault app" 
                className="w-full object-cover h-[300px] md:h-[400px]"
              />
            </div>
          </motion.div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                How It Works in 5 Simple Steps
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                MediVault makes managing your health records simple, secure, and accessible
              </p>
            </motion.div>

            <div className="grid md:grid-cols-5 gap-6 mb-16 relative">
              {/* Connection line */}
              <div className="hidden md:block absolute top-16 left-[10%] right-[10%] h-0.5 bg-blue-100 z-0"></div>

              {steps.map((step) => (
                <motion.div
                  key={step.id}
                  className={`relative z-10 flex flex-col items-center ${
                    activeStep === step.id ? "scale-105" : ""
                  }`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: step.id * 0.1 }}
                  onMouseEnter={() => handleStepHover(step.id)}
                  whileHover={{ scale: 1.05 }}
                >
                  <div 
                    className={`flex items-center justify-center w-16 h-16 rounded-full text-2xl mb-4 shadow-md
                      ${activeStep === step.id 
                        ? "bg-blue-600 text-white"
                        : "bg-white text-blue-600 border border-blue-100"}`}
                  >
                    <span>{step.icon}</span>
                  </div>
                  <div className={`text-center transition-all duration-300 ${
                    activeStep === step.id ? "text-blue-600" : "text-gray-800"
                  }`}>
                    <h3 className="font-semibold mb-2 text-lg">Step {step.id}</h3>
                    <h4 className="font-bold mb-2">{step.title}</h4>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6"
                onClick={() => navigate("/signup")}
              >
                Get Started Today
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-blue-50">
          <div className="container mx-auto px-4">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              See What Our Users Say
            </motion.h2>

            <motion.div 
              className="grid md:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {testimonials.map((testimonial) => (
                <motion.div
                  key={testimonial.id}
                  className="bg-white p-6 rounded-xl shadow-md"
                  variants={itemVariants}
                  whileHover={{ y: -10, transition: { type: "spring", stiffness: 300 } }}
                >
                  <div className="flex items-center mb-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 italic">"{testimonial.text}"</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Security Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              Your Data is 100% Secure & Private
            </motion.h2>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <motion.div 
                className="bg-blue-50 p-8 rounded-xl text-center"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <Shield className="w-12 h-12 mx-auto text-blue-600 mb-4" />
                <h3 className="font-bold text-xl mb-2">End-to-End Encryption</h3>
                <p className="text-gray-700">Your health data is encrypted and can only be accessed by authorized users.</p>
              </motion.div>

              <motion.div 
                className="bg-blue-50 p-8 rounded-xl text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <Lock className="w-12 h-12 mx-auto text-blue-600 mb-4" />
                <h3 className="font-bold text-xl mb-2">HIPAA & GDPR Compliant</h3>
                <p className="text-gray-700">We adhere to the highest standards of medical data privacy regulations.</p>
              </motion.div>

              <motion.div 
                className="bg-blue-50 p-8 rounded-xl text-center"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <CheckSquare className="w-12 h-12 mx-auto text-blue-600 mb-4" />
                <h3 className="font-bold text-xl mb-2">Cloud Backup & Access</h3>
                <p className="text-gray-700">Access your medical data securely from any device, anywhere.</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="sticky bottom-0 z-50 bg-blue-600 py-6 shadow-lg">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <h3 className="text-white text-xl md:text-2xl font-semibold mb-4 md:mb-0 text-center md:text-left">
                Ready to Take Control of Your Health?
              </h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="bg-white text-blue-600 hover:bg-blue-50"
                  onClick={() => navigate("/signup")}
                >
                  Sign Up Now
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-white border-white hover:bg-blue-700"
                  onClick={() => navigate("/features")}
                >
                  Explore Features
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default GetStarted;
