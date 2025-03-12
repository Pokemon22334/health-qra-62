import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';

const NavBar = () => {
  const location = useLocation();
  const { isMobile } = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, profile, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getInitials = () => {
    if (profile?.name) {
      return profile.name.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getRoleLabel = () => {
    if (!profile?.role) return '';
    return profile.role.charAt(0).toUpperCase() + profile.role.slice(1);
  };

  return (
    <header 
      className={`sticky top-0 z-50 w-full ${
        isScrolled || isMenuOpen ? 'bg-white shadow-sm' : 'bg-transparent'
      } transition-all duration-200`}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-medivault-600 to-medivault-800 text-white font-bold text-xl px-2 py-1 rounded">
              MV
            </div>
            <span className="font-semibold text-xl text-gray-900">MediVault</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className={`text-sm font-medium ${
                location.pathname === '/' 
                  ? 'text-medivault-600' 
                  : 'text-gray-700 hover:text-medivault-600'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/features" 
              className={`text-sm font-medium ${
                location.pathname === '/features' 
                  ? 'text-medivault-600' 
                  : 'text-gray-700 hover:text-medivault-600'
              }`}
            >
              Features
            </Link>
            <Link 
              to="/about" 
              className={`text-sm font-medium ${
                location.pathname === '/about' 
                  ? 'text-medivault-600' 
                  : 'text-gray-700 hover:text-medivault-600'
              }`}
            >
              About
            </Link>
            
            {isAuthenticated && (
              <>
                <Link 
                  to="/dashboard" 
                  className={`text-sm font-medium ${
                    location.pathname === '/dashboard' 
                      ? 'text-medivault-600' 
                      : 'text-gray-700 hover:text-medivault-600'
                  }`}
                >
                  Dashboard
                </Link>
                
                {profile?.role === 'doctor' && (
                  <Link 
                    to="/scan-qr" 
                    className={`text-sm font-medium ${
                      location.pathname === '/scan-qr' 
                        ? 'text-medivault-600' 
                        : 'text-gray-700 hover:text-medivault-600'
                    }`}
                  >
                    Scan QR Code
                  </Link>
                )}
              </>
            )}
          </nav>

          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-9 w-9 border-2 border-medivault-100">
                      <AvatarFallback className="bg-medivault-100 text-medivault-700">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="font-medium">{profile?.name}</p>
                      <p className="text-xs text-muted-foreground">{profile?.email}</p>
                      {profile?.role && (
                        <div className="text-xs px-2 py-1 bg-medivault-100 text-medivault-700 rounded-full w-min whitespace-nowrap">
                          {getRoleLabel()}
                        </div>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  {profile?.role === 'doctor' && (
                    <DropdownMenuItem asChild>
                      <Link to="/scan-qr" className="cursor-pointer">
                        <span className="mr-2">🔍</span>
                        <span>Scan QR Code</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Log in</Button>
                </Link>
                <Link to="/signup">
                  <Button>Sign up</Button>
                </Link>
              </>
            )}

            {isMobile && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden" 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            )}
          </div>
        </div>

        {isMenuOpen && isMobile && (
          <div className="md:hidden pt-2 pb-4 px-2">
            <nav className="flex flex-col space-y-3">
              <Link 
                to="/" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/' 
                    ? 'bg-medivault-50 text-medivault-600' 
                    : 'text-gray-800 hover:bg-gray-100'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/features" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/features' 
                    ? 'bg-medivault-50 text-medivault-600' 
                    : 'text-gray-800 hover:bg-gray-100'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link 
                to="/about" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/about' 
                    ? 'bg-medivault-50 text-medivault-600' 
                    : 'text-gray-800 hover:bg-gray-100'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              
              {isAuthenticated && (
                <>
                  <Link 
                    to="/dashboard" 
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname === '/dashboard' 
                        ? 'bg-medivault-50 text-medivault-600' 
                        : 'text-gray-800 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  
                  {profile?.role === 'doctor' && (
                    <Link 
                      to="/scan-qr" 
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        location.pathname === '/scan-qr' 
                          ? 'bg-medivault-50 text-medivault-600' 
                          : 'text-gray-800 hover:bg-gray-100'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Scan QR Code
                    </Link>
                  )}
                  
                  <div className="pt-2 pb-2">
                    <div className="border-t border-gray-200"></div>
                  </div>
                  
                  <button
                    className="px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 text-left"
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                  >
                    Log out
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default NavBar;
