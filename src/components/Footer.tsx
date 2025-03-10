
import { Link } from 'react-router-dom';
import { Heart, ArrowRight, Github, Twitter, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="container mx-auto px-4 md:px-6 py-12">
        {/* Newsletter Section */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Stay updated with MediVault
          </h3>
          <p className="text-gray-600 mb-6">
            Subscribe to our newsletter to receive the latest updates and health management tips.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-grow"
            />
            <Button className="whitespace-nowrap">
              Subscribe
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-medivault-500 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="font-semibold text-xl text-gray-900">
                MediVault
              </span>
            </Link>
            <p className="text-gray-600 text-sm">
              Secure, accessible health records management with QR-based doctor access.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-medivault-600 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-medivault-600 transition-colors">
                <Github size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-medivault-600 transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-sm text-gray-900 uppercase tracking-wider mb-4">
              Features
            </h4>
            <ul className="space-y-3">
              {['Health Records', 'QR Code Access', 'Medication Tracking', 'Emergency Profile', 'Doctor Visits'].map(item => (
                <li key={item}>
                  <Link to="#" className="text-gray-600 hover:text-medivault-600 text-sm transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-sm text-gray-900 uppercase tracking-wider mb-4">
              Company
            </h4>
            <ul className="space-y-3">
              {['About Us', 'Blog', 'Careers', 'Contact Us', 'Privacy Policy'].map(item => (
                <li key={item}>
                  <Link to="#" className="text-gray-600 hover:text-medivault-600 text-sm transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-sm text-gray-900 uppercase tracking-wider mb-4">
              Support
            </h4>
            <ul className="space-y-3">
              {['Help Center', 'FAQs', 'Terms of Service', 'Security', 'Accessibility'].map(item => (
                <li key={item}>
                  <Link to="#" className="text-gray-600 hover:text-medivault-600 text-sm transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} MediVault. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm flex items-center mt-4 md:mt-0">
            Made with <Heart className="mx-1 h-3 w-3 text-red-500" /> for better healthcare
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
