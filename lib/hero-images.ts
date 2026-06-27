import { readdirSync } from "fs";
import path from "path";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

const withBasePath = (value: string) =>
  `${BASE_PATH}${value.startsWith("/") ? value : `/${value}`}`;

export function getHeroImages(): string[] {
  const imagesDir = path.join(process.cwd(), "public", "images");

  return readdirSync(imagesDir)
    .filter((fileName) => /^hero\d+\.(png|jpg|jpeg|webp)$/i.test(fileName))
    .sort((left, right) => {
      const leftNumber = Number(left.match(/^hero(\d+)/i)?.[1] ?? Number.MAX_SAFE_INTEGER);
      const rightNumber = Number(right.match(/^hero(\d+)/i)?.[1] ?? Number.MAX_SAFE_INTEGER);

      return leftNumber - rightNumber;
    })
    .map((fileName) => withBasePath(`/images/${fileName}`));
}
