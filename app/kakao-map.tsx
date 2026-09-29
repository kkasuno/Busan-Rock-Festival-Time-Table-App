"use client";
import { useEffect, useRef, useState } from "react";
import { Cross, Info, Music, Utensils, X } from "lucide-react";
import { loadMaps, type Maps, type MapView, type Point, type MapEvent } from "./kakao-sdk";
import { GUIDE_IMAGE, GUIDE_WIDTH, GUIDE_HEIGHT, guideCorners, imageToWorld, type GuidePlacement, type XY } from "./map-overlay";
import { mapFrame, mapToScreen, screenToMap, clusterPins, type Pixel } from "./map-viewport";
import { bindMapGestures } from "./map-gestures";
import type { Venue } from "./venue-data";

type Location = { latitude: number; longitude: number; accuracy: number };
type Props = {
  height: number; location: Location | null; reset: number; onFailure: () => void; active: boolean;
  placement?: GuidePlacement; opacity?: number; onMapClick?: (p: XY) => void; className?: string;
  rotation?: number; places?: Venue[]; placePlacement?: GuidePlacement; selected?: Venue | null;
  onSelect?: (v: Venue) => void; locateRequest?: number; focusRequest?: number;
};
type ScreenState = { pins: { venue: Venue; point: Pixel }[]; gps: Pixel | null; width: number; height: number };
const icons = { stage: Music, food: Utensils, facility: Cross, info: Info };

export function KakaoVenueMap({ height, location, reset, onFailure, active, placement, opacity = .65, onMapClick, className,
  rotation = 0, places, placePlacement, selected, onSelect, locateRequest = 0, focusRequest = 0 }: Props) {
  const host = useRef<HTMLDivElement>(null), surface = useRef<HTMLDivElement>(null);
  const view = useRef<MapView | null>(null), api = useRef<Maps | null>(null);
  const update = useRef<(() => void) | null>(null), layout = useRef<(() => void) | null>(null), fit = useRef<(() => void) | null>(null);
  const focus = useRef<(() => void) | null>(null), locate = useRef<(() => void) | null>(null), follow = useRef(false);
  const [screen, setScreen] = useState<ScreenState>({ pins: [], gps: null, width: 0, height: 0 });
  const [cluster, setCluster] = useState<Venue[] | null>(null);
  const controlled = places !== undefined;
  const latest = useRef({ location, placement, opacity, onFailure, onMapClick, rotation, places, placePlacement, selected });
  latest.current = { location, placement, opacity, onFailure, onMapClick, rotation, places, placePlacement, selected };

  useEffect(() => {
    let disposed = false, observer: ResizeObserver | undefined, timer: number | undefined, frameId = 0;
    const listeners: [string, (e: MapEvent) => void][] = [];
    let removeOverlay: (() => void) | undefined, gestures: ReturnType<typeof bindMapGestures<Point>> | undefined;
    const el = surface.current!, viewport = host.current!;
    let frame = mapFrame(viewport.clientWidth, viewport.clientHeight, latest.current.rotation);
    const imageError = (event: Event) => { if (event.target instanceof HTMLImageElement && !disposed) latest.current.onFailure(); };
    el.addEventListener("error", imageError, true);
    loadMaps().then(maps => {
      if (disposed) return;
      api.current = maps;
      const center = new maps.Coords(949309, 469169).toLatLng();
      const map = new maps.Map(el, { center, level: 3, draggable: !controlled, scrollwheel: !controlled, disableDoubleClickZoom: controlled, tileAnimation: false });
      view.current = map;
      const listen = (name: string, fn: (e: MapEvent) => void) => { maps.event.addListener(map, name, fn); listeners.push([name, fn]); };
      listen("click", e => { const c = e.latLng.toCoords(); latest.current.onMapClick?.({ x: c.getX(), y: c.getY() }); });
      listen("tilesloaded", () => { clearTimeout(timer); el.dataset.loaded = "true"; });
      timer = window.setTimeout(() => { if (!disposed && el.dataset.loaded !== "true") latest.current.onFailure(); }, 12000);

      class GuideOverlay extends maps.AbstractOverlay {
        node = document.createElement("img");
        constructor() {
          super(); this.node.src = GUIDE_IMAGE; this.node.alt = "2026 부산국제록페스티벌 안내도";
          this.node.className = "kakao-guide-image"; this.node.draggable = false;
          Object.assign(this.node.style, { position: "absolute", left: "0", top: "0", width: `${GUIDE_WIDTH}px`, height: `${GUIDE_HEIGHT}px`,
            maxWidth: "none", transformOrigin: "0 0", pointerEvents: "none", userSelect: "none", zIndex: "0" });
        }
        onAdd() { this.getPanels().overlayLayer.appendChild(this.node); }
        onRemove() { this.node.remove(); }
        draw() {
          const p = latest.current.placement;
          this.node.style.display = p ? "block" : "none";
          if (!p) return;
          const [a, b, c] = guideCorners(p).map(point => this.getProjection().pointFromCoords(new maps.Coords(point.x, point.y).toLatLng()));
          this.node.style.transform = `matrix(${(b.x-a.x)/GUIDE_WIDTH},${(b.y-a.y)/GUIDE_WIDTH},${(c.x-a.x)/GUIDE_HEIGHT},${(c.y-a.y)/GUIDE_HEIGHT},${a.x},${a.y})`;
          this.node.style.opacity = String(latest.current.opacity);
        }
      }
      const overlay = new GuideOverlay(); overlay.setMap(map); removeOverlay = () => overlay.setMap(null);
      const atScreen = (p: Point) => mapToScreen(map.getProjection().containerPointFromCoords(p), frame);
      const atWorld = (p: Pixel) => { const q = screenToMap(p, frame); return map.getProjection().coordsFromContainerPoint(new maps.Point(q.x, q.y)); };
      const venuePoint = (v: Venue) => {
        const p = latest.current.placePlacement;
        if (!p) return null;
        const q = imageToWorld(p, { x: v.x / 100 * GUIDE_WIDTH, y: v.y / 100 * GUIDE_HEIGHT });
        return new maps.Coords(q.x, q.y).toLatLng();
      };
      const drawScreen = () => {
        if (disposed) return;
        const pins = (latest.current.places || []).flatMap(venue => { const p = venuePoint(venue); return p ? [{ venue, point: atScreen(p) }] : []; });
        const p = latest.current.location;
        setScreen({ pins, gps: p ? atScreen(new maps.LatLng(p.latitude, p.longitude)) : null, width: frame.width, height: frame.height });
        // Keep the SDK's original logo, link, scale and copyright visible and upright.
        const copyright = [...el.children].find(node => node.querySelector('a[href*="map.kakao.com"]')) as HTMLElement | undefined;
        if (copyright) {
          const q = screenToMap({ x: 6, y: Math.max(0, frame.height - 22) }, frame);
          Object.assign(copyright.style, { left: `${q.x}px`, top: `${q.y}px`, bottom: "auto", right: "auto", margin: "0", whiteSpace: "nowrap",
            width: "max-content", maxWidth: `${frame.width - 12}px`, transformOrigin: "0 0", transform: `rotate(${-frame.rotation}deg)`, pointerEvents: "auto", background: "#ffffffd9" });
        }
      };
      const queue = () => { cancelAnimationFrame(frameId); frameId = requestAnimationFrame(drawScreen); };
      listen("bounds_changed", queue); listen("idle", queue);
      update.current = () => { overlay.draw(); queue(); };
      layout.current = () => {
        gestures?.cancel();
        const currentCenter = map.getCenter();
        frame = mapFrame(viewport.clientWidth, viewport.clientHeight, latest.current.rotation);
        Object.assign(el.style, { width: `${frame.innerWidth}px`, height: `${frame.innerHeight}px`,
          left: `${(frame.width - frame.innerWidth) / 2}px`, top: `${(frame.height - frame.innerHeight) / 2}px`, transform: `rotate(${frame.rotation}deg)` });
        map.relayout(); map.setCenter(currentCenter); overlay.draw(); queue();
      };
      fit.current = () => {
        follow.current = false; gestures?.cancel();
        const p = latest.current.placement || latest.current.placePlacement;
        if (p && controlled && frame.width && frame.height) {
          map.setCenter(new maps.Coords(p.center.x, p.center.y).toLatLng()); map.setLevel(3);
          const corners = guideCorners(p).map(c => atScreen(new maps.Coords(c.x, c.y).toLatLng()));
          const width = Math.max(...corners.map(p => p.x)) - Math.min(...corners.map(p => p.x));
          const height = Math.max(...corners.map(p => p.y)) - Math.min(...corners.map(p => p.y));
          const ratio = Math.max(width / Math.max(80, frame.width - 16), height / Math.max(80, frame.height - 24));
          map.setLevel(Math.max(1, Math.min(8, 3 + Math.ceil(Math.log2(ratio)))));
        } else if (p) {
          const bounds = new maps.LatLngBounds(); guideCorners(p).forEach(c => bounds.extend(new maps.Coords(c.x, c.y).toLatLng()));
          map.setBounds(bounds, 44, 48, 28, 20);
        } else { map.setLevel(3); map.setCenter(center); }
        queue();
      };
      focus.current = () => {
        const v = latest.current.selected, p = v && venuePoint(v);
        if (!p) return;
        follow.current = false; map.setCenter(p); map.setLevel(Math.min(map.getLevel(), 2)); queue();
      };
      locate.current = () => {
        const p = latest.current.location;
        if (p && follow.current) { map.setCenter(new maps.LatLng(p.latitude, p.longitude)); queue(); }
      };
      if (controlled) {
        gestures = bindMapGestures(viewport, {
          worldAt: atWorld, getLevel: () => map.getLevel(), setLevel: n => { if (n !== map.getLevel()) map.setLevel(n); },
          onInteract: () => { follow.current = false; setCluster(null); },
          moveAnchor: (world, point) => {
            const projected = map.getProjection().containerPointFromCoords(world), target = screenToMap(point, frame);
            map.setCenter(map.getProjection().coordsFromContainerPoint(new maps.Point(frame.innerWidth / 2 + projected.x - target.x, frame.innerHeight / 2 + projected.y - target.y)));
            queue();
          },
        });
      }
      const followOnLoad = follow.current;
      layout.current(); fit.current(); focus.current(); follow.current = followOnLoad; locate.current();
      observer = new ResizeObserver(() => layout.current?.()); observer.observe(viewport);
    }).catch(() => { if (!disposed) latest.current.onFailure(); });
    return () => {
      disposed = true; clearTimeout(timer); cancelAnimationFrame(frameId); observer?.disconnect(); gestures?.dispose(); el.removeEventListener("error", imageError, true);
      if (api.current && view.current) listeners.forEach(([name, fn]) => api.current!.event.removeListener(view.current!, name, fn));
      removeOverlay?.(); update.current = null; layout.current = null; fit.current = null; focus.current = null; locate.current = null;
      view.current = null; api.current = null; el.replaceChildren();
    };
  }, [controlled]);
  useEffect(() => { update.current?.(); }, [placement, opacity, places, placePlacement, location]);
  useEffect(() => { layout.current?.(); }, [rotation, active]);
  useEffect(() => { locate.current?.(); }, [location]);
  useEffect(() => { if (locateRequest) { follow.current = true; locate.current?.(); } }, [locateRequest]);
  useEffect(() => { fit.current?.(); }, [reset]);
  useEffect(() => { focus.current?.(); }, [selected, focusRequest]);
  useEffect(() => { setCluster(null); }, [places, rotation, active, reset]);
  const visible = (p: Pixel) => p.x >= 20 && p.y >= 20 && p.x <= screen.width - 20 && p.y <= screen.height - 28;
  return <div className={`${className || "venue-canvas kakao-venue-canvas"} kakao-viewport`} style={{ bottom: `${height}%`, visibility: active ? "visible" : "hidden", zIndex: active ? 450 : 0 }} ref={host} aria-hidden={!active} aria-label="카카오 행사장 지도" tabIndex={active && places !== undefined ? 0 : -1}>
    <div ref={surface} className="kakao-map-surface" style={{ position: "absolute", width: "100%", height: "100%", transformOrigin: "center", pointerEvents: places !== undefined ? "none" : "auto" }}/>
    <div className="kakao-screen-pins">
      {clusterPins(screen.pins.filter(p => visible(p.point))).map(({ items, point }) => { const venue = items[0].venue, Icon = icons[venue.category];
        return <button key={venue.id} className={`kakao-place-pin ${items.length > 1 ? "pin-cluster" : `pin-${venue.category}`}`} style={{ left: point.x, top: point.y }} aria-label={items.length > 1 ? `장소 ${items.length}곳 보기: ${items.map(p=>p.venue.name).join(", ")}` : `${venue.name} 정보`} title={items.map(p=>p.venue.name).join(", ")} aria-pressed={items.some(p=>selected?.id===p.venue.id)} tabIndex={active ? 0 : -1} onClick={() => items.length > 1 ? setCluster(items.map(p=>p.venue)) : onSelect?.(venue)}>{items.length > 1 ? items.length : <Icon size={17}/>}</button>; })}
      {screen.gps && <div className="kakao-gps-dot" role="img" aria-label={`내 위치 · 정확도 약 ${Math.round(location?.accuracy || 0)}m`} style={{ left: screen.gps.x, top: screen.gps.y }}><span>내 위치</span></div>}
    </div>
    {cluster && <section className="kakao-pin-list" aria-label="겹친 장소" onPointerDown={e=>e.stopPropagation()} onWheel={e=>e.stopPropagation()}><header><strong>장소 {cluster.length}곳</strong><button aria-label="장소 목록 닫기" title="장소 목록 닫기" onClick={()=>setCluster(null)}><X size={16}/></button></header>{cluster.map(v=><button key={v.id} onClick={()=>{setCluster(null);onSelect?.(v);}}>{v.name}</button>)}</section>}
  </div>;
}
