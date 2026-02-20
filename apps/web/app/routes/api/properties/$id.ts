import type { Route } from "./+types/$id";
import { data } from "react-router";
import { getSupabaseServer } from "@/lib/supabase.server";
import {
  getPropertyById,
  updateProperty,
  deleteProperty,
  type PropertyUpdate,
} from "@repo/supabase";

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { supabase, headers } = getSupabaseServer(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return data({ error: "Unauthorized" }, { status: 401, headers });
  }

  const { id } = params;
  if (!id) {
    return data({ error: "Property ID required" }, { status: 400, headers });
  }

  try {
    const property = await getPropertyById(supabase, id);

    // Check ownership
    if (property.broker_id !== user.id) {
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

  const { id } = params;
  if (!id) {
    return data({ error: "Property ID required" }, { status: 400, headers });
  }

  // Common: Check ownership before modifying
  // Note: Optimally, this check should be done inside the service or RLS
  // For now, we'll rely on RLS or the update/delete call to fail if not owned,
  // or fetch-check here.
  try {
    const existing = await getPropertyById(supabase, id);
    if (existing.broker_id !== user.id) {
      return data({ error: "Forbidden" }, { status: 403, headers });
    }
  } catch (e) {
    return data({ error: "Property not found" }, { status: 404, headers });
  }

  try {
    if (request.method === "PUT") {
      const updateData = (await request.json()) as PropertyUpdate;
      // Prevent updating broker_id or id
      delete updateData.id;
      delete updateData.broker_id;

      const updated = await updateProperty(supabase, id, updateData);
      return data({ property: updated }, { headers });
    }

    if (request.method === "DELETE") {
      await deleteProperty(supabase, id);
      return data({ success: true }, { headers });
    }

    return data({ error: "Method not allowed" }, { status: 405, headers });
  } catch (error) {
    console.error(`Failed to ${request.method} property ${id}:`, error);
    return data(
      {
        error: `Failed to ${request.method === "DELETE" ? "delete" : "update"} property`,
      },
      { status: 500, headers },
    );
  }
};
