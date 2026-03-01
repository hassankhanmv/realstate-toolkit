import { MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";

interface LocationMapProps {
  location: string;
  className?: string;
}

export function LocationMap({ location, className = "" }: LocationMapProps) {
  const { t } = useTranslation();

  // Encode location for Google Maps embed URL
  const encodedLocation = encodeURIComponent(`${location}, UAE`);

  // Google Maps embed (free, no API key needed for basic embed)
  const mapUrl = `https://www.google.com/maps?q=${encodedLocation}&output=embed`;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2 text-[14px] text-muted-foreground">
        <MapPin className="h-4 w-4 text-[#C4903D]" />
        <span>{location}</span>
      </div>
      <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden border border-border/60 bg-secondary/30">
        <iframe
          src={mapUrl}
          title={`Map of ${location}`}
          className="absolute inset-0 w-full h-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          style={{ border: 0 }}
        />
      </div>
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${encodedLocation}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#C4903D] hover:underline"
      >
        {t("portal.detail.open_maps", "Open in Google Maps")} →
      </a>
    </div>
  );
}
