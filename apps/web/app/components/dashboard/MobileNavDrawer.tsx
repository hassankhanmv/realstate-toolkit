import { memo } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { sidebarMenuItems } from "@/config/menuConfig";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

interface MobileNavDrawerProps {
  open: boolean;
  onClose: () => void;
  currentPath: string;
}

export const MobileNavDrawer = memo(function MobileNavDrawer({
  open,
  onClose,
  currentPath,
}: MobileNavDrawerProps) {
  const { t } = useTranslation();

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="bg-background border-t border-border focus:outline-none">
        <DrawerHeader className="pb-4 pt-4 text-start px-6">
          <DrawerTitle className="text-lg font-bold tracking-tight text-foreground">
            {t("mobile.navigation")}
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-8 pt-0 overflow-y-auto max-h-[60vh] space-y-1.5 scrollbar-none">
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
                  "flex items-center gap-4 px-4 py-3.5 rounded-xl",
                  "text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-accent/15 text-accent font-semibold shadow-sm"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-colors",
                    isActive ? "text-accent" : "text-muted-foreground",
                  )}
                />
                <span className="tracking-wide">{t(item.label)}</span>
              </Link>
            );
          })}
        </div>
      </DrawerContent>
    </Drawer>
  );
});
