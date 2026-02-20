import { memo, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router";
import { Menu } from "lucide-react"; // Swapped Chevron for standard Menu icon
import { cn } from "@/lib/utils";
import { sidebarMenuItems, userMenuItems } from "@/config/menuConfig";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { getSupabaseBrowser } from "~/lib/supabase.client";
import { signOutUser } from "@repo/supabase";
import { resetAuth } from "~/store/slices/authSlice";

interface MobileBottomNavProps {
  isMenuOpen: boolean;
  onMenuOpen: () => void;
  className?: string;
}

export const MobileBottomNav = memo(function MobileBottomNav({
  isMenuOpen,
  onMenuOpen,
  className,
}: MobileBottomNavProps) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const currentMenuItem = useMemo(() => {
    return (
      sidebarMenuItems.find((item) =>
        item.href === "/dashboard"
          ? pathname === "/dashboard"
          : pathname.startsWith(item.href),
      ) || sidebarMenuItems[0]
    );
  }, [pathname]);

  // Memoize user initials (only recompute when user name changes)
  const userInitials = useMemo(() => {
    return user?.user_metadata?.full_name
      ? user.user_metadata.full_name.substring(0, 2).toUpperCase()
      : "U";
  }, [user?.user_metadata?.full_name]);

  // Memoize logout handler
  const handleLogout = useCallback(async () => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    await signOutUser(supabase);
    dispatch(resetAuth());
    window.location.href = "/login";
  }, [dispatch]);

  return (
    <nav
      className={cn(
        "fixed bottom-0 start-0 end-0 z-40",
        // Premium glassmorphic background with a subtle top shadow
        "bg-background/85 backdrop-blur-xl border-t border-border/50",
        "shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.08)]",
        "pb-safe", // Ensures it doesn't clip under the iOS home bar
        className,
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 gap-4">
        {/* Left Section: Drawer Menu Trigger */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuOpen}
          className="shrink-0 h-10 w-10 rounded-full bg-secondary/80 text-foreground hover:bg-secondary focus-visible:ring-accent transition-colors"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open Menu</span>
        </Button>

        {/* Center Section: Page Title */}
        <div className="flex-1 min-w-0 flex justify-center">
          <span className="text-[13px] font-bold tracking-widest uppercase text-foreground truncate opacity-90">
            {currentMenuItem ? t(currentMenuItem.label) : ""}
          </span>
        </div>

        {/* Right Section: Language Switcher + Avatar */}
        <div className="flex items-center gap-3 shrink-0">
          <LanguageSwitcher />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full hover:bg-slate-100 cursor-pointer focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              >
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarFallback className="bg-accent text-primary-foreground font-medium text-xs">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-64 bg-white border-slate-200"
              align="end"
              forceMount
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-2 p-2">
                  <p className="text-sm font-semibold leading-none text-slate-900">
                    {user?.user_metadata?.full_name || "User"}
                  </p>
                  <p className="text-xs leading-none text-slate-500">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-200" />

              {userMenuItems.map((item) => {
                if (item.action === "logout") {
                  return (
                    <DropdownMenuItem
                      key="logout"
                      onClick={() => setShowLogoutDialog(true)}
                      className="cursor-pointer hover:bg-red-50 text-red-600 focus:bg-red-50 focus:text-red-600"
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      {t(item.label)}
                    </DropdownMenuItem>
                  );
                }

                return (
                  <DropdownMenuItem
                    key={item.href}
                    asChild
                    className="cursor-pointer hover:bg-slate-50"
                  >
                    <Link
                      to={item.href!}
                      className="flex items-center gap-2 py-2"
                    >
                      <item.icon className="h-4 w-4 text-slate-600" />
                      <span>{t(item.label)}</span>
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
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
    </nav>
  );
});
