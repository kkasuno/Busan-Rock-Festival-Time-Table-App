import { readFileSync, existsSync } from "node:fs";
import { webcrypto } from "node:crypto";
import vm from "node:vm";
import assert from "node:assert/strict";
import { test } from "node:test";
import { createOfflineWorker } from "../scripts/offline-worker.mjs";

const root = new URL("../cloudflare-upload/", import.meta.url);
const source = readFileSync(new URL("sw.js", root), "utf8");
const config = JSON.parse(source.split("\n")[0].slice("self.FESTIVAL_OFFLINE = ".length, -1));
const types = { html: "text/html", js: "application/javascript", css: "text/css", json: "application/json", png: "image/png", webp: "image/webp", svg: "image/svg+xml" };
const html = body => new Response(body, { headers: { "Content-Type": "text/html" } });
const keyOf = input => new URL(typeof input === "string" ? input : input.url, "https://festival.test").pathname;

function harness(options = {}) {
  const handlers = {}, stores = new Map(), requests = [];
  let claimed = false, skipped = false;
  const state = { online: true, fetchOverride: null, failWrites: false, onPut: null };
  const cacheAPI = {
    async open(name) {
      if (!stores.has(name)) stores.set(name, new Map());
      const entries = stores.get(name);
      return {
        async put(path, response) { if (state.failWrites) throw new Error("Quota exceeded"); entries.set(keyOf(path), response.clone()); state.onPut?.(); },
        async match(path) { return entries.get(keyOf(path))?.clone(); },
      };
    },
    async keys() { return [...stores.keys()]; },
    async delete(name) { return stores.delete(name); },
  };
  const context = {
    URL, Response, Headers, AbortController, crypto: webcrypto, setTimeout, clearTimeout, Uint8Array,
    self: { location: { origin: "https://festival.test" }, clients: { async claim() { claimed = true; } }, async skipWaiting() { skipped = true; }, addEventListener(name, fn) { handlers[name] = fn; } },
    caches: cacheAPI,
    async fetch(input, init) {
      requests.push({ url: typeof input === "string" ? input : input.url, init });
      if (!state.online) throw new Error("Network unavailable");
      if (state.fetchOverride) {
        const response = await state.fetchOverride(input, init);
        if (response) return response;
      }
      const path = keyOf(input);
      const file = new URL(path === "/" ? "index.html" : path.slice(1), root);
      assert.ok(existsSync(file), path);
      return new Response(readFileSync(file), { headers: { "Content-Type": types[file.pathname.split(".").pop()] } });
    },
  };
  vm.runInNewContext(Object.keys(options).length ? createOfflineWorker({ ...config, ...options }) : source, context);
  async function lifecycle(name) { let pending; handlers[name]({ waitUntil(promise) { pending = promise; } }); await pending; }
  function request(path = "/", mode = "navigate", method = "GET") {
    let pending;
    handlers.fetch({ request: { url: new URL(path, context.self.location.origin).href, mode, method }, respondWith(promise) { pending = promise; } });
    return pending;
  }
  return { state, stores, cacheAPI, requests, lifecycle, request, get claimed() { return claimed; }, get skipped() { return skipped; } };
}

test("precache a version-paired canonical document, never the live redirected index", async () => {
  const h = harness();
  await h.lifecycle("install"); await h.lifecycle("activate");
  assert.equal(h.skipped, true); assert.equal(h.claimed, true);
  const cache = h.stores.get(config.cacheName);
  assert.ok(cache.has("/")); assert.equal(cache.has("/index.html"), false);
  assert.equal(cache.get("/").redirected, false);
  assert.equal(await cache.get("/").clone().text(), readFileSync(new URL("index.html", root), "utf8"));
  assert.ok(cache.has("/festival-map-2026.png")); assert.ok(cache.has("/festival-map-reference.png"));
  assert.ok([...cache.keys()].some(p => p.includes("leaflet")));
  assert.equal(h.requests.some(r => ["/", "/index.html"].includes(keyOf(r.url))), false);
});

test("normalize followed redirects before returning a navigation response", async () => {
  const h = harness();
  h.state.fetchOverride = () => {
    const response = html("<h1>Current release</h1>");
    Object.defineProperty(response, "redirected", { value: true });
    return response;
  };
  const response = await h.request("/index.html?picks=abc");
  assert.equal(response.redirected, false);
  assert.equal(await response.text(), "<h1>Current release</h1>");
  assert.equal(h.requests[0].url, "https://festival.test/?picks=abc");
  assert.equal(h.requests[0].init.cache, "no-store");
});

test("offline startup and server 503 return a non-redirected cached document", async () => {
  const h = harness(); await h.lifecycle("install");
  for (const fail of ["offline", "503"]) {
    h.state.online = fail !== "offline";
    h.state.fetchOverride = () => new Response("Unavailable", { status: 503 });
    const response = await h.request("/?picks=abc");
    assert.equal(response.status, 200); assert.equal(response.redirected, false);
    assert.match(await response.text(), /<div id="root">/);
  }
});

test("slow connections time out to the offline shell", async () => {
  const h = harness({ timeout: 10 }); await h.lifecycle("install");
  h.state.fetchOverride = () => new Promise(() => {});
  const response = await h.request();
  assert.equal(response.status, 200); assert.equal(h.requests.at(-1).init.signal.aborted, true);
});

test("vendor photographs are available offline with the prepared release", async () => {
  const h = harness(); await h.lifecycle("install"); h.state.online = false;
  const photos = config.assets.filter(path => path.startsWith("/food/"));
  assert.equal(photos.length, 25);
  for (const path of photos) {
    const response = await h.request(path, "no-cors");
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-type"), "image/webp");
  }
});

test("online upgrade or rollback uses server HTML without poisoning the offline release", async () => {
  const h = harness(); await h.lifecycle("install");
  const original = await (await h.cacheAPI.open(config.cacheName)).match("/").then(r => r.text());
  h.state.fetchOverride = () => html("<h1>Rolled back release</h1>");
  assert.equal(await (await h.request()).text(), "<h1>Rolled back release</h1>");
  h.state.online = false;
  assert.equal(await (await h.request()).text(), original);
});

test("do not activate when a missing JS asset is replaced by SPA fallback HTML", async () => {
  const h = harness();
  h.state.fetchOverride = input => keyOf(input).endsWith(".js") ? html("<html>fallback</html>") : null;
  await assert.rejects(h.lifecycle("install"), /Invalid offline asset/);
  assert.equal(h.skipped, false);
});

test("reject a stale or rolled-back HTML document at the versioned shell URL", async () => {
  const h = harness();
  h.state.fetchOverride = input => keyOf(input) === config.shell ? html("<html>wrong release</html>") : null;
  await assert.rejects(h.lifecycle("install"), /version mismatch/);
  assert.equal(h.skipped, false);
});

test("quota failure leaves the previous worker/cache intact", async () => {
  const h = harness(); await h.cacheAPI.open("busan-offline-old");
  h.state.failWrites = true;
  await assert.rejects(h.lifecycle("install"), /Quota exceeded/);
  assert.equal(h.skipped, false);
  assert.equal(h.stores.has(config.cacheName), false);
  assert.equal(h.stores.has("busan-offline-old"), true);
});

test("same-version recovery preserves its valid cache even if subsequent storage writes would fail", async () => {
  const h = harness(); await h.lifecycle("install");
  const requests = h.requests.length;
  h.state.failWrites = true; h.state.online = false;
  await h.lifecycle("install");
  assert.equal(h.requests.length, requests);
  assert.ok(h.stores.has(config.cacheName));
  assert.equal((await h.request()).status, 200);
});

test("consume completed asset responses before waiting for all connection slots", { timeout: 1000 }, async () => {
  const h = harness();
  let release;
  const consumed = new Promise(resolve => { release = resolve; });
  h.state.onPut = release;
  h.state.fetchOverride = async input => { if (keyOf(input) === config.shell) await consumed; return null; };
  await h.lifecycle("install");
  assert.equal(h.skipped, true);
});

test("activation retains two previous asset caches and unrelated storage", async () => {
  const h = harness();
  for (const name of ["other-site-cache", "busan-offline-a", "busan-offline-b", "busan-offline-c"]) await h.cacheAPI.open(name);
  await h.lifecycle("install"); await h.lifecycle("activate");
  assert.equal(h.stores.has("busan-offline-a"), false);
  for (const name of ["other-site-cache", "busan-offline-b", "busan-offline-c", config.cacheName]) assert.ok(h.stores.has(name), name);
});

test("old open tabs can still import their cached hashed chunks after activation", async () => {
  const h = harness();
  const old = await h.cacheAPI.open("busan-offline-legacy");
  await old.put("/assets/previous-hash.js", new Response("export const old = true;", { headers: { "Content-Type": "application/javascript" } }));
  await h.lifecycle("install"); await h.lifecycle("activate"); h.state.online = false;
  assert.equal(await (await h.request("/assets/previous-hash.js", "cors")).text(), "export const old = true;");
});

test("do not serve HTML cached under a script URL", async () => {
  const h = harness();
  await (await h.cacheAPI.open(config.cacheName)).put("/assets/bad.js", html("fallback"));
  h.state.fetchOverride = () => new Response("export {};", { headers: { "Content-Type": "application/javascript" } });
  assert.equal(await (await h.request("/assets/bad.js", "cors")).text(), "export {};");
});

test("remote APIs, recovery, editor and writes stay outside the worker", () => {
  const h = harness();
  for (const path of ["https://firestore.googleapis.com/test", "https://dapi.kakao.com/test", "/api/private", "/map-editor.html", "/repair", "/repair.html", "/sw.js?repair=test"]) assert.equal(h.request(path), undefined, path);
  assert.equal(h.request("/", "navigate", "POST"), undefined);
});

test("empty cache plus network failure returns a usable recovery document", async () => {
  const h = harness(); h.state.online = false;
  const response = await h.request();
  assert.equal(response.status, 503); assert.equal(response.redirected, false);
  assert.match(await response.text(), /href="\/repair"/);
});

test("build includes standalone recovery and explicit worker cache headers", () => {
  const repair = readFileSync(new URL("repair.html", root), "utf8");
  assert.match(repair, /sw\.js\?repair=[a-f0-9]+/);
  assert.doesNotMatch(repair, /__BUILD_VERSION__|localStorage\.(?:clear|removeItem)|indexedDB\.deleteDatabase/);
  assert.doesNotMatch(source, /localStorage|indexedDB/);
  assert.match(readFileSync(new URL("_headers", root), "utf8"), /\/sw\.js\s+Cache-Control: no-store/);
});
