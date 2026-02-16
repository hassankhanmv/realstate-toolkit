import {
  Building2,
  Users,
  Contact,
  LayoutDashboard,
  User,
  Settings,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { ROUTES } from "@/constants";

export interface MenuItem {
  href: string;
  label: string; // Translation key
  icon: LucideIcon;
  permissions?: string[]; // For future authorization
}

export interface UserMenuItem {
  href?: string;
  label: string; // Translation key
  icon: LucideIcon;
  action?: string; // For items that trigger actions instead of navigation
  permissions?: string[];
}

/**
 * Sidebar navigation menu configuration
 */
export const sidebarMenuItems: MenuItem[] = [
  {
    href: ROUTES.DASHBOARD,
    label: "dashboard.nav.overview",
    icon: LayoutDashboard,
  },
  {
    href: ROUTES.DASHBOARD_PROPERTIES,
    label: "dashboard.nav.properties",
    icon: Building2,
  },
  {
    href: ROUTES.DASHBOARD_LEADS,
    label: "dashboard.nav.leads",
    icon: Contact,
  },
  {
    href: ROUTES.DASHBOARD_USERS,
    label: "dashboard.nav.users",
    icon: Users,
  },
];

/**
 * Header user dropdown menu configuration
 */
export const userMenuItems: UserMenuItem[] = [
  {
    href: ROUTES.DASHBOARD_PROFILE,
    label: "user_menu.profile",
    icon: User,
  },
  {
    href: ROUTES.DASHBOARD_SETTINGS,
    label: "user_menu.settings",
    icon: Settings,
  },
  {
    action: "logout",
    label: "logout",
    icon: LogOut,
  },
];

/**
 * Get menu configuration for global access
 */
export const getMenuConfig = () => ({
  sidebar: sidebarMenuItems,
  userMenu: userMenuItems,
});
