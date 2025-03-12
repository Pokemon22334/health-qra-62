
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; requires2FA?: boolean }>;
  signup: (fullName: string, email: string, password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  signOut: async () => {},
  login: async () => ({ success: false }),
  signup: async () => false,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    console.log('Setting up auth state change listener');
    
    // Get initial session
    const setupInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session:', session?.user?.id || 'None');
        
        setUser(session?.user ?? null);
        setIsLoading(false);
        
        // If no session, redirect to login unless it's a public page
        if (!session) {
          const currentPath = window.location.pathname;
          if (currentPath !== '/login' && 
              currentPath !== '/signup' && 
              currentPath !== '/' && 
              !currentPath.includes('/public-records') &&
              !currentPath.includes('/shared-record') &&
              !currentPath.includes('/features') &&
              !currentPath.includes('/about') &&
              !currentPath.includes('/get-started') &&
              !currentPath.includes('/emergency-access')) {
            navigate('/login');
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        setIsLoading(false);
      }
    };
    
    setupInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      setUser(session?.user ?? null);
      setIsLoading(false);

      if (event === 'SIGNED_OUT') {
        navigate('/login');
      } else if (event === 'SIGNED_IN') {
        navigate('/dashboard');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const login = async (email: string, password: string): Promise<{ success: boolean; requires2FA?: boolean }> => {
    try {
      setIsLoading(true);
      console.log('Login initiated with:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      console.log('Login successful:', data);
      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error.message);
      toast({
        title: 'Login failed',
        description: error.message,
        variant: 'destructive',
      });
      setIsLoading(false);
      return { success: false };
    }
  };

  const signup = async (fullName: string, email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: fullName,
          },
        },
      });

      if (error) throw error;

      toast({
        title: 'Account created',
        description: 'Please check your email to verify your account.',
      });

      setIsLoading(false);
      return true;
    } catch (error: any) {
      console.error('Signup error:', error.message);
      toast({
        title: 'Signup failed',
        description: error.message,
        variant: 'destructive',
      });
      setIsLoading(false);
      return false;
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      navigate('/login');
    } catch (error: any) {
      console.error('Error signing out:', error.message);
      toast({
        title: 'Error signing out',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      signOut,
      login,
      signup,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
