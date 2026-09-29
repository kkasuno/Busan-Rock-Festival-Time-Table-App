import { chromium } from "file:///C:/Users/lp_08/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import assert from "node:assert/strict";
const browser = await chromium.launch({ headless: true, channel: "msedge" });
try {
  const page = await browser.newPage({ timezoneId: "America/Los_Angeles", viewport: { width: 390, height: 844 } });
  await page.clock.install({ time: new Date("2026-10-02T05:30:00Z") });
  await page.goto("http://localhost:3000");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "타임테이블", exact: true }).click();
  assert.equal(await page.locator(".current-time-line").count(), 5);
  assert.equal(await page.locator(".current-time-label").textContent(), "14:30");
  const initial = await page.locator(".current-time-line").first().evaluate(el => parseFloat(el.style.top));
  await page.clock.runFor(60_000);
  const later = await page.locator(".current-time-line").first().evaluate(el => parseFloat(el.style.top));
  assert.ok(later > initial);
  await page.getByRole("button", { name: /DAY 2/ }).click();
  assert.equal(await page.locator(".current-time-line").count(), 0);
  await page.getByRole("button", { name: /DAY 1/ }).click();
  await page.getByRole("button", { name: /^MY / }).click();
  assert.equal(await page.locator(".current-time-line").count(), 5);
  await page.clock.setSystemTime(new Date("2026-10-02T13:00:00Z"));
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  assert.equal(await page.locator(".current-time-line").count(), 0);
  await page.clock.setSystemTime(new Date("2026-10-03T03:00:00Z"));
  await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
  await page.getByRole("button", { name: /DAY 2/ }).click();
  assert.equal(await page.locator(".current-time-label").textContent(), "12:00");
  console.log("PASS: Korea timezone, all five stages, automatic movement, MY mode, other day hidden, closing boundary, resume refresh.");
} finally { await browser.close(); }
