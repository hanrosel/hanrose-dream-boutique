import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type Slide = { src: string; link?: string | null };

type Props = {
  /** Pass either slides (with per-slide links) or plain images array */
  slides?: Slide[];
  images?: string[];
  /** Fallback link used when slide has no individual link */
  linkUrl?: string | null;
  className?: string;
  imgClassName?: string;
  dots?: boolean;
};

export const SimpleSlider = ({ slides, images, linkUrl, className, imgClassName, dots = true }: Props) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [current, setCurrent] = useState(0);

  // Normalise to Slide[]
  const items: Slide[] = slides
    ? slides
    : (images ?? []).map((src) => ({ src, link: linkUrl }));

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrent(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  if (items.length === 0) return null;

  const renderImg = (item: Slide, eager = false) => (
    <img
      src={item.src}
      alt=""
      loading={eager ? "eager" : "lazy"}
      className={cn("w-full h-full object-cover", imgClassName)}
    />
  );

  if (items.length === 1) {
    const item = items[0];
    return (
      <div className={className}>
        {item.link
          ? <a href={item.link} target="_blank" rel="noreferrer">{renderImg(item, true)}</a>
          : renderImg(item, true)}
      </div>
    );
  }

  const prev = (e: React.MouseEvent) => { e.preventDefault(); emblaApi?.scrollPrev(); };
  const next = (e: React.MouseEvent) => { e.preventDefault(); emblaApi?.scrollNext(); };

  return (
    <div className={cn("relative overflow-hidden group", className)}>
      <div ref={emblaRef} className="overflow-hidden h-full">
        <div className="flex h-full">
          {items.map((item, i) => (
            <div key={i} className="min-w-0 shrink-0 grow-0 basis-full h-full">
              {item.link
                ? <a href={item.link} target="_blank" rel="noreferrer" className="block h-full">{renderImg(item, i === 0)}</a>
                : renderImg(item, i === 0)}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity z-10"
        aria-label="Previous"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity z-10"
        aria-label="Next"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {dots && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.preventDefault(); emblaApi?.scrollTo(i); }}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === current ? "w-4 bg-white" : "w-1.5 bg-white/50"
              )}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
