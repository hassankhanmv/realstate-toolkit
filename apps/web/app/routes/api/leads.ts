import {
  data,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router";
import { getSupabaseServer } from "@/lib/supabase.server";
import {
  getLeadsByCompany,
  createLead,
  bulkUpdateLeads,
  bulkDeleteLeads,
  createLeadEvent,
  type LeadInsert,
} from "@repo/supabase";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabaseServer(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return data({ error: "Unauthorized" }, { status: 401, headers });
  }

  const { data: profile } = await (supabase.from("profiles") as any)
    .select("company_id")
    .eq("id", user.id)
    .single();

  const companyId = profile?.company_id || user.id;

  try {
    const leads = await getLeadsByCompany(supabase, companyId);
    return data({ data: leads }, { headers });
  } catch (error: any) {
    return data({ error: error.message }, { status: 500, headers });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const { supabase, headers } = getSupabaseServer(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return data({ error: "Unauthorized" }, { status: 401, headers });
  }

  // POST: Create a lead
  if (request.method === "POST") {
    try {
      const body = (await request.json()) as LeadInsert;
      if (!body.name) {
        return data({ error: "Name is required" }, { status: 400, headers });
      }

      if (body.follow_up_date === "") {
        body.follow_up_date = null as any;
      }
      if (body.property_id === "") {
        body.property_id = null as any;
      }
      // We no longer have broker_id on leads, but we want to store the acting user
      // so in the events we use user_id, and for the lead itself we only need company_id.

      let companyId = user.id;
      const { data: profile } = await (supabase.from("profiles") as any)
        .select("company_id")
        .eq("id", user.id)
        .single();

      if (profile) {
        companyId = profile.company_id || user.id;
      }

      body.company_id = companyId;

      const newLead = await createLead(supabase, body);

      // Log creation event
      if (newLead?.id) {
        await createLeadEvent(supabase, {
          lead_id: newLead.id,
          event_type: "created",
          user_id: user.id,
        });
      }

      return data({ data: newLead }, { status: 201, headers });
    } catch (error: any) {
      return data({ error: error.message }, { status: 500, headers });
    }
  }

  // PUT: Bulk update leads
  if (request.method === "PUT") {
    try {
      const body = (await request.json()) as {
        ids: string[];
        data: Record<string, any>;
      };
      if (!body.ids?.length) {
        return data(
          { error: "No lead IDs provided" },
          { status: 400, headers },
        );
      }
      const updated = await bulkUpdateLeads(supabase, body.ids, body.data);

      // Log bulk update events
      if (updated && updated.length > 0) {
        for (const lead of updated) {
          if (body.data.status) {
            await createLeadEvent(supabase, {
              lead_id: lead.id,
              event_type: "status_changed",
              new_value: body.data.status,
              user_id: user.id,
            });
          }
        }
      }

      return data({ data: updated, count: updated?.length ?? 0 }, { headers });
    } catch (error: any) {
      return data({ error: error.message }, { status: 500, headers });
    }
  }

  // DELETE: Bulk delete leads
  if (request.method === "DELETE") {
    try {
      const body = (await request.json()) as { ids: string[] };
      if (!body.ids?.length) {
        return data(
          { error: "No lead IDs provided" },
          { status: 400, headers },
        );
      }
      await bulkDeleteLeads(supabase, body.ids);
      return data({ success: true, count: body.ids.length }, { headers });
    } catch (error: any) {
      return data({ error: error.message }, { status: 500, headers });
    }
  }

  return data({ error: "Method not allowed" }, { status: 405, headers });
}
