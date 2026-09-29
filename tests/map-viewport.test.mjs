import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
import { mapFrame, mapToScreen, screenToMap, rotatePixel, pinchLevel, clusterPins } from "../app/map-viewport.ts";
import { parsePlacement, imageToWorld, GUIDE_WIDTH, GUIDE_HEIGHT } from "../app/map-overlay.ts";

const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-6, `${a} != ${b}`);
test("rotated tile surface covers every corner on narrow, tall and desktop viewports", () => {
  for (const [w,h] of [[360,480],[390,500],[430,640],[1280,320],[900,180]]) for (const angle of [-176,0,45,90,180]) {
    const frame = mapFrame(w,h,angle);
    for (const p of [{x:0,y:0},{x:w,y:0},{x:0,y:h},{x:w,y:h},{x:w/2,y:h/2}]) {
      const q = screenToMap(p,frame), back = mapToScreen(q,frame);
      assert.ok(q.x >= -1e-6 && q.x <= frame.innerWidth+1e-6 && q.y >= -1e-6 && q.y <= frame.innerHeight+1e-6);
      close(back.x,p.x);close(back.y,p.y);
    }
  }
});
test("drag follows the finger in all four directions at 176 degrees and north-up", () => {
  for (const angle of [-176,0]) for (const delta of [{x:100,y:0},{x:-100,y:0},{x:0,y:100},{x:0,y:-100}]) {
    const frame=mapFrame(390,500,angle),start={x:150,y:200},end={x:start.x+delta.x,y:start.y+delta.y};
    const a=screenToMap(start,frame),b=screenToMap(end,frame),shift=rotatePixel({x:b.x-a.x,y:b.y-a.y},angle);
    close(shift.x,delta.x);close(shift.y,delta.y);
  }
});
test("guide-up keeps the original lettering direction while preserving geographic placement", () => {
  const p=parsePlacement(JSON.parse(readFileSync(new URL("../app/map-overlay-config.json",import.meta.url))));
  const a=imageToWorld(p,{x:0,y:0}),b=imageToWorld(p,{x:GUIDE_WIDTH,y:0}),c=imageToWorld(p,{x:0,y:GUIDE_HEIGHT});
  const x=rotatePixel({x:b.x-a.x,y:a.y-b.y},-p.rotation),y=rotatePixel({x:c.x-a.x,y:a.y-c.y},-p.rotation);
  close(x.y,0);close(y.x,0);assert.ok(x.x>0&&y.y>0);
});
test("GPS and venue markers use the same transform before and after zoom and rotation", () => {
  for(const rotation of [0,-176])for(const size of [[390,500],[1280,320]])for(const scale of [1,2,4]){
    const f=mapFrame(...size,rotation), projected={x:f.innerWidth/2+45*scale,y:f.innerHeight/2-60*scale};
    const screen=mapToScreen(projected,f),back=screenToMap(screen,f);
    close(back.x,projected.x);close(back.y,projected.y);
  }
});
test("pinch zoom clamps at SDK limits and returns to the starting level",()=>{
  assert.equal(pinchLevel(4,100,200),3);assert.equal(pinchLevel(4,100,50),5);
  assert.equal(pinchLevel(4,100,100),4);assert.equal(pinchLevel(1,100,800),1);assert.equal(pinchLevel(8,100,1),8);
});
test("overlapping places are grouped without losing any place or colliding group centers",()=>{
  const pins=[{id:1,point:{x:10,y:10}},{id:2,point:{x:20,y:20}},{id:3,point:{x:80,y:80}}];
  const groups=clusterPins(pins);assert.deepEqual(groups.map(g=>g.items.length),[2,1]);
  assert.deepEqual(groups.flatMap(g=>g.items).map(p=>p.id).sort(),[1,2,3]);
});

const source=readFileSync(new URL("../app/map-gestures.ts",import.meta.url),"utf8").replace('"./map-viewport"',JSON.stringify(new URL("../app/map-viewport.ts",import.meta.url).href));
const {bindMapGestures}=await import("data:text/javascript;base64,"+Buffer.from(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText).toString("base64"));
globalThis.window=new EventTarget();
class Surface extends EventTarget {
  clientWidth=390;clientHeight=500;captured=new Set();
  getBoundingClientRect(){return {left:0,top:0};}closest(){return null;}
  setPointerCapture(id){this.captured.add(id);}hasPointerCapture(id){return this.captured.has(id);}releasePointerCapture(id){this.captured.delete(id);}
}
function setup(){
  const el=new Surface(),moves=[];let level=4,taps=0;
  const button={closest:s=>s==="button"?{click:()=>taps++}:null};
  const controller=bindMapGestures(el,{worldAt:p=>p,moveAnchor:(a,b)=>moves.push({a,b}),getLevel:()=>level,setLevel:n=>level=n,onInteract:()=>{}});
  const send=(type,id,x,y,target=button)=>{const e=new Event(type,{cancelable:true});Object.assign(e,{pointerId:id,clientX:x,clientY:y,button:0});Object.defineProperty(e,"target",{value:target});el.dispatchEvent(e);};
  return {el,controller,moves,send,get level(){return level;},get taps(){return taps;}};
}
test("tap opens a place once; dragging a pin never opens it",()=>{
  const s=setup();s.send("pointerdown",1,100,100);s.send("pointerup",1,100,100);assert.equal(s.taps,1);
  s.send("pointerdown",1,100,100);s.send("pointermove",1,160,130);s.send("pointerup",1,160,130);
  assert.equal(s.taps,1);assert.deepEqual(s.moves.at(-1).b,{x:160,y:130});s.controller.dispose();
});
test("two-finger zoom and a subsequent single-finger drag keep the anchor and suppress taps",()=>{
  const s=setup();s.send("pointerdown",1,100,100);s.send("pointerdown",2,200,100);
  s.send("pointermove",2,300,100);assert.equal(s.level,3);assert.deepEqual(s.moves.at(-1).b,{x:200,y:100});
  s.send("pointerup",2,300,100);s.send("pointermove",1,110,120);s.send("pointerup",1,110,120);
  assert.equal(s.taps,0);assert.deepEqual(s.moves.at(-1).b,{x:110,y:120});s.controller.dispose();
});
test("cancel, orientation change, and unmount release captures without phantom clicks",()=>{
  const s=setup();s.send("pointerdown",1,100,100);s.send("pointercancel",1,100,100);assert.equal(s.taps,0);
  s.send("pointerdown",2,100,100);s.controller.cancel();assert.equal(s.el.captured.size,0);
  s.send("pointerup",2,100,100);assert.equal(s.taps,0);s.controller.dispose();
  s.send("pointerdown",3,100,100);assert.equal(s.el.captured.size,0);
});
test("copyright links and the cluster list keep their native interactions",()=>{
  const s=setup();const native={closest:()=>({})};
  s.send("pointerdown",1,100,100,native);assert.equal(s.el.captured.size,0);assert.equal(s.moves.length,0);s.controller.dispose();
});
test("opening a cluster does not suppress a fast click on its place list",()=>{
  const s=setup();s.send("pointerdown",1,100,100);s.send("pointerup",1,100,100);
  for(const native of [true,false]){
    const e=new Event("click",{cancelable:true});Object.assign(e,{detail:1});
    Object.defineProperty(e,"target",{value:{closest:selector=>native&&selector==="a, .kakao-pin-list"?{}:null}});
    s.el.dispatchEvent(e);assert.equal(e.defaultPrevented,!native);
  }
  s.controller.dispose();
});
