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

  const u = user as UserWithProfile;
  const url = new URL(request.url);

  // If buyer tries to access dashboard, redirect to portal home
  if (u.profile?.role === "buyer" && url.pathname.startsWith("/dashboard")) {
    throw redirect("/portal", { headers });
  }

  return { user: u, supabase, headers };
}

/**
 * requireAdminAuth - Stricter than requireAuth.
 * Forcefully redirects buyers to /portal and guests to /login.
 */
export async function requireAdminAuth(request: Request) {
  const { user, supabase, headers } = await requireAuth(request);

  if (user.profile?.role === "buyer") {
    throw redirect("/portal", { headers });
  }

  // Ensure user has an admin-like role
  const adminRoles = ["broker", "company_owner", "agent"];
  if (!user.profile?.role || !adminRoles.includes(user.profile.role)) {
    throw redirect("/portal", { headers });
  }

  return { user, supabase, headers };
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

/**
 * Optional auth — returns user or null without redirecting.
 * Used on public portal pages where auth is optional (e.g., favorites button shows login prompt).
 */
export async function optionalAuth(request: Request) {
  const { supabase, headers } = getSupabaseServer(request);
  const {
    data: { user },
    error,
  } = await getCurrentUser(supabase);

  if (error || !user) {
    return { user: null, supabase, headers };
  }

  return { user: user as UserWithProfile, supabase, headers };
}

/**
 * Require buyer role — redirects non-buyers to /portal.
 * Allows ?preview=true for brokers to view portal in read-only mode.
 */
export async function requireBuyerAuth(request: Request) {
  const url = new URL(request.url);
  const isPreview = url.searchParams.get("preview") === "true";

  const { supabase, headers } = getSupabaseServer(request);
  const {
    data: { user },
    error,
  } = await getCurrentUser(supabase);

  if (error || !user) {
    throw redirect("/login", { headers });
  }

  const role = (user as UserWithProfile).profile?.role;

  // Allow brokers/admins in preview mode
  if (
    isPreview &&
    role &&
    ["broker", "company_owner", "agent"].includes(role)
  ) {
    return {
      user: user as UserWithProfile,
      supabase,
      headers,
      isPreview: true,
    };
  }

  // Non-buyer, non-preview → redirect
  if (role && role !== "buyer") {
    throw redirect("/dashboard", { headers });
  }

  return { user: user as UserWithProfile, supabase, headers, isPreview: false };
}
