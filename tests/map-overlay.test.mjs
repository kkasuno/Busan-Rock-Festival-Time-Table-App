import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { initialPlacement, parsePlacement, imageToWorld, guideCorners, alignLandmarks, anchorPlacement, GUIDE_WIDTH, GUIDE_HEIGHT } from "../app/map-overlay.ts";

const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-6, `${a} != ${b}`);
test("image corners preserve ratio and center across rotation", () => {
  for (const rotation of [-180, -45, 0, 27, 90, 180]) {
    const p = { ...initialPlacement, rotation };
    const center = imageToWorld(p, { x: GUIDE_WIDTH / 2, y: GUIDE_HEIGHT / 2 });
    close(center.x, p.center.x); close(center.y, p.center.y);
    const [a, b, c] = guideCorners(p);
    close(Math.hypot(b.x - a.x, b.y - a.y), p.width);
    close(Math.hypot(c.x - a.x, c.y - a.y), p.width * GUIDE_HEIGHT / GUIDE_WIDTH);
  }
});
test("two landmarks recover scale/rotation without declaring GPS accuracy", () => {
  for (const rotation of [-160, -21, 0, 84, 180]) for (const mirrorX of [true, false]) for (const mirrorY of [true, false]) {
    const p = { ...initialPlacement, width: 2400, rotation, mirrorX, mirrorY };
    const source = [{ x: 211, y: 153 }, { x: 650, y: 1105 }];
    const target = source.map(point => imageToWorld(p, point));
    const fit = alignLandmarks(source, target, p);
    close(fit.width, p.width); close(fit.center.x, p.center.x); close(fit.center.y, p.center.y);
    source.forEach((point, i) => { const actual = imageToWorld(fit, point); close(actual.x, target[i].x); close(actual.y, target[i].y); });
    assert.equal(fit.calibrated, false);
    assert.equal(fit.mirrorX, mirrorX); assert.equal(fit.mirrorY, mirrorY);
  }
  assert.throws(() => alignLandmarks([{ x: 1, y: 2 }, { x: 1, y: 2 }], [{ x: 1, y: 2 }, { x: 1, y: 2 }]));
});
test("one landmark stays fixed when rotation, size, or reflection changes", () => {
  const source = { x: 315, y: 593 }, target = { x: 949200, y: 469350 };
  for (const rotation of [0, 25, 176, 179.5, 180]) for (const mirrorX of [true, false]) {
    const p = anchorPlacement({ ...initialPlacement, width: 2300, rotation, mirrorX }, source, target);
    const actual = imageToWorld(p, source);
    close(actual.x, target.x); close(actual.y, target.y);
    assert.equal(p.calibrated, false);
  }
});
test("old configuration remains unmirrored; rotation plus reflection reverses vertical layout", () => {
  const { mirrorX, mirrorY, ...old } = initialPlacement;
  assert.equal(parsePlacement(old).mirrorX, false);
  assert.equal(parsePlacement(old).mirrorY, false);
  const a = imageToWorld({ ...initialPlacement, mirrorX: true }, { x: 200, y: 100 });
  const b = imageToWorld({ ...initialPlacement, mirrorX: true }, { x: 800, y: 1100 });
  assert.ok(a.x < b.x); assert.ok(a.y < b.y);
  assert.throws(() => parsePlacement({ ...initialPlacement, mirrorX: "false" }));
  assert.throws(() => parsePlacement({ ...initialPlacement, anchor: { image: { x: -1, y: 0 }, world: initialPlacement.center } }));
});
test("published placement pins the supplied diamond intersection", () => {
  const p = parsePlacement(JSON.parse(readFileSync(new URL("../app/map-overlay-config.json", import.meta.url), "utf8")));
  assert.ok(p.anchor);
  const actual = imageToWorld(p, p.anchor.image);
  close(actual.x, p.anchor.world.x); close(actual.y, p.anchor.world.y);
});
test("saved configuration rejects malformed, nonfinite, and unreasonable data", () => {
  for (const p of [null, {}, { ...initialPlacement, width: -4 }, { ...initialPlacement, rotation: NaN }, { ...initialPlacement, center: { x: Infinity, y: 5 } }, { ...initialPlacement, width: "1900" }, { ...initialPlacement, calibrated: "true" }]) assert.throws(() => parsePlacement(p));
  assert.deepEqual(parsePlacement({ ...initialPlacement, injected: "ignored" }), initialPlacement);
});
test("public build ships image but no editor entry, endpoint, or controls", () => {
  const root = new URL("../cloudflare-upload/", import.meta.url);
  assert.ok(existsSync(new URL("festival-map-2026.png", root)));
  assert.equal(existsSync(new URL("map-editor.html", root)), false);
  assert.equal(existsSync(new URL("map-test.html", root)), false);
  for (const file of readdirSync(new URL("assets/", root))) {
    if (!file.endsWith(".js")) continue;
    const content = readFileSync(new URL("assets/" + file, root), "utf8");
    assert.equal(content.includes("/__map-editor/"), false, file);
    assert.equal(content.includes("프로젝트에 저장"), false, file);
    assert.equal(content.includes("GPS 리버 갱신"), false, file);
  }
});
