
import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Home } from 'lucide-react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import PublicRecordsList from '@/components/PublicRecordsList';
import { Toaster } from '@/components/ui/toaster';

const PublicRecordsPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/" className="text-medivault-600 hover:text-medivault-700 flex items-center">
            <Home className="h-4 w-4 mr-1" />
            Home
          </Link>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-center mb-6">
            <Shield className="h-6 w-6 text-medivault-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-800">Shared Medical Records</h1>
          </div>
          
          <p className="text-center text-gray-600 mb-6">
            These medical records have been securely shared with you.
          </p>
          
          <PublicRecordsList />
        </div>
      </main>
      
      <div className="bg-medivault-50 py-8 border-t border-medivault-100">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-3">
            <Shield className="h-5 w-5 text-medivault-600 mr-2" />
            <h2 className="text-xl font-semibold text-medivault-800">Secure Sharing</h2>
          </div>
          
          <p className="text-medivault-700 max-w-lg mx-auto">
            MediVault ensures all shared records are securely accessible. No login is required to 
            view these specific records. For more information, visit MediVault.
          </p>
        </div>
      </div>
      
      <Footer />
      <Toaster />
    </div>
  );
};

export default PublicRecordsPage;
