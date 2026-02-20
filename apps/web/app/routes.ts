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

  // API Routes
  route("api/auth/login", "routes/api/auth/login.ts"),
  route("api/auth/signup", "routes/api/auth/signup.ts"),
  route("api/auth/logout", "routes/api/auth/logout.ts"),
  route("api/properties", "routes/api/properties.ts"),
  route("api/properties/:id", "routes/api/properties/$id.ts"),
] satisfies RouteConfig;
