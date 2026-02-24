import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: 'apps/web/.env' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspectProfiles() {
  const { data, error } = await supabase.from('profiles').select('*');
  console.log("Profiles count (admin bypass):", data?.length);

  // Now test with anon or user? We don't have user token easily.
}
inspectProfiles();
