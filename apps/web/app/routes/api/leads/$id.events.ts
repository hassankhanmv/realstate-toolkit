import { data, type LoaderFunctionArgs } from "react-router";
import { getSupabaseServer } from "@/lib/supabase.server";
import { getLeadEvents } from "@repo/supabase";

export async function loader({ request, params }: LoaderFunctionArgs) {
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
    const events = await getLeadEvents(supabase, id);
    return data({ events }, { headers });
  } catch (error: any) {
    return data({ error: error.message }, { status: 500, headers });
  }
}
