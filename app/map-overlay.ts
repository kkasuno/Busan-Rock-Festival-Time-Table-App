export const GUIDE_IMAGE = "/festival-map-2026.png";
export const GUIDE_WIDTH = 1002;
export const GUIDE_HEIGHT = 1259;
export type XY = { x: number; y: number };
export type GuidePlacement = { version: 1; center: XY; width: number; rotation: number; mirrorX: boolean; mirrorY: boolean; calibrated: boolean; anchor?: { image: XY; world: XY } };

// WCONG coordinates, not metres. The initial placement is deliberately unverified.
export const initialPlacement: GuidePlacement = {
  version: 1, center: { x: 949309, y: 469169 }, width: 1900, rotation: 180, mirrorX: false, mirrorY: false, calibrated: false,
};

export function parsePlacement(value: unknown): GuidePlacement {
  const p = value as GuidePlacement;
  if (!p || p.version !== 1 || typeof p.calibrated !== "boolean" ||
      (p.mirrorX !== undefined && typeof p.mirrorX !== "boolean") ||
      (p.mirrorY !== undefined && typeof p.mirrorY !== "boolean") ||
      !p.center || ![p.center.x, p.center.y, p.width, p.rotation].every(Number.isFinite) ||
      Math.abs(p.center.x - initialPlacement.center.x) > 25000 ||
      Math.abs(p.center.y - initialPlacement.center.y) > 25000 ||
      p.width < 100 || p.width > 15000 || p.rotation < -180 || p.rotation > 180) {
    throw new Error("행사장 범위와 지도 크기를 확인하세요.");
  }
  const result: GuidePlacement = { version: 1, center: { x: p.center.x, y: p.center.y }, width: p.width, rotation: p.rotation,
    mirrorX: p.mirrorX ?? false, mirrorY: p.mirrorY ?? false, calibrated: p.calibrated };
  if (p.anchor !== undefined) {
    const a = p.anchor;
    if (!a?.image || !a?.world || ![a.image.x, a.image.y, a.world.x, a.world.y].every(Number.isFinite) ||
        a.image.x < 0 || a.image.x > GUIDE_WIDTH || a.image.y < 0 || a.image.y > GUIDE_HEIGHT ||
        Math.abs(a.world.x - initialPlacement.center.x) > 25000 || Math.abs(a.world.y - initialPlacement.center.y) > 25000) {
      throw new Error("기준점 좌표를 확인하세요.");
    }
    result.anchor = { image: { x: a.image.x, y: a.image.y }, world: { x: a.world.x, y: a.world.y } };
  }
  return result;
}

export function imageToWorld(p: GuidePlacement, point: XY): XY {
  const x = (point.x - GUIDE_WIDTH / 2) * p.width / GUIDE_WIDTH * (p.mirrorX ? -1 : 1);
  const y = (point.y - GUIDE_HEIGHT / 2) * p.width / GUIDE_WIDTH * (p.mirrorY ? -1 : 1);
  const angle = p.rotation * Math.PI / 180;
  return { x: p.center.x + Math.cos(angle) * x - Math.sin(angle) * y,
    y: p.center.y - Math.sin(angle) * x - Math.cos(angle) * y };
}

export function guideCorners(p: GuidePlacement): XY[] {
  return [{ x: 0, y: 0 }, { x: GUIDE_WIDTH, y: 0 }, { x: 0, y: GUIDE_HEIGHT }, { x: GUIDE_WIDTH, y: GUIDE_HEIGHT }].map(point => imageToWorld(p, point));
}

export function anchorPlacement(p: GuidePlacement, image: XY, world: XY): GuidePlacement {
  const current = imageToWorld(p, image);
  return parsePlacement({ ...p, center: { x: p.center.x + world.x - current.x, y: p.center.y + world.y - current.y },
    anchor: { image, world }, calibrated: false });
}

// Preserve the illustration's aspect ratio while fitting two landmarks.
export function alignLandmarks(source: [XY, XY], target: [XY, XY], mirror: { mirrorX: boolean; mirrorY: boolean } = { mirrorX: false, mirrorY: false }): GuidePlacement {
  // Landmark picks are on the unmodified source image; reflect them before fitting.
  const points = source.map(p => ({ x: mirror.mirrorX ? GUIDE_WIDTH - p.x : p.x, y: mirror.mirrorY ? GUIDE_HEIGHT - p.y : p.y }));
  const dx = points[1].x - points[0].x, dy = points[1].y - points[0].y;
  const tx = target[1].x - target[0].x, ty = target[0].y - target[1].y;
  const length = dx * dx + dy * dy;
  if (length < 2500 || tx * tx + ty * ty < 10000) throw new Error("기준점 두 곳을 더 멀리 떨어뜨려 선택하세요.");
  const a = (dx * tx + dy * ty) / length, b = (dx * ty - dy * tx) / length;
  const x = GUIDE_WIDTH / 2 - points[0].x, y = GUIDE_HEIGHT / 2 - points[0].y;
  return parsePlacement({ version: 1, center: { x: target[0].x + a * x - b * y, y: target[0].y - b * x - a * y },
    width: Math.hypot(a, b) * GUIDE_WIDTH, rotation: Math.atan2(b, a) * 180 / Math.PI,
    mirrorX: mirror.mirrorX, mirrorY: mirror.mirrorY, anchor: { image: source[0], world: target[0] }, calibrated: false });
}
