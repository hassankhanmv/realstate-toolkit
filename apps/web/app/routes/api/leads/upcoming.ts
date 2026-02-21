import { data, type LoaderFunctionArgs } from "react-router";
import { getSupabaseServer } from "@/lib/supabase.server";
import { getUpcomingFollowUps } from "@repo/supabase";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabaseServer(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return data({ error: "Unauthorized" }, { status: 401, headers });
  }

  const url = new URL(request.url);
  const days = Number(url.searchParams.get("days") || "7");

  try {
    const leads = await getUpcomingFollowUps(supabase, user.id, days);
    return data({ data: leads }, { headers });
  } catch (error: any) {
    return data({ error: error.message }, { status: 500, headers });
  }
}
