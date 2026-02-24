import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("about", "routes/about.tsx"),
  route("login", "routes/(auth)/login/index.tsx"),
  route("signup", "routes/(auth)/signup/index.tsx"),
  route("logout", "routes/(auth)/logout/index.tsx"),
  route("dashboard", "routes/(admin)/dashboard.tsx"),
  route("dashboard/profile", "routes/(admin)/dashboard/profile/index.tsx"),
  route(
    "dashboard/properties",
    "routes/(admin)/dashboard/properties/index.tsx",
  ),
  route(
    "dashboard/properties/:id",
    "routes/(admin)/dashboard/properties/$id.tsx",
  ),
  route("dashboard/leads", "routes/(admin)/dashboard/leads/index.tsx"),
  route("dashboard/users", "routes/(admin)/dashboard/users/index.tsx"),

  // API Routes
  route("api/auth/login", "routes/api/auth/login.ts"),
  route("api/auth/signup", "routes/api/auth/signup.ts"),
  route("api/auth/logout", "routes/api/auth/logout.ts"),
  route("api/properties", "routes/api/properties.ts"),
  route("api/properties/upload", "routes/api/properties/upload.ts"),
  route("api/properties/:id", "routes/api/properties/$id.ts"),
  route("api/fake-bulk-property", "routes/api/fake-bulk-property.ts"),
  route("api/fake-bulk-lead", "routes/api/fake-bulk-lead.ts"),
  route("api/leads", "routes/api/leads.ts"),
  route("api/leads/:id", "routes/api/leads/$id.ts"),
  route("api/leads/:id/events", "routes/api/leads/$id.events.ts"),
  route("api/leads/analytics", "routes/api/leads/analytics.ts"),
  route("api/leads/upcoming", "routes/api/leads/upcoming.ts"),
  route("api/email", "routes/api/email.ts"),
  route("api/users", "routes/api/users.ts"),
  route("api/users/:id", "routes/api/users/$id.ts"),
  route("api/users/reset-password", "routes/api/users/reset-password.ts"),
] satisfies RouteConfig;
