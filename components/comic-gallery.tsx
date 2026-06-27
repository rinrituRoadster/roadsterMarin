"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ComicEntry } from "@/lib/comics";

type ComicGalleryProps = {
  items: ComicEntry[];
  lastImageSrc: string;
  xUrl: string;
};

type GalleryItem = {
  id: string;
  src: string;
  alt: string;
  kind: "comic" | "last";
};

export function ComicGallery({
  items,
  lastImageSrc,
  xUrl
}: ComicGalleryProps) {
  const galleryItems = useMemo<GalleryItem[]>(
    () => [
      ...items.map((item) => ({
        id: item.id,
        src: item.src,
        alt: item.alt,
        kind: "comic" as const
      })),
      {
        id: "comic-last",
        src: lastImageSrc,
        alt: "Last slide",
        kind: "last" as const
      }
    ],
    [items, lastImageSrc]
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const thumbRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const suppressOpenRef = useRef(false);

  const activeItem = useMemo(
    () => (activeIndex === null ? null : galleryItems[activeIndex]),
    [activeIndex, galleryItems]
  );
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === galleryItems.length - 1;

  useEffect(() => {
    const activeThumb = thumbRefs.current[currentIndex];

    activeThumb?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest"
    });
  }, [currentIndex]);

  useEffect(() => {
    if (activeIndex === null) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveIndex(null);
      }

      if (event.key === "ArrowRight") {
        setCurrentIndex((current) => Math.min(current + 1, galleryItems.length - 1));
        setActiveIndex((current) =>
          current === null ? 0 : Math.min(current + 1, galleryItems.length - 1)
        );
      }

      if (event.key === "ArrowLeft") {
        setCurrentIndex((current) => Math.max(current - 1, 0));
        setActiveIndex((current) =>
          current === null ? 0 : Math.max(current - 1, 0)
        );
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, galleryItems.length]);

  const showPrevious = () => {
    setCurrentIndex((current) => Math.max(current - 1, 0));
    setActiveIndex((current) =>
      current === null ? 0 : Math.max(current - 1, 0)
    );
  };

  const showNext = () => {
    setCurrentIndex((current) => Math.min(current + 1, galleryItems.length - 1));
    setActiveIndex((current) =>
      current === null ? 0 : Math.min(current + 1, galleryItems.length - 1)
    );
  };

  const goToIndex = (index: number, openModal = false) => {
    setCurrentIndex(index);
    if (openModal) {
      setActiveIndex(index);
    }
  };

  if (galleryItems.length === 0) {
    return null;
  }

  return (
    <>
      <div className="space-y-5">
        <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-2 shadow-float backdrop-blur-md">
          <button
            type="button"
            onClick={() => {
              if (suppressOpenRef.current) {
                suppressOpenRef.current = false;
                return;
              }

              setActiveIndex(currentIndex);
            }}
            className="group block w-full overflow-hidden rounded-[24px] text-left focus:outline-none focus:ring-2 focus:ring-mist/60"
            onTouchStart={(event) => setTouchStartX(event.changedTouches[0]?.clientX ?? null)}
            onTouchEnd={(event) => {
              const endX = event.changedTouches[0]?.clientX;

              if (touchStartX === null || typeof endX !== "number") {
                return;
              }

              const delta = touchStartX - endX;

              if (Math.abs(delta) < 40) {
                suppressOpenRef.current = false;
                return;
              }

              suppressOpenRef.current = true;

              if (delta > 0) {
                goToIndex(Math.min(currentIndex + 1, galleryItems.length - 1));
                return;
              }

              goToIndex(Math.max(currentIndex - 1, 0));
            }}
          >
            <img
              src={galleryItems[currentIndex].src}
              alt={galleryItems[currentIndex].alt}
              className="block w-full rounded-[24px] object-cover transition duration-700 group-hover:scale-[1.01]"
            />
          </button>
        </div>

        {galleryItems[currentIndex].kind === "last" ? (
          <div className="pt-1 text-center">
            <a
              href={xUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-[#89cfff]/40 px-5 py-3 text-[12px] tracking-[0.18em] text-mist transition hover:border-[#89cfff] hover:bg-[#89cfff]/10 hover:text-white"
            >
              Xはこちら
            </a>
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-3 text-[11px] tracking-[0.28em] text-white/60">
          <button
            type="button"
            onClick={() => goToIndex(Math.max(currentIndex - 1, 0))}
            disabled={isFirst}
            className="rounded-full border border-white/12 px-4 py-2 transition hover:border-mist/40 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-35"
          >
            PREV
          </button>
          <div>
            {String(currentIndex + 1).padStart(2, "0")} / {String(galleryItems.length).padStart(2, "0")}
          </div>
          <button
            type="button"
            onClick={() => goToIndex(Math.min(currentIndex + 1, galleryItems.length - 1))}
            disabled={isLast}
            className="rounded-full border border-white/12 px-4 py-2 transition hover:border-mist/40 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-35"
          >
            NEXT
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-color:rgba(223,244,255,0.45)_transparent] [scrollbar-width:thin]">
          {galleryItems.map((item, index) => (
            <button
              key={item.id}
              ref={(node) => {
                thumbRefs.current[index] = node;
              }}
              type="button"
              onClick={() => goToIndex(index)}
              className={`relative shrink-0 overflow-hidden rounded-[18px] border transition ${
                currentIndex === index
                  ? "border-mist/70 bg-white/10"
                  : "border-white/10 bg-white/5 hover:border-white/30"
              }`}
            >
              <img
                src={item.src}
                alt={item.alt}
                className="h-24 w-20 object-cover sm:h-28 sm:w-24"
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#040b19] to-transparent px-2 py-2 text-left text-[10px] tracking-[0.24em] text-white/80">
                {String(index + 1).padStart(2, "0")}
              </span>
            </button>
          ))}
        </div>
      </div>

      {activeItem ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#020611]/92 px-3 py-6 backdrop-blur-xl"
          onClick={() => setActiveIndex(null)}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setActiveIndex(null)}
            className="absolute right-5 top-5 h-11 w-11 rounded-full border border-white/20 bg-white/5 text-xl text-white transition hover:border-mist/60 hover:bg-mist/10"
          >
            ×
          </button>

          <button
            type="button"
            aria-label="Previous comic"
            onClick={(event) => {
              event.stopPropagation();
              showPrevious();
            }}
            disabled={activeIndex === 0}
            className="absolute left-2 top-1/2 hidden h-12 w-12 -translate-y-1/2 rounded-full border border-white/20 bg-white/5 text-2xl text-white/90 transition hover:border-mist/60 hover:bg-mist/10 disabled:cursor-not-allowed disabled:opacity-35 sm:grid sm:place-items-center"
          >
            ‹
          </button>

          <div
            className="relative flex h-full w-full max-w-6xl flex-col items-center justify-center gap-4"
            onClick={(event) => event.stopPropagation()}
            onTouchStart={(event) => setTouchStartX(event.changedTouches[0]?.clientX ?? null)}
            onTouchEnd={(event) => {
              const endX = event.changedTouches[0]?.clientX;

              if (touchStartX === null || typeof endX !== "number") {
                return;
              }

              const delta = touchStartX - endX;

              if (Math.abs(delta) < 40) {
                return;
              }

              if (delta > 0) {
                showNext();
                return;
              }

              showPrevious();
            }}
          >
            <img
              src={activeItem.src}
              alt={activeItem.alt}
              className="max-h-[72vh] w-full rounded-[24px] object-contain shadow-[0_20px_80px_rgba(0,0,0,0.45)]"
            />

            {activeItem.kind === "last" ? (
              <a
                href={xUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-[#89cfff]/40 px-5 py-3 text-[12px] tracking-[0.18em] text-mist transition hover:border-[#89cfff] hover:bg-[#89cfff]/10 hover:text-white"
              >
                Xはこちら
              </a>
            ) : null}

            <div className="w-full overflow-x-auto pb-2 [scrollbar-color:rgba(223,244,255,0.45)_transparent] [scrollbar-width:thin]">
              <div className="flex gap-3">
                {galleryItems.map((item, index) => (
                  <button
                    key={`${item.id}-modal`}
                    type="button"
                    onClick={() => goToIndex(index, true)}
                    className={`relative shrink-0 overflow-hidden rounded-[16px] border transition ${
                      activeIndex === index
                        ? "border-mist/70 bg-white/10"
                        : "border-white/10 bg-white/5 hover:border-white/30"
                    }`}
                  >
                    <img
                      src={item.src}
                      alt={item.alt}
                      className="h-20 w-16 object-cover sm:h-24 sm:w-20"
                    />
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#040b19] to-transparent px-2 py-2 text-left text-[10px] tracking-[0.24em] text-white/80">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            aria-label="Next comic"
            onClick={(event) => {
              event.stopPropagation();
              showNext();
            }}
            disabled={activeIndex === galleryItems.length - 1}
            className="absolute right-2 top-1/2 hidden h-12 w-12 -translate-y-1/2 rounded-full border border-white/20 bg-white/5 text-2xl text-white/90 transition hover:border-mist/60 hover:bg-mist/10 disabled:cursor-not-allowed disabled:opacity-35 sm:grid sm:place-items-center"
          >
            ›
          </button>

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] tracking-[0.24em] text-white/70">
            {String((activeIndex ?? 0) + 1).padStart(2, "0")} / {String(galleryItems.length).padStart(2, "0")}
          </div>
        </div>
      ) : null}
    </>
  );
}
