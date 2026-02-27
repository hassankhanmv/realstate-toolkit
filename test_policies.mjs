import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: 'apps/web/.env' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data, error } = await supabase.rpc('get_policies');
  if (error) {
    const { data: res } = await supabase.from('properties').select('id').limit(1);
    console.log("We can query properties?", !!res);
    
    // just query pg_policies using REST if possible, but we can't.
  }
}
check();
