import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export interface ContextMenuOption {
  id: number;
  title: string;
  permission?: () => boolean;
  disabled?: boolean;
  icon?: ReactNode;
  onClick?: () => void;
  destructive?: boolean;
  separator?: boolean;
}

interface ContextMenuProps {
  options: ContextMenuOption[];
  triggerIcon?: ReactNode;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
}

export function ContextMenu({
  options,
  triggerIcon,
  align = "end",
  side = "bottom",
}: ContextMenuProps) {
  const { t } = useTranslation();

  const visibleOptions = options
    .filter((opt) => (opt.permission ? opt.permission() : true))
    .sort((a, b) => a.id - b.id);

  if (visibleOptions.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground focus-visible:ring-1 focus-visible:ring-accent"
        >
          <span className="sr-only">Open menu</span>
          {triggerIcon || <MoreVertical className="h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      {/* Shrunk width, removed harsh borders, added soft shadow */}
      <DropdownMenuContent
        align={align}
        side={side}
        className="w-36 min-w-[9rem] border border-gray-400 dark:border-gray-400 p-1"
      >
        {visibleOptions.map((opt, index) => (
          <div key={opt.id}>
            {opt.separator && index > 0 && (
              <DropdownMenuSeparator className="my-1 bg-border/40" />
            )}
            <DropdownMenuItem
              onClick={opt.onClick}
              disabled={opt.disabled}
              className={`py-1.5 px-2 cursor-pointer transition-colors rounded-sm ${
                opt.destructive
                  ? "text-destructive focus:text-destructive focus:bg-destructive/10"
                  : "focus:bg-secondary focus:text-foreground"
              }`}
            >
              {opt.icon && (
                <span className="me-2.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                  {opt.icon}
                </span>
              )}
              <span className="text-[11px] font-medium tracking-wide truncate">
                {t(opt.title)}
              </span>
            </DropdownMenuItem>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
