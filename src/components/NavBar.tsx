
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const NavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300",
      isScrolled 
        ? "bg-white/80 backdrop-blur-md shadow-sm py-3" 
        : "bg-transparent py-5"
    )}>
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-medivault-500 rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <span className={cn(
            "font-semibold text-xl transition-colors",
            isScrolled ? "text-medivault-800" : "text-medivault-700"
          )}>
            MediVault
          </span>
        </Link>
        
        {/* Desktop menu */}
        <div className="hidden md:flex items-center space-x-8">
          <div className="space-x-6">
            <NavLink href="/" isActive={location.pathname === '/'}>
              Home
            </NavLink>
            <NavLink href="/about" isActive={location.pathname === '/about'}>
              About
            </NavLink>
            <NavLink href="/features" isActive={location.pathname === '/features'}>
              Features
            </NavLink>
          </div>
          
          <div className="space-x-2 flex items-center">
            <Button variant="outline" size="sm" className="font-medium" asChild>
              <Link to="/login">
                <LogIn className="mr-1.5 h-4 w-4" />
                Log in
              </Link>
            </Button>
            <Button size="sm" className="font-medium" asChild>
              <Link to="/signup">
                <User className="mr-1.5 h-4 w-4" />
                Sign up
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Mobile menu button */}
        <button 
          className="md:hidden text-gray-700 p-2 rounded-md"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Mobile menu */}
      <div className={cn(
        "md:hidden absolute top-full left-0 right-0 bg-white shadow-lg transition-all duration-300 ease-in-out",
        isMobileMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0 overflow-hidden"
      )}>
        <div className="px-4 pb-6 pt-2 space-y-4">
          <div className="flex flex-col space-y-3">
            <MobileNavLink href="/" isActive={location.pathname === '/'}>Home</MobileNavLink>
            <MobileNavLink href="/about" isActive={location.pathname === '/about'}>About</MobileNavLink>
            <MobileNavLink href="/features" isActive={location.pathname === '/features'}>Features</MobileNavLink>
          </div>
          
          <div className="flex flex-col space-y-2 pt-2 border-t border-gray-100">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/login">
                <LogIn className="mr-2 h-4 w-4" />
                Log in
              </Link>
            </Button>
            <Button className="w-full justify-start" asChild>
              <Link to="/signup">
                <User className="mr-2 h-4 w-4" />
                Sign up
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

type NavLinkProps = {
  href: string;
  isActive: boolean;
  children: React.ReactNode;
};

const NavLink = ({ href, isActive, children }: NavLinkProps) => (
  <Link
    to={href}
    className={cn(
      "inline-block text-sm font-medium transition-colors hover:text-medivault-600",
      isActive ? "text-medivault-600" : "text-gray-600"
    )}
  >
    {children}
  </Link>
);

const MobileNavLink = ({ href, isActive, children }: NavLinkProps) => (
  <Link
    to={href}
    className={cn(
      "py-2 px-3 rounded-md text-base font-medium transition-colors",
      isActive 
        ? "bg-medivault-50 text-medivault-600"
        : "text-gray-700 hover:bg-gray-50"
    )}
  >
    {children}
  </Link>
);

export default NavBar;
