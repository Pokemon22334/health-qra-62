
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check for auth parameters in URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);
        
        // Attempt to exchange token if present
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (data?.session) {
          toast({
            title: 'Authentication successful',
            description: 'You have been successfully authenticated.',
          });
          navigate('/dashboard');
        } else {
          // Check for error parameters
          const errorDescription = hashParams.get('error_description') || queryParams.get('error_description');
          if (errorDescription) {
            toast({
              title: 'Authentication error',
              description: errorDescription,
              variant: 'destructive',
            });
            navigate('/login');
          } else {
            // No auth parameters or errors, redirect to login
            navigate('/login');
          }
        }
      } catch (error: any) {
        console.error('Auth callback error:', error);
        toast({
          title: 'Authentication error',
          description: error.message || 'An error occurred during authentication',
          variant: 'destructive',
        });
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full">
        <Loader2 className="h-12 w-12 animate-spin text-medivault-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Verifying your authentication</h1>
        <p className="text-gray-600">Please wait while we complete the authentication process...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
