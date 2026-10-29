"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
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
  const [isCurrentImageLoaded, setIsCurrentImageLoaded] = useState(false);
  const [retryVersion, setRetryVersion] = useState(0);
  const [batchPhase, setBatchPhase] = useState<"idle" | "loading" | "success">("idle");
  const isTransitioning = useRef(false);

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === galleryItems.length - 1;
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
      setIsCurrentImageLoaded(false);
      setCurrentIndex(nextIndex);
      return;
    }

    isTransitioning.current = true;
    setBatchPhase("loading");
    setIsCurrentImageLoaded(false);

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
    setIsCurrentImageLoaded(true);
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
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-navy/90 px-6"
        >
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
            className="relative block aspect-[2/3] w-full overflow-hidden rounded-[8px] text-left sm:rounded-[24px]"
          >
            {!isCurrentImageLoaded ? (
              <span className="absolute inset-0 z-10 grid place-items-center bg-navy/35">
                <img
                  src={loadingImageSrc}
                  alt="漫画を読み込み中"
                  className="w-[120px] max-w-[35%] object-contain opacity-90 sm:w-[160px]"
                />
              </span>
            ) : null}
            <img
              key={`${currentItem.src}-${retryVersion}`}
              src={currentImageSrc}
              alt={currentItem.alt}
              onLoad={() => {
                setFailedImage(null);
                setIsCurrentImageLoaded(true);
              }}
              onError={() => {
                setFailedImage(currentItem.src);
                setIsCurrentImageLoaded(false);
              }}
              className={`block h-full w-full rounded-[8px] object-contain transition-opacity duration-300 sm:rounded-[24px] ${isCurrentImageLoaded ? "opacity-100" : "opacity-0"}`}
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

      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px] tracking-[0.2em] text-white/45">
          <span>1話</span>
          <span>最終</span>
        </div>
        <input
          aria-label="漫画の話数を選択"
          aria-valuetext={`${currentIndex + 1} / ${galleryItems.length}`}
          className="comic-progress w-full"
          max={galleryItems.length - 1}
          min="0"
          onChange={(event) => {
            setIsCurrentImageLoaded(false);
            setCurrentIndex(Number(event.target.value));
            setFailedImage(null);
            setRetryVersion(0);
          }}
          step="1"
          style={
            {
              "--progress": `${(currentIndex / Math.max(galleryItems.length - 1, 1)) * 100}%`
            } as CSSProperties
          }
          type="range"
          value={currentIndex}
        />
      </div>
    </div>
  );
}
