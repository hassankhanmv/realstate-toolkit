import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../store/hooks";

export function GlobalSpinner() {
  const { t } = useTranslation();
  const isLoading = useAppSelector((state) => state.ui.isLoading);

  if (!isLoading) return null;

  return (
    // z-[9999] ensures it sits above Shadcn dialogs and popovers
    // bg-background/20 makes it subtle instead of deep black
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/20 backdrop-blur-[1px] transition-all">
      {/* Floating Premium Pill */}
      <div className="flex items-center gap-3 rounded-full border border-border bg-card px-5 py-3 shadow-xl animate-in fade-in zoom-in-95 duration-200">
        {/* Using your Gold accent color for the spinner */}
        <Loader2 className="h-5 w-5 animate-spin text-accent" />
        <span className="text-sm font-medium tracking-wide text-foreground">
          {t("common.loading")}
        </span>
      </div>
    </div>
  );
}