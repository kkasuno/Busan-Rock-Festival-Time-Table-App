import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const target = { hostname: "localhost", port: 4001 };
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assets = path.join(root, "dist", "client", "assets");
const contentTypes = { ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };

http.createServer(async (request, response) => {
  if (request.url?.startsWith("/assets/")) {
    try {
      const fileName = path.basename(new URL(request.url, "http://local").pathname);
      const filePath = path.join(assets, fileName);
      const body = await readFile(filePath);
      response.writeHead(200, { "content-type": contentTypes[path.extname(fileName)] ?? "application/octet-stream" });
      response.end(body);
    } catch {
      response.writeHead(404);
      response.end();
    }
    return;
  }

  const proxyRequest = http.request({
    ...target,
    path: request.url,
    method: request.method,
    headers: { ...request.headers, host: "localhost:3000" },
  }, (proxyResponse) => {
    response.writeHead(proxyResponse.statusCode ?? 502, proxyResponse.headers);
    proxyResponse.pipe(response);
  });

  proxyRequest.on("error", () => {
    response.writeHead(502, { "content-type": "text/plain; charset=utf-8" });
    response.end("Local development server is unavailable.");
  });
  request.pipe(proxyRequest);
}).listen(4174, "0.0.0.0", () => {
  console.log("Mobile preview: http://0.0.0.0:4174");
});
