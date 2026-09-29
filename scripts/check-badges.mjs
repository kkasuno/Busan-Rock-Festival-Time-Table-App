import { chromium } from "file:///C:/Users/lp_08/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import assert from "node:assert/strict";
const browser=await chromium.launch({headless:true,channel:"msedge"});
try{
 for(const width of [360,390,1280]){
 const page=await browser.newPage({viewport:{width,height:844},isMobile:width<600,hasTouch:true});
 await page.route(/.*(firebase|googleapis).*/,r=>r.abort());
 await page.addInitScript(()=>{if(!localStorage.getItem("seeded")){localStorage.setItem("busan-festival-progress-v1",JSON.stringify({wanted:["demo-food-0"],eaten:[],visited:[]}));localStorage.setItem("seeded","yes");}});
 await page.goto("http://localhost:4180");await page.waitForSelector(".badge-open");
 assert.equal(await page.locator(".badge-open").count(),17);
 await page.getByRole("button",{name:"돗자리 득템 기록 열기",exact:true}).click();
 await page.getByRole("checkbox",{name:"아이즈 매거진에서 돗자리 받았어요"}).check();
 assert.equal(await page.locator(".badge-dialog .badge-sticker.color").count(),1);
 await page.getByRole("button",{name:"뱃지 닫기"}).click();
 await page.getByRole("button",{name:"맥주 타임 기록 열기",exact:true}).click();
 assert.equal(await page.getByRole("button",{name:"맥주 줄이기",exact:true}).isDisabled(),true);
 await page.getByRole("button",{name:"무알코올 늘리기",exact:true}).click();
 await page.getByRole("button",{name:"맥주 늘리기",exact:true}).click();
 assert.equal(await page.locator(".badge-detail-summary strong").innerText(),"2회 기록");
 await page.getByRole("button",{name:"맥주 줄이기",exact:true}).click();
 await page.getByRole("button",{name:"무알코올 줄이기",exact:true}).click();
 assert.equal(await page.locator(".badge-dialog .badge-sticker.color").count(),0);
 await page.getByRole("button",{name:"뱃지 닫기"}).click();
 await page.getByRole("button",{name:"라이브 수집가 기록 열기",exact:true}).click();
 const checks=page.locator(".badge-records input");for(let i=0;i<10;i++)await checks.nth(i).check();
 assert.equal(await page.locator(".badge-detail-summary strong").innerText(),"10 / 10");
 await page.screenshot({path:`artifacts/badge-attendance-${width}.png`});
 await checks.first().uncheck();assert.equal(await page.locator(".badge-dialog .badge-sticker.color").count(),0);
 await page.getByRole("button",{name:"뱃지 닫기"}).click();
 await page.reload();await page.waitForSelector(".badge-open");
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem("busan-festival-progress-v1")));
 assert.equal(saved.attended.length,9);assert.deepEqual(saved.wanted,["demo-food-0"]);assert.ok(saved.completed.includes("mat"));
 await page.screenshot({path:`artifacts/badges-new-${width}.png`});
 await page.getByRole("button",{name:"삼락 화장실 원정대 기록 열기",exact:true}).click();assert.match(await page.locator(".badge-dialog").innerText(),/목록.*확정/);await page.getByRole("button",{name:"뱃지 닫기"}).click();
 await page.getByRole("button",{name:"타임테이블",exact:true}).click();
 await page.locator(".performance").first().click();
 await page.getByRole("button",{name:/^MY /}).click();
 const pick=page.locator(".performance").first(),check=page.locator(".attendance-check").first();
 await check.click();assert.equal(await pick.getAttribute("aria-pressed"),"true");
 await page.screenshot({path:`artifacts/attendance-card-${width}.png`});
 await pick.click();assert.equal(await page.locator(".performance").count(),0);
 const after=await page.evaluate(()=>JSON.parse(localStorage.getItem("busan-festival-progress-v1")));assert.equal(after.attended.length,10);
 await page.getByRole("button",{name:"일정 추가",exact:true}).click();await page.getByLabel("일정 이름").fill("잠깐 쉬기");await page.getByLabel("일정 종류").selectOption("rest");await page.getByRole("button",{name:"저장",exact:true}).click();
 await page.getByRole("button",{name:"홈",exact:true}).click();assert.equal(await page.getByRole("button",{name:"충전 완료 기록 열기"}).locator(".badge-sticker.color").count(),1);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 console.log(`PASS ${width}: 17 badges, manual, counters, attendance, undo, migration, persistence, rest`);await page.close();
 }
}finally{await browser.close();}
