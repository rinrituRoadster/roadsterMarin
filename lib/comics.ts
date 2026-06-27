import { readdirSync } from "fs";
import path from "path";

export type ComicEntry = {
  id: string;
  src: string;
  alt: string;
  number: number;
};

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

const withBasePath = (value: string) =>
  `${BASE_PATH}${value.startsWith("/") ? value : `/${value}`}`;

export function getComicEntries(): ComicEntry[] {
  const comicsDir = path.join(process.cwd(), "public", "comics");

  return readdirSync(comicsDir)
    .filter((fileName) => /\.(png|jpg|jpeg|webp)$/i.test(fileName))
    .map((fileName) => {
      const match = fileName.match(/^(\d+)/);
      const number = match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;

      return {
        id: `comic-${fileName.toLowerCase()}`,
        src: withBasePath(`/comics/${fileName}`),
        alt: `Comic ${String(number).padStart(2, "0")}`,
        number
      };
    })
    .sort((left, right) => left.number - right.number);
}
