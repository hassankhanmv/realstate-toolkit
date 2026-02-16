import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { sidebarMenuItems } from "@/config/menuConfig";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

interface MobileBottomNavProps {
  isMenuOpen: boolean;
  onMenuOpen: () => void;
  className?: string;
}

/**
 * MobileBottomNav - Mobile-only bottom navigation bar
 *
 * Features:
 * - Arrow icon (toggles drawer, rotates on open)
 * - Selected menu label
 * - User avatar
 * - Language switcher
 * - RTL support
 */
export const MobileBottomNav = memo(function MobileBottomNav({
  isMenuOpen,
  onMenuOpen,
  className,
}: MobileBottomNavProps) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const user = useSelector((state: RootState) => state.auth.user);

  // Find current menu item
  const currentMenuItem = useMemo(() => {
    return (
      sidebarMenuItems.find((item) =>
        item.href === "/dashboard"
          ? pathname === "/dashboard"
          : pathname.startsWith(item.href),
      ) || sidebarMenuItems[0]
    );
  }, [pathname]);

  // User initials
  const userInitials = useMemo(() => {
    return user?.user_metadata?.full_name
      ? user.user_metadata.full_name.substring(0, 2).toUpperCase()
      : "U";
  }, [user?.user_metadata?.full_name]);

  const ArrowIcon = isMenuOpen ? ChevronDown : ChevronUp;

  return (
    <nav
      className={cn(
        "fixed bottom-0 start-0 end-0 z-40",
        "bg-white/95 backdrop-blur-lg border-t border-slate-200",
        "shadow-lg",
        className,
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 gap-3">
        {/* Left Section: Arrow + Menu Label */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Arrow Button - Elevated */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuOpen}
              className={cn(
                "absolute -top-8 w-10 h-10 rounded-full",
                "bg-accent hover:bg-accent/90 text-white shadow-md",
                "transition-transform duration-200",
                isMenuOpen && "rotate-180",
              )}
            >
              <ArrowIcon className="h-5 w-5" />
            </Button>
          </div>

          {/* Menu Label - Spaced from arrow */}
          <span className="text-sm font-medium text-slate-900 truncate ms-12">
            {t(currentMenuItem.label)}
          </span>
        </div>

        {/* Right Section: Language Switcher + Avatar */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <LanguageSwitcher />

          <Avatar className="h-8 w-8 cursor-pointer">
            <AvatarFallback className="bg-accent text-primary-foreground font-medium text-xs">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </nav>
  );
});
