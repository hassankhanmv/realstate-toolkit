/**
 * Common application constants
 * These constants are globally accessible via window.App
 */

export const APP_CONFIG = {
  name: "app_name", // Translation key
  subtitle: "app_subtitle", // Translation key
  defaultLanguage: "en",
  supportedLanguages: ["en", "ar"],
} as const;

export const UI_CONFIG = {
  sidebarWidth: 288, // 72 * 4 = 288px (w-72 in Tailwind)
  headerHeight: 80, // 20 * 4 = 80px (h-20 in Tailwind)
  mobileBreakpoint: 768, // md breakpoint
} as const;

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  DASHBOARD: "/dashboard",
  DASHBOARD_PROPERTIES: "/dashboard/properties",
  DASHBOARD_LEADS: "/dashboard/leads",
  DASHBOARD_USERS: "/dashboard/users",
  DASHBOARD_PROFILE: "/dashboard/profile",
  DASHBOARD_SETTINGS: "/dashboard/settings",
  PORTAL: "/portal",
  PORTAL_SEARCH: "/portal/search",
  PORTAL_FAVORITES: "/portal/favorites",
  PORTAL_PROFILE: "/portal/profile",
} as const;

export const STORAGE_KEYS = {
  LANGUAGE: "i18nextLng",
  THEME: "theme",
  USER_PREFERENCES: "user_preferences",
} as const;
