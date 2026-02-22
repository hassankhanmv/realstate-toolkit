import { Link, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { sidebarMenuItems } from "@/config/menuConfig";
import { Button } from "@/components/ui/button";
import { memo, useCallback, useMemo, useState } from "react";
import { signOutUser } from "@repo/supabase";
import { resetAuth } from "@/store/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { getSupabaseBrowser } from "@/lib/supabase.client";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import type { RootState } from "@/store/store";
interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

/**
 * Sidebar Component - Optimized navigation sidebar
 *
 * Memoized to prevent unnecessary re-renders on route changes.
 * Uses useCallback for handlers and useMemo for computed values.
 */
export const Sidebar = memo(
  function Sidebar({
    className,
    collapsed = false,
    onCollapsedChange,
  }: SidebarProps) {
    const { pathname } = useLocation();
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);

    const user = useSelector((state: RootState) => state.auth.user);

    // Memoize logout handler
    const handleLogout = useCallback(async () => {
      const supabase = getSupabaseBrowser();
      if (!supabase) return;
      await signOutUser(supabase);
      dispatch(resetAuth());
      window.location.href = "/login";
    }, [dispatch]);

    // Memoize toggle handler
    const toggleSidebar = useCallback(() => {
      const newCollapsed = !collapsed;
      onCollapsedChange?.(newCollapsed);
    }, [collapsed, onCollapsedChange]);

    const companyName = useMemo(() => {
      return user?.user_metadata?.company_name
        ? user.user_metadata.company_name
        : "U";
    }, [user?.user_metadata?.company_name]);

    return (
      <>
        <div
          className={cn(
            "flex flex-col h-full bg-white transition-all duration-300",
            collapsed ? "w-16" : "w-72",
            className,
          )}
        >
          {/* Header with Title and Collapse Button */}
          <div className="px-4 py-6 border-b border-slate-200 flex items-center justify-between">
            {!collapsed && (
              <h2 className="text-lg font-bold tracking-tight text-slate-900">
                {companyName}
              </h2>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-8 w-8 hover:bg-slate-100"
              title={collapsed ? t("sidebar.expand") : t("sidebar.collapse")}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4">
            <div className="space-y-1">
              {sidebarMenuItems.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 relative",
                      collapsed && "justify-center",
                      isActive
                        ? "bg-accent/10 text-accent-foreground"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                    )}
                    title={collapsed ? t(item.label) : undefined}
                  >
                    {isActive && (
                      <div className="absolute start-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-accent rounded-e" />
                    )}
                    <item.icon
                      className={cn(
                        "h-5 w-5 flex-shrink-0",
                        isActive && "text-accent",
                      )}
                    />
                    {!collapsed && <span>{t(item.label)}</span>}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Help Section */}
          {!collapsed && (
            <div className="px-4 py-3 border-t border-slate-200">
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <p className="text-xs font-semibold text-slate-900 mb-1">
                  {t("dashboard.help.title")}
                </p>
                <p className="text-xs text-slate-600">
                  {t("dashboard.help.description")}
                </p>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <div
            className={cn(
              "px-3 pb-4",
              collapsed ? "border-t border-slate-200 pt-3" : "",
            )}
          >
            <Button
              variant="ghost"
              onClick={() => setShowLogoutDialog(true)}
              className={cn(
                "w-full justify-start text-slate-600 hover:bg-red-50 hover:text-red-600",
                collapsed && "justify-center px-0",
              )}
              title={collapsed ? t("sidebar.logout") : undefined}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {!collapsed && (
                <span className="ms-3">{t("sidebar.logout")}</span>
              )}
            </Button>
          </div>
        </div>

        {/* Logout Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showLogoutDialog}
          onClose={() => setShowLogoutDialog(false)}
          onConfirm={handleLogout}
          title={t("logout_dialog.title")}
          description={t("logout_dialog.description")}
          confirmText={t("logout_dialog.confirm")}
        />
      </>
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if collapsed state changes
    // Ignore className changes to prevent unnecessary re-renders
    return prevProps.collapsed === nextProps.collapsed;
  },
);
