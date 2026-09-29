import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { test } from "node:test";
import { restaurants, venues, demoRestaurants, hasVenuePosition } from "../app/venue-data.ts";

test("posters become 25 distinct real vendors in their two published groups", () => {
 assert.equal(restaurants.length, 25);
 assert.equal(new Set(restaurants.map(r => r.id)).size, 25);
 assert.equal(restaurants.filter(r => r.zone === "부산 로컬푸드").length, 7);
 assert.equal(restaurants.filter(r => r.zone === "푸드라운지").length, 18);
 for (const r of restaurants) {
  assert.equal(r.category, "food"); assert.ok(!r.demo); assert.ok(r.menus.length);
  assert.equal(new Set(r.menus.map(m => m.name)).size, r.menus.length);
  for (const m of r.menus) assert.ok(Number.isInteger(m.price) && m.price > 0);
 }
});

test("vendor photos and the logo are separate from menu-specific photos", () => {
 const crops = JSON.parse(readFileSync(new URL("../scripts/food-photo-crops.json", import.meta.url), "utf8"));
 const files = crops.flatMap(c => c.items.map(([id]) => `/food/${id}.webp`));
 let total = 0;
 for (const r of restaurants) {
  assert.ok(files.includes(r.photo));
  const path = new URL(`../public${r.photo}`, import.meta.url);
  const bytes = readFileSync(path);
  assert.equal(bytes.subarray(8, 12).toString(), "WEBP");
  total += statSync(path).size;
  assert.ok(r.menus.every(m => !m.photo), "Do not assign representative photos to individual menus");
 }
 assert.ok(total < 500 * 1024, "Keep the complete photo set below 500 KiB");
 assert.equal(restaurants.find(r => r.id === "food-birak").photoKind, "logo");
});

test("only published menu entries are supplied, preserving portions and notices", () => {
 const byId = id => restaurants.find(r => r.id === `food-${id}`);
 assert.equal(byId("suan-coffee").menus.length, 3); assert.equal(byId("suan-coffee").totalMenus, 5);
 assert.equal(byId("lee-heung-yong").totalMenus, 8);
 assert.deepEqual(byId("samjin").menus.map(m => m.price), [15000, 8500, 8500]);
 assert.equal(byId("daum-cupbap").menus[0].price, 10500);
 assert.equal(byId("crazy-pizza").menus[0].price, 21900);
 assert.equal(byId("birak").menus[0].name, "비락식혜 슬러시(495ml)");
 assert.equal(byId("birak").note, "이벤트 참여 시 굿즈 제공");
 assert.match(byId("pig-bingsu").menus[2].name, /한정판매/);
 assert.equal(byId("youth-snack").menus.length, 5); assert.equal(byId("youth-snack").totalMenus, 7);
 assert.equal(byId("vegan").menus.length, 3); assert.equal(byId("vegan").totalMenus, 5);
});

test("unknown booth positions never become fabricated map pins or demo records", () => {
 assert.deepEqual(restaurants.filter(hasVenuePosition).map(r => r.id), ["food-suan-coffee", "food-lee-heung-yong", "food-samjin"]);
 assert.equal(restaurants.filter(r => !hasVenuePosition(r)).length, 22);
 assert.ok(venues.every(hasVenuePosition));
 assert.ok(demoRestaurants.every(r => !restaurants.some(real => real.id === r.id)));
 assert.equal(hasVenuePosition({ x: NaN, y: 10 }), false);
 assert.equal(hasVenuePosition({ x: 10 }), false);
});
