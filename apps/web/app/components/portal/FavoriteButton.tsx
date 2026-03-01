import { useState, useCallback } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface FavoriteButtonProps {
  propertyId: string;
  isFavorited: boolean;
  userId?: string | null;
  onToggle?: (newState: boolean) => void;
  size?: "sm" | "md";
}

export function FavoriteButton({
  propertyId,
  isFavorited,
  userId,
  onToggle,
  size = "sm",
}: FavoriteButtonProps) {
  const { t } = useTranslation();
  const [optimisticFav, setOptimisticFav] = useState(isFavorited);
  const [loading, setLoading] = useState(false);

  const handleToggle = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!userId) {
        toast.info(
          t("portal.favorites.login_required", "Sign in to save properties"),
        );
        return;
      }

      const newState = !optimisticFav;
      setOptimisticFav(newState); // Optimistic update
      setLoading(true);

      try {
        const res = await fetch("/api/portal/favorites", {
          method: newState ? "POST" : "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ propertyId }),
        });

        if (!res.ok) {
          throw new Error("Failed to update favorite");
        }

        onToggle?.(newState);

        toast.success(
          newState
            ? t("portal.favorites.saved", "Property saved!")
            : t("portal.favorites.removed", "Property removed from saved"),
        );
      } catch {
        // Revert optimistic update
        setOptimisticFav(!newState);
        toast.error(
          t("portal.favorites.error", "Failed to update. Try again."),
        );
      } finally {
        setLoading(false);
      }
    },
    [optimisticFav, userId, propertyId, onToggle, t],
  );

  const iconSize = size === "md" ? "h-5 w-5" : "h-4 w-4";
  const btnSize = size === "md" ? "h-10 w-10" : "h-8 w-8";

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`${btnSize} rounded-full shrink-0 transition-colors ${
        optimisticFav
          ? "text-red-500 hover:text-red-600 hover:bg-red-50"
          : "text-muted-foreground hover:text-red-500 hover:bg-red-50"
      }`}
      onClick={handleToggle}
      disabled={loading}
      aria-label={
        optimisticFav
          ? t("portal.favorites.remove_aria", "Remove from saved")
          : t("portal.favorites.save_aria", "Save property")
      }
    >
      <Heart
        className={`${iconSize} transition-all ${
          optimisticFav ? "fill-current portal-heart-active" : ""
        }`}
      />
    </Button>
  );
}
