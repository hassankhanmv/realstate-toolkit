import { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { Search, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";

const QUICK_FILTERS = [
  { key: "for_sale", label: "For Sale", param: "status=For Sale" },
  { key: "for_rent", label: "For Rent", param: "status=For Rent" },
  { key: "off_plan", label: "Off-Plan", param: "status=Off-Plan" },
  { key: "villa", label: "Villas", param: "type=Villa" },
  { key: "apartment", label: "Apartments", param: "type=Apartment" },
];

export function HeroSearch() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      // TODO: Replace with OpenAI parse here
      // Future: Send query to AI endpoint to extract structured filters
      // e.g., "2BR in Dubai Marina under 2M" → { bedrooms: 2, location: "Dubai Marina", priceMax: 2000000 }

      const searchParams = new URLSearchParams();
      if (query.trim()) {
        searchParams.set("q", query.trim());
      }
      navigate(`/portal/search?${searchParams.toString()}`);
    },
    [query, navigate],
  );

  const handleQuickFilter = useCallback(
    (param: string) => {
      navigate(`/portal/search?${param}`);
    },
    [navigate],
  );

  return (
    <section className="relative bg-[#FDFBF7] py-16 sm:py-20 lg:py-28">
      {/* Subtle decorative line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-border/40" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Eyebrow */}
        <span className="inline-block text-[11px] font-semibold tracking-[0.2em] uppercase text-[#C4903D] mb-4">
          {t("portal.hero.eyebrow", "UAE Premium Properties")}
        </span>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-foreground leading-[1.15] tracking-tight mb-4">
          {t("portal.hero.title", "Find Your Dream Property")}
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
          {t(
            "portal.hero.subtitle",
            "Discover premium properties across the UAE. Search, save, and connect with agents instantly.",
          )}
        </p>

        {/* Search bar */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center max-w-2xl mx-auto bg-white border border-border rounded-lg shadow-sm overflow-hidden"
        >
          <div className="relative flex-1">
            <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t(
                "portal.hero.search_placeholder",
                "Search for 2BR in Dubai Marina under 2M AED...",
              )}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="ps-12 h-13 text-[15px] border-0 focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground/50 rounded-none"
            />
          </div>
          <button
            type="submit"
            className="h-13 px-6 bg-[#302B25] hover:bg-[#3d352c] text-white font-semibold text-sm flex items-center gap-2 transition-colors shrink-0 cursor-pointer"
          >
            <span className="hidden sm:inline">
              {t("portal.hero.search_btn", "Search")}
            </span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Quick filter chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
          {QUICK_FILTERS.map((filter) => (
            <button
              key={filter.key}
              onClick={() => handleQuickFilter(filter.param)}
              className="px-4 py-2 text-[13px] font-medium text-muted-foreground bg-white border border-border hover:border-[#C4903D] hover:text-[#C4903D] rounded-full transition-all duration-200 cursor-pointer"
            >
              {t(`portal.quick_filter.${filter.key}`, filter.label)}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
