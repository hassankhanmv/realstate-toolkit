import { cn } from "@/lib/utils";
import {
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  X,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export type BannerVariant = "info" | "warning" | "error" | "success";

interface BannerProps {
  variant: BannerVariant;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  icon?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const variantConfig: Record<
  BannerVariant,
  {
    icon: LucideIcon;
    containerClass: string;
    iconClass: string;
    titleClass: string;
    descriptionClass: string;
  }
> = {
  info: {
    icon: Info,
    containerClass:
      "bg-slate-50 border-slate-200 dark:bg-slate-900/50 dark:border-slate-700",
    iconClass: "text-slate-600 dark:text-slate-400",
    titleClass: "text-slate-900 dark:text-slate-100",
    descriptionClass: "text-slate-700 dark:text-slate-300",
  },
  warning: {
    icon: AlertTriangle,
    containerClass:
      "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800",
    iconClass: "text-amber-600 dark:text-amber-500",
    titleClass: "text-amber-900 dark:text-amber-100",
    descriptionClass: "text-amber-800 dark:text-amber-200",
  },
  error: {
    icon: AlertCircle,
    containerClass:
      "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800",
    iconClass: "text-red-600 dark:text-red-500",
    titleClass: "text-red-900 dark:text-red-100",
    descriptionClass: "text-red-800 dark:text-red-200",
  },
  success: {
    icon: CheckCircle,
    containerClass:
      "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800",
    iconClass: "text-emerald-600 dark:text-emerald-500",
    titleClass: "text-emerald-900 dark:text-emerald-100",
    descriptionClass: "text-emerald-800 dark:text-emerald-200",
  },
};

/**
 * Banner Component
 *
 * A reusable global banner/alert component that follows the theme colors.
 * Supports four variants: info, warning, error, and success.
 *
 * @example
 * ```tsx
 * <Banner
 *   variant="warning"
 *   title="Important Notice"
 *   description="Please review your settings before proceeding."
 *   actions={<Button size="sm">Review Settings</Button>}
 * />
 * ```
 */
export function Banner({
  variant,
  title,
  description,
  actions,
  icon = true,
  onDismiss,
  className,
}: BannerProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "relative flex items-start gap-4 rounded-lg border p-4",
        config.containerClass,
        className,
      )}
      role="alert"
    >
      {/* Icon */}
      {icon && (
        <div className="flex-shrink-0">
          <Icon
            className={cn("h-5 w-5", config.iconClass)}
            aria-hidden="true"
          />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <h3 className={cn("text-sm font-semibold mb-1", config.titleClass)}>
            {title}
          </h3>
        )}
        {description && (
          <p className={cn("text-sm", config.descriptionClass)}>
            {description}
          </p>
        )}
      </div>

      {/* Actions */}
      {actions && (
        <div className="flex-shrink-0 flex items-center gap-2">{actions}</div>
      )}

      {/* Dismiss Button */}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className={cn(
            "flex-shrink-0 rounded-md p-1 hover:bg-black/5 dark:hover:bg-white/10 transition-colors",
            config.iconClass,
          )}
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
