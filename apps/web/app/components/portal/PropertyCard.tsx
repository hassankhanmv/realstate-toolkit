import { useMemo, useCallback } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { MapPin, BedDouble, Bath, Maximize, Building2 } from "lucide-react";
import type { Property } from "@repo/supabase";
import { FavoriteButton } from "./FavoriteButton";

const FALLBACK_IMAGE =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI0Y1RjBFQiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjQjBBODlBIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+";

interface PropertyCardProps {
  property: Property;
  isFavorited?: boolean;
  userId?: string | null;
  onFavoriteToggle?: (propertyId: string, isFavorited: boolean) => void;
}

const statusLabels: Record<string, { bg: string; text: string }> = {
  "For Sale": { bg: "bg-[#302B25]", text: "text-white" },
  "For Rent": { bg: "bg-[#C4903D]", text: "text-white" },
  "Off-Plan": { bg: "bg-amber-800/90", text: "text-white" },
  Ready: { bg: "bg-emerald-800/90", text: "text-white" },
};

export function PropertyCard({
  property,
  isFavorited = false,
  userId,
  onFavoriteToggle,
}: PropertyCardProps) {
  const { t } = useTranslation();

  const formattedPrice = useMemo(() => {
    if (property.price >= 1_000_000) {
      return `${(property.price / 1_000_000).toFixed(1)}M`;
    }
    return property.price.toLocaleString();
  }, [property.price]);

  const thumbnail = useMemo(() => {
    const img = property.images?.[0];
    return img && img.length > 0 ? img : FALLBACK_IMAGE;
  }, [property.images]);

  const hasImage = useMemo(() => {
    return Boolean(property.images?.[0]?.length);
  }, [property.images]);

  const handleFavoriteToggle = useCallback(
    (newState: boolean) => {
      onFavoriteToggle?.(property.id, newState);
    },
    [property.id, onFavoriteToggle],
  );

  const statusStyle = statusLabels[property.status] ?? {
    bg: "bg-neutral-700/90",
    text: "text-white",
  };

  return (
    <div className="portal-card group">
      {/* Image */}
      <Link to={`/portal/property/${property.id}`} className="block">
        <div className="portal-image-container aspect-[16/10] relative">
          {hasImage ? (
            <img
              src={thumbnail}
              alt={property.title}
              loading="lazy"
              decoding="async"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full portal-img-fallback">
              <Building2 className="h-10 w-10 text-[#B0A89A]" />
            </div>
          )}

          {/* Status label */}
          <span
            className={`absolute top-3 start-3 text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded ${statusStyle.bg} ${statusStyle.text}`}
          >
            {t(
              `portal.status.${property.status.toLowerCase().replace(/\s+/g, "_")}`,
              property.status,
            )}
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 space-y-2.5">
        {/* Price row */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-lg font-bold tracking-tight text-foreground">
              {t("portal.card.currency", "AED")} {formattedPrice}
            </p>
            {property.status === "For Rent" && (
              <p className="text-[11px] text-muted-foreground -mt-0.5">
                {t("portal.card.per_year", "/ year")}
              </p>
            )}
          </div>
          <FavoriteButton
            propertyId={property.id}
            isFavorited={isFavorited}
            userId={userId}
            onToggle={handleFavoriteToggle}
          />
        </div>

        {/* Title */}
        <Link to={`/portal/property/${property.id}`}>
          <h3 className="text-[15px] font-semibold text-foreground line-clamp-1 group-hover:text-[#C4903D] transition-colors">
            {property.title}
          </h3>
        </Link>

        {/* Location */}
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-[#C4903D] shrink-0" />
          <span className="text-[13px] text-muted-foreground truncate">
            {property.location}
          </span>
        </div>

        {/* Divider + Stats */}
        <div className="flex items-center gap-4 pt-3 border-t border-border/60">
          {property.bedrooms > 0 && (
            <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
              <BedDouble className="h-3.5 w-3.5" />
              <span>
                {property.bedrooms} {t("portal.card.beds", "Beds")}
              </span>
            </div>
          )}
          {property.bathrooms > 0 && (
            <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
              <Bath className="h-3.5 w-3.5" />
              <span>
                {property.bathrooms} {t("portal.card.baths", "Baths")}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <Maximize className="h-3.5 w-3.5" />
            <span>
              {property.area.toLocaleString()} {t("portal.card.sqft", "sqft")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
