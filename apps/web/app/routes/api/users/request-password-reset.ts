import type { ActionFunctionArgs } from "react-router";
import { data } from "react-router";
import { getSupabaseServer } from "@/lib/supabase.server";
import { sendEmail, getPasswordResetRequestEmail } from "@repo/email";

export async function action({ request }: ActionFunctionArgs) {
  const { supabase, headers } = getSupabaseServer(request);
  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !authUser) {
    throw data("Unauthorized", { status: 401, headers });
  }

  if (request.method !== "POST") {
    return data({ error: "Method not allowed" }, { status: 405, headers });
  }

  try {
    const payload = await request.json();
    const note = payload.note as string | undefined;

    // 1. Look up the child agent's underlying profile to find their `admin_id`
    const { data: profile, error: profileError } = await (
      supabase.from("profiles") as any
    )
      .select("full_name, admin_id")
      .eq("id", authUser.id)
      .single();

    if (profileError || !profile) {
      throw new Error("Unable to locate profile details.");
    }

    if (!profile.admin_id) {
      throw new Error("You are not a managed agent.");
    }

    // 2. Fetch the Company Owner's details. We need the Admin Auth client to fetch their authenticated email.
    const { createClient } = await import("@supabase/supabase-js");
    const adminAuthClient = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.VITE_SUPABASE_ANON_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const { data: adminUser, error: adminError } =
      await adminAuthClient.auth.admin.getUserById(profile.admin_id);

    if (adminError || !adminUser?.user) {
      throw new Error(
        "Unable to locate Company Admin profile for this request.",
      );
    }

    const adminEmail = adminUser.user.email;
    const adminName = adminUser.user.user_metadata?.full_name || "Admin";
    const agentName = profile.full_name || authUser.email || "Unknown Agent";

    if (!adminEmail) {
      throw new Error("Company Admin does not have a registered email.");
    }

    // 3. Assemble and dispatch the @repo/email template
    const dashBoardUrl = process.env.VITE_BASE_URL
      ? `${process.env.VITE_BASE_URL}/dashboard/users`
      : "http://localhost:5173/dashboard/users";

    const { subject, html } = getPasswordResetRequestEmail({
      adminName,
      agentName,
      agentEmail: authUser.email || "",
      note,
      dashBoardUrl,
    });

    await sendEmail({
      to: adminEmail,
      subject,
      html,
    });

    return data(
      { success: true, message: "Request sent to administrator." },
      { status: 200, headers },
    );
  } catch (error: any) {
    console.error("Password reset request error:", error);
    return data(
      { error: error.message || "Failed to submit request" },
      { status: 500, headers },
    );
  }
}
