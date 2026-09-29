import { readFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

// Extract the supplied poster photographs, without generating or retouching food.
const sources = JSON.parse(await readFile(new URL("./food-photo-crops.json", import.meta.url), "utf8"));
const sourceDir = process.argv[2] || process.env.TEMP;
if (!sourceDir) throw new Error("Provide the folder containing the supplied clipboard PNGs.");
const destination = new URL("../public/food/", import.meta.url);
await mkdir(destination, { recursive: true });
let bytes = 0;
for (const { source, items } of sources) {
  for (const [id, left, top, width, height] of items) {
    const result = await sharp(join(sourceDir, `codex-clipboard-${source}.png`))
      .extract({ left, top, width, height }).webp({ quality: 84 })
      .toFile(fileURLToPath(new URL(`${id}.webp`, destination)));
    bytes += result.size;
  }
}
console.log(`Extracted ${sources.flatMap(s => s.items).length} images, ${(bytes / 1024).toFixed(1)} KiB total.`);
