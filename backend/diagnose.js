import { supabase } from './src/config/supabase.js';

async function test() {
  console.log('Testing Supabase connection...');
  try {
    const { data, error } = await supabase.auth.signUp({
      email: `test_${Date.now()}@mathsclub.com`,
      password: 'Password123!'
    });
    if (error) {
      console.error('Supabase Auth returned error:', error);
    } else {
      console.log('Supabase Auth success:', data.user?.id);
    }
  } catch (err) {
    console.error('Fetch exception:', err);
  }
}

test();
