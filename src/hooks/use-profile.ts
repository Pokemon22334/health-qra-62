
import { useAuth } from '@/context/AuthContext';

/**
 * A simple hook to access user info from auth context
 * Note: We've removed the profile system, so this hook simply provides user information
 */
export const useProfile = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  // Extract basic user info from auth metadata
  const userInfo = user ? {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name || user.user_metadata?.full_name || user.email,
    role: user.user_metadata?.role || 'patient',
  } : null;
  
  return {
    user: userInfo,
    isAuthenticated,
    isLoading,
  };
};
