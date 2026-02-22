import { data, type ActionFunctionArgs } from "react-router";
import { getSupabaseServer } from "@/lib/supabase.server";
import {
  updateLead,
  deleteLead,
  createLeadEvent,
  type LeadUpdate,
} from "@repo/supabase";
import { sendEmail, getLeadStatusChangeEmail } from "@repo/email";

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

      // --- AUTOMATION RULES ---
      // Rule 1: If status is changing to 'Contacted' and no follow_up_date is set, set to +3 days
      if (body.status === "Contacted" && !body.follow_up_date) {
        const d = new Date();
        d.setDate(d.getDate() + 3);
        body.follow_up_date = d.toISOString().split("T")[0]; // YYYY-MM-DD
      }

      // 1. Fetch old lead to compare
      const { data: oldLeadData } = await supabase
        .from("leads")
        .select("status, notes, property_id")
        .eq("id", id)
        .single();
      const oldLead = oldLeadData as any as Record<string, any>;

      const updatedLead = await updateLead(supabase, id, body);

      // 2. Track changes if any
      if (oldLead) {
        if (body.status && body.status !== oldLead.status) {
          await createLeadEvent(supabase, {
            lead_id: id,
            event_type: "status_changed",
            old_value: oldLead.status,
            new_value: body.status,
            broker_id: user.id,
          });

          // Rule 2: Automatic Email on Status Change
          // Only send if the lead has an email address and status changed
          if (oldLead.email) {
            try {
              const { subject, html } = getLeadStatusChangeEmail({
                leadName: oldLead.name || "Client",
                oldStatus: oldLead.status,
                newStatus: body.status,
                propertyTitle: oldLead.properties?.title || "our properties",
                brokerName: user.user_metadata?.first_name || "Your Broker",
              });
              await sendEmail({ to: oldLead.email, subject, html });
            } catch (err) {
              console.error("Failed to send automated status email:", err);
            }
          }
        }
        if (body.notes && body.notes !== oldLead.notes) {
          await createLeadEvent(supabase, {
            lead_id: id,
            event_type: "note_added", // Or note_changed
            old_value: oldLead.notes,
            new_value: body.notes,
            broker_id: user.id,
          });
        }
        if ("property_id" in body && body.property_id !== oldLead.property_id) {
          await createLeadEvent(supabase, {
            lead_id: id,
            event_type: "property_assigned",
            old_value: oldLead.property_id || "Unassigned",
            new_value: body.property_id || "Unassigned",
            broker_id: user.id,
          });
        }
      }

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
