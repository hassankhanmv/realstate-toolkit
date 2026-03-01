import { data } from "react-router";
import type { Route } from "./+types/property.$id";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { setUser } from "~/store/slices/authSlice";
import { optionalAuth } from "@/lib/auth.server";
import {
  getPublishedPropertyById,
  getPublishedProperties,
  getUserFavoriteIds,
} from "@repo/supabase";
import { PortalLayout } from "@/components/layouts/PortalLayout";
import { ImageCarousel } from "@/components/portal/ImageCarousel";
import { InquiryForm } from "@/components/portal/InquiryForm";
import { PropertyCard } from "@/components/portal/PropertyCard";
import { FavoriteButton } from "@/components/portal/FavoriteButton";
import { ShareButton } from "@/components/portal/ShareButton";
import { AmenityIcon } from "@/components/portal/AmenityIcon";
import { LocationMap } from "@/components/portal/LocationMap";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useEmblaCarousel from "embla-carousel-react";
import {
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  Calendar,
  ArrowLeft,
  Building2,
  Home,
  ChevronRight,
  Sofa,
  Layers,
  FileText,
  TrendingUp,
  CreditCard,
  ChevronLeft,
} from "lucide-react";
import { Link } from "react-router";

export const meta: Route.MetaFunction = ({ data: routeData }: any) => {
  const property = routeData?.property;
  return [
    {
      title: property
        ? `${property.title} | Real Estate Portal`
        : "Property Details",
    },
    {
      name: "description",
      content: property
        ? `${property.title} - AED ${property.price.toLocaleString()} in ${property.location}`
        : "View property details",
    },
  ];
};

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { user, supabase, headers } = await optionalAuth(request);
  const propertyId = params.id;

  const property = await getPublishedPropertyById(supabase, propertyId);

  if (!property) {
    throw new Response("Property not found", { status: 404 });
  }

  const similar = await getPublishedProperties(supabase, {
    type: [property.type],
    limit: 6,
  });

  const similarProperties = similar.properties
    .filter((p: any) => p.id !== propertyId)
    .slice(0, 6);

  let favoriteIds: string[] = [];
  if (user) {
    try {
      favoriteIds = await getUserFavoriteIds(supabase, user.id);
    } catch {}
  }

  return data({ user, property, similarProperties, favoriteIds }, { headers });
};

export default function PropertyDetail({ loaderData }: Route.ComponentProps) {
  const { user, property, similarProperties, favoriteIds } = loaderData;
  const { t } = useTranslation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) dispatch(setUser(user));
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

  const formattedPrice = useMemo(() => {
    const p = property.price;
    if (p >= 1_000_000) return `AED ${(p / 1_000_000).toFixed(2)}M`;
    return `AED ${p.toLocaleString()}`;
  }, [property.price]);

  const amenities = useMemo(
    () => (property.amenities ?? []).filter(Boolean),
    [property.amenities],
  );

  const statusLabel = String(
    t(
      `portal.status.${property.status.toLowerCase().replace(/\s+/g, "_")}`,
      property.status,
    ),
  );

  const isOffPlan = property.status === "Off-Plan";

  // Similar properties carousel
  const [simRef, simApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    slidesToScroll: 1,
  });

  return (
    <PortalLayout user={user}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-[12px] text-muted-foreground mb-4 portal-animate-in">
          <Link
            to="/portal"
            className="hover:text-foreground transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link
            to="/portal/search"
            className="hover:text-foreground transition-colors"
          >
            {t("portal.detail.search", "Search")}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium truncate max-w-[200px]">
            {property.title}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main content — 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image carousel */}
            <div className="portal-animate-in">
              {property.images?.length ? (
                <ImageCarousel
                  images={property.images}
                  alt={property.title}
                  aspectRatio="wide"
                  showFullscreen
                />
              ) : (
                <div className="aspect-[16/9] rounded-xl portal-img-fallback">
                  <Building2 className="h-16 w-16 text-[#B0A89A]" />
                </div>
              )}
            </div>

            {/* Header section */}
            <div
              className="space-y-4 portal-animate-in"
              style={{ animationDelay: "0.1s" }}
            >
              {/* Title + actions row */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl lg:text-[28px] font-bold text-foreground tracking-tight leading-tight">
                    {property.title}
                  </h1>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="h-4 w-4 text-[#C4903D] shrink-0" />
                    <span className="text-[14px] truncate">
                      {property.location}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <ShareButton title={property.title} />
                  <FavoriteButton
                    propertyId={property.id}
                    isFavorited={favIds.has(property.id)}
                    userId={user?.id}
                    onToggle={(newState) =>
                      handleFavoriteToggle(property.id, newState)
                    }
                    size="md"
                  />
                </div>
              </div>

              {/* Price + badges */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                  {formattedPrice}
                </span>
                {property.status === "For Rent" && (
                  <span className="text-[13px] text-muted-foreground">
                    {t("portal.card.per_year", "/ year")}
                  </span>
                )}
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-md bg-[#302B25] text-white">
                  {statusLabel}
                </span>
                <span className="text-[10px] font-medium px-2.5 py-1 rounded-md border border-border text-muted-foreground">
                  {String(
                    t(
                      `portal.property_types.${property.type.toLowerCase()}`,
                      property.type,
                    ),
                  )}
                </span>
                {property.rera_id && (
                  <span className="text-[10px] font-medium px-2.5 py-1 rounded-md bg-secondary text-muted-foreground">
                    RERA: {property.rera_id}
                  </span>
                )}
              </div>
            </div>

            {/* Key stats */}
            <div
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 portal-animate-in"
              style={{ animationDelay: "0.15s" }}
            >
              {[
                {
                  icon: BedDouble,
                  value: property.bedrooms === 0 ? "Studio" : property.bedrooms,
                  label: t("portal.detail.bedrooms", "Bedrooms"),
                },
                {
                  icon: Bath,
                  value: property.bathrooms,
                  label: t("portal.detail.bathrooms", "Bathrooms"),
                },
                {
                  icon: Maximize,
                  value: `${property.area.toLocaleString()} sqft`,
                  label: t("portal.detail.area", "Area"),
                },
                {
                  icon: property.furnished ? Sofa : Calendar,
                  value: property.furnished
                    ? t("portal.detail.yes", "Yes")
                    : property.year_built || "—",
                  label: property.furnished
                    ? t("portal.detail.furnished", "Furnished")
                    : t("portal.detail.year_built", "Year Built"),
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 sm:p-4 bg-white border border-border/50 rounded-lg"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#C4903D]/10 flex items-center justify-center shrink-0">
                    <stat.icon className="h-5 w-5 text-[#C4903D]" />
                  </div>
                  <div>
                    <p className="text-[15px] font-bold text-foreground leading-tight">
                      {stat.value}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabbed content */}
            <div
              className="portal-detail-tabs portal-animate-in"
              style={{ animationDelay: "0.2s" }}
            >
              <Tabs defaultValue="overview">
                <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none h-auto p-0 gap-0">
                  <TabsTrigger
                    value="overview"
                    className="rounded-none border-b-2 border-transparent px-4 py-3 text-[13px] font-medium data-[state=active]:shadow-none"
                  >
                    <FileText className="h-3.5 w-3.5 me-1.5" />
                    {t("portal.detail.tab_overview", "Overview")}
                  </TabsTrigger>
                  {amenities.length > 0 && (
                    <TabsTrigger
                      value="amenities"
                      className="rounded-none border-b-2 border-transparent px-4 py-3 text-[13px] font-medium data-[state=active]:shadow-none"
                    >
                      <Layers className="h-3.5 w-3.5 me-1.5" />
                      {t("portal.detail.tab_amenities", "Amenities")}
                    </TabsTrigger>
                  )}
                  <TabsTrigger
                    value="location"
                    className="rounded-none border-b-2 border-transparent px-4 py-3 text-[13px] font-medium data-[state=active]:shadow-none"
                  >
                    <MapPin className="h-3.5 w-3.5 me-1.5" />
                    {t("portal.detail.tab_location", "Location")}
                  </TabsTrigger>
                  {isOffPlan && (
                    <TabsTrigger
                      value="payment"
                      className="rounded-none border-b-2 border-transparent px-4 py-3 text-[13px] font-medium data-[state=active]:shadow-none"
                    >
                      <CreditCard className="h-3.5 w-3.5 me-1.5" />
                      {t("portal.detail.tab_payment", "Payment")}
                    </TabsTrigger>
                  )}
                </TabsList>

                {/* Overview */}
                <TabsContent value="overview" className="pt-6 space-y-6">
                  {property.description && (
                    <div>
                      <h2 className="text-[16px] font-bold text-foreground mb-3 tracking-tight">
                        {t("portal.detail.description", "Description")}
                      </h2>
                      <p className="text-[14px] text-muted-foreground leading-[1.8] whitespace-pre-line">
                        {property.description}
                      </p>
                    </div>
                  )}

                  {/* Details grid */}
                  <div>
                    <h2 className="text-[16px] font-bold text-foreground mb-3 tracking-tight">
                      {t("portal.detail.details", "Property Details")}
                    </h2>
                    <div className="grid grid-cols-2 gap-px bg-border/50 rounded-lg overflow-hidden border border-border/50">
                      {[
                        {
                          label: t("portal.detail.type", "Type"),
                          value: property.type,
                        },
                        {
                          label: t("portal.detail.status_label", "Status"),
                          value: statusLabel,
                        },
                        {
                          label: t("portal.detail.furnished", "Furnished"),
                          value: property.furnished ? "Yes" : "No",
                        },
                        {
                          label: t("portal.detail.floor", "Floor"),
                          value: property.floor ?? "—",
                        },
                        {
                          label: t("portal.detail.year_built", "Year Built"),
                          value: property.year_built ?? "—",
                        },
                        {
                          label: t("portal.detail.rera", "RERA ID"),
                          value: property.rera_id ?? "—",
                        },
                        {
                          label: t("portal.detail.roi", "ROI Estimate"),
                          value: property.roi_estimate
                            ? `${property.roi_estimate}%`
                            : "—",
                        },
                        {
                          label: t("portal.detail.handover", "Handover"),
                          value: property.handover_date ?? "—",
                        },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center px-4 py-3 bg-white text-[13px]"
                        >
                          <span className="text-muted-foreground">
                            {item.label}
                          </span>
                          <span className="font-medium text-foreground">
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Amenities */}
                {amenities.length > 0 && (
                  <TabsContent value="amenities" className="pt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {amenities.map((amenity: string, i: number) => (
                        <AmenityIcon key={i} amenity={amenity} />
                      ))}
                    </div>
                  </TabsContent>
                )}

                {/* Location */}
                <TabsContent value="location" className="pt-6">
                  <LocationMap location={property.location} />
                </TabsContent>

                {/* Payment (Off-Plan) */}
                {isOffPlan && (
                  <TabsContent value="payment" className="pt-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-5 bg-white border border-border/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-4 w-4 text-[#C4903D]" />
                          <h3 className="text-[14px] font-bold text-foreground">
                            {t("portal.detail.handover_date", "Handover Date")}
                          </h3>
                        </div>
                        <p className="text-[15px] text-foreground font-medium">
                          {property.handover_date ||
                            t("portal.detail.tba", "To Be Announced")}
                        </p>
                      </div>
                      <div className="p-5 bg-white border border-border/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <CreditCard className="h-4 w-4 text-[#C4903D]" />
                          <h3 className="text-[14px] font-bold text-foreground">
                            {t("portal.detail.payment_plan", "Payment Plan")}
                          </h3>
                        </div>
                        <p className="text-[15px] text-foreground font-medium whitespace-pre-line">
                          {property.payment_plan ||
                            t(
                              "portal.detail.contact_agent",
                              "Contact agent for details",
                            )}
                        </p>
                      </div>
                      {property.roi_estimate && (
                        <div className="p-5 bg-white border border-border/50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-[#C4903D]" />
                            <h3 className="text-[14px] font-bold text-foreground">
                              {t("portal.detail.roi_estimate", "ROI Estimate")}
                            </h3>
                          </div>
                          <p className="text-[22px] text-foreground font-bold">
                            {property.roi_estimate}%
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4" id="inquire">
              <InquiryForm
                propertyId={property.id}
                propertyTitle={property.title}
                userId={user?.id}
                userName={user?.profile?.full_name ?? undefined}
                userEmail={user?.email ?? undefined}
              />
            </div>
          </div>
        </div>

        {/* Similar Properties — horizontal carousel */}
        {similarProperties.length > 0 && (
          <section className="mt-12 pt-8 border-t border-border portal-animate-in">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="inline-block text-[11px] font-semibold tracking-[0.2em] uppercase text-[#C4903D] mb-1">
                  {t("portal.detail.recommended", "Recommended")}
                </span>
                <h2 className="text-lg font-bold text-foreground tracking-tight">
                  {t("portal.detail.similar", "Similar Properties")}
                </h2>
              </div>
              {similarProperties.length > 3 && (
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    onClick={() => simApi?.scrollPrev()}
                    className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => simApi?.scrollNext()}
                    className="h-8 w-8 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <div ref={simRef} className="overflow-hidden">
              <div className="flex gap-5">
                {similarProperties.map((p: any) => (
                  <div
                    key={p.id}
                    className="flex-[0_0_85%] sm:flex-[0_0_45%] lg:flex-[0_0_32%] min-w-0"
                  >
                    <PropertyCard
                      property={p}
                      isFavorited={favIds.has(p.id)}
                      userId={user?.id}
                      onFavoriteToggle={handleFavoriteToggle}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </PortalLayout>
  );
}
