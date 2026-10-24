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
const basePath = "/roadsterMarin";
const execFileAsync = promisify(execFile);

let server;
let serverUrl;

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png"
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
  for (const fileName of ["17.PNG", "18.PNG", "19.PNG", "20.PNG"]) {
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
  for (const fileName of ["17.PNG", "18.PNG", "19.PNG", "20.PNG"]) {
    const filePath = path.join(docsDir, "comics", fileName);
    const body = await readFile(filePath);
    assert.ok(body.byteLength > 0, `docs/${fileName} が空です`);
  }
});

test("public/comicsの全画像がout/comicsに存在し、取得できる", async () => {
  const fileNames = (await readdir(publicComicsDir)).filter((fileName) =>
    /^\d+\.PNG$/.test(fileName)
  );

  for (const fileName of fileNames) {
    const response = await requestComic(fileName);
    assert.equal(response.status, 200, `${fileName} が静的出力から取得できません`);
  }
});

test("漫画ファイル名が数字.PNGに統一されている", async () => {
  const fileNames = await readdir(publicComicsDir);

  assert.ok(fileNames.length > 0, "漫画ファイルがありません");
  assert.ok(
    fileNames.every((fileName) => /^\d+\.PNG$/.test(fileName)),
    `数字.PNG以外のファイルがあります: ${fileNames.join(", ")}`
  );
});

test("Git管理下の漫画ファイル名も数字.PNGに統一されている", async () => {
  for (const directory of ["public/comics", "docs/comics"]) {
    const { stdout } = await execFileAsync("git", ["ls-files", directory], {
      cwd: projectRoot
    });
    const fileNames = stdout.trim().split(/\r?\n/).filter(Boolean);

    assert.ok(fileNames.length > 0, `Git管理下に${directory}の漫画がありません`);
    assert.ok(
      fileNames.every((filePath) =>
        new RegExp(`^${directory.replace("/", "\\/")}\\/\\d+\\.PNG$`).test(filePath)
      ),
      `Git管理下の${directory}に数字.PNG以外のファイルがあります: ${fileNames.join(", ")}`
    );
  }
});

test("漫画URLにキャッシュ更新用バージョンが付いている", async () => {
  const html = await readFile(path.join(outDir, "index.html"), "utf8");

  for (const fileName of ["17.PNG", "18.PNG", "19.PNG", "20.PNG"]) {
    assert.match(
      html,
      new RegExp(`comics/${fileName.replace(".", "\\.")}\\?v=[^\\s"\\\\]+`),
      `${fileName} にバージョン情報がありません`
    );
  }
});
