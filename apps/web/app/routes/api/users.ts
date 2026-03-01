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

  // Lookup the authenticated user's profile to extract their company scope
  const { data: authProfileData, error: profileError } = await supabase
    .from("profiles")
    .select("company_name")
    .eq("id", authUser.id)
    .single();

  const authProfile =
    authProfileData as unknown as import("@repo/supabase").Profile;

  if (profileError || !authProfile?.company_name) {
    return data(
      { error: "Company context not found for your account" },
      { status: 403 },
    );
  }

  // In production, limit fields to prevent leaking sensitive hashes
  // Filter by the authenticating user's company namespace
  const { data: users, error } = await supabase
    .from("profiles")
    .select(
      "id, full_name, email, role, is_disabled, expiry_date, permissions, notifications, created_at, company_name",
    )
    .eq("company_name", authProfile.company_name)
    .neq("id", authUser.id)
    .neq("role", "buyer")
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

    const { data: adminProfileData, error: adminProfileError } = await supabase
      .from("profiles")
      .select("company_name")
      .eq("id", authUser.id)
      .single();

    const adminProfile =
      adminProfileData as unknown as import("@repo/supabase").Profile;

    // Fallback to reading company_name from Auth Metadata if DB profile fails
    const resolvedCompanyName =
      adminProfile?.company_name || authUser.user_metadata?.company_name;

    if (!resolvedCompanyName) {
      throw new Error(
        "Unable to identify your company namespace for assignment.",
      );
    }

    // Initialize an admin client to bypass RLS and prevent the current admin session from logging out
    const { createAdminClient } = await import("@repo/supabase");
    const adminAuthClient = createAdminClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.VITE_SUPABASE_ANON_KEY!,
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

    // Second: Insert profile fields securely locked entirely to the Admin's namespace
    const updatePayload: Database["public"]["Tables"]["profiles"]["Update"] = {
      role: validatedData.role,
      company_name: resolvedCompanyName, // Permanent tenant isolation linkage
      company_id: authUser.id, // Direct company owner hierarchy
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
