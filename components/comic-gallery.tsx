"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ComicEntry } from "@/lib/comics";

type ComicGalleryProps = {
  items: ComicEntry[];
  lastImageSrc: string;
  xUrl: string;
  loadingImageSrc: string;
  successImageSrc: string;
};

type GalleryItem = {
  id: string;
  src: string;
  alt: string;
  kind: "comic" | "last";
};

const ITEMS_PER_PAGE = 5;
const READ_PROGRESS_KEY = "marin-last-read";
const BATCH_LOADING_MS = 900;
const BATCH_SUCCESS_MS = 700;

export function ComicGallery({
  items,
  lastImageSrc,
  xUrl,
  loadingImageSrc,
  successImageSrc
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
  const [hasRestoredProgress, setHasRestoredProgress] = useState(false);
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const [retryVersion, setRetryVersion] = useState(0);
  const [batchPhase, setBatchPhase] = useState<"idle" | "loading" | "success">("idle");
  const stripRef = useRef<HTMLDivElement | null>(null);
  const thumbRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const isTransitioning = useRef(false);

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === galleryItems.length - 1;
  const pageStart =
    Math.floor(currentIndex / ITEMS_PER_PAGE) * ITEMS_PER_PAGE;
  const visibleItems = galleryItems.slice(
    pageStart,
    pageStart + ITEMS_PER_PAGE
  );

  useEffect(() => {
    try {
      const savedIndex = Number.parseInt(
        window.localStorage.getItem(READ_PROGRESS_KEY) ?? "",
        10
      );

      if (Number.isInteger(savedIndex)) {
        setCurrentIndex(
          Math.min(Math.max(savedIndex, 0), galleryItems.length - 1)
        );
      }
    } catch {
      // Ignore storage restrictions and start from the first comic.
    } finally {
      setHasRestoredProgress(true);
    }
  }, [galleryItems.length]);

  useEffect(() => {
    if (!hasRestoredProgress) {
      return;
    }

    try {
      window.localStorage.setItem(READ_PROGRESS_KEY, String(currentIndex));
    } catch {
      // Ignore storage restrictions without interrupting comic navigation.
    }
  }, [currentIndex, hasRestoredProgress]);

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

  const currentItem = galleryItems[currentIndex];
  const currentImageSrc =
    retryVersion > 0
      ? `${currentItem.src}${currentItem.src.includes("?") ? "&" : "?"}retry=${retryVersion}`
      : currentItem.src;
  const isCurrentImageFailed = failedImage === currentItem.src;

  const wait = (duration: number) =>
    new Promise<void>((resolve) => {
      window.setTimeout(resolve, duration);
    });

  const preloadBatch = (targetIndex: number) => {
    const targetStart =
      Math.floor(targetIndex / ITEMS_PER_PAGE) * ITEMS_PER_PAGE;
    const targetItems = galleryItems.slice(
      targetStart,
      targetStart + ITEMS_PER_PAGE
    );

    return Promise.all(
      targetItems.map(
        (item) =>
          new Promise<string | null>((resolve) => {
            const image = new window.Image();
            image.onload = () => resolve(null);
            image.onerror = () => resolve(item.src);
            image.src = item.src;
          })
      )
    ).then((failedSources) => failedSources.find(Boolean) ?? null);
  };

  const goToIndex = async (nextIndex: number) => {
    if (
      nextIndex < 0 ||
      nextIndex >= galleryItems.length ||
      isTransitioning.current
    ) {
      return;
    }

    const currentPage = Math.floor(currentIndex / ITEMS_PER_PAGE);
    const nextPage = Math.floor(nextIndex / ITEMS_PER_PAGE);

    if (currentPage === nextPage) {
      setCurrentIndex(nextIndex);
      return;
    }

    isTransitioning.current = true;
    setBatchPhase("loading");

    const [failedSource] = await Promise.all([
      preloadBatch(nextIndex),
      wait(BATCH_LOADING_MS)
    ]);

    if (failedSource) {
      setCurrentIndex(nextIndex);
      setFailedImage(failedSource);
      setBatchPhase("idle");
      isTransitioning.current = false;
      return;
    }

    setBatchPhase("success");
    await wait(BATCH_SUCCESS_MS);
    setCurrentIndex(nextIndex);
    setBatchPhase("idle");
    isTransitioning.current = false;
  };

  const showPrevious = () => {
    void goToIndex(Math.max(currentIndex - 1, 0));
  };

  const showNext = () => {
    void goToIndex(Math.min(currentIndex + 1, galleryItems.length - 1));
  };

  return (
    <div className="space-y-5">
      {batchPhase !== "idle" ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/90 px-6">
          <img
            src={batchPhase === "loading" ? loadingImageSrc : successImageSrc}
            alt={batchPhase === "loading" ? "Loading next comics" : "Comics loaded"}
            className={`w-[190px] max-w-[48vw] object-contain sm:w-[230px] ${
              batchPhase === "success" ? "animate-pulseSoft" : "animate-reveal"
            }`}
          />
        </div>
      ) : null}

      <div className="-mx-4 overflow-hidden rounded-[12px] border border-white/10 bg-white/5 p-[2px] shadow-float backdrop-blur-md sm:mx-0 sm:rounded-[28px] sm:p-2">
        {isCurrentImageFailed ? (
          <div className="flex aspect-[2/3] w-full items-center justify-center rounded-[8px] bg-white/5 px-6 text-center sm:rounded-[24px]">
            <div>
              <p className="text-sm tracking-[0.12em] text-white/70">
                画像を読み込めませんでした。
              </p>
              <button
                type="button"
                onClick={() => {
                  setRetryVersion(Date.now());
                  setFailedImage(null);
                }}
                className="mt-5 rounded-full border border-mist/60 px-6 py-3 text-xs tracking-[0.2em] text-mist transition hover:bg-white/10"
              >
                リロード！
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={(event) => {
              const rect = event.currentTarget.getBoundingClientRect();
              const clickX = event.clientX - rect.left;

              if (clickX >= rect.width / 2) {
                void goToIndex(Math.min(currentIndex + 1, galleryItems.length - 1));
                return;
              }

              void goToIndex(Math.max(currentIndex - 1, 0));
            }}
            className="block w-full overflow-hidden rounded-[8px] text-left sm:rounded-[24px]"
          >
            <img
              key={`${currentItem.src}-${retryVersion}`}
              src={currentImageSrc}
              alt={currentItem.alt}
              onLoad={() => setFailedImage(null)}
              onError={() => setFailedImage(currentItem.src)}
              className="block w-full rounded-[8px] object-cover sm:rounded-[24px]"
            />
          </button>
        )}
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
        {visibleItems.map((item, visibleIndex) => {
          const index = pageStart + visibleIndex;

          return (
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
                loading="lazy"
                className="h-20 w-[4.5rem] object-cover sm:h-28 sm:w-24"
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#040b19] to-transparent px-2 py-2 text-left text-[10px] tracking-[0.24em] text-white/80">
                {String(index + 1).padStart(2, "0")}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
