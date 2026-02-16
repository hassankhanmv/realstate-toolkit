import { memo } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { sidebarMenuItems } from "@/config/menuConfig";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface MobileNavDrawerProps {
  open: boolean;
  onClose: () => void;
  currentPath: string;
}

/**
 * MobileNavDrawer - Bottom sheet navigation menu for mobile
 *
 * Features:
 * - Slides up from bottom
 * - Menu items from sidebarMenuItems
 * - Active state highlighting
 * - Closes on item selection
 * - RTL support
 */
export const MobileNavDrawer = memo(function MobileNavDrawer({
  open,
  onClose,
  currentPath,
}: MobileNavDrawerProps) {
  const { t } = useTranslation();

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="bottom"
        className={cn(
          "bg-white rounded-t-2xl border-t border-slate-200",
          "max-h-[80vh] overflow-y-auto",
        )}
      >
        <SheetHeader className="pb-4">
          <SheetTitle className="text-lg font-semibold text-slate-900">
            {t("mobile.navigation")}
          </SheetTitle>
        </SheetHeader>

        <nav className="space-y-1">
          {sidebarMenuItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? currentPath === "/dashboard"
                : currentPath.startsWith(item.href);

            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg",
                  "min-h-[48px] text-base font-medium",
                  "transition-all duration-200 relative",
                  isActive
                    ? "bg-accent/10 text-accent border-s-2 border-accent"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 flex-shrink-0",
                    isActive && "text-accent",
                  )}
                />
                <span>{t(item.label)}</span>
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
});
