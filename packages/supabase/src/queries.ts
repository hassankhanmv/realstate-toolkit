import { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";
import type { Database } from "./types";

export type UserWithProfile = User & {
  profile?: Database["public"]["Tables"]["profiles"]["Row"];
};

export const signUpUser = async (
  supabase: SupabaseClient<Database>,
  data: {
    email: string;
    password: string;
    options?: {
      data: { full_name: string; company_name?: string | null; role?: string };
    };
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

export const getCurrentUser = async (
  supabase: SupabaseClient<Database>,
): Promise<{ data: { user: UserWithProfile | null }; error: any }> => {
  // console.log("getCurrentUser called"); // excessive logging
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { data: { user: null }, error: authError };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError && profileError.code !== "PGRST116") {
    console.error("Error fetching profile in getCurrentUser:", profileError);
  }

  const userWithProfile: UserWithProfile = {
    ...user,
    profile: profile || undefined,
  };

  return { data: { user: userWithProfile }, error: null };
};

// Properties methods are now in properties.ts

// properties methods
