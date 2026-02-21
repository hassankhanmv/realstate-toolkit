import { data, type ActionFunctionArgs } from "react-router";
import { getSupabaseServer } from "@/lib/supabase.server";
import { updateLead, deleteLead, type LeadUpdate } from "@repo/supabase";

export async function action({ request, params }: ActionFunctionArgs) {
  const { id } = params;
  if (!id) {
    return data({ error: "Lead ID is required" }, { status: 400 });
  }

  const { supabase, headers } = getSupabaseServer(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return data({ error: "Unauthorized" }, { status: 401, headers });
  }

  try {
    if (request.method === "PUT") {
      const body = (await request.json()) as LeadUpdate;
      if (body.follow_up_date === "") {
        body.follow_up_date = null as any;
      }
      if (body.property_id === "") {
        body.property_id = null as any;
      }
      const updatedLead = await updateLead(supabase, id, body);
      return data({ data: updatedLead }, { headers });
    }

    if (request.method === "DELETE") {
      await deleteLead(supabase, id);
      return data({ success: true }, { headers });
    }

    return data({ error: "Method not allowed" }, { status: 405, headers });
  } catch (error: any) {
    return data({ error: error.message }, { status: 500, headers });
  }
}
