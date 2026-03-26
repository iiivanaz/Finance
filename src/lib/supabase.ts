import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Debug: log to console (will appear in browser dev tools)
console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Not set');
console.log('Supabase Key:', supabaseAnonKey ? 'Set' : 'Not set');

// Create client with fallback for development
let client;
try {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials missing. Using dummy client for development.');
    // Create a dummy client that will fail gracefully
    client = createClient('https://placeholder.supabase.co', 'placeholder');
  } else {
    client = createClient(supabaseUrl, supabaseAnonKey);
  }
} catch (error) {
  console.error('Failed to create Supabase client:', error);
  // Fallback client
  client = createClient('https://placeholder.supabase.co', 'placeholder');
}

export const supabase = client;

// Types untuk database
export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  date: string;
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  period: 'monthly' | 'yearly';
  created_at: string;
}
