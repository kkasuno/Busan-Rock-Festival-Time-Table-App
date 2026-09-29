import { chromium } from "file:///C:/Users/lp_08/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";

const browser = await chromium.launch({ headless: true, channel: "msedge" });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
  page.on("pageerror", e => console.error("PAGE ERROR", e.message));
  await page.goto("http://localhost:3000");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "타임테이블", exact: true }).click();
  await page.locator(".performance").first().waitFor();
  assert.equal(await page.locator(".performance").count(), 35);
  assert.equal(await page.locator(".stage-head").count(), 5);
  await page.locator(".pick-button").first().click();
  await page.getByRole("button", { name: /^MY / }).click();
  assert.equal(await page.locator(".performance").count(), 1);
  await page.getByRole("button", { name: /이미지 저장 \/ 공유/ }).click();
  await page.locator(".export-preview").waitFor();
  assert.equal(await page.locator(".export-preview").evaluate(img => img.naturalWidth), 1600);
  await mkdir("artifacts", { recursive: true });
  const download1 = page.waitForEvent("download");
  await page.getByRole("link", { name: "PNG 저장" }).click();
  await (await download1).saveAs("artifacts/my-timetable.png");
  await page.getByRole("button", { name: "전체 + 내 선택 강조" }).click();
  await page.locator(".export-preview").waitFor();
  const download2 = page.waitForEvent("download");
  await page.getByRole("link", { name: "PNG 저장" }).click();
  await (await download2).saveAs("artifacts/full-timetable.png");
  await page.screenshot({ path: "artifacts/share-mobile.png", fullPage: true });
  await page.getByRole("button", { name: "닫기", exact: true }).click();
  await page.getByRole("button", { name: "ALL", exact: true }).click();
  for (const date of ["DAY 2", "DAY 3"]) {
    await page.getByRole("button", { name: new RegExp(date) }).click();
    assert.equal(await page.locator(".performance").count(), 35);
  }
  await page.screenshot({ path: "artifacts/timetable-mobile.png", fullPage: false });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: "artifacts/timetable-desktop.png" });
  console.log("PASS: 105 performances, five stages, MY filtering, both PNG downloads, mobile and desktop.");
} finally { await browser.close(); }
