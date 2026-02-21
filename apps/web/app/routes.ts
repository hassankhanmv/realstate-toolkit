import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("about", "routes/about.tsx"),
  route("login", "routes/login/index.tsx"),
  route("signup", "routes/signup.tsx"),
  route("logout", "routes/logout.tsx"),
  route("dashboard", "routes/dashboard.tsx"),
  route("dashboard/profile", "routes/dashboard/profile/index.tsx"),
  route("dashboard/properties", "routes/dashboard/properties/index.tsx"),
  route("dashboard/properties/:id", "routes/dashboard/properties/$id.tsx"),
  route("dashboard/leads", "routes/dashboard/leads/index.tsx"),

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
  route("api/leads/analytics", "routes/api/leads/analytics.ts"),
  route("api/leads/upcoming", "routes/api/leads/upcoming.ts"),
  route("api/email", "routes/api/email.ts"),
] satisfies RouteConfig;
