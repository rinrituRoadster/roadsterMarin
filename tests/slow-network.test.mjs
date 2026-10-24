import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const comicsDir = path.join(projectRoot, "out", "comics");
const basePath = "/roadsterMarin";
const chunkSize = 32 * 1024;
const chunkDelayMs = 30;

let server;
let serverUrl;
let firstFailure = true;

before(async () => {
  server = createServer(async (request, response) => {
    const requestUrl = new URL(request.url ?? "/", "http://localhost");
    const fileName = path.basename(requestUrl.pathname);

    if (!requestUrl.pathname.startsWith(`${basePath}/comics/`)) {
      response.writeHead(404).end();
      return;
    }

    // Simulate a transient network failure for the first request only.
    if (
      fileName === "18-comic.PNG" &&
      requestUrl.searchParams.get("failure") === "1" &&
      !requestUrl.searchParams.has("retry") &&
      firstFailure
    ) {
      firstFailure = false;
      await new Promise((resolve) => setTimeout(resolve, 250));
      response.writeHead(503).end();
      return;
    }

    try {
      const body = await readFile(path.join(comicsDir, fileName));
      response.writeHead(200, { "Content-Type": "image/png" });

      for (let offset = 0; offset < body.length; offset += chunkSize) {
        response.write(body.subarray(offset, offset + chunkSize));
        await new Promise((resolve) => setTimeout(resolve, chunkDelayMs));
      }

      response.end();
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

function imageUrl(fileName, query = "") {
  return `${serverUrl}${basePath}/comics/${fileName}${query}`;
}

test("低速配信でも17〜20話の画像を最後まで取得できる", async () => {
  for (const fileName of ["17.png", "18-comic.PNG", "19-comic.PNG", "20.PNG"]) {
    const response = await fetch(imageUrl(fileName), {
      signal: AbortSignal.timeout(15000)
    });

    assert.equal(response.status, 200, `${fileName} がHTTP ${response.status}`);
    assert.ok((await response.arrayBuffer()).byteLength > 0, `${fileName} が空です`);
  }
});

test("一度失敗した画像はretryパラメータ付きURLで再取得できる", async () => {
  const firstResponse = await fetch(imageUrl("18-comic.PNG", "?failure=1"), {
    signal: AbortSignal.timeout(15000)
  });
  assert.equal(firstResponse.status, 503);

  const retryUrl = imageUrl(
    "18-comic.PNG",
    "?failure=1&retry=slow-network-test"
  );
  const retryResponse = await fetch(retryUrl, {
    signal: AbortSignal.timeout(15000)
  });

  assert.equal(retryResponse.status, 200);
  assert.ok((await retryResponse.arrayBuffer()).byteLength > 0);
});
