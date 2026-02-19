import type { Route } from "./+types/properties";
import { data } from "react-router";
import { getSupabaseServer } from "@/lib/supabase.server";
import {
  getPropertiesByBroker,
  createProperty,
  type PropertyInsert,
} from "@repo/supabase";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { supabase, headers } = getSupabaseServer(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return data({ error: "Unauthorized" }, { status: 401, headers });
  }

  try {
    const properties = await getPropertiesByBroker(supabase, user.id);
    return data({ properties }, { headers });
  } catch (error) {
    console.error("Failed to fetch properties:", error);
    return data(
      { error: "Failed to fetch properties", properties: [] },
      { status: 500, headers },
    );
  }
};

export const action = async ({ request }: Route.ActionArgs) => {
  const { supabase, headers } = getSupabaseServer(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return data({ error: "Unauthorized" }, { status: 401, headers });
  }

  if (request.method !== "POST") {
    return data({ error: "Method not allowed" }, { status: 405, headers });
  }

  try {
    // The frontend sends JSON, so we must use request.json()
    // request.formData() throws if Content-Type is application/json
    const jsonData = (await request.json()) as Partial<PropertyInsert>;

    // Basic validation could go here, or use Zod
    if (!jsonData.title || !jsonData.location || !jsonData.price) {
      return data(
        { error: "Missing required fields" },
        { status: 400, headers },
      );
    }

    const newPropertyData: PropertyInsert = {
      ...jsonData,
      broker_id: user.id, // Enforce broker_id from auth
    } as PropertyInsert;

    // Ensure profile exists to avoid FK error
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!profile) {
      // console.log("Profile missing for user", user.id, "creating...");
      const { error: profileError } = await (
        supabase.from("profiles") as any
      ).insert({
        id: user.id,
        full_name:
          user.user_metadata?.full_name ??
          user.email?.split("@")[0] ??
          "Unknown",
        company_name: user.user_metadata?.company_name,
      });

      if (profileError) {
        console.error("Failed to create missing profile:", profileError);
        // Continue anyway, maybe it exists now or RLS blocked it
      }
    }

    // console.log("Creating property:", newPropertyData);

    const newProperty = await createProperty(supabase, newPropertyData);

    return data({ property: newProperty }, { status: 201, headers });
  } catch (error: any) {
    console.error("Failed to create property:", error);
    return data(
      { error: error?.message || "Failed to create property" },
      { status: 500, headers },
    );
  }
};
