
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = 'https://tzitipccwgcgkdbdruhu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6aXRpcGNjd2djZ2tkYmRydWh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTU1MjgwMzMsImV4cCI6MjAzMTEwNDAzM30.ySx7gR4SXosjW5a0xNmfzA0MQWnGrNnLFj-gU9aWpXk';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export type { Database };
