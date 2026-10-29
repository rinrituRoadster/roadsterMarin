"use client";

import { useEffect, useMemo, useState } from "react";
import { ComicGallery } from "@/components/comic-gallery";
import { RevealSection } from "@/components/reveal-section";
import type { ComicEntry } from "@/lib/comics";
import { LINE_STAMP_URL, withBasePath, X_URL } from "@/lib/site";

const LOADING_MS = 1500;
const SUCCESS_MS = 1000;

type Phase = "loading" | "success" | "index";

type HomePageProps = {
  comics: ComicEntry[];
  heroImages: string[];
};

export function HomePage({ comics, heroImages }: HomePageProps) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [heroImage, setHeroImage] = useState(heroImages[0] ?? "");
  const [characterSet, setCharacterSet] = useState(1);

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

  useEffect(() => {
    setCharacterSet(Math.floor(Math.random() * 3) + 1);
  }, []);

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
        <section
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-navy/28 px-6"
        >
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
                  中古のロードスターには
                  <br />
                  幽霊少女が憑いていました。
                </h1>
                <p className="mt-7 max-w-[26rem] text-left text-[0.8rem] leading-[2.35] text-white/74">
                  海沿いを走るときのような、少しだけ胸が鳴る
                  <br />
                  ノスタルジック・ロードコメディ。
                  <br />
                  あの頃の海風を、令和のふたりが届けます。
                </p>
              </div>
            </RevealSection>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-5 pb-20 sm:px-8 lg:px-14">
          <RevealSection>
            <div className="mb-8 max-w-[34rem] text-left">
              <p className="text-[10px] uppercase tracking-[0.32em] text-dusk/70">
                Characters
              </p>
              <h2 className="mt-3 text-[1rem] font-medium leading-[2.1] text-white">
                海夢と、ご主人。
              </h2>
            </div>
          </RevealSection>

          <div className="grid grid-cols-2 gap-3 sm:gap-6">
            <CharacterCard
              name="海夢"
              romanized="MARIN / 155cm"
              intro="中古のオープンカーに憑いてきた呪縛霊の女の子。好きな音楽はシティポップ。"
              concern="ご主人がお供え物をしてくれない。"
              image={`/images/profile/${characterSet}-marin.webp`}
            />
            <CharacterCard
              name="ご主人"
              romanized="GOSHUJIN / 178cm"
              intro="中古のロードスターを購入した社会人。趣味なし、恋人なし。平凡な日常を送っていた。"
              concern="中古車に幽霊がついてきた。"
              image={`/images/profile/${characterSet}-owner.webp`}
            />
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-5 pb-20 sm:px-8 lg:px-14">
          <RevealSection className="mb-7">
            <div className="mb-6 max-w-[30rem] text-left">
              <p className="text-[10px] uppercase tracking-[0.32em] text-dusk/70">
                Comics
              </p>
              <h2 className="mt-3 text-[1rem] font-medium leading-[2.1] text-white">
                画像の右側タップで次話、左側タップで前話に推移できます。
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
              loadingImageSrc={withBasePath("/images/loading.jpg")}
              successImageSrc={withBasePath("/images/success.jpg")}
            />
          </RevealSection>
        </section>

        <section className="mx-auto w-full max-w-6xl px-5 pb-20 sm:px-8 lg:px-14">
          <RevealSection>
            <div className="rounded-[18px] border border-white/12 bg-white/[0.04] p-5 sm:p-8">
              <p className="text-[10px] uppercase tracking-[0.32em] text-dusk/70">Line stickers</p>
              <h2 className="mt-3 text-[1rem] font-medium leading-[2.1] text-white">
                海夢ちゃん、LINEスタンプになりました。
              </h2>
              <p className="mt-4 text-[0.8rem] leading-[2.2] text-white/65">
                ちょっと生意気で、ちょっと便利。
                <br />
                ドライブにも日常会話にも使える、海夢ちゃんのLINEスタンプ。
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[1, 2, 3, 4].map((number) => (
                  <div key={number} className="aspect-square rounded-[10px] bg-white/[0.04] p-2">
                    <img
                      src={withBasePath(`/images/line-stamp/${number}.webp`)}
                      alt={`海夢ちゃんLINEスタンプ${number}`}
                      width="512"
                      height="512"
                      loading="lazy"
                      className="h-full w-full object-contain"
                    />
                  </div>
                ))}
              </div>
              <a
                href={LINE_STAMP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex rounded-full border border-white/35 px-5 py-3 text-xs tracking-[0.14em] text-white/75 transition hover:border-[#89cfff] hover:bg-[#89cfff]/10 hover:text-white"
              >
                LINEスタンプを見る
              </a>
            </div>
          </RevealSection>
        </section>

        <RevealSection className="mx-auto w-full max-w-6xl px-5 pb-16 sm:px-8 lg:px-14" delayMs={160}>
          <div className="flex flex-col items-center gap-6">
            <div className="text-center">
              <h2 className="text-[1rem] font-medium leading-[2.1] text-white">
                Xで海夢たちの日常をチェック
              </h2>
              <p className="mt-2 text-[0.75rem] leading-[2] text-white/60">
                最新話や制作情報、ロードスターとの日常を更新中。
              </p>
            </div>
            <a
              href={X_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open X account"
              className="grid min-h-14 min-w-14 place-items-center rounded-full border border-white/55 bg-transparent px-5 text-sm tracking-[0.12em] text-white transition duration-500 hover:border-[#89cfff] hover:bg-[#89cfff]/10 hover:shadow-glow"
            >
              公式Xをフォロー
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

type CharacterCardProps = {
  name: string;
  romanized: string;
  intro: string;
  concern: string;
  image: string;
};

function CharacterCard({ name, romanized, intro, concern, image }: CharacterCardProps) {
  return (
    <article className="rounded-[14px] border border-white/12 bg-white/[0.04] p-2.5 sm:rounded-[18px] sm:p-5">
      <img
        src={withBasePath(image)}
        alt={`${name}プロフィール`}
        width="800"
        height="800"
        loading="lazy"
        className="aspect-square w-full rounded-[8px] object-cover sm:rounded-[10px]"
      />
      <div className="mt-3 sm:mt-5">
        <p className="text-[10px] uppercase tracking-[0.3em] text-dusk/70">{romanized}</p>
        <h3 className="mt-1 text-base font-medium text-white sm:mt-2 sm:text-xl">{name}</h3>
        <p className="mt-2 text-[0.68rem] leading-[1.9] text-white/70 sm:mt-4 sm:text-[0.8rem] sm:leading-[2.15]">{intro}</p>
        <p className="mt-2 border-l border-[#89cfff]/60 pl-2 text-[0.64rem] leading-[1.8] text-white/55 sm:mt-3 sm:pl-3 sm:text-[0.75rem] sm:leading-[2]">
          {concern}
        </p>
      </div>
    </article>
  );
}

function BackgroundLayer() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0">
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
