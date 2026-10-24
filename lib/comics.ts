import { readdirSync } from "fs";
import { statSync } from "fs";
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
    .filter((fileName) => /^\d+\.webp$/.test(fileName))
    .map((fileName) => {
      const match = fileName.match(/^(\d+)/);
      const number = match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
      const filePath = path.join(comicsDir, fileName);
      const fileStats = statSync(filePath);
      const version = `${fileStats.size}-${Math.trunc(fileStats.mtimeMs)}`;

      return {
        id: `comic-${fileName.toLowerCase()}`,
        src: withBasePath(`/comics/${fileName}?v=${version}`),
        alt: `Comic ${String(number).padStart(2, "0")}`,
        number,
        fileName
      };
    })
    .sort(
      (left, right) =>
        left.number - right.number || left.fileName.localeCompare(right.fileName)
    )
    .map(({ fileName: _fileName, ...comic }) => comic);
}
