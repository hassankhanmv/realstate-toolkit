import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, type LucideIcon } from "lucide-react";
import { memo, useMemo } from "react";

export interface TileProps {
  title?: string;
  value?: string | number;
  icon?: LucideIcon;
  trend?: {
    value: number | string;
    direction: "up" | "down";
  };
  className?: string;
}

/**
 * Tile Component - Optimized stats card
 *
 * Memoized to prevent unnecessary re-renders.
 * Only updates when props actually change.
 */
export const Tile = memo(
  function Tile({ title, value, icon: Icon, trend, className }: TileProps) {
    // Memoize trend color class
    const trendColorClass = useMemo(() => {
      return trend?.direction === "up" ? "text-emerald-600" : "text-red-600";
    }, [trend?.direction]);

    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-lg bg-white border border-slate-200 p-5",
          "shadow-sm hover:shadow-md transition-all duration-300",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4">
          {/* Left side: Icon and Title */}
          <div className="flex-1 min-w-0">
            {Icon && (
              <div className="mb-2">
                <Icon className="h-5 w-5 text-slate-500" />
              </div>
            )}
            {title && (
              <p className="text-sm font-medium text-slate-600 mb-3">{title}</p>
            )}
          </div>

          {/* Right side: Value and Trend */}
          {value && (
            <div className="flex flex-col items-end gap-1">
              <div className="text-2xl font-bold text-slate-900 tabular-nums">
                {value}
              </div>
              {trend && (
                <div
                  className={cn(
                    "flex items-center gap-1 text-xs font-medium",
                    trendColorClass,
                  )}
                >
                  {trend.direction === "up" ? (
                    <ArrowUp className="h-3 w-3" />
                  ) : (
                    <ArrowDown className="h-3 w-3" />
                  )}
                  <span>{trend.value}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison - only re-render if values change
    return (
      prevProps.title === nextProps.title &&
      prevProps.value === nextProps.value &&
      prevProps.icon === nextProps.icon &&
      prevProps.trend?.value === nextProps.trend?.value &&
      prevProps.trend?.direction === nextProps.trend?.direction &&
      prevProps.className === nextProps.className
    );
  },
);
