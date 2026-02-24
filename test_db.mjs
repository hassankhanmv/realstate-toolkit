import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: 'apps/web/.env' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function inspectTriggers() {
  const { data, error } = await supabase.rpc('get_triggers');
  console.log("RPC Error (if any):", error?.message || "None");
  console.log("Data:", data);
}

inspectTriggers();
