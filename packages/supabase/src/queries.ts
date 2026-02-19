import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

export const signUpUser = async (
  supabase: SupabaseClient<Database>,
  data: {
    email: string;
    password: string;
    options?: { data: { full_name: string; company_name?: string } };
  },
) => {
  console.log("signUpUser called with:", data.email);
  return await supabase.auth.signUp(data);
};

export const signInUser = async (
  supabase: SupabaseClient<Database>,
  data: { email: string; password: string },
) => {
  console.log("signInUser called with:", data.email);
  const result = await supabase.auth.signInWithPassword(data);
  console.log(
    "signInUser result:",
    result.error ? result.error.message : "Success",
  );
  return result;
};

export const signOutUser = async (supabase: SupabaseClient<Database>) => {
  console.log("signOutUser called");
  return await supabase.auth.signOut();
};

export const getCurrentUser = async (supabase: SupabaseClient<Database>) => {
  // console.log("getCurrentUser called"); // excessive logging
  return await supabase.auth.getUser();
};

// Properties methods are now in properties.ts

// properties methods
