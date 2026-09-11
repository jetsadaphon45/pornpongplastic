import { createClient } from '@supabase/supabase-js'

const metaEnv: any = typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env : {};
const nodeEnv: any = typeof process !== 'undefined' && process.env ? process.env : {};

const supabaseUrl =
  metaEnv.NEXT_PUBLIC_SUPABASE_URL ||
  metaEnv.VITE_SUPABASE_URL ||
  nodeEnv.NEXT_PUBLIC_SUPABASE_URL ||
  nodeEnv.VITE_SUPABASE_URL ||
  'https://xyzcompany.supabase.co';

const supabaseAnonKey =
  metaEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  metaEnv.VITE_SUPABASE_ANON_KEY ||
  nodeEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  nodeEnv.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
