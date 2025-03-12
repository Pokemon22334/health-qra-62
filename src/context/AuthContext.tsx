
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: any;
  profile: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; requires2FA?: boolean }>;
  signup: (fullName: string, email: string, password: string) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: true,
  signOut: async () => {},
  login: async () => ({ success: false }),
  signup: async () => false,
  refreshProfile: async () => {},
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
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileFetchAttempted, setProfileFetchAttempted] = useState(false);
  const [fetchAttempts, setFetchAttempts] = useState(0);
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
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setIsLoading(false);
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
      
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setIsLoading(false);
      }

      if (event === 'SIGNED_OUT') {
        navigate('/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      setProfileFetchAttempted(true);
      setFetchAttempts(prev => prev + 1);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error.message);
        throw error;
      }
      
      console.log('Profile fetched:', profile || 'No profile found');
      
      // If no profile was found, create a basic one
      if (!profile) {
        if (!user) {
          throw new Error('User is undefined, cannot create profile');
        }
        
        const { user_metadata } = user || {};
        const name = user_metadata?.name || user_metadata?.full_name || 'User';
        
        try {
          console.log('Creating new profile for user:', userId);
          
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert([{ 
              id: userId, 
              name, 
              email: user.email, 
              role: 'patient' 
            }])
            .select()
            .single();
            
          if (insertError) {
            console.error('Error creating profile:', insertError.message);
            throw insertError;
          }
          
          console.log('Created new profile:', newProfile);
          setProfile(newProfile);
          toast({
            title: 'Profile created',
            description: 'Your profile has been set up successfully.',
          });
        } catch (createError: any) {
          console.error('Error creating profile:', createError.message);
          
          // Even after a failed creation, set a basic profile to prevent app from getting stuck
          const basicProfile = { id: userId, name: name || 'User', email: user.email, role: 'patient' };
          setProfile(basicProfile);
          
          toast({
            title: 'Profile setup issue',
            description: 'We created a basic profile for you. Some features might be limited.',
            variant: 'destructive',
          });
        }
      } else {
        setProfile(profile);
      }
    } catch (error: any) {
      console.error('Error in fetchProfile:', error.message);
      
      // Set a basic profile to prevent the app from getting stuck
      if (user) {
        const basicProfile = { 
          id: userId, 
          name: user.user_metadata?.name || 'User', 
          email: user.email, 
          role: 'patient' 
        };
        setProfile(basicProfile);
        
        toast({
          title: 'Profile loading issue',
          description: 'Using a temporary profile while we resolve the issue.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async (): Promise<void> => {
    if (!user) {
      console.error('Cannot refresh profile: No user logged in');
      return;
    }
    
    try {
      setIsLoading(true);
      await fetchProfile(user.id);
    } catch (error) {
      console.error('Error refreshing profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; requires2FA?: boolean }> => {
    try {
      setIsLoading(true);
      console.log('Login initiated with:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Session is handled by the auth state change listener
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
      setProfile(null);
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

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isLoading && !profileFetchAttempted) {
        console.warn('Auth loading timeout reached - forcing loading state to complete');
        setIsLoading(false);
      }
    }, 5000); // 5 second timeout
    
    return () => clearTimeout(timeoutId);
  }, [isLoading, profileFetchAttempted]);

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      isAuthenticated: !!user,
      isLoading,
      signOut,
      login,
      signup,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};
