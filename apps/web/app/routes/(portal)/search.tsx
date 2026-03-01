import { data, useNavigate, useNavigation, useFetcher } from "react-router";
import type { Route } from "./+types/search";
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { setUser } from "~/store/slices/authSlice";
import { optionalAuth } from "@/lib/auth.server";
import { getPublishedProperties, getUserFavoriteIds } from "@repo/supabase";
import { PortalLayout } from "@/components/layouts/PortalLayout";
import { PropertyCard } from "@/components/portal/PropertyCard";
import { PropertyCardSkeleton } from "@/components/portal/PropertyCardSkeleton";
import { FilterPanel, DEFAULT_FILTERS } from "@/components/portal/FilterPanel";
import type { FilterState } from "@/components/portal/FilterPanel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, Building2, Loader2 } from "lucide-react";

const PAGE_SIZE = 12;

export const meta: Route.MetaFunction = () => [
  { title: "Search Properties | Real Estate Portal" },
  {
    name: "description",
    content: "Search and filter premium properties across the UAE.",
  },
];

export const loader = async ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const { user, supabase, headers } = await optionalAuth(request);

  // Parse URL search params into filters
  const filters: any = {};
  const q = url.searchParams.get("q");
  if (q) filters.query = q;

  const status = url.searchParams.getAll("status");
  if (status.length) filters.status = status;

  const type = url.searchParams.getAll("type");
  if (type.length) filters.type = type;

  const bedrooms = url.searchParams.get("bedrooms");
  if (bedrooms) filters.bedrooms = Number(bedrooms);

  const priceMin = url.searchParams.get("priceMin");
  if (priceMin) filters.priceMin = Number(priceMin);

  const priceMax = url.searchParams.get("priceMax");
  if (priceMax) filters.priceMax = Number(priceMax);

  const location = url.searchParams.get("location");
  if (location) filters.location = location;

  const sortBy = url.searchParams.get("sortBy") || "date_desc";
  filters.sortBy = sortBy;

  const page = Number(url.searchParams.get("page") || "1");
  filters.page = page;
  filters.limit = PAGE_SIZE;

  const result = await getPublishedProperties(supabase, filters);

  let favoriteIds: string[] = [];
  if (user) {
    try {
      favoriteIds = await getUserFavoriteIds(supabase, user.id);
    } catch {}
  }

  return data(
    {
      user,
      properties: result.properties,
      total: result.total,
      totalPages: result.totalPages,
      favoriteIds,
      initialQuery: q || "",
      initialSort: sortBy,
      initialStatuses: status,
      initialTypes: type,
      initialBedrooms: bedrooms ? Number(bedrooms) : undefined,
      initialPriceMin: priceMin ? Number(priceMin) : 0,
      initialPriceMax: priceMax ? Number(priceMax) : 20_000_000,
      initialLocation: location || "",
    },
    { headers },
  );
};

export default function PortalSearch({ loaderData }: Route.ComponentProps) {
  const {
    user,
    properties: initialProperties,
    total,
    totalPages,
    favoriteIds,
    initialQuery,
    initialSort,
    initialStatuses,
    initialTypes,
    initialBedrooms,
    initialPriceMin,
    initialPriceMax,
    initialLocation,
  } = loaderData;
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const fetcher = useFetcher<typeof loader>();

  const isNavigating = navigation.state === "loading";

  useEffect(() => {
    if (user) dispatch(setUser(user));
  }, [user, dispatch]);

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState(initialSort);

  // Initialize filters from URL params
  const [filters, setFilters] = useState<FilterState>({
    priceMin: initialPriceMin,
    priceMax: initialPriceMax,
    bedrooms: initialBedrooms,
    types: initialTypes,
    statuses: initialStatuses,
    location: initialLocation,
  });

  const [favIds, setFavIds] = useState<Set<string>>(new Set(favoriteIds));

  // ── Infinite scroll state ──
  const [allProperties, setAllProperties] = useState<any[]>(initialProperties);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(totalPages > 1);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const isLoadingMore = fetcher.state === "loading";

  // Reset when new data comes from the loader (filter/sort/search change)
  useEffect(() => {
    setAllProperties(initialProperties);
    setCurrentPage(1);
    setHasMore(totalPages > 1);
  }, [initialProperties, totalPages]);

  // Append new data when fetcher returns
  useEffect(() => {
    if (fetcher.data && fetcher.state === "idle") {
      const newProps = (fetcher.data as any).properties ?? [];
      const fetchedTotalPages = (fetcher.data as any).totalPages ?? totalPages;

      if (newProps.length > 0) {
        setAllProperties((prev) => [...prev, ...newProps]);
        setCurrentPage((prev) => prev + 1);
      }

      if (newProps.length === 0 || currentPage + 1 >= fetchedTotalPages) {
        setHasMore(false);
      }
    }
  }, [fetcher.data, fetcher.state]);

  // Build search params string
  const buildSearchParams = useCallback(
    (page: number) => {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      if (filters.priceMin > 0)
        params.set("priceMin", filters.priceMin.toString());
      if (filters.priceMax < 20_000_000)
        params.set("priceMax", filters.priceMax.toString());
      if (filters.bedrooms !== undefined)
        params.set("bedrooms", filters.bedrooms.toString());
      if (filters.statuses.length)
        filters.statuses.forEach((s) => params.append("status", s));
      if (filters.types.length)
        filters.types.forEach((t) => params.append("type", t));
      if (filters.location) params.set("location", filters.location);
      if (sortBy !== "date_desc") params.set("sortBy", sortBy);
      params.set("page", page.toString());
      return params.toString();
    },
    [searchQuery, filters, sortBy],
  );

  // Load more via Remix fetcher
  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    const nextPage = currentPage + 1;
    fetcher.load(`/portal/search?${buildSearchParams(nextPage)}`);
  }, [currentPage, hasMore, isLoadingMore, buildSearchParams, fetcher]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      { rootMargin: "200px" },
    );

    const el = loadMoreRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [hasMore, isLoadingMore, loadMore]);

  // Build URL and navigate when filters change
  const applyFilters = useCallback(
    (newFilters?: FilterState, newSort?: string) => {
      const params = new URLSearchParams();
      const f = newFilters || filters;
      const s = newSort || sortBy;

      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      if (f.priceMin > 0) params.set("priceMin", f.priceMin.toString());
      if (f.priceMax < 20_000_000)
        params.set("priceMax", f.priceMax.toString());
      if (f.bedrooms !== undefined)
        params.set("bedrooms", f.bedrooms.toString());
      if (f.statuses.length)
        f.statuses.forEach((s) => params.append("status", s));
      if (f.types.length) f.types.forEach((t) => params.append("type", t));
      if (f.location) params.set("location", f.location);
      if (s !== "date_desc") params.set("sortBy", s);

      navigate(`/portal/search?${params.toString()}`);
    },
    [filters, sortBy, searchQuery, navigate],
  );

  const handleFilterApply = useCallback(
    (newFilters: FilterState) => {
      setFilters(newFilters);
      applyFilters(newFilters);
    },
    [applyFilters],
  );

  const handleSortChange = useCallback(
    (newSort: string) => {
      setSortBy(newSort);
      applyFilters(undefined, newSort);
    },
    [applyFilters],
  );

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      applyFilters();
    },
    [applyFilters],
  );

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

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.priceMin > 0 || filters.priceMax < 20_000_000) count++;
    if (filters.bedrooms !== undefined) count++;
    if (filters.types.length) count++;
    if (filters.statuses.length) count++;
    if (filters.location) count++;
    return count;
  }, [filters]);

  // Active filter badges for display
  const activeFilterBadges = useMemo(() => {
    const badges: { label: string; key: string }[] = [];
    if (filters.statuses.length) {
      filters.statuses.forEach((s) =>
        badges.push({ label: s, key: `status-${s}` }),
      );
    }
    if (filters.types.length) {
      filters.types.forEach((t) => badges.push({ label: t, key: `type-${t}` }));
    }
    if (filters.bedrooms !== undefined) {
      badges.push({
        label: `${filters.bedrooms === 0 ? "Studio" : filters.bedrooms + " BR"}`,
        key: "bedrooms",
      });
    }
    if (filters.location) {
      badges.push({ label: filters.location, key: "location" });
    }
    return badges;
  }, [filters]);

  return (
    <PortalLayout user={user}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 md:pb-8">
        {/* Search Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          {/* Search bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-2 flex-1 max-w-lg"
          >
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t(
                  "portal.search.placeholder",
                  "Search properties...",
                )}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-9 h-10 border-border/60 focus:border-[#C4903D] focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    const params = new URLSearchParams(window.location.search);
                    params.delete("q");
                    navigate(`/portal/search?${params.toString()}`);
                  }}
                  className="absolute end-3 top-1/2 -translate-y-1/2 cursor-pointer"
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                </button>
              )}
            </div>
            <Button
              type="submit"
              size="sm"
              className="h-10 px-4 cursor-pointer bg-[#302B25] hover:bg-[#3d352c] text-white"
            >
              {t("portal.search.btn", "Search")}
            </Button>
          </form>

          {/* Sort + Filter */}
          <div className="flex items-center gap-2">
            <FilterPanel
              filters={filters}
              onApply={handleFilterApply}
              activeFilterCount={activeFilterCount}
            />

            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-40 h-10 cursor-pointer border-border/60 focus:ring-0 focus:ring-offset-0">
                <SelectValue placeholder={t("portal.search.sort", "Sort by")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date_desc" className="cursor-pointer">
                  {t("portal.search.sort_newest", "Newest")}
                </SelectItem>
                <SelectItem value="price_asc" className="cursor-pointer">
                  {t("portal.search.sort_price_low", "Price: Low → High")}
                </SelectItem>
                <SelectItem value="price_desc" className="cursor-pointer">
                  {t("portal.search.sort_price_high", "Price: High → Low")}
                </SelectItem>
                <SelectItem value="beds_desc" className="cursor-pointer">
                  {t("portal.search.sort_beds", "Bedrooms")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active filter badges */}
        {activeFilterBadges.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {activeFilterBadges.map((badge) => (
              <Badge
                key={badge.key}
                variant="secondary"
                className="text-xs bg-[#C4903D]/10 text-[#C4903D] border border-[#C4903D]/20 px-2.5 py-1"
              >
                {badge.label}
              </Badge>
            ))}
          </div>
        )}

        {/* Result count */}
        <div className="flex items-center gap-2 mb-4 text-[13px] text-muted-foreground">
          {isNavigating ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-[#C4903D]" />
              <span className="text-[#C4903D] font-medium">
                {t("portal.search.loading", "Loading properties...")}
              </span>
            </div>
          ) : (
            <>
              <span>
                {t("portal.search.results_count", {
                  count: total,
                  defaultValue: `${total} properties found`,
                })}
              </span>
              {initialQuery && (
                <Badge variant="secondary" className="text-xs">
                  &ldquo;{initialQuery}&rdquo;
                </Badge>
              )}
            </>
          )}
        </div>

        {/* Loading skeletons (initial navigation) */}
        {isNavigating && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Property Grid */}
        {!isNavigating && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allProperties.map((property: any, idx: number) => (
              <div
                key={property.id}
                className="portal-animate-in"
                style={{ animationDelay: `${Math.min(idx, 11) * 0.05}s` }}
              >
                <PropertyCard
                  property={property}
                  isFavorited={favIds.has(property.id)}
                  userId={user?.id}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isNavigating && allProperties.length === 0 && (
          <div className="text-center py-20">
            <Building2 className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">
              {t("portal.search.no_results", "No properties found")}
            </h3>
            <p className="text-[13px] text-muted-foreground max-w-sm mx-auto">
              {t(
                "portal.search.no_results_desc",
                "Try adjusting your search or filters to find what you're looking for.",
              )}
            </p>
          </div>
        )}

        {/* Infinite scroll sentinel */}
        {!isNavigating && hasMore && (
          <div ref={loadMoreRef} className="flex justify-center py-8">
            {isLoadingMore && (
              <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-[#C4903D]" />
                <span>
                  {t("portal.search.loading_more", "Loading more...")}
                </span>
              </div>
            )}
          </div>
        )}

        {/* End of results */}
        {!isNavigating &&
          !hasMore &&
          allProperties.length > 0 &&
          allProperties.length >= PAGE_SIZE && (
            <div className="text-center py-6">
              <p className="text-[12px] text-muted-foreground/50">
                {t(
                  "portal.search.end_of_results",
                  "You've seen all properties",
                )}
              </p>
            </div>
          )}
      </div>
    </PortalLayout>
  );
}
