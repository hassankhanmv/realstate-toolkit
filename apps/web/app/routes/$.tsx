import { redirect } from "react-router";
import type { Route } from "./+types/$";
import { requireAuth } from "@/lib/auth.server";

/**
 * Catch-all route ($) handles unknown paths and unauthorized access.
 * It redirects users to their appropriate home page based on their role and auth status.
 */
export const loader = async ({ request }: Route.LoaderArgs) => {
  const { user, headers } = await requireAuth(request);

  if (!user) {
    // If not logged in, redirect to login
    throw redirect("/login", { headers });
  }

  // If logged in, redirect based on role
  const role = user.profile?.role;
  const target = role === "buyer" ? "/portal" : "/dashboard";

  throw redirect(target, { headers });
};

export default function CatchAll() {
  return null;
}
