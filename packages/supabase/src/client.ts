import { createClient } from "@supabase/supabase-js";

// ---------- BROWSER CLIENT ----------
export const createBrowserClient = (
  supabaseUrl: string,
  supabaseAnonKey: string
) => {
  return createClient(supabaseUrl, supabaseAnonKey);
};

// ---------- SERVER CLIENT ----------
export const createServerClient = (
  supabaseUrl: string,
  supabaseAnonKey: string,
  headers?: Headers
) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: headers ? Object.fromEntries(headers.entries()) : {},
    },
  });
};

// ---------- MOBILE CLIENT ----------
export const createMobileClient = (
  supabaseUrl: string,
  supabaseAnonKey: string
) => {
  return createClient(supabaseUrl, supabaseAnonKey);
};
