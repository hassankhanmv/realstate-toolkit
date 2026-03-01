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
import {
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  Calendar,
  CheckCircle2,
  ArrowLeft,
  Building2,
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
    limit: 3,
  });

  const similarProperties = similar.properties
    .filter((p: any) => p.id !== propertyId)
    .slice(0, 3);

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
    if (property.price >= 1_000_000)
      return `AED ${(property.price / 1_000_000).toFixed(1)}M`;
    return `AED ${property.price.toLocaleString()}`;
  }, [property.price]);

  const amenities = useMemo(
    () => property.amenities ?? [],
    [property.amenities],
  );

  const statusLabel = String(
    t(
      `portal.status.${property.status.toLowerCase().replace(/\s+/g, "_")}`,
      property.status,
    ),
  );

  return (
    <PortalLayout user={user}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 md:pb-8">
        {/* Back link */}
        <Link
          to="/portal/search"
          className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-5 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("portal.detail.back", "Back to search")}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image carousel */}
            {property.images?.length ? (
              <ImageCarousel
                images={property.images}
                alt={property.title}
                aspectRatio="video"
                showFullscreen
              />
            ) : (
              <div className="aspect-video rounded-lg portal-img-fallback">
                <Building2 className="h-16 w-16 text-[#B0A89A]" />
              </div>
            )}

            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <h1 className="text-2xl sm:text-[28px] font-bold text-foreground tracking-tight leading-tight">
                    {property.title}
                  </h1>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="h-4 w-4 text-[#C4903D]" />
                    <span className="text-[14px]">{property.location}</span>
                  </div>
                </div>
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
                <span className="text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded bg-[#302B25] text-white">
                  {statusLabel}
                </span>
                <span className="text-[11px] font-medium px-2.5 py-1 rounded border border-border text-muted-foreground">
                  {String(
                    t(
                      `portal.property_types.${property.type.toLowerCase()}`,
                      property.type,
                    ),
                  )}
                </span>
              </div>
            </div>

            {/* Key stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  icon: BedDouble,
                  value: property.bedrooms,
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
                  icon: Calendar,
                  value: property.year_built || "—",
                  label: t("portal.detail.year_built", "Year Built"),
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-4 bg-white border border-border/60 rounded-lg"
                >
                  <stat.icon className="h-5 w-5 text-[#C4903D] shrink-0" />
                  <div>
                    <p className="text-[15px] font-semibold text-foreground">
                      {stat.value}
                    </p>
                    <p className="text-[12px] text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            {property.description && (
              <div className="space-y-3">
                <h2 className="text-lg font-bold text-foreground tracking-tight">
                  {t("portal.detail.description", "Description")}
                </h2>
                <p className="text-[14px] text-muted-foreground leading-[1.75] whitespace-pre-line">
                  {property.description}
                </p>
              </div>
            )}

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-bold text-foreground tracking-tight">
                  {t("portal.detail.amenities", "Amenities")}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {amenities.map((amenity: string, i: number) => (
                    <div
                      key={i}
                      className="flex items-center gap-2.5 text-[14px] text-muted-foreground"
                    >
                      <CheckCircle2 className="h-4 w-4 text-[#C4903D] shrink-0" />
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Details table */}
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-foreground tracking-tight">
                {t("portal.detail.details", "Details")}
              </h2>
              <div className="bg-white border border-border/60 rounded-lg overflow-hidden">
                {[
                  {
                    label: t("portal.detail.furnished", "Furnished"),
                    value: property.furnished ? "Yes" : "No",
                  },
                  {
                    label: t("portal.detail.floor", "Floor"),
                    value: property.floor ?? "—",
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
                  {
                    label: t("portal.detail.payment_plan", "Payment Plan"),
                    value: property.payment_plan ?? "—",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`flex justify-between items-center px-4 py-3 text-[14px] ${i % 2 === 0 ? "bg-secondary/30" : "bg-white"}`}
                  >
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium text-foreground">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-20">
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

        {/* Similar Properties */}
        {similarProperties.length > 0 && (
          <section className="mt-14 pt-8 border-t border-border">
            <h2 className="text-xl font-bold text-foreground tracking-tight mb-6">
              {t("portal.detail.similar", "Similar Properties")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarProperties.map((p: any) => (
                <PropertyCard
                  key={p.id}
                  property={p}
                  isFavorited={favIds.has(p.id)}
                  userId={user?.id}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </PortalLayout>
  );
}
