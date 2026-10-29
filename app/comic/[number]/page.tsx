import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EpisodePage } from "@/components/episode-page";
import { getComicEntries } from "@/lib/comics";
import { getEpisodeContent } from "@/lib/episode-content";
import { SITE_URL } from "@/lib/site";

type EpisodeRouteProps = {
  params: Promise<{ number: string }>;
};

function getEpisode(numberParam: string) {
  if (!/^\d{3}$/.test(numberParam)) {
    return null;
  }

  const number = Number(numberParam);
  const comics = getComicEntries();
  const index = comics.findIndex((comic) => comic.number === number);

  if (index === -1) {
    return null;
  }

  return {
    comic: comics[index],
    previous: comics[index - 1] ?? null,
    next: comics[index + 1] ?? null,
    content: getEpisodeContent(number)
  };
}

export function generateStaticParams() {
  return getComicEntries().map((comic) => ({
    number: String(comic.number).padStart(3, "0")
  }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: EpisodeRouteProps): Promise<Metadata> {
  const { number: numberParam } = await params;
  const episode = getEpisode(numberParam);

  if (!episode) {
    return {};
  }

  const canonical = `${SITE_URL}/comic/${numberParam}/`;
  const { comic, content } = episode;

  return {
    title: `${content.title}｜中古車呪縛霊まりんちゃん`,
    description: content.description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      url: canonical,
      title: `${content.title}｜中古車呪縛霊まりんちゃん`,
      description: content.description,
      images: [
        {
          url: `${SITE_URL}/comics/${comic.fileName}`,
          alt: comic.alt
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: `${content.title}｜中古車呪縛霊まりんちゃん`,
      description: content.description,
      images: [`${SITE_URL}/comics/${comic.fileName}`]
    }
  };
}

export default async function ComicEpisodeRoute({ params }: EpisodeRouteProps) {
  const { number: numberParam } = await params;
  const episode = getEpisode(numberParam);

  if (!episode) {
    notFound();
  }

  return <EpisodePage {...episode} />;
}
