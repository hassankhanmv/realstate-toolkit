import type { ActionFunctionArgs } from "react-router";
import { data } from "react-router";
import type { Database } from "@repo/supabase";
import { getSupabaseServer } from "@/lib/supabase.server";
import { userFormSchema } from "@/validations/user";
import { sendEmail, getAccountDisabledEmail } from "@repo/email";

export async function action({ request, params }: ActionFunctionArgs) {
  const { supabase } = await getSupabaseServer(request);
  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !authUser) throw data("Unauthorized", { status: 401 });

  const id = params.id;
  if (!id) return data({ error: "User ID is required" }, { status: 400 });

  if (request.method === "PUT") {
    const payload = await request.json();
    const rawData = payload.data ? JSON.parse(payload.data) : payload;
    const note = payload.note;

    try {
      const validatedData = userFormSchema.parse(rawData);

      // Get the existing user's state to check if we are disabling them
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("is_disabled")
        .eq("id", id)
        .single();

      const isBeingDisabled =
        validatedData.is_disabled && !(existingUser as any)?.is_disabled;

      const updatePayload: Database["public"]["Tables"]["profiles"]["Update"] =
        {
          full_name: validatedData.full_name,
          role: validatedData.role,
          is_disabled: validatedData.is_disabled,
          expiry_date: validatedData.expiry_date
            ? new Date(validatedData.expiry_date).toISOString()
            : null,
          permissions: validatedData.permissions as any,
          notifications: validatedData.notifications as any,
        };

      const { data: responseData, error } = await supabase
        .from("profiles")
        // @ts-ignore
        .update(updatePayload)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // If a password was provided, try updating auth.user (Service role needed usually)
      if (validatedData.password && validatedData.password.length > 5 && id) {
        // supabase.auth.admin.updateUserById(id, { password: validatedData.password })
      }

      if (isBeingDisabled) {
        const { createClient } = await import("@supabase/supabase-js");
        const adminAuthClient = createClient(
          process.env.VITE_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY ||
            process.env.VITE_SUPABASE_ANON_KEY!,
          { auth: { autoRefreshToken: false, persistSession: false } },
        );
        const { data: userData } =
          await adminAuthClient.auth.admin.getUserById(id);
        const emailAddress = userData?.user?.email;
        if (emailAddress) {
          const emailTemplate = getAccountDisabledEmail({
            name: validatedData.full_name,
            note: note,
          });
          await sendEmail({
            to: emailAddress,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
          });
        }
      }

      return data({ data: responseData, success: true });
    } catch (err: any) {
      console.error(`API Error in /api/users/${id} [PUT]:`, err);
      return data(
        { error: err.message || "Failed to update user" },
        { status: 400 },
      );
    }
  }

  if (request.method === "DELETE") {
    try {
      // Initialize an admin client to bypass RLS and perform auth actions
      const { createClient } = await import("@supabase/supabase-js");
      const adminAuthClient = createClient(
        process.env.VITE_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
          process.env.VITE_SUPABASE_ANON_KEY!,
        {
          auth: { autoRefreshToken: false, persistSession: false },
        },
      );

      // Hard delete the user from Auth. This cascades to the public.profiles table automatically
      const { error } = await adminAuthClient.auth.admin.deleteUser(id);

      if (error) throw error;
      return data({ success: true });
    } catch (err: any) {
      console.error(`API Error in /api/users/${id} [DELETE]:`, err);
      return data(
        { error: err.message || "Failed to delete user" },
        { status: 500 },
      );
    }
  }

  return data({ error: "Method not allowed" }, { status: 405 });
}
