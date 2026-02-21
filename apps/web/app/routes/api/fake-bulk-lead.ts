import { data, type ActionFunctionArgs } from "react-router";
import { getSupabaseServer } from "@/lib/supabase.server";
import { createLead } from "@repo/supabase";
import { generateFakeLeads } from "@/lib/fakeLeadData";

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return data({ error: "Method not allowed" }, { status: 405 });
  }

  const { supabase, headers } = getSupabaseServer(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return data({ error: "Unauthorized" }, { status: 401, headers });
  }

  try {
    const body = (await request.json()) as { count?: number };
    const count = Math.min(body.count || 25, 50); // cap at 50
    console.log("user id", user.id);
    const fakeLeads = generateFakeLeads(count, user.id);
    const results: { index: number; name: string; status: string }[] = [];

    for (let i = 0; i < fakeLeads.length; i++) {
      const lead = fakeLeads[i];
      try {
        await createLead(supabase as any, lead as any);
        results.push({
          index: i + 1,
          name: lead.name,
          status: "✅ created",
        });
      } catch (err) {
        results.push({
          index: i + 1,
          name: lead.name,
          status: `❌ ${err instanceof Error ? err.message : "failed"}`,
        });
      }
    }

    const successCount = results.filter((r) =>
      r.status.startsWith("✅"),
    ).length;

    return data(
      {
        message: `Seeded ${successCount}/${count} leads`,
        results,
      },
      { headers },
    );
  } catch (error) {
    console.error("Seed error:", error);
    return data(
      { error: error instanceof Error ? error.message : "Seed failed" },
      { status: 500, headers },
    );
  }
};
