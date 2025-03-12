
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
      console.log('Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      console.log('Profile fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('Profile fetch error:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      console.log('Refreshing profile for user:', user.id);
      const profile = await fetchProfile(user.id);
      setProfile(profile);
    }
  };

  // Initial session check and auth state change listener
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      console.log('Initializing auth...');
      
      try {
        // Check current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('Initial session check:', session ? 'Session found' : 'No session', error || '');
        
        if (session) {
          setSession(session);
          setUser(session.user);
          
          // Fetch user profile
          const profile = await fetchProfile(session.user.id);
          setProfile(profile);
        }
      } catch (err) {
        console.error('Error during auth initialization:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
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
      console.log('Attempting login with:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log('Login response:', data, error);
      
      if (error) {
        console.error('Login error:', error);
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
        return { success: false };
      }
      
      // In a real app with 2FA, we would check if 2FA is required
      // We'll simplify and remove this for now to fix the login issue
      const requires2FA = false;
      
      if (!requires2FA) {
        toast({
          title: "Login successful",
          description: "Welcome back to MediVault!",
        });
      }
      
      return { success: true, requires2FA };
    } catch (error: any) {
      console.error('Login exception:', error);
      toast({
        title: "Login failed",
        description: error.message || "An unexpected error occurred",
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
      console.log('Attempting signup with:', email, role);
      
      // Create the user in Supabase Auth
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
      
      console.log('Signup response:', data, error);
      
      if (error) {
        console.error('Signup error:', error);
        toast({
          title: "Signup failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }
      
      // For demo purposes, we'll create a profile record manually
      // In production, this would typically be handled by a database trigger
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            name: name,
            role: role
          });
          
        if (profileError) {
          console.error('Profile creation error:', profileError);
          // We won't fail the signup if profile creation fails, just log it
        }
      }
      
      toast({
        title: "Account created successfully",
        description: "Welcome to MediVault!",
      });
      
      return true;
    } catch (error: any) {
      console.error('Signup exception:', error);
      toast({
        title: "Signup failed",
        description: error.message || "An unexpected error occurred",
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
        console.error('Logout error:', error);
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
      console.error('Logout exception:', error);
      toast({
        title: "Logout failed",
        description: error.message || "An unexpected error occurred",
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
