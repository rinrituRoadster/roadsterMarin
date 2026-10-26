import { HomePage } from "@/components/home-page";
import { getComicEntries } from "@/lib/comics";
import { getHeroImages } from "@/lib/hero-images";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "ComicSeries",
  name: "中古車呪縛霊まりんちゃん",
  url: "https://rinrituroadster.github.io/roadsterMarin/",
  description:
    "中古車と海沿いの夜風をテーマにした、無料で読めるノスタルジックロードコメディ4コマ漫画。",
  inLanguage: "ja",
  genre: ["4コマ漫画", "無料漫画", "ロードスター漫画"],
  creator: {
    "@type": "Person",
    name: "@roadsterMarin"
  }
};

export default function Page() {
  const comics = getComicEntries();
  const heroImages = getHeroImages();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <HomePage comics={comics} heroImages={heroImages} />
    </>
  );
}
