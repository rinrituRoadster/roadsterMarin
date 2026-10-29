import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createServer } from "node:http";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { after, before, test } from "node:test";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(projectRoot, "out");
const docsDir = path.join(projectRoot, "docs");
const publicComicsDir = path.join(projectRoot, "public", "comics");
const publicImagesDir = path.join(projectRoot, "public", "images");
const basePath = "/roadsterMarin";
const execFileAsync = promisify(execFile);

let server;
let serverUrl;

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".webp": "image/webp"
};

before(async () => {
  server = createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url ?? "/", "http://localhost");
      let relativePath = requestUrl.pathname;

      if (relativePath === basePath || relativePath === `${basePath}/`) {
        relativePath = "/index.html";
      } else if (relativePath.startsWith(`${basePath}/`)) {
        relativePath = relativePath.slice(basePath.length);
      } else {
        response.writeHead(404).end();
        return;
      }

      const filePath = path.resolve(outDir, `.${relativePath}`);
      if (!filePath.startsWith(`${outDir}${path.sep}`)) {
        response.writeHead(403).end();
        return;
      }

      const body = await readFile(filePath);
      const extension = path.extname(filePath).toLowerCase();
      response.writeHead(200, {
        "Content-Type": contentTypes[extension] ?? "application/octet-stream",
        "Cache-Control": "no-store"
      });
      response.end(body);
    } catch {
      response.writeHead(404).end();
    }
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  serverUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
});

async function requestComic(fileName) {
  return fetch(
    `${serverUrl}${basePath}/comics/${encodeURIComponent(fileName)}`
  );
}

test("17〜20話の画像が静的サイトから取得できる", async () => {
  for (const fileName of ["17.webp", "18.webp", "19.webp", "20.webp"]) {
    const response = await requestComic(fileName);
    assert.equal(response.status, 200, `${fileName} がHTTP ${response.status}`);
    assert.match(
      response.headers.get("content-type") ?? "",
      /^image\//,
      `${fileName} のContent-Typeが画像ではありません`
    );
    assert.ok((await response.arrayBuffer()).byteLength > 0, `${fileName} が空です`);
  }
});

test("公開用docsも17〜20話を正しい大文字小文字で保持している", async () => {
  for (const fileName of ["17.webp", "18.webp", "19.webp", "20.webp"]) {
    const filePath = path.join(docsDir, "comics", fileName);
    const body = await readFile(filePath);
    assert.ok(body.byteLength > 0, `docs/${fileName} が空です`);
  }
});

test("public/comicsの全画像がout/comicsに存在し、取得できる", async () => {
  const fileNames = (await readdir(publicComicsDir)).filter((fileName) =>
    /^\d+\.webp$/.test(fileName)
  );

  for (const fileName of fileNames) {
    const response = await requestComic(fileName);
    assert.equal(response.status, 200, `${fileName} が静的出力から取得できません`);
  }
});

test("漫画ファイル名が数字.webpに統一されている", async () => {
  const fileNames = await readdir(publicComicsDir);

  assert.ok(fileNames.length > 0, "漫画ファイルがありません");
  assert.ok(
    fileNames.every((fileName) => /^\d+\.webp$/.test(fileName)),
    `数字.webp以外のファイルがあります: ${fileNames.join(", ")}`
  );
});

test("Git管理下の漫画ファイル名も数字.webpに統一されている", async () => {
  for (const directory of ["public/comics", "docs/comics"]) {
    const { stdout } = await execFileAsync("git", ["ls-files", directory], {
      cwd: projectRoot
    });
    const fileNames = stdout.trim().split(/\r?\n/).filter(Boolean);

    assert.ok(fileNames.length > 0, `Git管理下に${directory}の漫画がありません`);
    assert.ok(
      fileNames.every((filePath) =>
        new RegExp(`^${directory.replace("/", "\\/")}\\/\\d+\\.webp$`).test(filePath)
      ),
      `Git管理下の${directory}に数字.webp以外のファイルがあります: ${fileNames.join(", ")}`
    );
  }
});

test("漫画URLにキャッシュ更新用バージョンが付いている", async () => {
  const html = await readFile(path.join(outDir, "index.html"), "utf8");

  for (const fileName of ["17.webp", "18.webp", "19.webp", "20.webp"]) {
    assert.match(
      html,
      new RegExp(`comics/${fileName.replace(".", "\\.")}\\?v=[^\\s"\\\\]+`),
      `${fileName} にバージョン情報がありません`
    );
  }
});

test("public/images直下の画像がWebPに統一されている", async () => {
  const fileNames = await readdir(publicImagesDir);
  const directImageNames = fileNames.filter((fileName) => fileName.endsWith(".webp"));

  assert.ok(directImageNames.length > 0, "public/images直下に画像がありません");
  assert.ok(
    fileNames.every(
      (fileName) => fileName === "profile" || fileName === "line-stamp" || fileName.endsWith(".webp")
    ),
    `WebP以外の画像があります: ${fileNames.join(", ")}`
  );
});

test("検索エンジン向けのrobots.txtとsitemap.xmlが生成されている", async () => {
  const robots = await readFile(path.join(outDir, "robots.txt"), "utf8");
  const sitemap = await readFile(path.join(outDir, "sitemap.xml"), "utf8");

  assert.match(robots, /User-agent: \*/);
  assert.match(
    robots,
    /Sitemap: https:\/\/rinrituroadster\.github\.io\/roadsterMarin\/sitemap\.xml/
  );
  assert.match(
    sitemap,
    /<loc>https:\/\/rinrituroadster\.github\.io\/roadsterMarin\/<\/loc>/
  );
});

test("検索向けmetadataと構造化データがHTMLに含まれている", async () => {
  const html = await readFile(path.join(outDir, "index.html"), "utf8");

  assert.match(
    html,
    /<link rel="canonical" href="https:\/\/rinrituroadster\.github\.io\/roadsterMarin\/"/i
  );
  assert.match(html, /property="og:title"/i);
  assert.match(html, /property="og:image"/i);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /中古車呪縛霊まりんちゃん/);
});

test("各話ページが静的生成され、画像と前後リンクを含んでいる", async () => {
  const first = await readFile(path.join(outDir, "comic", "001", "index.html"), "utf8");
  const second = await readFile(path.join(outDir, "comic", "002", "index.html"), "utf8");

  assert.match(first, /第1話/);
  assert.match(first, /comics\/1\.webp\?v=/);
  assert.match(first, /\/roadsterMarin\/comic\/002\//);
  assert.doesNotMatch(first, /\/roadsterMarin\/comic\/000\//);
  assert.match(second, /\/roadsterMarin\/comic\/001\//);
  assert.match(second, /\/roadsterMarin\/comic\/003\//);
});

test("sitemapにトップページと全話のURLが含まれている", async () => {
  const sitemap = await readFile(path.join(outDir, "sitemap.xml"), "utf8");
  const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);

  assert.equal(locations[0], "https://rinrituroadster.github.io/roadsterMarin/");
  assert.ok(locations.includes("https://rinrituroadster.github.io/roadsterMarin/comic/001/"));
  assert.ok(locations.includes("https://rinrituroadster.github.io/roadsterMarin/comic/062/"));
  const comicFiles = (await readdir(publicComicsDir)).filter((fileName) =>
    /^\d+\.webp$/.test(fileName)
  );
  assert.equal(locations.length, comicFiles.length + 1);
});

test("プロフィールとLINEスタンプの導線がトップページに含まれている", async () => {
  const html = await readFile(path.join(outDir, "index.html"), "utf8");

  for (const asset of [
    "images/profile/1-marin.webp",
    "images/profile/1-owner.webp",
    "images/line-stamp/1.webp",
    "images/line-stamp/4.webp"
  ]) {
    assert.match(html, new RegExp(asset.replace(/[.]/g, "\\.")), `${asset} が見つかりません`);
  }
});
