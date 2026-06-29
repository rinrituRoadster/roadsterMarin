"use client";

import { useEffect, useMemo, useState } from "react";
import { ComicGallery } from "@/components/comic-gallery";
import { RevealSection } from "@/components/reveal-section";
import type { ComicEntry } from "@/lib/comics";

const LOADING_MS = 1500;
const SUCCESS_MS = 1000;
const X_URL = "https://x.com/roadsterMarin";
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

const withBasePath = (path: string) =>
  `${BASE_PATH}${path.startsWith("/") ? path : `/${path}`}`;

type Phase = "loading" | "success" | "index";

type HomePageProps = {
  comics: ComicEntry[];
  heroImages: string[];
};

export function HomePage({ comics, heroImages }: HomePageProps) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [heroImage, setHeroImage] = useState(heroImages[0] ?? "");

  useEffect(() => {
    const loadingTimer = window.setTimeout(() => {
      setPhase("success");
    }, LOADING_MS);

    const successTimer = window.setTimeout(() => {
      setPhase("index");
    }, LOADING_MS + SUCCESS_MS);

    return () => {
      window.clearTimeout(loadingTimer);
      window.clearTimeout(successTimer);
    };
  }, []);

  useEffect(() => {
    if (heroImages.length === 0) {
      return;
    }

    const randomIndex = Math.floor(Math.random() * heroImages.length);
    setHeroImage(heroImages[randomIndex]);
  }, [heroImages]);

  const overlay = useMemo(() => {
    if (phase === "loading") {
      return {
        src: withBasePath("/images/loading.jpg"),
        alt: "Loading",
        className: "opacity-100 scale-100"
      };
    }

    if (phase === "success") {
      return {
        src: withBasePath("/images/success.jpg"),
        alt: "Success",
        className: "animate-pulseSoft"
      };
    }

    return null;
  }, [phase]);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-navy text-ink">
      <BackgroundLayer />

      {overlay ? (
        <section className="fixed inset-0 z-40 flex items-center justify-center bg-navy/28 px-6">
          <img
            src={overlay.src}
            alt={overlay.alt}
            className={`w-[190px] max-w-[48vw] object-contain transition-all duration-[1400ms] ease-out animate-reveal sm:w-[230px] ${overlay.className}`}
          />
        </section>
      ) : null}

      <div
        className={`relative z-10 transition-opacity duration-[1800ms] ${
          phase === "index" ? "opacity-100" : "opacity-0"
        }`}
      >
        <section className="relative aspect-square w-full overflow-hidden lg:h-screen">
          <img
            src={heroImage}
            alt="Hero visual"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,10,24,0.16),rgba(4,10,24,0.34)_38%,rgba(4,10,24,0.7)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(223,244,255,0.18),transparent_22%),radial-gradient(circle_at_76%_20%,rgba(243,198,216,0.16),transparent_24%)]" />
          <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#050914] to-transparent" />

          <div className="relative mx-auto flex h-full w-full max-w-6xl items-start px-5 pt-14 sm:px-8 sm:pt-20 lg:px-14 lg:pt-28">
            <RevealSection className="max-w-[440px]">
              <div className="rounded-[24px] border border-white/12 bg-[rgba(10,15,35,0.18)] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.14)] sm:border-white/15 sm:bg-[rgba(10,15,35,0.32)] sm:p-7 sm:backdrop-blur-[18px]">
                <p className="mb-5 text-[10px] uppercase tracking-[0.38em] text-mist/75">
                  Neo Nostalgia / City Pop / Heisei x Reiwa
                </p>
                <h1 className="text-balance text-left text-[1rem] font-medium leading-[2.1] text-white sm:text-[1.75rem]">
                  今日どこへ行こうか。
                  <br />
                  そんな毎日が続く。
                  <br />
                  ノスタルジックロードコメディ
                </h1>
                <p className="mt-7 max-w-[26rem] text-left text-[0.8rem] leading-[2.35] text-white/74">
                  海沿いを夜に走るオープンカーみたいに、静かで、少しだけ胸が鳴る。
                  <br />
                  あの頃の海風を令和のふたりが届けます。
                </p>
              </div>
            </RevealSection>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-5 pb-20 sm:px-8 lg:px-14">
          <RevealSection className="mb-7">
            <div className="mb-6 max-w-[30rem] text-left">
              <p className="text-[10px] uppercase tracking-[0.32em] text-dusk/70">
                Comics
              </p>
              <h2 className="mt-3 text-[1rem] font-medium leading-[2.1] text-white">
                横スライドと下部バーで先の話数まで移動できます。
              </h2>
              <p className="mt-3 text-[0.78rem] leading-[2.35] text-white/65">
                （原作小説はcomming soon...!）
              </p>
            </div>
          </RevealSection>

          <RevealSection delayMs={120}>
            <ComicGallery
              items={comics}
              lastImageSrc={withBasePath("/images/last.PNG")}
              xUrl={X_URL}
            />
          </RevealSection>
        </section>

        <RevealSection className="mx-auto w-full max-w-6xl px-5 pb-16 sm:px-8 lg:px-14" delayMs={160}>
          <div className="flex flex-col items-center gap-6">
            <a
              href={X_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="Open X account"
              className="grid h-14 w-14 place-items-center rounded-full border border-white/55 bg-transparent text-sm tracking-[0.2em] text-white transition duration-500 hover:border-[#89cfff] hover:bg-[#89cfff]/10 hover:shadow-glow"
            >
              X
            </a>
            <p className="text-center text-[11px] tracking-[0.18em] text-white/50">
              Copyright @roadsterMarin
            </p>
          </div>
        </RevealSection>
      </div>
    </main>
  );
}

function BackgroundLayer() {
  return (
    <div className="fixed inset-0">
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={withBasePath("/images/background_collage.PNG")}
          alt=""
          aria-hidden="true"
          className="h-full w-full animate-drift object-cover blur-[5px] saturate-[1.05]"
        />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,10,24,0.2),rgba(4,10,24,0.78))]" />
      <div className="absolute inset-0 animate-breathe bg-[radial-gradient(circle_at_24%_18%,rgba(223,244,255,0.16),transparent_22%),radial-gradient(circle_at_75%_20%,rgba(243,198,216,0.14),transparent_20%),radial-gradient(circle_at_50%_75%,rgba(226,217,255,0.12),transparent_22%)]" />
    </div>
  );
}
