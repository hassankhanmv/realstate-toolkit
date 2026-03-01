import { useState, useEffect, useCallback } from "react";
import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScrollToTopProps {
  /** Distance from top (px) before button appears */
  threshold?: number;
  /** Additional CSS classes */
  className?: string;
}

export function ScrollToTop({ threshold = 400, className }: ScrollToTopProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > threshold);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={cn(
        "fixed z-40 bottom-20 md:bottom-8 end-4 md:end-6",
        "h-10 w-10 rounded-full",
        "bg-[#302B25] hover:bg-[#3d352c] text-[#C4903D]",
        "flex items-center justify-center",
        "shadow-lg shadow-black/10",
        "transition-all duration-300 cursor-pointer",
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none",
        className,
      )}
    >
      <ChevronUp className="h-5 w-5" />
    </button>
  );
}
