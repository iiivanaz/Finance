import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

let client;
try {
  if (!supabaseUrl || !supabaseAnonKey) {
    client = createClient('https://placeholder.supabase.co', 'placeholder');
  } else {
    client = createClient(supabaseUrl, supabaseAnonKey);
  }
} catch (error) {
  client = createClient('https://placeholder.supabase.co', 'placeholder');
}

export const supabase = client;

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
