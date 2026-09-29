import { chromium } from "file:///C:/Users/lp_08/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import assert from "node:assert/strict";
const browser=await chromium.launch({headless:true,channel:"msedge"});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.route(/.*(firebase|googleapis).*/,r=>r.abort());await page.goto("http://localhost:4180");
 await page.getByRole("button",{name:"타임테이블",exact:true}).click();
 for(let day=1;day<=3;day++){
 await page.getByRole("button",{name:new RegExp(`DAY ${day}`)}).click();await page.getByRole("button",{name:"ALL",exact:true}).click();
 await page.locator(".performance").evaluateAll(buttons=>buttons.forEach(b=>b.click()));
 await page.getByRole("button",{name:/^MY /}).click();
 const bad=await page.locator(".performance.with-attendance").evaluateAll(cards=>cards.filter(c=>{const meta=c.querySelector(".performance-meta").getBoundingClientRect(),check=c.nextElementSibling.getBoundingClientRect();return meta.bottom>check.top;}).map(c=>c.textContent));
 assert.deepEqual(bad,[],`day ${day} artist/time clear of attendance`);
 }
 console.log("PASS: all three days artist/time do not overlap attendance controls");
}finally{await browser.close();}
