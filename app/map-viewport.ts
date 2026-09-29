export type Pixel = { x: number; y: number };
export type MapFrame = { width: number; height: number; innerWidth: number; innerHeight: number; rotation: number };

export function rotatePixel(p: Pixel, degrees: number): Pixel {
  const a = degrees * Math.PI / 180;
  return { x: p.x * Math.cos(a) - p.y * Math.sin(a), y: p.x * Math.sin(a) + p.y * Math.cos(a) };
}

export function mapFrame(width: number, height: number, rotation: number): MapFrame {
  const a = rotation * Math.PI / 180;
  // The inverse-rotated viewport must fit entirely inside the SDK's tile surface.
  return { width, height, rotation,
    innerWidth: Math.ceil(Math.abs(Math.cos(a)) * width + Math.abs(Math.sin(a)) * height),
    innerHeight: Math.ceil(Math.abs(Math.sin(a)) * width + Math.abs(Math.cos(a)) * height) };
}

export function screenToMap(p: Pixel, f: MapFrame): Pixel {
  const q = rotatePixel({ x: p.x - f.width / 2, y: p.y - f.height / 2 }, -f.rotation);
  return { x: q.x + f.innerWidth / 2, y: q.y + f.innerHeight / 2 };
}

export function mapToScreen(p: Pixel, f: MapFrame): Pixel {
  const q = rotatePixel({ x: p.x - f.innerWidth / 2, y: p.y - f.innerHeight / 2 }, f.rotation);
  return { x: q.x + f.width / 2, y: q.y + f.height / 2 };
}

export function pinchLevel(startLevel: number, startDistance: number, distance: number): number {
  return Math.max(1, Math.min(8, Math.round(startLevel - Math.log2(Math.max(1, distance) / Math.max(1, startDistance)))));
}

export function gestureSample(points: Pixel[]) {
  const [a, b] = points;
  return b ? { point: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, distance: Math.hypot(a.x - b.x, a.y - b.y) }
    : { point: a, distance: 0 };
}

export function clusterPins<T extends { point: Pixel }>(pins: T[], spacing = 40): { point: Pixel; items: T[] }[] {
  const groups: { point: Pixel; items: T[] }[] = [];
  for (const pin of pins) {
    const group = groups.find(g => Math.hypot(g.point.x - pin.point.x, g.point.y - pin.point.y) < spacing);
    if (group) group.items.push(pin);
    else groups.push({ point: pin.point, items: [pin] });
  }
  return groups;
}
