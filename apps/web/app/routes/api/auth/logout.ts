import { data } from "react-router";
import { getSupabaseServer } from "@/lib/supabase.server";
import { signOutUser } from "@repo/supabase";
import type { Route } from "./+types/logout";

export const action = async ({ request }: Route.ActionArgs) => {
  if (request.method !== "POST") {
    return data({ error: "Method not allowed" }, { status: 405 });
  }

  const { supabase, headers } = getSupabaseServer(request);
  const { error } = await signOutUser(supabase);

  if (error) {
    return data({ error: error.message }, { status: 500, headers });
  }

  return data({ success: true }, { status: 200, headers });
};
