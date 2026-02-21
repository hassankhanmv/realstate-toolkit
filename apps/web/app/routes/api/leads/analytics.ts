import { data, type LoaderFunctionArgs } from "react-router";
import { getSupabaseServer } from "@/lib/supabase.server";
import { getLeadsAnalytics } from "@repo/supabase";

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabaseServer(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return data({ error: "Unauthorized" }, { status: 401, headers });
  }

  try {
    const analytics = await getLeadsAnalytics(supabase, user.id);
    return data({ data: analytics }, { headers });
  } catch (error: any) {
    return data({ error: error.message }, { status: 500, headers });
  }
}
