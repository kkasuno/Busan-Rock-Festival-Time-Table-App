import { chromium } from "file:///C:/Users/lp_08/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import assert from "node:assert/strict";
const browser = await chromium.launch({ headless: true, channel: "msedge" });
let selected = false;
let a;
try {
  const ca = await browser.newContext();
  const cb = await browser.newContext();
  a = await ca.newPage();
  const b = await cb.newPage();
  const errors = [];
  a.on("console", msg => { if (msg.type() === "warning") errors.push(msg.text()); });
  async function open(page) {
    await page.goto("http://localhost:3000");
    await page.waitForFunction(() => localStorage.getItem("busan-rock-timetable-picks") !== null);
    await page.getByRole("button", { name: "타임테이블", exact: true }).click();
    await page.waitForFunction(() => /^\d/.test(document.querySelector(".performance-pick-badge")?.textContent ?? ""), undefined, { timeout: 30000 });
  }
  await open(a);
  const badge = a.locator(".performance-pick-badge").first();
  const baseline = Number((await badge.textContent()).split(" ")[0]);
  await a.locator(".pick-button").first().click();
  selected = true;
  await a.waitForFunction(expected => document.querySelector(".performance-pick-badge")?.textContent === expected, (baseline+1)+" PICK", { timeout: 30000 });
  await open(b);
  assert.equal(await b.locator(".performance-pick-badge").first().textContent(), (baseline+1)+" PICK");
  assert.equal(await b.locator(".performance.picked").count(), 0);
  await a.locator(".pick-button").first().click();
  selected = false;
  await a.waitForFunction(expected => document.querySelector(".performance-pick-badge")?.textContent === expected, baseline+" PICK", { timeout: 30000 });
  const records = await a.evaluate(() => JSON.parse(localStorage.getItem("busan-rock-pick-contributions-v1")));
  assert.deepEqual(records.counted, []);
  assert.deepEqual(records.pending, []);
  const check = await a.evaluate(async () => {
    const sdk = await import("/app/firebase-picks.ts");
    const token = () => Array.from(crypto.getRandomValues(new Uint8Array(16)), b => b.toString(16).padStart(2, "0")).join("");
    const key = token();
    const id = "2026-day1-samrock-1";
    const first = await sdk.submitPick(id, 1, key);
    const again = await sdk.submitPick(id, 1, key);
    await sdk.submitPick(id, -1, token());
    let denied = false;
    try { await sdk.submitPick("not-a-performance", 1, token()); }
    catch (error) { denied = error.code === "permission-denied"; }
    return { first, again, denied };
  });
  assert.equal(check.first, check.again);
  assert.equal(check.denied, true);
  const cachedBefore = await b.evaluate(() => JSON.parse(localStorage.getItem("busan-rock-pick-count-cache-v1")).at);
  await b.reload();
  await b.waitForFunction(() => document.querySelector(".bottom-nav"));
  assert.equal(await b.evaluate(() => JSON.parse(localStorage.getItem("busan-rock-pick-count-cache-v1")).at), cachedBefore);
  console.log("PASS: duplicate operation is idempotent; invalid performance rejected; cache retained across reload.");
  console.log("PASS: live Firebase +1/-1, separate browser sees aggregate only, journal acknowledged, test total restored.", errors);
} finally {
  if (selected && a) {
    try { await a.locator(".pick-button").first().click(); await a.waitForTimeout(5000); } catch {}
  }
  await browser.close();
}
