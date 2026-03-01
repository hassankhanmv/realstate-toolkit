import { useMemo, useCallback, useState, useRef, useEffect } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import useEmblaCarousel from "embla-carousel-react";
import {
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  Building2,
  ChevronLeft,
  ChevronRight,
  Waves,
  Dumbbell,
  Car,
  Wifi,
  Shield,
  TreePine,
  MessageSquare,
} from "lucide-react";
import type { Property } from "@repo/supabase";
import { FavoriteButton } from "./FavoriteButton";

const FALLBACK_IMAGE =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI0Y1RjBFQiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjQjBBODlBIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+";

// Map amenity strings to icons
const AMENITY_ICONS: Record<string, typeof Waves> = {
  pool: Waves,
  swimming: Waves,
  gym: Dumbbell,
  fitness: Dumbbell,
  parking: Car,
  wifi: Wifi,
  security: Shield,
  garden: TreePine,
  park: TreePine,
};

function getAmenityIcon(amenity: string) {
  const lower = amenity.toLowerCase();
  for (const [key, Icon] of Object.entries(AMENITY_ICONS)) {
    if (lower.includes(key)) return Icon;
  }
  return null;
}

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
  const [isHovering, setIsHovering] = useState(false);

  const formattedPrice = useMemo(() => {
    if (property.price >= 1_000_000) {
      return `AED ${(property.price / 1_000_000).toFixed(1)}M`;
    }
    return `AED ${property.price.toLocaleString()}`;
  }, [property.price]);

  const images = useMemo(() => {
    const imgs = property.images?.filter((img) => img && img.length > 0) ?? [];
    return imgs.length > 0 ? imgs : [FALLBACK_IMAGE];
  }, [property.images]);

  const hasRealImages = useMemo(
    () => Boolean(property.images?.some((img) => img && img.length > 0)),
    [property.images],
  );

  // Top 3 amenities with icons
  const topAmenities = useMemo(() => {
    if (!property.amenities?.length) return [];
    return property.amenities.slice(0, 3).map((a) => ({
      name: a,
      Icon: getAmenityIcon(a),
    }));
  }, [property.amenities]);

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

  // Mini carousel for hover
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    active: images.length > 1,
  });
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setActiveSlide(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  return (
    <div
      className="portal-card group"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Image section with mini carousel */}
      <div className="portal-card-carousel aspect-[16/10] relative">
        {hasRealImages && images.length > 1 ? (
          <div ref={emblaRef} className="overflow-hidden h-full">
            <div className="flex h-full">
              {images.slice(0, 5).map((src, idx) => (
                <div key={idx} className="flex-[0_0_100%] min-w-0">
                  <Link
                    to={`/portal/property/${property.id}`}
                    className="block h-full"
                  >
                    <img
                      src={src}
                      alt={`${property.title} ${idx + 1}`}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <Link to={`/portal/property/${property.id}`} className="block h-full">
            {hasRealImages ? (
              <img
                src={images[0]}
                alt={property.title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full portal-img-fallback">
                <Building2 className="h-10 w-10 text-[#B0A89A]" />
              </div>
            )}
          </Link>
        )}

        {/* Carousel navigation (visible on hover) */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.preventDefault();
                emblaApi?.scrollPrev();
              }}
              className="carousel-nav absolute start-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-sm transition-all"
            >
              <ChevronLeft className="h-3.5 w-3.5 text-foreground" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                emblaApi?.scrollNext();
              }}
              className="carousel-nav absolute end-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-sm transition-all"
            >
              <ChevronRight className="h-3.5 w-3.5 text-foreground" />
            </button>
            {/* Dots */}
            <div className="carousel-dots absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1">
              {images.slice(0, 5).map((_, idx) => (
                <span
                  key={idx}
                  className={`block h-1.5 rounded-full transition-all ${
                    idx === activeSlide ? "w-4 bg-white" : "w-1.5 bg-white/60"
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Image count badge */}
        {images.length > 1 && (
          <span className="absolute top-3 end-3 bg-black/50 text-white text-[10px] font-medium px-2 py-0.5 rounded-md">
            {images.length} 📷
          </span>
        )}

        {/* Status badge */}
        <span
          className={`absolute top-3 start-3 text-[10px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-md ${statusStyle.bg} ${statusStyle.text}`}
        >
          {String(
            t(
              `portal.status.${property.status.toLowerCase().replace(/\s+/g, "_")}`,
              property.status,
            ),
          )}
        </span>

        {/* Gradient overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        {/* Price row */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[17px] font-bold tracking-tight text-foreground">
              {formattedPrice}
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
          <h3 className="text-[14px] font-semibold text-foreground line-clamp-1 group-hover:text-[#C4903D] transition-colors">
            {property.title}
          </h3>
        </Link>

        {/* Location */}
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3 w-3 text-[#C4903D] shrink-0" />
          <span className="text-[12px] text-muted-foreground truncate">
            {property.location}
          </span>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 pt-2 border-t border-border/50">
          {property.bedrooms > 0 && (
            <div className="flex items-center gap-1 text-[12px] text-muted-foreground">
              <BedDouble className="h-3.5 w-3.5" />
              <span>{property.bedrooms}</span>
            </div>
          )}
          {property.bathrooms > 0 && (
            <div className="flex items-center gap-1 text-[12px] text-muted-foreground">
              <Bath className="h-3.5 w-3.5" />
              <span>{property.bathrooms}</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-[12px] text-muted-foreground">
            <Maximize className="h-3.5 w-3.5" />
            <span>{property.area.toLocaleString()} sqft</span>
          </div>
        </div>

        {/* Amenity chips */}
        {topAmenities.length > 0 && (
          <div className="flex items-center gap-1.5 pt-1">
            {topAmenities.map(({ name, Icon }) => (
              <span
                key={name}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-muted-foreground bg-secondary/60 rounded-full"
              >
                {Icon && <Icon className="h-2.5 w-2.5" />}
                {name}
              </span>
            ))}
          </div>
        )}

        {/* Bottom row: Inquire */}
        <div className="pt-2">
          <Link
            to={`/portal/property/${property.id}#inquire`}
            className="flex items-center justify-center gap-1.5 w-full py-2 text-[12px] font-semibold text-[#302B25] bg-secondary/50 hover:bg-[#302B25] hover:text-white rounded-md transition-all duration-200"
          >
            <MessageSquare className="h-3 w-3" />
            {t("portal.card.inquire", "Inquire Now")}
          </Link>
        </div>
      </div>
    </div>
  );
}
