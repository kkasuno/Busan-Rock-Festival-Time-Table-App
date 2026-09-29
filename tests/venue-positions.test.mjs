import assert from "node:assert/strict";
import { test } from "node:test";
import { venues, restaurants, hasVenuePosition } from "../app/venue-data.ts";
import { clusterPins } from "../app/map-viewport.ts";

const all = [...venues, ...restaurants];
const at = id => all.find(v => v.id === id);

test("every real place keeps a unique ID and positioned places stay in the guide", () => {
 assert.equal(new Set(all.map(v => v.id)).size, all.length);
 assert.deepEqual(venues.filter(v => v.category === "stage").map(v => v.id), ["samrock", "green", "wave", "hidden", "river"]);
 for (const v of all.filter(hasVenuePosition)) {
  assert.ok(v.x >= 0 && v.x <= 100 && v.y >= 0 && v.y <= 100, v.name);
 }
});

test("the labelled local-food row preserves the screenshot order in the south-up guide", () => {
 const row = ["booth-jameson-food", "water-food", "booth-sasang-mothers", "local-food-zone", "food-samjin", "booth-cgv", "food-lee-heung-yong", "booth-daesun-cocktail", "food-suan-coffee"].map(at);
 for (let i = 1; i < row.length; i++) assert.ok(row[i].y < row[i - 1].y);
 assert.ok(!hasVenuePosition(at("food-hanshin")), "Do not identify a differently named association without confirmation");
});

test("same-brand booths are distinct by zone, without creating more menu vendors", () => {
 for (const ids of [["booth-jameson-food", "booth-jameson-samrock"], ["booth-tsingtao-main", "booth-tsingtao-river"], ["water-food", "water-standing", "water-river"]]) {
  const group = ids.map(at);
  assert.equal(new Set(group.map(v => v.name)).size, ids.length);
  assert.equal(new Set(group.map(v => `${v.x},${v.y}`)).size, ids.length);
 }
 assert.equal(restaurants.length, 25);
 assert.equal(restaurants.reduce((count, v) => count + v.menus.length, 0), 66);
});

test("clustered guide pins retain every selectable venue at mobile and desktop scales", () => {
 for (const scale of [0.28, 0.6, 1, 2]) {
  const pins = all.filter(hasVenuePosition).map(venue => ({venue, point: {x: venue.x * 10.02 * scale, y: venue.y * 12.59 * scale}}));
  const groups = clusterPins(pins);
  assert.deepEqual(groups.flatMap(g => g.items.map(i => i.venue.id)).sort(), pins.map(p => p.venue.id).sort());
  for (let i = 0; i < groups.length; i++) for (let j = i + 1; j < groups.length; j++) {
   assert.ok(Math.hypot(groups[i].point.x - groups[j].point.x, groups[i].point.y - groups[j].point.y) >= 40);
  }
 }
});
