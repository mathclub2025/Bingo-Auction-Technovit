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

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseKey && 
  !supabaseUrl.includes('placeholder') &&
  !supabaseKey.includes('placeholder')
);

if (!isSupabaseConfigured) {
  console.warn('⚠️ [Supabase] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing or placeholder in .env. Operating in hybrid memory-fallback mode.');
} else {
  console.log('✅ [Supabase] Connected to live database at', supabaseUrl);
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);
