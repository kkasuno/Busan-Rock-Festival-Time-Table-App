import { defineConfig, mergeConfig, type Plugin } from "vite";
import { readFile, writeFile } from "node:fs/promises";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { parsePlacement } from "./app/map-overlay";
import upload from "./vite.upload.config";

// Only this loopback dev server exposes saving. Nothing here is in the public build.
function localEditor(): Plugin {
  const token = randomBytes(32).toString("hex");
  const file = new URL("./app/map-overlay-config.json", import.meta.url);
  return { name: "local-map-editor", apply: "serve", configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      // Retire only this localhost app's old worker, which would otherwise serve a stale editor/app.
      if (req.url === "/sw.js") {
        res.setHeader("Content-Type", "application/javascript");
        res.setHeader("Cache-Control", "no-store");
        res.end(`self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil((async()=>{await self.clients.claim();await self.registration.unregister();const clients=await self.clients.matchAll({type:'window'});for(const client of clients)if('navigate' in client)await client.navigate(client.url);})()));`);
        return;
      }
      if (!req.url?.startsWith("/__map-editor/")) return next();
      const host = req.headers.host || "";
      const local = ["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(req.socket.remoteAddress || "");
      if (!local || !["localhost:4180", "127.0.0.1:4180", "[::1]:4180"].includes(host) ||
          req.headers["sec-fetch-site"] === "cross-site") { res.statusCode = 403; res.end(); return; }
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");
      try {
        if (req.url !== "/__map-editor/config") { res.statusCode = 404; res.end(); return; }
        if (req.method === "GET") {
          res.end(JSON.stringify({ token, placement: parsePlacement(JSON.parse(await readFile(file, "utf8"))) })); return;
        }
        const supplied = Buffer.from(String(req.headers["x-editor-token"] || ""));
        if (req.method !== "POST" || req.headers.origin !== `http://${host}` ||
            supplied.length !== token.length || !timingSafeEqual(supplied, Buffer.from(token))) {
          res.statusCode = 403; res.end(JSON.stringify({ error: "로컬 편집기에서 다시 열어주세요." })); return;
        }
        const chunks: Buffer[] = []; let size = 0;
        for await (const chunk of req) {
          size += chunk.length;
          if (size > 4096) { res.statusCode = 413; res.end(); return; }
          chunks.push(Buffer.from(chunk));
        }
        const placement = parsePlacement(JSON.parse(Buffer.concat(chunks).toString("utf8")));
        await writeFile(file, JSON.stringify(placement, null, 2) + "\n", "utf8");
        res.end(JSON.stringify({ saved: true }));
      } catch (error) { res.statusCode = 400; res.end(JSON.stringify({ error: error instanceof Error ? error.message : "저장 실패" })); }
    });
  } };
}

export default mergeConfig(upload, defineConfig({
  server: { host: "localhost", port: 4180, strictPort: true, cors: false },
  plugins: [localEditor()],
}));
