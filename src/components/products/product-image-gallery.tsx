"use client";

import Image from "next/image";
import { useCallback, useEffect, useState, type MouseEvent } from "react";
import { Expand, X, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  images: string[];
  alt: string;
};

export function ProductImageGallery({ images, alt }: Props) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });

  const hasImages = images.length > 0;
  const current = hasImages ? images[active] : null;

  const closeLightbox = useCallback(() => {
    setLightbox(false);
    setZoomed(false);
  }, []);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight" && images.length > 1) {
        setActive((i) => (i + 1) % images.length);
        setZoomed(false);
      }
      if (e.key === "ArrowLeft" && images.length > 1) {
        setActive((i) => (i - 1 + images.length) % images.length);
        setZoomed(false);
      }
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, images.length, closeLightbox]);

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (!zoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin({ x, y });
  }

  return (
    <>
      <div className="space-y-3">
        <div
          className="group relative aspect-square cursor-zoom-in overflow-hidden bg-muted"
          onClick={() => hasImages && setLightbox(true)}
          onMouseMove={handleMouseMove}
          role={hasImages ? "button" : undefined}
          tabIndex={hasImages ? 0 : undefined}
          onKeyDown={(e) => {
            if (hasImages && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              setLightbox(true);
            }
          }}
          aria-label={hasImages ? "Open image gallery zoom" : undefined}
        >
          {current ? (
            <>
              <Image
                src={current}
                alt={alt}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                quality={60}
              />
              <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-md bg-steel/80 px-2.5 py-1.5 text-xs text-white opacity-0 transition group-hover:opacity-100">
                <Expand className="h-3.5 w-3.5" /> Zoom
              </span>
            </>
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-steel/5 to-primary/10">
              <span className="font-display text-6xl font-semibold text-steel/15">
                VX
              </span>
            </div>
          )}
        </div>

        {images.length > 1 && (
          <div className="grid min-h-[72px] grid-cols-4 gap-2 sm:grid-cols-5">
            {images.map((img, index) => (
              <button
                key={img}
                type="button"
                onClick={() => setActive(index)}
                className={cn(
                  "relative aspect-square overflow-hidden bg-muted ring-offset-2 transition",
                  active === index
                    ? "ring-2 ring-primary"
                    : "opacity-70 hover:opacity-100"
                )}
                aria-label={`View image ${index + 1}`}
              >
                <Image
                  src={img}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="100px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightbox && current && (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-steel/95"
          role="dialog"
          aria-modal="true"
          aria-label="Product image zoom"
        >
          <div className="flex items-center justify-between px-4 py-3 text-white">
            <p className="truncate text-sm">
              {alt}
              {images.length > 1 ? ` · ${active + 1}/${images.length}` : ""}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-md p-2 hover:bg-white/10"
                onClick={() => setZoomed((z) => !z)}
                aria-label={zoomed ? "Zoom out" : "Zoom in"}
              >
                {zoomed ? (
                  <ZoomOut className="h-5 w-5" />
                ) : (
                  <ZoomIn className="h-5 w-5" />
                )}
              </button>
              <button
                type="button"
                className="rounded-md p-2 hover:bg-white/10"
                onClick={closeLightbox}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div
            className={cn(
              "relative mx-auto flex min-h-0 w-full max-w-5xl flex-1 items-center justify-center px-4 pb-8",
              zoomed ? "cursor-zoom-out overflow-hidden" : "cursor-zoom-in"
            )}
            onClick={() => setZoomed((z) => !z)}
            onMouseMove={handleMouseMove}
          >
            <div
              className={cn(
                "relative h-full max-h-[80vh] w-full transition-transform duration-200",
                zoomed ? "scale-[1.8]" : "scale-100"
              )}
              style={
                zoomed
                  ? { transformOrigin: `${origin.x}% ${origin.y}%` }
                  : undefined
              }
            >
              <Image
                src={current}
                alt={alt}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>
          </div>

          {images.length > 1 && (
            <div className="flex justify-center gap-2 px-4 pb-6">
              {images.map((img, index) => (
                <button
                  key={img}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActive(index);
                    setZoomed(false);
                  }}
                  className={cn(
                    "relative h-14 w-14 overflow-hidden bg-white/10",
                    active === index && "ring-2 ring-primary"
                  )}
                >
                  <Image src={img} alt="" fill className="object-cover" sizes="56px" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
