export type Coords = { getX(): number; getY(): number; toLatLng(): Point };
export type Point = { getLat(): number; getLng(): number; toCoords(): Coords };
export type Bounds = { extend(p: Point): void };
export type MapView = {
  relayout(): void; getCenter(): Point; setCenter(p: Point): void; setLevel(n: number): void; getLevel(): number;
  getProjection(): { containerPointFromCoords(p: Point): { x: number; y: number }; coordsFromContainerPoint(p: { x: number; y: number }): Point };
  setBounds(bounds: Bounds, top?: number, right?: number, bottom?: number, left?: number): void;
};
export type Marker = { setMap(map: MapView | null): void; setPosition(p: Point): void };
export type AbstractOverlay = {
  setMap(map: MapView | null): void;
  getPanels(): { overlayLayer: HTMLElement };
  getProjection(): { pointFromCoords(p: Point): { x: number; y: number } };
  onAdd(): void; onRemove(): void; draw(): void;
};
export type MapEvent = { latLng: Point };
export type Maps = {
  load(callback: () => void): void;
  Coords: new(x: number, y: number) => Coords;
  LatLng: new(lat: number, lng: number) => Point;
  Point: new(x: number, y: number) => { x: number; y: number };
  LatLngBounds: new() => Bounds;
  Map: new(el: HTMLElement, options: { center: Point; level: number; draggable?: boolean; scrollwheel?: boolean; disableDoubleClickZoom?: boolean; tileAnimation?: boolean }) => MapView;
  Marker: new(options: { map?: MapView; position: Point; title?: string; zIndex?: number }) => Marker;
  AbstractOverlay: new() => AbstractOverlay;
  event: {
    addListener(target: MapView, type: string, handler: (event: MapEvent) => void): void;
    removeListener(target: MapView, type: string, handler: (event: MapEvent) => void): void;
  };
};
declare global { interface Window { kakao?: { maps: Maps } } }

// Public browser key, restricted to the domains registered in Kakao Developers.
const KEY = "74df604b0ddb782c459f5581431c8568";
let sdk: Promise<Maps> | undefined;
export function loadMaps() {
  if (sdk) return sdk;
  sdk = new Promise<Maps>((resolve, reject) => {
    const script = document.createElement("script");
    let done = false;
    const timer = window.setTimeout(() => finish(new Error("지도 응답 시간 초과")), 12000);
    function finish(error?: Error) {
      if (done) return;
      done = true; clearTimeout(timer);
      if (error) { script.remove(); reject(error); } else resolve(window.kakao!.maps);
    }
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KEY}&autoload=false`;
    script.async = true;
    script.onerror = () => finish(new Error("지도 SDK를 불러오지 못했습니다."));
    script.onload = () => {
      if (!window.kakao?.maps?.load) { finish(new Error("지도 API 설정을 확인해주세요.")); return; }
      window.kakao.maps.load(() => finish());
    };
    document.head.appendChild(script);
  }).catch(error => { sdk = undefined; throw error; });
  return sdk;
}
