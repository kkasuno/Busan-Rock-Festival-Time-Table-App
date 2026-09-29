import { test } from "node:test";
import assert from "node:assert/strict";
import { attendedShows, uniqueArtists, performanceAlerts } from "../app/festival-insights.ts";

const show=(id,artist,stage,start,end)=>({id,artist,stage,start,end});
const days=[
  {id:"day1",date:"2026-10-02",label:"10.02",stages:[{id:"green",name:"GREEN"},{id:"samrock",name:"SAMROCK"}],performances:[
    show("a","Artist A","samrock","15:20","16:00"),
    show("b","Artist B","green","16:00","16:50"),
    show("c","Artist C","samrock","16:05","17:00"),
    show("event","부락 대운동회","green","17:40","18:20"),
  ]},
  {id:"day2",date:"2026-10-03",label:"10.03",stages:[],performances:[show("d","artist a","green","12:00","13:00")]},
];
const routes={"green|samrock":[5,6]};
const alerts=(time,picks=["a","b","c"])=>performanceAlerts(days,picks,new Date(time),routes);
test("recap excludes events, unknown records and counts distinct artists across dates",()=>{
  assert.equal(uniqueArtists(attendedShows(days,["a","d","event","unknown"],"all")),1);
  assert.deepEqual(attendedShows(days,["a","d"],"day2").map(p=>p.id),["d"]);
  assert.equal(attendedShows(days,[],"all").length,0);
});
test("alerts honor Korea date, 10 minute boundary and two minute start window",()=>{
  assert.equal(alerts("2026-10-02T15:49:59+09:00",["b"]).length,0);
  assert.match(alerts("2026-10-02T15:50:00+09:00",["b"])[0].text,/10분 뒤/);
  assert.match(alerts("2026-10-02T06:51:00Z",["b"])[0].text,/9분 뒤/);
  assert.match(alerts("2026-10-02T16:01:59+09:00",["b"])[0].text,/지금 시작/);
  assert.equal(alerts("2026-10-02T16:02:00+09:00",["b"]).length,0);
  assert.equal(alerts("2026-09-22T15:50:00+09:00",["b"]).length,0);
});
test("multiple picks flag overlaps and known insufficient travel without inventing routes",()=>{
  const both=alerts("2026-10-02T15:55:00+09:00");
  assert.equal(both.length,2);
  assert.ok(both.every(p=>p.warning==="시간 겹침 2개"));
  assert.match(alerts("2026-10-02T15:50:00+09:00",["a","b"])[0].warning,/이동 여유 부족/);
  assert.equal(performanceAlerts(days,["a","b"],new Date("2026-10-02T15:50:00+09:00"),{})[0].warning,"");
});
