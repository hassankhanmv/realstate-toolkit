import {
  Waves,
  Dumbbell,
  Car,
  Wifi,
  Shield,
  TreePine,
  Wind,
  Flame,
  Tv,
  Baby,
  UtensilsCrossed,
  Shirt,
  Eye,
  Footprints,
  CheckCircle2,
} from "lucide-react";

const AMENITY_MAP: Record<string, typeof Waves> = {
  pool: Waves,
  swimming: Waves,
  gym: Dumbbell,
  fitness: Dumbbell,
  parking: Car,
  garage: Car,
  wifi: Wifi,
  internet: Wifi,
  security: Shield,
  cctv: Shield,
  garden: TreePine,
  park: TreePine,
  landscaped: TreePine,
  "air conditioning": Wind,
  "central ac": Wind,
  ac: Wind,
  heating: Flame,
  "smart home": Tv,
  tv: Tv,
  "kids area": Baby,
  playground: Baby,
  nursery: Baby,
  kitchen: UtensilsCrossed,
  "built-in kitchen": UtensilsCrossed,
  laundry: Shirt,
  "walk-in closet": Shirt,
  view: Eye,
  "sea view": Eye,
  "city view": Eye,
  balcony: Footprints,
  terrace: Footprints,
};

interface AmenityIconProps {
  amenity: string;
  className?: string;
  showLabel?: boolean;
}

export function AmenityIcon({
  amenity,
  className = "h-4 w-4",
  showLabel = true,
}: AmenityIconProps) {
  const lower = amenity.toLowerCase();
  let Icon = CheckCircle2;

  for (const [key, MappedIcon] of Object.entries(AMENITY_MAP)) {
    if (lower.includes(key)) {
      Icon = MappedIcon;
      break;
    }
  }

  return (
    <div className="flex items-center gap-2.5 text-[14px] text-muted-foreground">
      <div className="w-8 h-8 rounded-lg bg-secondary/70 flex items-center justify-center shrink-0">
        <Icon className={`${className} text-[#C4903D]`} />
      </div>
      {showLabel && <span>{amenity}</span>}
    </div>
  );
}
