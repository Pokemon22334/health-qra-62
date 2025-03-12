
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = 'https://tzitipccwgcgkdbdruhu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6aXRpcGNjd2djZ2tkYmRydWh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2ODQ1NTIsImV4cCI6MjA1NzI2MDU1Mn0.Egr2unnxxmuz5lgFxcnFB8NWoibXRlk7ayFD1kUvzXA';

// Initialize the Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'medivault-auth-token',
  },
});

// Check if we're in a browser environment before setting up auth state listener
if (typeof window !== 'undefined') {
  // Listen for auth changes in other tabs/windows
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed in another tab:', event, session);
    
    // Update local storage to reflect the current session state
    if (session) {
      localStorage.setItem('supabase.auth.token', JSON.stringify(session));
    } else {
      localStorage.removeItem('supabase.auth.token');
    }
  });
}

export type { Database };
