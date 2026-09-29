"use client";
import { useEffect, useState } from "react";
import { Accessibility, Baby, Beer, Camera, Cigarette, Coffee, Cross, Droplets, Gift, Info, Music, Toilet, TrainFront, Utensils, X } from "lucide-react";
import { clusterPins, type Pixel } from "./map-viewport";
import type { Venue } from "./venue-data";

const categoryIcons = { stage: Music, food: Utensils, facility: Cross, info: Info, booth: Gift };
const detailIcons = { beer: Beer, water: Droplets, camera: Camera, gift: Gift, train: TrainFront, coffee: Coffee, toilet: Toilet, accessibility: Accessibility, baby: Baby, utensils: Utensils, cigarette: Cigarette };
export function VenueIcon({ venue, size = 17 }: { venue: Venue; size?: number }) {
  const Icon = venue.icon ? detailIcons[venue.icon] : categoryIcons[venue.category];
  return <Icon size={size} aria-hidden="true"/>;
}
export type VenuePin = { venue: Venue; point: Pixel };
export type VenueScreen = { pins: VenuePin[]; width: number; height: number };

// Use the same screen-space hit targets and clusters for Kakao and the offline guide.
export function VenuePins({ pins, width, height, active, selected, onSelect, revision = 0 }: VenueScreen & {
  active: boolean; selected?: Venue | null; onSelect?: (venue: Venue) => void; revision?: number;
}) {
  const [cluster, setCluster] = useState<Venue[] | null>(null);
  const ids = pins.map(p => p.venue.id).join(",");
  useEffect(() => { setCluster(null); }, [ids, active, revision, selected]);
  const visible = pins.filter(({ point: p }) => p.x >= 20 && p.y >= 20 && p.x <= width - 20 && p.y <= height - 28);
  return <>
    <div className="kakao-screen-pins">
      {clusterPins(visible).map(({ items, point }) => {
        const venue = items[0].venue, multiple = items.length > 1;
        return <button key={venue.id} className={`kakao-place-pin ${multiple ? "pin-cluster" : `pin-${venue.category}`}`}
          style={{ left: point.x, top: point.y }} title={items.map(p => p.venue.name).join(", ")}
          aria-label={multiple ? `장소 ${items.length}곳 보기: ${items.map(p => p.venue.name).join(", ")}` : `${venue.name} 정보`}
          aria-pressed={items.some(p => selected?.id === p.venue.id)} tabIndex={active ? 0 : -1}
          onClick={() => multiple ? setCluster(items.map(p => p.venue)) : onSelect?.(venue)}>
          {multiple ? items.length : <VenueIcon venue={venue}/>}
        </button>;
      })}
    </div>
    {cluster && <section className="kakao-pin-list" aria-label="겹친 장소" onPointerDown={e => e.stopPropagation()} onWheel={e => e.stopPropagation()}>
      <header><strong>장소 {cluster.length}곳</strong><button aria-label="장소 목록 닫기" title="장소 목록 닫기" onClick={() => setCluster(null)}><X size={16}/></button></header>
      {cluster.map(v => <button className="venue-cluster-item" key={v.id} onClick={() => { setCluster(null); onSelect?.(v); }}><VenueIcon venue={v}/><span>{v.name}</span></button>)}
    </section>}
  </>;
}
