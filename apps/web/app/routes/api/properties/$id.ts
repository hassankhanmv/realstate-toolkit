import type { Route } from "./+types/$id";
import { data } from "react-router";
import { getSupabaseServer } from "@/lib/supabase.server";
import {
  getPropertyById,
  updateProperty,
  deleteProperty,
  createAdminClient,
  type PropertyUpdate,
} from "@repo/supabase";
import { sendEmail, getPropertyDeletedEmail } from "@repo/email";

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { supabase, headers } = getSupabaseServer(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return data({ error: "Unauthorized" }, { status: 401, headers });
  }

  const { data: profile } = await (supabase.from("profiles") as any)
    .select("admin_id")
    .eq("id", user.id)
    .single();

  const companyId = profile?.admin_id || user.id;

  const { id } = params;
  if (!id) {
    return data({ error: "Property ID required" }, { status: 400, headers });
  }

  try {
    const property = await getPropertyById(supabase, id);

    // Check ownership
    const propCompanyId = property.company_id || property.broker_id;
    if (propCompanyId !== companyId && property.broker_id !== user.id) {
      return data({ error: "Forbidden" }, { status: 403, headers });
    }

    return data({ property }, { headers });
  } catch (error) {
    console.error(`Failed to fetch property ${id}:`, error);
    return data(
      { error: "Failed to fetch property" },
      { status: 500, headers },
    );
  }
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const { supabase, headers } = getSupabaseServer(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return data({ error: "Unauthorized" }, { status: 401, headers });
  }

  const { data: profile } = await (supabase.from("profiles") as any)
    .select("admin_id")
    .eq("id", user.id)
    .single();

  const companyId = profile?.admin_id || user.id;

  const { id } = params;
  if (!id) {
    return data({ error: "Property ID required" }, { status: 400, headers });
  }

  // Common: Check ownership before modifying
  let existing: any;
  try {
    existing = await getPropertyById(supabase, id);
    const propCompanyId = existing.company_id || existing.broker_id;
    if (propCompanyId !== companyId && existing.broker_id !== user.id) {
      return data({ error: "Forbidden" }, { status: 403, headers });
    }
  } catch (e) {
    return data({ error: "Property not found" }, { status: 404, headers });
  }

  try {
    const adminSupabase = createAdminClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.VITE_SUPABASE_ANON_KEY!,
    );

    if (request.method === "PUT") {
      const updateData = (await request.json()) as PropertyUpdate;
      // Prevent updating broker_id or id
      delete updateData.id;
      delete updateData.broker_id;

      const updated = await updateProperty(
        adminSupabase as any,
        id,
        updateData,
      );
      return data({ property: updated }, { headers });
    }

    if (request.method === "DELETE") {
      const propertyTitle = existing.title || "Untitled Property";
      await deleteProperty(adminSupabase as any, id);

      // Send deletion notification email to the logged-in user
      if (user.email) {
        try {
          const { subject, html } = getPropertyDeletedEmail({
            name: user.user_metadata?.full_name || user.email.split("@")[0],
            propertyTitle,
          });
          await sendEmail({ to: user.email, subject, html });
        } catch (emailErr) {
          // Don't fail the delete if email fails — just log it
          console.error("Failed to send property-deleted email:", emailErr);
        }
      }

      return data({ success: true }, { headers });
    }

    return data({ error: "Method not allowed" }, { status: 405, headers });
  } catch (error) {
    console.error(`Failed to ${request.method} property ${id}:`, error);
    return data(
      {
        error: `Failed to ${request.method === "DELETE" ? "delete" : "update"} property: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500, headers },
    );
  }
};
