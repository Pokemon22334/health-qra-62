
import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  profile: any | null;
  login: (email: string, password: string) => Promise<{ success: boolean; requires2FA?: boolean }>;
  verify2FA: (code: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, role?: 'patient' | 'doctor') => Promise<boolean>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch user profile data
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Profile fetch error:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profile = await fetchProfile(user.id);
      setProfile(profile);
    }
  };

  // Initial session check and auth state change listener
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      
      // Check current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session) {
        setSession(session);
        setUser(session.user);
        
        // Fetch user profile
        const profile = await fetchProfile(session.user.id);
        setProfile(profile);
      }
      
      setIsLoading(false);
    };
    
    initializeAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          setProfile(profile);
        } else {
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
        return { success: false };
      }
      
      // In a real app with 2FA, we would check if 2FA is required
      // For now, we'll simulate a 50% chance of requiring 2FA for demo purposes
      const requires2FA = Math.random() > 0.5;
      
      if (!requires2FA) {
        toast({
          title: "Login successful",
          description: "Welcome back to MediVault!",
        });
      }
      
      return { success: true, requires2FA };
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const verify2FA = async (code: string) => {
    try {
      setIsLoading(true);
      
      // In a real app, we would verify the 2FA code with Supabase or another service
      // For demo purposes, we'll accept "123456" as the correct code
      if (code === "123456") {
        toast({
          title: "Verification successful",
          description: "Welcome back to MediVault!",
        });
        return true;
      }
      
      toast({
        title: "Verification failed",
        description: "Invalid verification code",
        variant: "destructive",
      });
      return false;
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, role: 'patient' | 'doctor' = 'patient') => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          },
        },
      });
      
      if (error) {
        toast({
          title: "Signup failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }
      
      toast({
        title: "Account created successfully",
        description: "Welcome to MediVault!",
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          title: "Logout failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      setUser(null);
      setSession(null);
      setProfile(null);
      
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of MediVault.",
      });
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!user,
        isLoading,
        profile,
        login,
        verify2FA,
        signup,
        logout,
        refreshProfile
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
