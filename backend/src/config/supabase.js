import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Load from backend/.env, backend/src/.env, or working directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, './.env') });
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const isHttpUrl = (value) => /^https?:\/\//i.test(String(value || ''));

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseKey &&
  isHttpUrl(supabaseUrl) &&
  !supabaseUrl.includes('placeholder') &&
  !supabaseKey.includes('placeholder')
);

if (!isSupabaseConfigured) {
  console.warn('⚠️ [Supabase] Invalid or missing SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY in .env. SUPABASE_URL must be an HTTP(S) project URL. Operating in hybrid memory-fallback mode.');
} else {
  console.log('✅ [Supabase] Connected to live database at', supabaseUrl);
}

export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? supabaseKey : 'placeholder-key',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);
