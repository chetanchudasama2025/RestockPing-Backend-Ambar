import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client
export const supabase: SupabaseClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: false,
      detectSessionInUrl: false
    }
  }
);

// Create admin client for server-side operations
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY for admin client');
}

export const supabaseAdmin: SupabaseClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Database table names
export const TABLES = {
  USERS: 'users',
  PRODUCTS: 'products',
  PRODUCT_ALERTS: 'product_alerts',
  USER_PREFERENCES: 'user_preferences'
} as const;

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          updated_at: string;
          full_name?: string;
          phone?: string;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
          updated_at?: string;
          full_name?: string;
          phone?: string;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
          full_name?: string;
          phone?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          description?: string;
          price: number;
          stock_quantity: number;
          created_at: string;
          updated_at: string;
          category?: string;
          image_url?: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          price: number;
          stock_quantity: number;
          created_at?: string;
          updated_at?: string;
          category?: string;
          image_url?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          price?: number;
          stock_quantity?: number;
          created_at?: string;
          updated_at?: string;
          category?: string;
          image_url?: string;
        };
      };
      product_alerts: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          alert_type: 'restock' | 'price_drop' | 'availability';
          threshold?: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          alert_type: 'restock' | 'price_drop' | 'availability';
          threshold?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          alert_type?: 'restock' | 'price_drop' | 'availability';
          threshold?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
