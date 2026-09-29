export function createOfflineWorker(config) {
  return `self.FESTIVAL_OFFLINE = ${JSON.stringify(config)};\n(${offlineWorker.toString()})();\n`;
}

function offlineWorker() {
  const { cacheName, assets, shell, shellHash, timeout = 4000 } = self.FESTIVAL_OFFLINE;
  const prefix = "busan-offline-";
  const origin = self.location.origin;

  function valid(response, path) {
    if (!response?.ok) return false;
    const type = response.headers.get("content-type") || "";
    if (path === "/" || path.endsWith(".html")) return type.includes("text/html");
    if (path.endsWith(".js")) return /(?:javascript|ecmascript)/i.test(type);
    if (path.endsWith(".css")) return type.includes("text/css");
    if (path.endsWith(".json")) return type.includes("application/json");
    if (/\.(png|svg|webp|jpg)$/.test(path)) return type.startsWith("image/");
    return false;
  }

  // A followed HTML redirect cannot be returned directly to a document navigation.
  function documentResponse(response) {
    const headers = new Headers(response.headers);
    headers.delete("content-encoding");
    headers.delete("content-length");
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  }

  async function digest(body) {
    return [...new Uint8Array(await crypto.subtle.digest("SHA-256", body))].map(byte => byte.toString(16).padStart(2, "0")).join("");
  }

  async function install() {
    const cache = await caches.open(cacheName);
    const existing = await Promise.all(["/", ...assets].map(path => cache.match(path)));
    if (existing.every((response, index) => valid(response, ["/", ...assets][index])) && !existing[0].redirected && await digest(await existing[0].arrayBuffer()) === shellHash) {
      await self.skipWaiting();
      return;
    }
    // Consume each response immediately so large bodies cannot stall the connection pool.
    const writes = await Promise.allSettled([...assets, shell].map(async path => {
      let response = await fetch(new URL(path, origin).href, { cache: "reload", credentials: "same-origin" });
      if (!valid(response, path)) throw new Error(`Invalid offline asset: ${path}`);
      if (path === shell) {
        const body = await response.arrayBuffer();
        const hash = await digest(body);
        if (hash !== shellHash) throw new Error("Offline document version mismatch");
        response = new Response(body, { headers: response.headers });
      }
      await cache.put(path === shell ? "/" : path, path === shell ? documentResponse(response) : response);
    }));
    const failed = writes.find(result => result.status === "rejected");
    if (failed) {
      await caches.delete(cacheName);
      throw failed.reason;
    }
    // The old worker can block the whole app, so recovery must not depend on its UI.
    await self.skipWaiting();
  }

  async function activate() {
    const previous = (await caches.keys()).filter(key => key.startsWith(prefix) && key !== cacheName);
    // Retain recent hashed chunks for tabs still running a previous release.
    await Promise.all(previous.slice(0, -2).map(key => caches.delete(key)));
    await self.clients.claim();
  }

  async function documentFromNetwork(request) {
    const controller = new AbortController();
    let timer;
    try {
      const url = new URL(request.url);
      url.pathname = "/";
      const response = await Promise.race([
        fetch(url.href, { cache: "no-store", credentials: "same-origin", redirect: "follow", signal: controller.signal }),
        new Promise((_, reject) => { timer = setTimeout(() => { controller.abort(); reject(new Error("Offline timeout")); }, timeout); }),
      ]);
      if (!valid(response, "/")) throw new Error("Document unavailable");
      return documentResponse(response);
    } catch {
      const cached = await (await caches.open(cacheName)).match("/");
      if (valid(cached, "/")) return documentResponse(cached);
      return new Response('<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>연결 확인</title><p>인터넷 연결 후 다시 열어주세요.</p><a href="/repair">연결 복구</a></html>', { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } });
    } finally { clearTimeout(timer); }
  }

  async function assetResponse(request, path) {
    const current = await (await caches.open(cacheName)).match(path);
    if (valid(current, path)) return current;
    if (path.startsWith("/assets/")) {
      const previous = (await caches.keys()).filter(key => key.startsWith(prefix) && key !== cacheName).reverse();
      for (const key of previous) {
        const cached = await (await caches.open(key)).match(path);
        if (valid(cached, path)) return cached;
      }
    }
    return fetch(request);
  }

  self.addEventListener("install", event => event.waitUntil(install()));
  self.addEventListener("activate", event => event.waitUntil(activate()));
  self.addEventListener("message", event => {
    if (event.data === "ACTIVATE_UPDATE") event.waitUntil(self.skipWaiting());
  });
  self.addEventListener("fetch", event => {
    const url = new URL(event.request.url);
    if (event.request.method !== "GET" || url.origin !== origin) return;
    if (event.request.mode === "navigate" && (url.pathname === "/" || url.pathname === "/index.html")) {
      event.respondWith(documentFromNetwork(event.request));
    } else if (assets.includes(url.pathname) || url.pathname.startsWith("/assets/")) {
      event.respondWith(assetResponse(event.request, url.pathname));
    }
  });
}
