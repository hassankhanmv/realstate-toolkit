import { redirect } from "react-router";
import { getSupabaseServer } from "@/lib/supabase.server";
import { getCurrentUser, type UserWithProfile } from "@repo/supabase";

export async function requireAuth(request: Request) {
  const { supabase, headers } = getSupabaseServer(request);
  const {
    data: { user },
    error,
  } = await getCurrentUser(supabase);

  if (error || !user) {
    throw redirect("/login", { headers });
  }

  return { user: user as UserWithProfile, supabase, headers };
}

export async function requirePermission(
  request: Request,
  module: "properties" | "leads" | "users" | "analytics" | "profile",
  action?: "view" | "edit" | "create" | "delete",
) {
  const { user, supabase, headers } = await requireAuth(request);

  if (!user.profile) {
    throw redirect("/login", { headers });
  }

  // Parse permissions
  let permissions: any = {};
  const prof = user.profile as any;
  if (typeof prof.permissions === "string") {
    try {
      permissions = JSON.parse(prof.permissions);
    } catch (e) {
      // Ignore parse error
    }
  } else if (prof.permissions) {
    permissions = prof.permissions;
  }

  let hasPermission = false;

  // Handle boolean modules (analytics, profile)
  if (module === "analytics" || module === "profile") {
    hasPermission = !!permissions[module];
  } else if (action && permissions[module]) {
    // Handle action-based modules (properties, leads, users)
    hasPermission = !!permissions[module][action];
  }

  if (!hasPermission) {
    throw redirect("/dashboard", { headers });
  }

  return { user, supabase, headers };
}
