import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@repo/supabase";

declare global {
  interface Window {
    ENV: {
      VITE_SUPABASE_URL: string;
      VITE_SUPABASE_ANON_KEY: string;
    };
  }
}

let client: ReturnType<typeof createBrowserClient<Database>> | undefined;

export const getSupabaseBrowser = () => {
  if (typeof window === "undefined") {
    return undefined;
  }

  if (client) return client;

  client = createBrowserClient<Database>(
    window.ENV.VITE_SUPABASE_URL,
    window.ENV.VITE_SUPABASE_ANON_KEY,
  );

  return client;
};
