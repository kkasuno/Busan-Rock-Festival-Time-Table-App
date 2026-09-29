import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../cloudflare-upload/", import.meta.url));
const port = Number(process.argv[2] || process.env.DIAGNOSTIC_PORT || 4197);
const mime = { ".html": "text/html; charset=utf-8", ".js": "application/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".webp": "image/webp", ".svg": "image/svg+xml" };
let mode = "online";
const diagnostic = `<!doctype html><meta charset="utf-8"><title>Offline cache diagnostic</title>
<h1>Cloudflare recovery test</h1>
<button id="legacy">Install legacy worker and test record</button>
<button id="probe">Inspect cache and saved record</button>
<button data-mode="offline">Simulate server unavailable</button>
<button data-mode="rollback">Simulate rollback</button>
<button data-mode="online">Restore server</button>
<a href="/repair">Open recovery page</a>
<a href="/">Open app</a><pre id="result"></pre>
<script>
const output = document.querySelector('#result');
const log = value => output.textContent += JSON.stringify(value, null, 2) + '\\n';
document.querySelector('#legacy').onclick = async () => {
 try {
  localStorage.setItem('offline-diagnostic-sentinel', 'keep-records');
  await navigator.serviceWorker.register('/sw.js?legacy-test=1', {updateViaCache:'none'});
  const reg = await navigator.serviceWorker.ready;
  log({worker:reg.active.state,controlled:!!navigator.serviceWorker.controller});
 } catch(e) {log({error:String(e)});}
};
document.querySelector('#probe').onclick = async () => {
 log({savedRecord:localStorage.getItem('offline-diagnostic-sentinel')});
 const reg = await navigator.serviceWorker.getRegistration();
 log({active:reg?.active?.state,script:reg?.active?.scriptURL,waiting:reg?.waiting?.state,installing:reg?.installing?.state,installingScript:reg?.installing?.scriptURL});
 for (const key of await caches.keys()) {
  const c = await caches.open(key);
  for (const path of ['/', '/index.html']) {
   const r = await c.match(path);
   log({key,path,status:r?.status,redirected:r?.redirected,url:r?.url,type:r?.type});
  }
 }
};
document.querySelectorAll('[data-mode]').forEach(button => button.onclick = async () => {
 const response = await fetch('/_diagnostic/mode?value=' + button.dataset.mode, {method:'POST'});
 log(await response.json());
});
navigator.serviceWorker.addEventListener('controllerchange', () => log({controlled:!!navigator.serviceWorker.controller}));
</script>`;

createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  if (url.pathname === "/_diagnostic/mode" && req.method === "POST") {
    const requested = url.searchParams.get("value");
    if (["online", "offline", "rollback"].includes(requested)) mode = requested;
    res.writeHead(200, { "Content-Type": "application/json" }); res.end(JSON.stringify({ mode })); return;
  }
  if (url.pathname === "/_diagnostic") {
    res.writeHead(200, { "Content-Type": mime[".html"], "Cache-Control": "no-store" }); res.end(diagnostic); return;
  }
  if (mode === "offline") { res.writeHead(503); res.end("Test server unavailable"); return; }
  if (url.pathname.endsWith(".html")) {
    res.writeHead(308, { Location: url.pathname === "/index.html" ? "/" + url.search : url.pathname.slice(0, -5) + url.search }); res.end(); return;
  }
  if (url.pathname === "/" && mode === "rollback") {
    res.writeHead(200, { "Content-Type": mime[".html"], "Cache-Control": "no-store" });
    res.end('<!doctype html><title>Rollback test</title><h1>Rollback test release</h1><a href="/_diagnostic">Diagnostics</a>'); return;
  }
  if (url.pathname === "/sw.js" && url.searchParams.has("legacy-test")) {
    const source = await readFile(resolve(root, "sw.js"), "utf8");
    const config = JSON.parse(source.split("\n")[0].slice("self.FESTIVAL_OFFLINE = ".length, -1));
    const worker = `const CACHE = "busan-offline-legacy-repro";
const ASSETS = ${JSON.stringify(["/", "/index.html", ...config.assets])};
self.addEventListener("install", e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS))));
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", e => {
 const url = new URL(e.request.url);
 if (url.origin !== self.location.origin || e.request.method !== "GET") return;
 if (e.request.mode === "navigate" && (url.pathname === "/" || url.pathname === "/index.html")) e.respondWith(caches.open(CACHE).then(c => c.match("/index.html")));
 else if (ASSETS.includes(url.pathname)) e.respondWith(caches.open(CACHE).then(c => c.match(url.pathname)).then(r => r || fetch(e.request)));
});`;
    res.writeHead(200, { "Content-Type": mime[".js"], "Cache-Control": "no-store" }); res.end(worker); return;
  }
  let pathname = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  if (!extname(pathname)) pathname += ".html";
  const path = resolve(root, "." + pathname);
  if (!path.startsWith(resolve(root) + sep)) { res.writeHead(403); res.end(); return; }
  try {
    const body = await readFile(path);
    res.writeHead(200, { "Content-Type": mime[extname(path)] || "application/octet-stream", "Cache-Control": "no-store" }); res.end(body);
  } catch { res.writeHead(404); res.end("Not found"); }
}).listen(port, "127.0.0.1", () => console.log(`Diagnostic only: http://127.0.0.1:${port}/_diagnostic`));
