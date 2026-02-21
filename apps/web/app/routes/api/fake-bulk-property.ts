import type { Route } from "./+types/fake-bulk-property";
import { data } from "react-router";
import { getSupabaseServer } from "@/lib/supabase.server";
import { createProperty } from "@repo/supabase";
import { generateFakeProperties } from "@/lib/fakeData";

export const action = async ({ request }: Route.ActionArgs) => {
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

    const fakeProperties = generateFakeProperties(count, user.id);
    const results: { index: number; title: string; status: string }[] = [];

    for (let i = 0; i < fakeProperties.length; i++) {
      const prop = fakeProperties[i];
      try {
        await createProperty(supabase as any, prop as any);
        results.push({
          index: i + 1,
          title: prop.title,
          status: "✅ created",
        });
      } catch (err) {
        results.push({
          index: i + 1,
          title: prop.title,
          status: `❌ ${err instanceof Error ? err.message : "failed"}`,
        });
      }
    }

    const successCount = results.filter((r) =>
      r.status.startsWith("✅"),
    ).length;

    return data(
      {
        message: `Seeded ${successCount}/${count} properties`,
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
