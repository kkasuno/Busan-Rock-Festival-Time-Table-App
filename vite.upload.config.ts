import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { createOfflineWorker } from "./scripts/offline-worker.mjs";

export default defineConfig({
  root: fileURLToPath(new URL("./web-upload", import.meta.url)),
  publicDir: fileURLToPath(new URL("./public", import.meta.url)),
  plugins: [react(), {
    name: "festival-offline",
    generateBundle: { order: "post", handler(_options, bundle) {
      const updated = new Date().toISOString();
      const html = bundle["index.html"];
      if (!html || html.type !== "asset") throw new Error("Offline build requires the final index.html");
      const version = createHash("sha256").update(JSON.stringify(bundle) + updated).digest("hex").slice(0, 16);
      const shell = `/offline-shell-${version}.html`;
      const foodPhotos = readdirSync(new URL("./public/food/", import.meta.url)).filter(name => name.endsWith(".webp")).sort().map(name => `/food/${name}`);
      const assets = ["/offline-version.json", "/festival-map-2026.png", "/festival-map-reference.png", "/badge-stickers.png", "/favicon.svg", ...foodPhotos, ...Object.keys(bundle).filter(name => name.startsWith("assets/")).map(name => "/" + name)];
      this.emitFile({ type: "asset", fileName: "offline-version.json", source: JSON.stringify({ updated }) });
      this.emitFile({ type: "asset", fileName: shell.slice(1), source: html.source });
      this.emitFile({ type: "asset", fileName: "sw.js", source: createOfflineWorker({ cacheName: `busan-offline-v2-${version}`, assets, shell, shellHash: createHash("sha256").update(html.source).digest("hex") }) });
      this.emitFile({ type: "asset", fileName: "repair.html", source: readFileSync(new URL("./scripts/offline-repair.html", import.meta.url), "utf8").replace("__BUILD_VERSION__", version) });
    } },
  }],
  build: {
    outDir: fileURLToPath(new URL("./cloudflare-upload", import.meta.url)),
    emptyOutDir: true,
  },
});
