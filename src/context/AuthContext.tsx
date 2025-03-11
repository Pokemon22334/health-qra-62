
import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { api, User } from '../services/api';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; requires2FA?: boolean }>;
  verify2FA: (code: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, role?: 'patient' | 'doctor') => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // In a real app, we would validate the token with the server
        const currentUser = api.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Authentication error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { user: loggedInUser } = await api.login({ email, password });
      
      // In a real app, we would check if 2FA is required here
      const requires2FA = Math.random() > 0.5; // Simulate 50% chance of requiring 2FA
      
      if (!requires2FA) {
        setUser(loggedInUser);
        toast({
          title: "Login successful",
          description: "Welcome back to MediVault!"
        });
        return { success: true };
      }
      
      return { success: true, requires2FA: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const verify2FA = async (code: string) => {
    try {
      setIsLoading(true);
      await api.verify2FA(code);
      
      // After 2FA verification, set the user
      const currentUser = api.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        toast({
          title: "Verification successful",
          description: "Welcome back to MediVault!"
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('2FA verification error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, role: 'patient' | 'doctor' = 'patient') => {
    try {
      setIsLoading(true);
      const { user: newUser } = await api.signup({ name, email, password, role });
      setUser(newUser);
      toast({
        title: "Account created successfully",
        description: "Welcome to MediVault!"
      });
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await api.logout();
      setUser(null);
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of MediVault."
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        verify2FA,
        signup,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
