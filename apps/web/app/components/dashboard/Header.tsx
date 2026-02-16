import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { memo, useCallback, useMemo, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { LogoutConfirmDialog } from "@/components/common/LogoutConfirmDialog";
import { signOutUser } from "@repo/supabase";
import { resetAuth } from "@/store/slices/authSlice";
import type { RootState } from "@/store/store";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { getSupabaseBrowser } from "@/lib/supabase.client";
import { userMenuItems } from "@/config/menuConfig";
import { cn } from "@/lib/utils";

/**
 * Header Component - Optimized top navigation
 *
 * Memoized to prevent unnecessary re-renders.
 * Uses useCallback and useMemo for derived values.
 */
export const Header = memo(
  function Header({ className }: { className?: string }) {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.auth.user);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);

    // Memoize logout handler
    const handleLogout = useCallback(async () => {
      const supabase = getSupabaseBrowser();
      if (!supabase) return;
      await signOutUser(supabase);
      dispatch(resetAuth());
      window.location.href = "/login";
    }, [dispatch]);

    // Memoize user initials (only recompute when user name changes)
    const userInitials = useMemo(() => {
      return user?.user_metadata?.full_name
        ? user.user_metadata.full_name.substring(0, 2).toUpperCase()
        : "U";
    }, [user?.user_metadata?.full_name]);

    return (
      <>
        <header
          className={cn(
            "sticky top-0 z-30 flex h-20 items-center gap-4 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-8 shadow-sm",
            className,
          )}
        >
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden hover:bg-slate-100"
              >
                <Menu className="h-5 w-5 text-slate-700" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="p-0 bg-white border-r border-slate-200"
            >
              <Sidebar />
            </SheetContent>
          </Sheet>

          <div className="w-full flex-1">
            {/* Breadcrumbs or Title could go here */}
          </div>

          <div className="flex items-center gap-3">
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
        </header>

        {/* Logout Confirmation Dialog */}
        <LogoutConfirmDialog
          open={showLogoutDialog}
          onOpenChange={setShowLogoutDialog}
          onConfirm={handleLogout}
        />
      </>
    );
  },
  () => {
    // Never re-render Header unless forced
    // User data is memoized internally
    return true;
  },
);
