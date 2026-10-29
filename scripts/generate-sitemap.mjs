import { readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const siteUrl = "https://rinrituroadster.github.io/roadsterMarin";
const comicsDirectory = path.join(process.cwd(), "public", "comics");
const episodeNumbers = readdirSync(comicsDirectory)
  .filter((fileName) => /^\d+\.webp$/.test(fileName))
  .map((fileName) => Number(fileName.slice(0, -5)))
  .sort((a, b) => a - b);

const urls = [
  `${siteUrl}/`,
  ...episodeNumbers.map((number) => `${siteUrl}/comic/${String(number).padStart(3, "0")}/`)
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${url}</loc></url>`).join("\n")}
</urlset>
`;

writeFileSync(path.join(process.cwd(), "public", "sitemap.xml"), xml);
