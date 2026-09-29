"use client";
import { useEffect, useRef, useState } from "react";
import { festival } from "./festivals/busan-rock-2025";

const JOURNAL = "busan-rock-pick-contributions-v1";
const CACHE = "busan-rock-pick-count-cache-v1";
export const REFRESH_MS = 10 * 60 * 1000;
type Operation = { id: string; delta: number; token: string };
type Journal = { counted: string[]; pending: Operation[] };
const valid = new Set(festival.days.flatMap(d => d.performances.map(p => p.id)));
const token = () => Array.from(crypto.getRandomValues(new Uint8Array(16)), b => b.toString(16).padStart(2, "0")).join("");

export function usePickCounts(picks: string[], enabled: boolean) {
  const desired = useRef(picks);
  desired.current = picks;
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const [status, setStatus] = useState("PICK 집계 연결 중");
  const sync = useRef<() => void>(() => {});
  useEffect(() => {
    if (!enabled) return;
    let stopped = false, busy = false, reading = false, lastRead = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const sdk = import("./firebase-picks");
    const saveCache = (values: Record<string, number>, at: number) => {
      try { localStorage.setItem(CACHE, JSON.stringify({ counts: values, at })); } catch { /* Counts still work without the optional cache. */ }
    };
    const errorStatus = (error: unknown) => {
      const code = (error as { code?: string })?.code ?? "";
      console.warn("PICK connection:", code || "unavailable");
      return code.includes("permission-denied") || code.includes("operation-not-allowed") || code.includes("configuration-not-found")
        ? "PICK 집계 설정 중 · 내 선택은 이 기기에 저장됩니다"
        : "PICK 집계 연결 대기 · 내 선택은 이 기기에 저장됩니다";
    };
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE) || "null");
      if (cached && typeof cached.at === "number" && cached.at <= Date.now() && cached.counts && typeof cached.counts === "object") {
        lastRead = cached.at;
        setCounts(cached.counts);
      }
    } catch { /* Start without cached totals. */ }
    async function refresh() {
      if (reading || stopped || document.hidden || !navigator.onLine || Date.now() - lastRead < REFRESH_MS) return;
      reading = true;
      try {
        const values = await (await sdk).readCounts();
        if (!stopped) { lastRead = Date.now(); setCounts(values); saveCache(values, lastRead); setStatus("PICK 10분마다 갱신"); }
      } catch (error) { if (!stopped) setStatus(errorStatus(error)); }
      finally { reading = false; }
    }
    async function flush() {
      if (!enabled || stopped || busy || !navigator.onLine) return;
      busy = true;
      try {
        // Hold the journal lock across the request so two tabs cannot send duplicate votes.
        const work = async () => {
          if (stopped) return;
          const raw = localStorage.getItem(JOURNAL);
          const journal: Journal = raw ? JSON.parse(raw) : { counted: [], pending: [] };
          if (!Array.isArray(journal.counted) || !Array.isArray(journal.pending)) throw new Error("Invalid contribution journal");
          const counted = new Set(journal.counted.filter(id => valid.has(id)));
          const persist = () => localStorage.setItem(JOURNAL, JSON.stringify({ counted: [...counted], pending: journal.pending }));
          persist(); // Never send without a durable retry token.
          for (;;) {
            if (stopped) return;
            if (!journal.pending.length) {
              const target = new Set(desired.current.filter(id => valid.has(id)));
              const id = [...new Set([...counted, ...target])].find(id => counted.has(id) !== target.has(id));
              if (!id) break;
              journal.pending.push({ id, delta: target.has(id) ? 1 : -1, token: token() });
              persist();
            }
            const op = journal.pending[0];
            if (!valid.has(op.id) || ![1, -1].includes(op.delta) || !/^[a-f0-9]{32}$/.test(op.token)) throw new Error("Invalid pending vote");
            const count = await (await sdk).submitPick(op.id, op.delta, op.token);
            if (op.delta === 1) counted.add(op.id); else counted.delete(op.id);
            journal.pending.shift();
            persist();
            if (!stopped) setCounts(previous => {
              if (!previous) return previous;
              const next = { ...previous, [op.id]: count };
              saveCache(next, lastRead);
              return next;
            });
          }
          if (!stopped && lastRead > 0) setStatus("PICK 10분마다 갱신");
        };
        if (navigator.locks) await navigator.locks.request(JOURNAL, work);
        else await work();
      } catch (error) { if (!stopped) setStatus(errorStatus(error)); }
      finally { busy = false; }
    }
    sync.current = () => {
      clearTimeout(timer);
      timer = setTimeout(() => { void flush(); }, 2500);
    };
    const resume = () => { void refresh(); sync.current(); };
    resume();
    const interval = setInterval(resume, REFRESH_MS);
    window.addEventListener("online", resume);
    document.addEventListener("visibilitychange", resume);
    return () => {
      stopped = true; clearTimeout(timer); clearInterval(interval);
      window.removeEventListener("online", resume);
      document.removeEventListener("visibilitychange", resume);
    };
  }, [enabled]);
  useEffect(() => { sync.current(); }, [picks]);
  return { counts, status };
}
