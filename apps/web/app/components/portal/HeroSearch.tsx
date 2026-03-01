import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import {
  Search,
  ArrowRight,
  MapPin,
  Building2,
  TrendingUp,
  Home,
  Briefcase,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Popular UAE locations for autocomplete
const UAE_LOCATIONS = [
  "Dubai Marina",
  "Downtown Dubai",
  "Palm Jumeirah",
  "JBR",
  "Business Bay",
  "Dubai Hills Estate",
  "Arabian Ranches",
  "Jumeirah Village Circle",
  "Dubai Creek Harbour",
  "Mohammed Bin Rashid City",
  "DAMAC Hills",
  "Emaar Beachfront",
  "Al Reem Island",
  "Yas Island",
  "Saadiyat Island",
  "Sharjah",
  "Ajman",
  "Ras Al Khaimah",
];

// Status tab → filter param mapping
const TABS = [
  { key: "buy", label: "Buy", param: "For Sale", icon: Home },
  { key: "rent", label: "Rent", param: "For Rent", icon: Building2 },
  { key: "off_plan", label: "Off-Plan", param: "Off-Plan", icon: TrendingUp },
  {
    key: "commercial",
    label: "Commercial",
    param: "Commercial",
    icon: Briefcase,
  },
] as const;

interface HeroSearchProps {
  trendingLocations?: string[];
  totalCount?: number;
}

export function HeroSearch({
  trendingLocations = [],
  totalCount = 0,
}: HeroSearchProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("buy");
  const [showLocations, setShowLocations] = useState(false);
  const [locationQuery, setLocationQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);

  // Close location dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowLocations(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Filter locations based on input
  const filteredLocations = useMemo(() => {
    const q = (locationQuery || query).toLowerCase();
    if (!q) return UAE_LOCATIONS.slice(0, 8);
    return UAE_LOCATIONS.filter((loc) => loc.toLowerCase().includes(q)).slice(
      0,
      6,
    );
  }, [locationQuery, query]);

  // Trending: use real data or fallback
  const trending = useMemo(() => {
    if (trendingLocations.length > 0) return trendingLocations.slice(0, 6);
    return [
      "Dubai Marina",
      "Palm Jumeirah",
      "Downtown Dubai",
      "Dubai Hills",
      "JBR",
      "Off-Plan",
    ];
  }, [trendingLocations]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setShowLocations(false);

      // TODO: Replace with OpenAI parse here
      // Future: Send query to AI endpoint to extract structured filters
      // e.g., "2BR in Dubai Marina under 2M" → { bedrooms: 2, location: "Dubai Marina", priceMax: 2000000 }

      const params = new URLSearchParams();
      const tab = TABS.find((t) => t.key === activeTab);
      if (tab && tab.key !== "commercial") {
        params.append("status", tab.param);
      }
      if (tab?.key === "commercial") {
        params.append("type", "Commercial");
      }
      if (query.trim()) {
        params.set("q", query.trim());
      }
      navigate(`/portal/search?${params.toString()}`);
    },
    [query, activeTab, navigate],
  );

  const handleLocationSelect = useCallback(
    (location: string) => {
      setShowLocations(false);
      const params = new URLSearchParams();
      const tab = TABS.find((t) => t.key === activeTab);
      if (tab && tab.key !== "commercial") {
        params.append("status", tab.param);
      }
      if (tab?.key === "commercial") {
        params.append("type", "Commercial");
      }
      params.set("location", location);
      navigate(`/portal/search?${params.toString()}`);
    },
    [activeTab, navigate],
  );

  const handleTrendingClick = useCallback(
    (chip: string) => {
      // Check if it's a status filter or location
      if (chip === "Off-Plan") {
        navigate("/portal/search?status=Off-Plan");
      } else {
        navigate(`/portal/search?location=${encodeURIComponent(chip)}`);
      }
    },
    [navigate],
  );

  return (
    <section className="portal-hero py-16 sm:py-20 lg:py-28">
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Eyebrow */}
        <span className="inline-block text-[11px] font-semibold tracking-[0.25em] uppercase text-[#C4903D] mb-4 portal-animate-in">
          {t("portal.hero.eyebrow", "UAE Premium Properties")}
        </span>

        {/* Heading */}
        <h1
          className="text-3xl sm:text-4xl lg:text-[48px] font-bold text-white leading-[1.1] tracking-tight mb-3 portal-animate-in"
          style={{ animationDelay: "0.1s" }}
        >
          {t("portal.hero.title", "Find Your Dream Property")}
        </h1>
        <p
          className="text-[15px] sm:text-base text-white/60 mb-8 max-w-lg mx-auto leading-relaxed portal-animate-in"
          style={{ animationDelay: "0.15s" }}
        >
          {t(
            "portal.hero.subtitle",
            "Smart search across the UAE. Buy, rent, or invest in premium real estate.",
          )}
        </p>

        {/* Tabs */}
        <div
          className="portal-hero-tabs mb-6 portal-animate-in"
          style={{ animationDelay: "0.2s" }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-white/5 border border-white/10 h-11 p-1 rounded-lg gap-0.5">
              {TABS.map((tab) => (
                <TabsTrigger
                  key={tab.key}
                  value={tab.key}
                  className="text-[13px] font-medium px-4 sm:px-6 h-9 rounded-md data-[state=active]:bg-white/10 data-[state=active]:text-[#C4903D] data-[state=active]:shadow-none transition-all"
                >
                  <tab.icon className="h-3.5 w-3.5 me-1.5 hidden sm:inline-block" />
                  {t(`portal.hero.tab_${tab.key}`, tab.label)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Search bar */}
        <div
          ref={searchRef}
          className="relative max-w-2xl mx-auto portal-animate-in"
          style={{ animationDelay: "0.25s" }}
        >
          <form
            onSubmit={handleSubmit}
            className="flex items-center bg-white rounded-xl shadow-2xl shadow-black/20 overflow-hidden"
          >
            <div className="relative flex-1">
              <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-muted-foreground/60" />
              <Input
                type="text"
                placeholder={t(
                  "portal.hero.search_placeholder",
                  "Search by location, community, or keyword...",
                )}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowLocations(true);
                }}
                onFocus={() => setShowLocations(true)}
                className="ps-12 pe-10 h-14 text-[15px] border-0 focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground/40 rounded-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setShowLocations(false);
                  }}
                  className="absolute end-3 top-1/2 -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="h-14 px-6 sm:px-8 bg-[#302B25] hover:bg-[#3d352c] text-white font-semibold text-sm flex items-center gap-2 transition-colors shrink-0"
            >
              <span className="hidden sm:inline">
                {t("portal.hero.search_btn", "Search")}
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Location autocomplete dropdown */}
          {showLocations && filteredLocations.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-border/60 overflow-hidden z-50 portal-animate-scale">
              <div className="px-3 py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/40">
                {t("portal.hero.popular_locations", "Popular Locations")}
              </div>
              {filteredLocations.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => handleLocationSelect(loc)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] text-foreground hover:bg-secondary/50 transition-colors text-start"
                >
                  <MapPin className="h-3.5 w-3.5 text-[#C4903D] shrink-0" />
                  {loc}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Properties count */}
        {totalCount > 0 && (
          <p
            className="text-[13px] text-white/40 mt-4 portal-animate-in"
            style={{ animationDelay: "0.3s" }}
          >
            {t("portal.hero.count", {
              count: totalCount,
              defaultValue: `${totalCount.toLocaleString()} properties available`,
            })}
          </p>
        )}

        {/* Trending chips */}
        <div
          className="flex flex-wrap items-center justify-center gap-2 mt-6 portal-animate-in"
          style={{ animationDelay: "0.35s" }}
        >
          <span className="text-[12px] text-white/30 font-medium me-1">
            {t("portal.hero.trending", "Trending")}:
          </span>
          {trending.map((chip) => (
            <button
              key={chip}
              onClick={() => handleTrendingClick(chip)}
              className="px-3.5 py-1.5 text-[12px] font-medium text-white/70 bg-white/5 border border-white/10 hover:border-[#C4903D]/40 hover:text-[#C4903D] rounded-full transition-all duration-200"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
