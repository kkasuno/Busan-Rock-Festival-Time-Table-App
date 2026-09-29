"use client";

import { useEffect, useRef, type ReactNode } from "react";

const WIDTH = 958;
const BOTTOM_SPACE = 24;

export function ZoomableTimetable({ children, height }: { children: ReactNode; height: number }) {
  const viewport = useRef<HTMLDivElement>(null);
  const surface = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const shell = viewport.current!;
    const spacer = surface.current!;
    const inner = content.current!;
    let zoom = 1;
    let suppressUntil = 0;
    let singleTouch: { x: number; y: number } | null = null;
    let gesture: { distance: number; zoom: number; x: number; y: number } | null = null;
    const minimum = () => Math.min(1, shell.clientWidth / WIDTH, Math.max(1, shell.clientHeight - BOTTOM_SPACE) / height);
    const inset = () => Math.max(0, (shell.clientWidth - WIDTH * zoom) / 2);
    const pinHeaders = () => {
      inner.style.setProperty("--schedule-scroll-y", `${shell.scrollTop / zoom}px`);
      inner.style.setProperty("--schedule-scroll-x", `${Math.max(0, shell.scrollLeft - inset()) / zoom}px`);
    };
    // Explicit dimensions define the scroll range independently of CSS zoom support.
    const layout = () => {
      spacer.style.width = `${Math.max(shell.clientWidth, Math.ceil(WIDTH * zoom))}px`;
      spacer.style.height = `${Math.ceil(height * zoom) + BOTTOM_SPACE}px`;
      inner.style.transform = `translateX(${inset()}px) scale(${zoom})`;
      inner.dataset.scale = String(zoom);
      pinHeaders();
    };
    const apply = (next: number, x: number, y: number, worldX: number, worldY: number) => {
      zoom = Math.max(minimum(), Math.min(2.5, next));
      layout();
      shell.scrollLeft = worldX * zoom + inset() - x;
      shell.scrollTop = worldY * zoom - y;
      pinHeaders();
    };
    layout();
    const center = (touches: TouchList) => {
      const rect = shell.getBoundingClientRect();
      return {
        x: (touches[0].clientX + touches[1].clientX) / 2 - rect.left - shell.clientLeft,
        y: (touches[0].clientY + touches[1].clientY) / 2 - rect.top - shell.clientTop,
        distance: Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY),
      };
    };
    const start = (event: TouchEvent) => {
      if (event.touches.length === 1) singleTouch = { x: event.touches[0].clientX, y: event.touches[0].clientY };
      if (event.touches.length !== 2) return;
      event.preventDefault();
      const p = center(event.touches);
      gesture = { distance: Math.max(1, p.distance), zoom, x: (shell.scrollLeft + p.x - inset()) / zoom, y: (shell.scrollTop + p.y) / zoom };
      suppressUntil = Infinity;
    };
    const move = (event: TouchEvent) => {
      if (singleTouch && event.touches.length === 1 && Math.hypot(event.touches[0].clientX - singleTouch.x, event.touches[0].clientY - singleTouch.y) > 10) suppressUntil = Date.now() + 500;
      if (!gesture || event.touches.length !== 2) return;
      event.preventDefault();
      const p = center(event.touches);
      apply(gesture.zoom * p.distance / gesture.distance, p.x, p.y, gesture.x, gesture.y);
    };
    const end = (event: TouchEvent) => {
      if (event.touches.length === 0) singleTouch = null;
      if (event.touches.length < 2 && gesture) {
        gesture = null;
        suppressUntil = Date.now() + 400;
      }
    };
    const click = (event: MouseEvent) => {
      if (Date.now() < suppressUntil) { event.preventDefault(); event.stopPropagation(); }
    };
    const wheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      const rect = shell.getBoundingClientRect();
      const x = event.clientX - rect.left - shell.clientLeft;
      const y = event.clientY - rect.top - shell.clientTop;
      apply(zoom * Math.exp(-event.deltaY * .008), x, y, (shell.scrollLeft + x - inset()) / zoom, (shell.scrollTop + y) / zoom);
    };
    const resize = new ResizeObserver(() => {
      const worldX = (shell.scrollLeft - inset()) / zoom;
      const worldY = shell.scrollTop / zoom;
      apply(zoom, 0, 0, worldX, worldY);
    });
    resize.observe(shell);
    shell.addEventListener("scroll", pinHeaders, { passive: true });
    shell.addEventListener("touchstart", start, { passive: false });
    shell.addEventListener("touchmove", move, { passive: false });
    shell.addEventListener("touchend", end);
    shell.addEventListener("touchcancel", end);
    shell.addEventListener("click", click, true);
    shell.addEventListener("wheel", wheel, { passive: false });
    return () => {
      resize.disconnect();
      shell.removeEventListener("scroll", pinHeaders);
      shell.removeEventListener("touchstart", start);
      shell.removeEventListener("touchmove", move);
      shell.removeEventListener("touchend", end);
      shell.removeEventListener("touchcancel", end);
      shell.removeEventListener("click", click, true);
      shell.removeEventListener("wheel", wheel);
    };
  }, [height]);
  return <div ref={viewport} className="schedule-shell zoomable-schedule" tabIndex={0} aria-label="확대 축소 가능한 타임테이블">
    <div ref={surface} className="schedule-scroll-surface">
      <div ref={content} className="schedule-zoom-content">{children}</div>
    </div>
  </div>;
}
