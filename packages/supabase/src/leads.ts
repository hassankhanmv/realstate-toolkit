import { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import type { Lead, LeadInsert, LeadUpdate } from "./types";

/**
 * Fetches all leads for a specific broker
 * Joins with properties to get the property title
 * Orders by created_at descending
 */
export async function getLeadsByCompany(
  supabase: SupabaseClient<Database>,
  companyId: string,
) {
  try {
    const { data, error } = await supabase
      .from("leads")
      .select(
        `
        *,
        properties ( title )
      `,
      )
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data as unknown as Lead[]) || [];
  } catch (error: any) {
    console.error("Error fetching leads by broker:", error);
    throw new Error(`Failed to fetch leads: ${error.message}`);
  }
}

/**
 * Fetches leads linked to a specific property (for CRM integration)
 */
export async function getLeadsByProperty(
  supabase: SupabaseClient<Database>,
  propertyId: string,
) {
  try {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("property_id", propertyId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error("Error fetching leads by property:", error);
    throw new Error(`Failed to fetch leads: ${error.message}`);
  }
}

/**
 * Fetches a single lead by its ID
 */
export async function getLeadById(
  supabase: SupabaseClient<Database>,
  id: string,
) {
  try {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error("Error fetching lead details:", error);
    throw new Error(`Failed to fetch lead details: ${error.message}`);
  }
}

/**
 * Inserts a new lead
 */
export async function createLead(
  supabase: SupabaseClient<Database>,
  data: LeadInsert,
) {
  try {
    const { data: newLead, error } = await (supabase.from("leads") as any)
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return newLead;
  } catch (error: any) {
    console.error("Error creating lead:", error);
    throw new Error(`Failed to create lead: ${error.message}`);
  }
}

/**
 * Updates an existing lead (e.g. status/notes)
 */
export async function updateLead(
  supabase: SupabaseClient<Database>,
  id: string,
  data: LeadUpdate,
) {
  try {
    const { data: updatedLead, error } = await (supabase.from("leads") as any)
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return updatedLead;
  } catch (error: any) {
    console.error("Error updating lead:", error);
    throw new Error(`Failed to update lead: ${error.message}`);
  }
}

/**
 * Deletes a lead
 */
export async function deleteLead(
  supabase: SupabaseClient<Database>,
  id: string,
) {
  try {
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error("Error deleting lead:", error);
    throw new Error(`Failed to delete lead: ${error.message}`);
  }
}

// Fetch leads not assigned to any property
export async function getUnassignedLeads(
  supabase: SupabaseClient<Database>,
  brokerId: string,
) {
  try {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("broker_id", brokerId)
      .is("property_id", null)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error("Error fetching unassigned leads:", error);
    throw new Error(`Failed to fetch unassigned leads: ${error.message}`);
  }
}

// Bulk update leads (e.g., assign property or change status)
export async function bulkUpdateLeads(
  supabase: SupabaseClient<Database>,
  leadIds: string[],
  updateData: Partial<LeadUpdate>,
) {
  try {
    const { data, error } = await (supabase.from("leads") as any)
      .update(updateData)
      .in("id", leadIds)
      .select();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error("Error bulk updating leads:", error);
    throw new Error(`Failed to bulk update leads: ${error.message}`);
  }
}

// Bulk delete leads
export async function bulkDeleteLeads(
  supabase: SupabaseClient<Database>,
  leadIds: string[],
) {
  try {
    const { error } = await supabase.from("leads").delete().in("id", leadIds);

    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error("Error bulk deleting leads:", error);
    throw new Error(`Failed to bulk delete leads: ${error.message}`);
  }
}

// Fetch leads with follow-up dates in the next N days
export async function getUpcomingFollowUps(
  supabase: SupabaseClient<Database>,
  brokerId: string,
  days: number = 7,
) {
  try {
    const now = new Date();
    const future = new Date();
    future.setDate(now.getDate() + days);

    const { data, error } = await supabase
      .from("leads")
      .select("*, properties ( title )")
      .eq("broker_id", brokerId)
      .not("follow_up_date", "is", null)
      .gte("follow_up_date", now.toISOString().split("T")[0])
      .lte("follow_up_date", future.toISOString().split("T")[0])
      .order("follow_up_date", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error("Error fetching upcoming follow-ups:", error);
    throw new Error(`Failed to fetch upcoming follow-ups: ${error.message}`);
  }
}

// Aggregate analytics: counts by source, status, conversion rate, top properties
export async function getLeadsAnalytics(
  supabase: SupabaseClient<Database>,
  brokerId: string,
) {
  try {
    const { data: leads, error } = await supabase
      .from("leads")
      .select("status, source, property_id, properties ( title )")
      .eq("broker_id", brokerId);

    if (error) throw error;
    if (!leads || leads.length === 0) {
      return {
        total: 0,
        bySource: {} as Record<string, number>,
        byStatus: {} as Record<string, number>,
        conversionRate: 0,
        topProperties: [] as { title: string; count: number }[],
      };
    }

    const bySource: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    const propertyCount: Record<string, { title: string; count: number }> = {};
    let wonCount = 0;

    for (const lead of leads) {
      // By source
      const src = (lead as any).source || "Unknown";
      bySource[src] = (bySource[src] || 0) + 1;

      // By status
      const st = (lead as any).status || "Unknown";
      byStatus[st] = (byStatus[st] || 0) + 1;
      if (st === "Won") wonCount++;

      // By property
      const pid = (lead as any).property_id;
      const pTitle = (lead as any).properties?.title;
      if (pid && pTitle) {
        if (!propertyCount[pid])
          propertyCount[pid] = { title: pTitle, count: 0 };
        propertyCount[pid].count++;
      }
    }

    const topProperties = Object.values(propertyCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      total: leads.length,
      bySource,
      byStatus,
      conversionRate:
        leads.length > 0 ? Math.round((wonCount / leads.length) * 100) : 0,
      topProperties,
    };
  } catch (error: any) {
    console.error("Error fetching leads analytics:", error);
    throw new Error(`Failed to fetch leads analytics: ${error.message}`);
  }
}
// --- LEAD EVENTS (AUDIT LOG) ---

export async function getLeadEvents(
  supabase: SupabaseClient<Database>,
  leadId: string,
) {
  try {
    const { data, error } = await supabase
      .from("lead_events")
      .select("*")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error("Error fetching lead events:", error);
    throw new Error(`Failed to fetch lead events: ${error.message}`);
  }
}

export async function createLeadEvent(
  supabase: SupabaseClient<Database>,
  event: Database["public"]["Tables"]["lead_events"]["Insert"],
) {
  try {
    const { error } = await supabase.from("lead_events").insert([event] as any);
    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error("Error creating lead event:", error);
    throw new Error(`Failed to create lead event: ${error.message}`);
  }
}
