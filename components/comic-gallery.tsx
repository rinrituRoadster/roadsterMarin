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
  const stripRef = useRef<HTMLDivElement | null>(null);
  const thumbRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === galleryItems.length - 1;

  useEffect(() => {
    const activeThumb = thumbRefs.current[currentIndex];
    const strip = stripRef.current;

    if (!activeThumb || !strip) {
      return;
    }

    const thumbLeft = activeThumb.offsetLeft;
    const thumbWidth = activeThumb.offsetWidth;
    const targetLeft = thumbLeft - strip.clientWidth / 2 + thumbWidth / 2;

    strip.scrollTo({
      left: Math.max(targetLeft, 0),
      behavior: "smooth"
    });
  }, [currentIndex]);

  if (galleryItems.length === 0) {
    return null;
  }

  const showPrevious = () => {
    setCurrentIndex((current) => Math.max(current - 1, 0));
  };

  const showNext = () => {
    setCurrentIndex((current) => Math.min(current + 1, galleryItems.length - 1));
  };

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-[18px] border border-white/10 bg-white/5 p-1 shadow-float backdrop-blur-md sm:rounded-[28px] sm:p-2">
        <button
          type="button"
          onClick={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const clickX = event.clientX - rect.left;

            if (clickX >= rect.width / 2) {
              showNext();
              return;
            }

            showPrevious();
          }}
          className="block w-full overflow-hidden rounded-[14px] text-left sm:rounded-[24px]"
        >
          <img
            src={galleryItems[currentIndex].src}
            alt={galleryItems[currentIndex].alt}
            className="block w-full rounded-[14px] object-cover sm:rounded-[24px]"
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
          onClick={showPrevious}
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
          onClick={showNext}
          disabled={isLast}
          className="rounded-full border border-white/12 px-4 py-2 transition hover:border-mist/40 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-35"
        >
          NEXT
        </button>
      </div>

      <div
        ref={stripRef}
        className="flex gap-2 overflow-x-auto pb-2 [scrollbar-color:rgba(223,244,255,0.45)_transparent] [scrollbar-width:thin] sm:gap-3"
      >
        {galleryItems.map((item, index) => (
          <button
            key={item.id}
            ref={(node) => {
              thumbRefs.current[index] = node;
            }}
            type="button"
            onClick={() => setCurrentIndex(index)}
            className={`relative shrink-0 overflow-hidden rounded-[14px] border transition sm:rounded-[18px] ${
              currentIndex === index
                ? "border-mist/70 bg-white/10"
                : "border-white/10 bg-white/5 hover:border-white/30"
            }`}
          >
            <img
              src={item.src}
              alt={item.alt}
              className="h-20 w-[4.5rem] object-cover sm:h-28 sm:w-24"
            />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#040b19] to-transparent px-2 py-2 text-left text-[10px] tracking-[0.24em] text-white/80">
              {String(index + 1).padStart(2, "0")}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
