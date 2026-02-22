import { redirect } from "react-router";
import { getSupabaseServer } from "@/lib/supabase.server";
import { signOutUser } from "@repo/supabase";
import type { Route } from "./+types/index";
export const action = async ({ request }: Route.ActionArgs) => {
  const { supabase, headers } = getSupabaseServer(request);
  await signOutUser(supabase);
  return redirect("/login", { headers });
};

export const loader = async () => {
  return redirect("/");
};
