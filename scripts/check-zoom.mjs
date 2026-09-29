import { chromium } from "file:///C:/Users/lp_08/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import assert from "node:assert/strict";
const browser = await chromium.launch({ headless: true, channel: "msedge" });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await page.goto("http://localhost:3000");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "타임테이블", exact: true }).click();
  const shell = page.locator(".zoomable-schedule");
  const rect = await shell.boundingBox();
  const headerBefore = await page.locator(".app-header").boundingBox();
  const cdp = await page.context().newCDPSession(page);
  async function pinch(from, to) {
    const x = rect.x + rect.width / 2, y = rect.y + 140;
    const points = distance => [{ x: x-distance/2, y, id: 1 }, { x: x+distance/2, y, id: 2 }];
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: points(from) });
    for (let i=1;i<=10;i++) await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: points(from+(to-from)*i/10) });
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  }
  await pinch(280, 20);
  const result = await shell.evaluate(el => {
    const content = el.querySelector(".schedule-zoom-content");
    return { zoom: Number(content.style.zoom), width: content.getBoundingClientRect().width, height: content.getBoundingClientRect().height, availableWidth: el.clientWidth, availableHeight: el.clientHeight, pageScale: visualViewport.scale };
  });
  assert.ok(result.zoom < .4, JSON.stringify(result));
  assert.ok(result.width <= result.availableWidth+2 && result.height <= result.availableHeight+2, JSON.stringify(result));
  assert.equal(result.pageScale, 1);
  assert.deepEqual(await page.locator(".app-header").boundingBox(), headerBefore);
  await page.screenshot({ path: "artifacts/zoom-overview.png" });
  await pinch(25, 200);
  assert.ok(await shell.evaluate(el => Number(el.querySelector(".schedule-zoom-content").style.zoom)) > 1);
  await page.waitForTimeout(450);
  await page.locator(".pick-button").first().click();
  assert.equal(await page.locator(".performance.picked").count(), 1);
  console.log("PASS: real two-touch pinch, entire day fits, page/header unaffected, zoom back in, PICK works.");
} finally { await browser.close(); }
