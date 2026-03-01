import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageCarouselProps {
  images: string[];
  alt?: string;
  aspectRatio?: "square" | "video" | "wide";
  showFullscreen?: boolean;
}

export function ImageCarousel({
  images,
  alt = "Property image",
  aspectRatio = "video",
  showFullscreen = false,
}: ImageCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const aspectClass = {
    square: "aspect-square",
    video: "aspect-video",
    wide: "aspect-[16/9]",
  }[aspectRatio];

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  if (!images || images.length === 0) {
    return (
      <div
        className={`${aspectClass} bg-muted flex items-center justify-center rounded-xl`}
      >
        <span className="text-sm text-muted-foreground">No images</span>
      </div>
    );
  }

  const carousel = (
    <div className="relative group">
      <div ref={emblaRef} className="overflow-hidden rounded-xl">
        <div className="flex">
          {images.map((src, idx) => (
            <div key={idx} className="flex-[0_0_100%] min-w-0">
              <div className={aspectClass}>
                <img
                  src={src}
                  alt={`${alt} ${idx + 1}`}
                  loading={idx === 0 ? "eager" : "lazy"}
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nav buttons */}
      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={scrollPrev}
            className="absolute start-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={scrollNext}
            className="absolute end-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* Dots indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => emblaApi?.scrollTo(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === selectedIndex
                  ? "bg-white w-4"
                  : "bg-white/60 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}

      {/* Fullscreen button */}
      {showFullscreen && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setFullscreen(true)}
          className="absolute top-3 end-3 h-8 w-8 rounded-full bg-white/80 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Expand className="h-4 w-4" />
        </Button>
      )}

      {/* Image count */}
      <div className="absolute top-3 start-3 bg-black/50 text-white text-xs px-2 py-1 rounded-md">
        {selectedIndex + 1}/{images.length}
      </div>
    </div>
  );

  // Fullscreen overlay
  if (fullscreen) {
    return (
      <>
        {carousel}
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setFullscreen(false)}
            className="absolute top-4 end-4 h-10 w-10 text-white hover:bg-white/20 z-10"
          >
            <X className="h-6 w-6" />
          </Button>
          <div className="w-full max-w-5xl mx-auto px-4">
            <img
              src={images[selectedIndex]}
              alt={`${alt} fullscreen`}
              className="w-full max-h-[85vh] object-contain rounded-lg"
            />
            {/* Thumbnails */}
            <div className="flex gap-2 justify-center mt-4 overflow-x-auto pb-2">
              {images.map((src, idx) => (
                <button
                  key={idx}
                  onClick={() => emblaApi?.scrollTo(idx)}
                  className={`shrink-0 w-16 h-12 rounded-md overflow-hidden border-2 transition-colors ${
                    idx === selectedIndex
                      ? "border-white"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={src}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  return carousel;
}
