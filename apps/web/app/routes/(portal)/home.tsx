import { data } from "react-router";
import type { Route } from "./+types/home";
import { useEffect, useMemo, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { setUser } from "~/store/slices/authSlice";
import { optionalAuth } from "@/lib/auth.server";
import { getPublishedProperties, getUserFavoriteIds } from "@repo/supabase";
import { PortalLayout } from "@/components/layouts/PortalLayout";
import { HeroSearch } from "@/components/portal/HeroSearch";
import { PropertyCard } from "@/components/portal/PropertyCard";
import { PropertyCardSkeleton } from "@/components/portal/PropertyCardSkeleton";
import { Building2, TrendingUp, MapPin, Star, ArrowRight } from "lucide-react";
import { Link } from "react-router";

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Browse Properties | Real Estate Portal" },
    {
      name: "description",
      content:
        "Discover premium properties across the UAE. Browse apartments, villas, and more.",
    },
  ];
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { user, supabase, headers } = await optionalAuth(request);

  // Fetch featured properties (latest 6 published)
  const result = await getPublishedProperties(supabase, {
    limit: 6,
    sortBy: "date_desc",
  });

  // Get favorite IDs if logged in
  let favoriteIds: string[] = [];
  if (user) {
    try {
      favoriteIds = await getUserFavoriteIds(supabase, user.id);
    } catch {
      // Non-critical
    }
  }

  // Extract unique locations for trending chips
  const locations = result.properties
    .map((p: any) => p.location)
    .filter(Boolean);
  const uniqueLocations = [...new Set(locations as string[])].slice(0, 6);

  return data(
    {
      user,
      properties: result.properties,
      totalCount: result.total,
      favoriteIds,
      trendingLocations: uniqueLocations,
    },
    { headers },
  );
};

export default function PortalHome({ loaderData }: Route.ComponentProps) {
  const { user, properties, totalCount, favoriteIds, trendingLocations } =
    loaderData;
  const { t } = useTranslation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      dispatch(setUser(user));
    }
  }, [user, dispatch]);

  const [favIds, setFavIds] = useState<Set<string>>(new Set(favoriteIds));

  const handleFavoriteToggle = useCallback(
    (propertyId: string, isFavorited: boolean) => {
      setFavIds((prev) => {
        const next = new Set(prev);
        if (isFavorited) next.add(propertyId);
        else next.delete(propertyId);
        return next;
      });
    },
    [],
  );

  const stats = useMemo(
    () => [
      {
        icon: Building2,
        value: totalCount.toString(),
        label: t("portal.home.stats.listings", "Active Listings"),
      },
      {
        icon: MapPin,
        value: "8+",
        label: t("portal.home.stats.locations", "Prime Locations"),
      },
      {
        icon: TrendingUp,
        value: "24/7",
        label: t("portal.home.stats.support", "Agent Support"),
      },
      {
        icon: Star,
        value: "4.9",
        label: t("portal.home.stats.rating", "Client Rating"),
      },
    ],
    [t, totalCount],
  );

  return (
    <PortalLayout user={user}>
      {/* Hero Search Section */}
      <HeroSearch
        trendingLocations={trendingLocations as string[]}
        totalCount={totalCount}
      />

      {/* Stats Strip */}
      <section className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 portal-stagger">
            {stats.map((stat, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#C4903D]/10 flex items-center justify-center shrink-0">
                  <stat.icon className="h-6 w-6 text-[#C4903D]" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-[12px] text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="inline-block text-[11px] font-semibold tracking-[0.2em] uppercase text-[#C4903D] mb-1">
              {t("portal.home.featured_eyebrow", "Curated")}
            </span>
            <h2 className="text-xl font-bold text-foreground tracking-tight">
              {t("portal.home.featured_title", "Featured Properties")}
            </h2>
            <p className="text-[13px] text-muted-foreground mt-1">
              {t(
                "portal.home.featured_subtitle",
                "Handpicked premium listings for you",
              )}
            </p>
          </div>
          <Link
            to="/portal/search"
            className="hidden sm:flex items-center gap-1.5 text-[13px] font-medium text-[#C4903D] hover:underline"
          >
            {t("portal.home.view_all", "View All")}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 portal-stagger">
          {properties.map((property: any) => (
            <div key={property.id}>
              <PropertyCard
                property={property}
                isFavorited={favIds.has(property.id)}
                userId={user?.id}
                onFavoriteToggle={handleFavoriteToggle}
              />
            </div>
          ))}
        </div>

        {properties.length === 0 && (
          <div className="text-center py-16">
            <Building2 className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground">
              {t("portal.home.no_listings", "No listings yet")}
            </h3>
            <p className="text-sm text-muted-foreground/60 mt-1">
              {t(
                "portal.home.no_listings_desc",
                "Check back soon for new properties.",
              )}
            </p>
          </div>
        )}

        {/* Mobile view all link */}
        <div className="text-center mt-8 sm:hidden">
          <Link
            to="/portal/search"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#C4903D] hover:underline"
          >
            {t("portal.home.view_all", "View All")}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </PortalLayout>
  );
}
