import { chromium } from "file:///C:/Users/lp_08/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import assert from "node:assert/strict";
const browser = await chromium.launch({ headless: true, channel: "msedge" });
try {
  for (const viewport of [{width:360,height:640},{width:390,height:844},{width:412,height:915},{width:844,height:390}]) {
    const page = await browser.newPage({ viewport, isMobile:true, hasTouch:true });
    await page.route(/.*(googleapis|firebase).*/, route => route.abort());
    await page.goto("http://localhost:4180");
    await page.waitForFunction(() => localStorage.getItem("busan-rock-timetable-picks") !== null);
    await page.getByRole("button",{name:"타임테이블",exact:true}).click();
    const shell = page.locator(".zoomable-schedule");
    const cdp = await page.context().newCDPSession(page);
    async function pinch(from,to) {
      const r=await shell.boundingBox(), x=r.x+r.width/2, y=r.y+r.height/2;
      const points=d=>[{x:x-d/2,y,id:1},{x:x+d/2,y,id:2}];
      await cdp.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:points(from)});
      for(let i=1;i<=8;i++) await cdp.send("Input.dispatchTouchEvent",{type:"touchMove",touchPoints:points(from+(to-from)*i/8)});
      await cdp.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});
    }
    for (const mode of ["normal","minimum","maximum","middle"]) {
      if(mode==="minimum") await pinch(280,5);
      if(mode==="maximum") { await pinch(5,280); await pinch(5,280); }
      if(mode==="middle") await pinch(200,65);
      await shell.evaluate(el=>{el.scrollTop=el.scrollHeight;el.scrollLeft=0;});
      await page.waitForTimeout(80);
      const metrics=await shell.evaluate(el=>{
        const r=el.getBoundingClientRect();
        const last=el.querySelector(".stage-column .performance:last-child").getBoundingClientRect();
        const head=el.querySelector(".stage-head").getBoundingClientRect();
        return {bottom:r.bottom,lastBottom:last.bottom,headTop:head.top,top:r.top,
          scrollTop:el.scrollTop,max:el.scrollHeight-el.clientHeight,
          documentHeight:document.documentElement.scrollHeight,windowHeight:innerHeight,
          navTop:document.querySelector(".bottom-nav").getBoundingClientRect().top, pageY:scrollY};
      });
      assert.ok(metrics.lastBottom<=metrics.bottom+1,JSON.stringify({viewport,mode,metrics}));
      assert.ok(Math.abs(metrics.max-metrics.scrollTop)<=1);
      assert.ok(metrics.bottom<=metrics.navTop+1,JSON.stringify({viewport,mode,metrics}));
      assert.ok(metrics.documentHeight<=metrics.windowHeight+1);
      assert.equal(metrics.pageY,0);
      assert.ok(Math.abs(metrics.headTop-metrics.top)<=2,JSON.stringify(metrics));
    }
    await shell.evaluate(el=>{el.scrollTop=0;el.scrollLeft=0;});
    const r=await shell.boundingBox(),x=r.x+100,y=r.y+r.height*.8;
    await cdp.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[{x,y,id:1}]});
    for(let i=1;i<=8;i++) await cdp.send("Input.dispatchTouchEvent",{type:"touchMove",touchPoints:[{x,y:y-i*r.height*.065,id:1}]});
    await cdp.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});
    await page.waitForTimeout(150);
    assert.ok(await shell.evaluate(el=>el.scrollTop)>0,"One-finger drag must scroll timetable");
    assert.equal(await page.evaluate(()=>scrollY),0);
    await page.getByRole("button",{name:"이용 안내",exact:true}).click();
    await page.locator(".timetable-help[open]").waitFor();
    await page.getByRole("button",{name:"이용 안내 닫기"}).click();
    await page.screenshot({path:`artifacts/scroll-${viewport.width}x${viewport.height}.png`});
    await page.close();
  }
  console.log("PASS four phone/landscape sizes; min/mid/max scale; last performance reachable; pinned headings; single scroll; help dialog.");
} finally { await browser.close(); }
