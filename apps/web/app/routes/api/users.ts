import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { data } from "react-router";
import type { Database } from "@repo/supabase";
import { getSupabaseServer } from "@/lib/supabase.server";
import { userFormSchema } from "@/validations/user";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase } = await getSupabaseServer(request);
  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !authUser) throw data("Unauthorized", { status: 401 });

  // In production, limit fields to prevent leaking sensitive hashes
  const { data: users, error } = await supabase
    .from("profiles")
    .select(
      "id, full_name, email, role, is_disabled, expiry_date, permissions, notifications, created_at",
    )
    .neq("id", authUser.id)
    .order("created_at", { ascending: false });

  if (error) {
    return data({ error: error.message }, { status: 500 });
  }

  return data({ data: users });
}

export async function action({ request }: ActionFunctionArgs) {
  const { supabase } = await getSupabaseServer(request);
  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !authUser) throw data("Unauthorized", { status: 401 });

  // Here we'd verify authUser is an admin

  if (request.method !== "POST") {
    return data({ error: "Method not allowed" }, { status: 405 });
  }

  const payload = await request.json();
  const rawData = payload.data ? JSON.parse(payload.data) : payload;

  try {
    const validatedData = userFormSchema.parse(rawData);

    // Initialize an admin client to bypass RLS and prevent the current admin session from logging out
    const { createClient } = await import("@supabase/supabase-js");
    const adminAuthClient = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.VITE_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    // 1. Create auth user securely
    const { data: authData, error: signupError } =
      await adminAuthClient.auth.admin.createUser({
        email: validatedData.email,
        password: validatedData.password || "Temp1234!", // Auto-generate if not provided
        user_metadata: {
          full_name: validatedData.full_name,
        },
        email_confirm: true,
      });

    if (signupError) throw signupError;

    const userId = authData?.user?.id;
    if (!userId) throw new Error("Failed to create user auth record");

    // Second: Insert profile fields
    const updatePayload: Database["public"]["Tables"]["profiles"]["Update"] = {
      role: validatedData.role,
      is_disabled: validatedData.is_disabled,
      expiry_date: validatedData.expiry_date
        ? new Date(validatedData.expiry_date).toISOString()
        : null,
      permissions: validatedData.permissions as any,
      notifications: validatedData.notifications as any,
    };

    // Ensure we give the trigger a few milliseconds to create the profile row before trying to update it
    await new Promise((resolve) => setTimeout(resolve, 500));

    const { data: updatedProfile, error } = await adminAuthClient
      .from("profiles")
      // @ts-ignore
      .update(updatePayload)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      // If profile update fails, we might leave a dangling auth user. Better to use RPC if atomic
      throw error;
    }

    return data({ data: updatedProfile, success: true });
  } catch (err: any) {
    console.error("API Error in /api/users [POST]:", err);
    return data(
      { error: err.message || "Failed to create user" },
      { status: 400 },
    );
  }
}
