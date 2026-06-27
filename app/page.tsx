import { HomePage } from "@/components/home-page";
import { getComicEntries } from "@/lib/comics";
import { getHeroImages } from "@/lib/hero-images";

export default function Page() {
  const comics = getComicEntries();
  const heroImages = getHeroImages();

  return <HomePage comics={comics} heroImages={heroImages} />;
}
