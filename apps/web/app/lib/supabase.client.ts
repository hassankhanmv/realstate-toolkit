import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@repo/supabase";

declare global {
  interface Window {
    ENV: {
      VITE_SUPABASE_URL: string;
      VITE_SUPABASE_ANON_KEY: string;
    };
  }
}

let client: SupabaseClient<Database> | undefined;

export const getSupabaseBrowser = () => {
  if (typeof window === "undefined") {
    return undefined;
  }

  if (client) return client;

  client = createClient<Database>(
    window.ENV.VITE_SUPABASE_URL,
    window.ENV.VITE_SUPABASE_ANON_KEY,
  );

  return client;
};
