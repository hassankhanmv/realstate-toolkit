import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("about", "routes/about.tsx"),
  route("login", "routes/login/index.tsx"),
  route("signup", "routes/signup.tsx"),
  route("logout", "routes/logout.tsx"),
  route("dashboard", "routes/dashboard.tsx"),

  // API Routes
  route("api/auth/login", "routes/api/auth/login.ts"),
  route("api/auth/signup", "routes/api/auth/signup.ts"),
  route("api/auth/logout", "routes/api/auth/logout.ts"),
] satisfies RouteConfig;
