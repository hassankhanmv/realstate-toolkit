import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { SlidersHorizontal, RotateCcw, Check } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const PROPERTY_TYPES = [
  "Apartment",
  "Villa",
  "Townhouse",
  "Office",
  "Plot",
  "Commercial",
] as const;

const STATUSES = ["For Sale", "For Rent", "Off-Plan", "Ready"] as const;

const BEDROOMS = [
  { value: 0, label: "Studio" },
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
  { value: 5, label: "5+" },
];

const LOCATIONS = [
  "Dubai Marina",
  "Downtown Dubai",
  "Palm Jumeirah",
  "Jumeirah Village Circle",
  "Business Bay",
  "Dubai Hills Estate",
  "Arabian Ranches",
  "DIFC",
];

export interface FilterState {
  priceMin: number;
  priceMax: number;
  bedrooms: number | undefined;
  types: string[];
  statuses: string[];
  location: string;
}

const DEFAULT_FILTERS: FilterState = {
  priceMin: 0,
  priceMax: 20_000_000,
  bedrooms: undefined,
  types: [],
  statuses: [],
  location: "",
};

interface FilterPanelProps {
  filters: FilterState;
  onApply: (filters: FilterState) => void;
  activeFilterCount?: number;
}

export function FilterPanel({
  filters,
  onApply,
  activeFilterCount = 0,
}: FilterPanelProps) {
  const { t } = useTranslation();
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);
  const [open, setOpen] = useState(false);

  const handleApply = useCallback(() => {
    onApply(localFilters);
    setOpen(false);
  }, [localFilters, onApply]);

  const handleClear = useCallback(() => {
    setLocalFilters(DEFAULT_FILTERS);
    onApply(DEFAULT_FILTERS);
    setOpen(false);
  }, [onApply]);

  const toggleType = useCallback((type: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter((t) => t !== type)
        : [...prev.types, type],
    }));
  }, []);

  const toggleStatus = useCallback((status: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter((s) => s !== status)
        : [...prev.statuses, status],
    }));
  }, []);

  const formatPrice = useCallback((val: number) => {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K`;
    return val.toString();
  }, []);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="flex items-center gap-2 h-10 px-3.5 text-[13px] font-medium border border-border/60 rounded-lg cursor-pointer bg-white hover:bg-secondary/50 transition-colors">
          <SlidersHorizontal className="h-4 w-4" />
          {t("portal.filters.title", "Filters")}
          {activeFilterCount > 0 && (
            <span className="h-5 min-w-5 px-1 flex items-center justify-center text-[10px] font-bold bg-[#C4903D] text-white rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[340px] sm:w-[380px] overflow-y-auto bg-white border-l border-border/40 p-0 [&>button]:hidden"
      >
        {/* Header */}
        <SheetHeader className="px-5 pt-5 pb-4 border-b border-border/30">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-[16px] font-bold text-foreground tracking-tight">
              {t("portal.filters.title", "Filters")}
            </SheetTitle>
            {activeFilterCount > 0 && (
              <button
                onClick={handleClear}
                className="text-[12px] text-[#C4903D] hover:text-[#a37730] font-medium cursor-pointer transition-colors"
              >
                {t("portal.filters.clear_all", "Clear All")}
              </button>
            )}
          </div>
        </SheetHeader>

        <div className="px-5 py-5 space-y-7">
          {/* Price Range */}
          <div className="space-y-3">
            <Label className="text-[13px] font-semibold text-foreground">
              {t("portal.filters.price_range", "Price Range")}
            </Label>
            <Slider
              min={0}
              max={20_000_000}
              step={100_000}
              value={[localFilters.priceMin, localFilters.priceMax]}
              onValueChange={([min, max]) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  priceMin: min,
                  priceMax: max,
                }))
              }
              className="cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span className="bg-secondary/80 px-2 py-0.5 rounded font-medium">
                AED {formatPrice(localFilters.priceMin)}
              </span>
              <span className="bg-secondary/80 px-2 py-0.5 rounded font-medium">
                AED {formatPrice(localFilters.priceMax)}
              </span>
            </div>
          </div>

          {/* Bedrooms */}
          <div className="space-y-3">
            <Label className="text-[13px] font-semibold text-foreground">
              {t("portal.filters.bedrooms", "Bedrooms")}
            </Label>
            <div className="flex flex-wrap gap-2">
              {BEDROOMS.map((bed) => (
                <button
                  key={bed.value}
                  onClick={() =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      bedrooms:
                        prev.bedrooms === bed.value ? undefined : bed.value,
                    }))
                  }
                  className={`px-3.5 py-2 text-[13px] font-medium rounded-lg border cursor-pointer transition-all duration-150 ${
                    localFilters.bedrooms === bed.value
                      ? "bg-[#302B25] text-white border-[#302B25]"
                      : "bg-white text-foreground border-border/60 hover:border-[#C4903D]/50"
                  }`}
                >
                  {t(
                    `portal.filters.bedroom_options.${bed.label.toLowerCase().replace(/\+/, "_plus")}`,
                    bed.label,
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Property Type */}
          <div className="space-y-3">
            <Label className="text-[13px] font-semibold text-foreground">
              {t("portal.filters.property_type", "Property Type")}
            </Label>
            <div className="space-y-1">
              {PROPERTY_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-150 ${
                    localFilters.types.includes(type)
                      ? "bg-secondary text-foreground"
                      : "bg-white text-muted-foreground hover:bg-secondary/40"
                  }`}
                >
                  <div
                    className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-all duration-150 ${
                      localFilters.types.includes(type)
                        ? "bg-[#302B25] border-[#302B25]"
                        : "border-border/80 bg-white"
                    }`}
                  >
                    {localFilters.types.includes(type) && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>
                  {t(`portal.property_types.${type.toLowerCase()}`, type)}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-3">
            <Label className="text-[13px] font-semibold text-foreground">
              {t("portal.filters.status", "Status")}
            </Label>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((status) => (
                <button
                  key={status}
                  onClick={() => toggleStatus(status)}
                  className={`px-3.5 py-2 text-[13px] font-medium rounded-lg border cursor-pointer transition-all duration-150 ${
                    localFilters.statuses.includes(status)
                      ? "bg-[#302B25] text-white border-[#302B25]"
                      : "bg-white text-foreground border-border/60 hover:border-[#C4903D]/50"
                  }`}
                >
                  {t(
                    `portal.status.${status.toLowerCase().replace(/\s+/g, "_")}`,
                    status,
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="space-y-3">
            <Label className="text-[13px] font-semibold text-foreground">
              {t("portal.filters.location", "Location")}
            </Label>
            <select
              value={localFilters.location}
              onChange={(e) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  location: e.target.value,
                }))
              }
              className="w-full h-10 px-3 text-[13px] border border-border/60 rounded-lg bg-white cursor-pointer focus:outline-none focus:border-[#C4903D] transition-colors"
            >
              <option value="">
                {t("portal.filters.all_locations", "All Locations")}
              </option>
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {t(
                    `portal.locations.${loc.toLowerCase().replace(/\s+/g, "_")}`,
                    loc,
                  )}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sticky buttons */}
        <div className="sticky bottom-0 bg-white border-t border-border/30 px-5 py-4 flex gap-3">
          <button
            onClick={handleApply}
            className="flex-1 h-11 font-semibold text-[14px] bg-[#302B25] hover:bg-[#3d352c] text-white cursor-pointer transition-colors rounded-lg"
          >
            {t("portal.filters.apply", "Apply Filters")}
          </button>
          <button
            onClick={handleClear}
            className="shrink-0 h-11 px-4 cursor-pointer hover:bg-secondary/80 transition-colors rounded-lg border border-border/60 flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {t("portal.filters.clear", "Clear")}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export { DEFAULT_FILTERS };
