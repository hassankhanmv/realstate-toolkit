import type { ActionFunctionArgs } from "react-router";
import { data } from "react-router";
import { getSupabaseServer } from "@/lib/supabase.server";
import { sendEmail, getPasswordResetEmail } from "@repo/email";

export async function action({ request }: ActionFunctionArgs) {
  const { supabase } = await getSupabaseServer(request);
  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !authUser) throw data("Unauthorized", { status: 401 });

  if (request.method !== "POST") {
    return data({ error: "Method not allowed" }, { status: 405 });
  }

  const payload = await request.json();
  const { userId, email, newPassword, websiteUrl } = payload;

  if (!userId || !email || !newPassword) {
    return data({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const adminAuthClient = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.VITE_SUPABASE_ANON_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    // Update password
    const { error: updateError } =
      await adminAuthClient.auth.admin.updateUserById(userId, {
        password: newPassword,
      });

    if (updateError) throw updateError;

    // Send email
    const loginUrl = websiteUrl
      ? `${websiteUrl}/login`
      : "http://localhost:5173/login";

    // Fetch user name
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .single();

    const emailTemplate = getPasswordResetEmail({
      name: (profile as any)?.full_name || "User",
      loginUrl,
      newPassword,
    });

    await sendEmail({
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });

    return data({ success: true });
  } catch (err: any) {
    console.error("API Error in /api/users/reset-password [POST]:", err);
    return data(
      { error: err.message || "Failed to reset password" },
      { status: 500 },
    );
  }
}
