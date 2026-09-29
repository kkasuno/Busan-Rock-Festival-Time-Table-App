import { gestureSample, pinchLevel, type Pixel } from "./map-viewport";

type Controls<T> = {
  worldAt(p: Pixel): T; moveAnchor(world: T, p: Pixel): void;
  getLevel(): number; setLevel(level: number): void;
  onInteract(): void;
};

// Own pointer coordinates instead of forwarding synthetic events into the rotated SDK.
export function bindMapGestures<T>(el: HTMLElement, controls: Controls<T>) {
  const pointers = new Map<number, Pixel>();
  let start: { world: T; point: Pixel; distance: number; level: number } | null = null;
  let moved = false, target: Element | null = null, blockClickUntil = 0, wheelTotal = 0;
  const point = (e: { clientX: number; clientY: number }) => { const r = el.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const rebase = () => {
    if (!pointers.size) { start = null; return; }
    const sample = gestureSample([...pointers.values()]);
    start = { ...sample, world: controls.worldAt(sample.point), level: controls.getLevel() };
  };
  const down = (e: PointerEvent) => {
    if (e.button !== 0 || (e.target as Element).closest("a, .kakao-pin-list")) return;
    e.preventDefault(); controls.onInteract();
    if (!pointers.size) { moved = false; target = e.target as Element; }
    else moved = true;
    pointers.set(e.pointerId, point(e)); el.setPointerCapture(e.pointerId); rebase();
  };
  const move = (e: PointerEvent) => {
    if (!pointers.has(e.pointerId) || !start) return;
    e.preventDefault(); pointers.set(e.pointerId, point(e));
    const sample = gestureSample([...pointers.values()]);
    if (Math.hypot(sample.point.x - start.point.x, sample.point.y - start.point.y) > 5) moved = true;
    if (sample.distance) controls.setLevel(pinchLevel(start.level, start.distance, sample.distance));
    if (moved) controls.moveAnchor(start.world, sample.point);
  };
  const end = (e: PointerEvent) => {
    if (!pointers.has(e.pointerId)) return;
    if (e.type === "pointerup") move(e);
    const tap = e.type === "pointerup" && !moved && pointers.size === 1;
    pointers.delete(e.pointerId);
    if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    blockClickUntil = Date.now() + 400;
    if (tap) (target?.closest("button") as HTMLButtonElement | null)?.click();
    rebase();
  };
  const cancel = () => {
    const ids = [...pointers.keys()]; pointers.clear(); start = null; moved = true;
    for (const id of ids) if (el.hasPointerCapture(id)) el.releasePointerCapture(id);
    blockClickUntil = Date.now() + 400;
  };
  const click = (e: MouseEvent) => {
    if (e.detail && Date.now() < blockClickUntil) { e.preventDefault(); e.stopPropagation(); }
  };
  const wheel = (e: WheelEvent) => {
    if ((e.target as Element).closest(".kakao-pin-list")) return;
    e.preventDefault(); controls.onInteract(); wheelTotal += e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? el.clientHeight : 1);
    if (Math.abs(wheelTotal) < 40) return;
    const p = point(e), world = controls.worldAt(p);
    controls.setLevel(Math.max(1, Math.min(8, controls.getLevel() + Math.sign(wheelTotal))));
    controls.moveAnchor(world, p); wheelTotal = 0;
  };
  const key = (e: KeyboardEvent) => {
    if (e.target !== el) return;
    const delta: Record<string, Pixel> = { ArrowLeft: { x: 80, y: 0 }, ArrowRight: { x: -80, y: 0 }, ArrowUp: { x: 0, y: 80 }, ArrowDown: { x: 0, y: -80 } };
    if (!delta[e.key] && !["+", "=", "-"].includes(e.key)) return;
    e.preventDefault(); controls.onInteract();
    const p = { x: el.clientWidth / 2, y: el.clientHeight / 2 }, world = controls.worldAt(p);
    if (delta[e.key]) controls.moveAnchor(world, { x: p.x + delta[e.key].x, y: p.y + delta[e.key].y });
    else { controls.setLevel(Math.max(1, Math.min(8, controls.getLevel() + (e.key === "-" ? 1 : -1)))); controls.moveAnchor(world, p); }
  };
  el.addEventListener("pointerdown", down); el.addEventListener("pointermove", move);
  el.addEventListener("pointerup", end); el.addEventListener("pointercancel", end); el.addEventListener("lostpointercapture", end);
  el.addEventListener("click", click, true); el.addEventListener("wheel", wheel, { passive: false }); el.addEventListener("keydown", key);
  window.addEventListener("blur", cancel);
  return { cancel, dispose() {
    cancel(); el.removeEventListener("pointerdown", down); el.removeEventListener("pointermove", move);
    el.removeEventListener("pointerup", end); el.removeEventListener("pointercancel", end); el.removeEventListener("lostpointercapture", end);
    el.removeEventListener("click", click, true); el.removeEventListener("wheel", wheel); el.removeEventListener("keydown", key); window.removeEventListener("blur", cancel);
  } };
}
