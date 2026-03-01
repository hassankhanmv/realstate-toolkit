import { data } from "react-router";
import type { Route } from "./+types/favorites";
import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { setUser } from "~/store/slices/authSlice";
import { requireBuyerAuth } from "@/lib/auth.server";
import { getUserFavorites } from "@repo/supabase";
import { PortalLayout } from "@/components/layouts/PortalLayout";
import { PropertyCard } from "@/components/portal/PropertyCard";
import { Heart, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";

export const meta: Route.MetaFunction = () => [
  { title: "Saved Properties | Real Estate Portal" },
  { name: "description", content: "View your saved properties." },
];

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { user, supabase, headers, isPreview } =
    await requireBuyerAuth(request);

  const favorites = await getUserFavorites(supabase, user.id);

  return data({ user, favorites, isPreview }, { headers });
};

export default function Favorites({ loaderData }: Route.ComponentProps) {
  const { user, favorites, isPreview } = loaderData;
  const { t } = useTranslation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) dispatch(setUser(user));
  }, [user, dispatch]);

  const [localFavorites, setLocalFavorites] = useState(favorites);

  const handleFavoriteToggle = useCallback(
    (propertyId: string, isFavorited: boolean) => {
      if (!isFavorited) {
        // Remove from local list
        setLocalFavorites((prev: any[]) =>
          prev.filter((p: any) => p.id !== propertyId),
        );
      }
    },
    [],
  );

  return (
    <PortalLayout user={user} isPreview={isPreview}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="portal-heading portal-heading-xl flex items-center gap-2">
            <Heart className="h-6 w-6 text-red-500 fill-current" />
            {t("portal.favorites.title", "Saved Properties")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("portal.favorites.subtitle", {
              count: localFavorites.length,
              defaultValue: `${localFavorites.length} saved properties`,
            })}
          </p>
        </div>

        {/* Grid */}
        {localFavorites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {localFavorites.map((property: any, idx: number) => (
              <div
                key={property.id}
                className="portal-animate-in"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <PropertyCard
                  property={property}
                  isFavorited={true}
                  userId={user?.id}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              </div>
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="text-center py-20">
            <Heart className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {t("portal.favorites.empty_title", "No saved properties yet")}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
              {t(
                "portal.favorites.empty_desc",
                "Start browsing and tap the heart icon to save properties you love.",
              )}
            </p>
            <Button asChild>
              <Link to="/portal/search">
                <Search className="h-4 w-4 me-2" />
                {t("portal.favorites.browse_btn", "Browse Properties")}
              </Link>
            </Button>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
