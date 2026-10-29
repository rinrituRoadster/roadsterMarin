import type { ComicEntry } from "@/lib/comics";
import type { EpisodeContent } from "@/lib/episode-content";
import { withBasePath, X_URL } from "@/lib/site";

type EpisodePageProps = {
  comic: ComicEntry;
  content: Required<EpisodeContent>;
  previous: ComicEntry | null;
  next: ComicEntry | null;
};

export function EpisodePage({ comic, content, previous, next }: EpisodePageProps) {
  return (
    <main className="min-h-screen bg-navy px-5 py-8 text-ink sm:px-8 sm:py-12">
      <article className="mx-auto max-w-3xl">
        <header className="mb-8 text-center sm:mb-10">
          <a
            href={withBasePath("/")}
            className="text-[10px] uppercase tracking-[0.28em] text-mist/65 transition hover:text-white"
          >
            中古車呪縛霊まりんちゃん
          </a>
          <p className="mt-5 text-[10px] uppercase tracking-[0.3em] text-dusk/70">
            Comic {String(comic.number).padStart(3, "0")}
          </p>
          <h1 className="mt-3 text-2xl font-medium leading-relaxed text-white sm:text-3xl">
            {content.title}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-8 text-white/70">
            {content.description}
          </p>
        </header>

        <figure className="overflow-hidden rounded-[12px] border border-white/15 bg-white/5 p-1 shadow-float sm:rounded-[18px] sm:p-2">
          <img
            src={comic.src}
            alt={comic.alt}
            width="1024"
            height="1536"
            fetchPriority="high"
            className="block h-auto w-full rounded-[8px] sm:rounded-[12px]"
          />
        </figure>

        <nav
          aria-label="漫画の話数ナビゲーション"
          className="mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-xs tracking-[0.16em]"
        >
          {previous ? (
            <a
              href={withBasePath(`/comic/${String(previous.number).padStart(3, "0")}/`)}
              className="rounded-full border border-white/20 px-4 py-3 text-center text-white/75 transition hover:border-mist/70 hover:text-white"
            >
              ← 前の話
            </a>
          ) : (
            <span />
          )}
          <a
            href={withBasePath("/")}
            className="text-center text-white/50 transition hover:text-white"
          >
            一覧へ
          </a>
          {next ? (
            <a
              href={withBasePath(`/comic/${String(next.number).padStart(3, "0")}/`)}
              className="rounded-full border border-white/20 px-4 py-3 text-center text-white/75 transition hover:border-mist/70 hover:text-white"
            >
              次の話 →
            </a>
          ) : (
            <span />
          )}
        </nav>

        <div className="mt-10 flex justify-center">
          <a
            href={X_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-white/40 px-5 py-3 text-xs tracking-[0.16em] text-white/75 transition hover:border-[#89cfff] hover:bg-[#89cfff]/10 hover:text-white"
          >
            公式Xをフォロー
          </a>
        </div>
      </article>
    </main>
  );
}
