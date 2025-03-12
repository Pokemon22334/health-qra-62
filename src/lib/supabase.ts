
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = 'https://tzitipccwgcgkdbdruhu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6aXRpcGNjd2djZ2tkYmRydWh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2ODQ1NTIsImV4cCI6MjA1NzI2MDU1Mn0.Egr2unnxxmuz5lgFxcnFB8NWoibXRlk7ayFD1kUvzXA';

// Initialize the Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'medivault-auth-token',
  },
  global: {
    headers: {
      'X-Client-Info': 'medivault-web'
    },
  }
});

// Add debug listener for auth state changes (if in browser)
if (typeof window !== 'undefined') {
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session ? 'User authenticated' : 'No session');
  });
}

export type { Database };
