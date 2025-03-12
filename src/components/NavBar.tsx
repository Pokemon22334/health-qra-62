
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, UserCircle, LogOut, FileText, QrCode, Home, Info, Settings, HeartPulse } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <HeartPulse className="h-8 w-8 text-medivault-600" />
            <span className="ml-2 text-xl font-semibold text-gray-800">MediVault</span>
          </Link>

          {/* Desktop Navigation */}
          {!isMobile && (
            <div className="hidden md:flex space-x-6">
              <Link to="/" className="text-gray-600 hover:text-medivault-600 transition-colors">Home</Link>
              <Link to="/features" className="text-gray-600 hover:text-medivault-600 transition-colors">Features</Link>
              <Link to="/about" className="text-gray-600 hover:text-medivault-600 transition-colors">About</Link>
              <Link to="/scan-qr" className="text-gray-600 hover:text-medivault-600 transition-colors">Scan QR</Link>
            </div>
          )}

          {/* User Menu or Login Button */}
          <div className="flex items-center">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative rounded-full" aria-label="User menu">
                    <UserCircle className="h-8 w-8 text-medivault-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {profile?.name || 'MediVault User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-1">
                      {user.email}
                    </p>
                  </div>
                  <DropdownMenuItem onClick={() => navigate('/dashboard')} className="cursor-pointer">
                    <FileText className="mr-2 h-4 w-4" />
                    <span>My Records</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/scan-qr')} className="cursor-pointer">
                    <QrCode className="mr-2 h-4 w-4" />
                    <span>Scan QR Code</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex space-x-2">
                <Button asChild variant="ghost">
                  <Link to="/login">Log In</Link>
                </Button>
                <Button asChild>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <button
                className="md:hidden ml-4 text-gray-600 hover:text-gray-900 focus:outline-none"
                onClick={toggleMenu}
                aria-label="Toggle Menu"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobile && isMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-gray-200">
            <div className="flex flex-col space-y-3 pb-3">
              <Link to="/" className="text-gray-600 hover:text-medivault-600 transition-colors" onClick={toggleMenu}>Home</Link>
              <Link to="/features" className="text-gray-600 hover:text-medivault-600 transition-colors" onClick={toggleMenu}>Features</Link>
              <Link to="/about" className="text-gray-600 hover:text-medivault-600 transition-colors" onClick={toggleMenu}>About</Link>
              <Link to="/scan-qr" className="text-gray-600 hover:text-medivault-600 transition-colors" onClick={toggleMenu}>Scan QR</Link>
              {user && (
                <>
                  <Link to="/dashboard" className="text-gray-600 hover:text-medivault-600 transition-colors" onClick={toggleMenu}>My Records</Link>
                  <Link to="/settings" className="text-gray-600 hover:text-medivault-600 transition-colors" onClick={toggleMenu}>Settings</Link>
                  <button 
                    onClick={() => {
                      handleLogout();
                      toggleMenu();
                    }}
                    className="text-left text-red-600 hover:text-red-700 transition-colors"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
