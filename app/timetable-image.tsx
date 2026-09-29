"use client";

import { useEffect, useRef, useState } from "react";
import { festival } from "./festivals/busan-rock-2025";
import type { PersonalPlan } from "./personal-plan";

type Day = typeof festival.days[number];
const colors: Record<string, string> = { samrock: "#ffe76b", green: "#a6f878", river: "#ffb3cc", wave: "#6ed8e4", hidden: "#bfa5fa" };
const minute = (time: string) => { const [h, m] = time.split(":").map(Number); return h * 60 + m; };

export function drawTimetable(canvas: HTMLCanvasElement, day: Day, picks: string[], mode: "my" | "all", plans: PersonalPlan[] = []) {
  const dayPlans = plans.filter(p => p.dayId === day.id).sort((a, b) => a.start.localeCompare(b.start));
  canvas.width = 1600;
  canvas.height = 2700 + dayPlans.length * 66;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("이미지를 만들 수 없습니다.");
  const left = 105, top = 310, column = 291, scale = 3.4;
  ctx.fillStyle = "#f4f6f2";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.textBaseline = "top";
  const text = (value: string, x: number, y: number, size: number, color = "#17201f", weight = 700) => {
    ctx.fillStyle = color;
    ctx.font = `${weight} ${size}px Arial, "Malgun Gothic", sans-serif`;
    ctx.fillText(value, x, y);
  };
  text("2026 BUSAN INTERNATIONAL ROCK FESTIVAL", 40, 35, 25);
  text(mode === "my" ? "MY TIMETABLE" : "MY PICKS / FULL TIMETABLE", 40, 82, 50);
  text(day.label, 40, 155, 36);
  text(`${day.performances.filter(p => picks.includes(p.id)).length} PICKS · GATE OPEN 10:00`, 600, 164, 25);
  text(mode === "my" ? "내가 선택한 공연 + 개인 일정" : "색상 카드 + MY PICK = 내가 선택한 공연", 40, 215, 24);
  day.stages.forEach((stage, i) => {
    ctx.fillStyle = colors[stage.id];
    ctx.fillRect(left + i * column, top - 55, column - 2, 50);
    text(stage.name, left + i * column + 18, top - 45, 28);
  });
  for (let m = 660; m <= 1320; m += 10) {
    const y = top + (m - 660) * scale;
    ctx.strokeStyle = m % 60 === 0 ? "#9fa9a7" : "#dce1df";
    ctx.lineWidth = m % 60 === 0 ? 2 : 1;
    ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(1560, y); ctx.stroke();
    if (m % 60 === 0) text(`${m / 60}:00`, 20, y - 12, 22);
  }
  for (let i = 0; i <= 5; i++) {
    ctx.strokeStyle = "#bac4c0"; ctx.beginPath(); ctx.moveTo(left + i * column, top);
    ctx.lineTo(left + i * column, top + 660 * scale); ctx.stroke();
  }
  dayPlans.forEach(plan => {
    const y = top + (minute(plan.start) - 660) * scale;
    const h = (minute(plan.end) - minute(plan.start)) * scale;
    ctx.fillStyle = "#ffdfb5"; ctx.fillRect(left, y, column * 5, h);
    ctx.strokeStyle = "#a86829"; ctx.lineWidth = 2; ctx.setLineDash([10, 6]);
    ctx.strokeRect(left + 1, y + 1, column * 5 - 2, h - 2); ctx.setLineDash([]);
    text(`${plan.start}–${plan.end}  ${plan.title}`, left + 14, y + 8, 20, "#59360f");
  });
  day.performances.filter(p => mode === "all" || picks.includes(p.id)).forEach(p => {
    const picked = picks.includes(p.id);
    const x = left + day.stages.findIndex(s => s.id === p.stage) * column + 4;
    const y = top + (minute(p.start) - 660) * scale + 3;
    const h = (minute(p.end) - minute(p.start)) * scale - 6;
    ctx.fillStyle = picked ? colors[p.stage] : "#e4e8e6";
    ctx.fillRect(x, y, column - 8, h);
    ctx.strokeStyle = picked ? "#17201f" : "#bac4c0";
    ctx.lineWidth = picked ? 3 : 1; ctx.strokeRect(x, y, column - 8, h);
    // Wrap every character so long Korean and Latin names are never truncated.
    let size = 23, lines: string[] = [];
    do {
      ctx.font = `700 ${size}px Arial, "Malgun Gothic", sans-serif`;
      lines = []; let line = "";
      for (const char of p.artist) {
        if (line && ctx.measureText(line + char).width > column - 30) { lines.push(line.trim()); line = char; }
        else line += char;
      }
      if (line) lines.push(line.trim());
      if (lines.length * (size + 3) <= h - 47) break;
      size--;
    } while (size > 12);
    text(picked ? "MY PICK" : p.stage.toUpperCase(), x + 10, y + 5, 14, picked ? "#17201f" : "#52625c");
    lines.forEach((line, i) => text(line, x + 10, y + 23 + i * (size + 3), size));
    text(`${p.start} – ${p.end}`, x + 10, y + h - 23, 19, "#283c34");
  });
  dayPlans.forEach((plan, i) => {
    ctx.fillStyle = "#ffdfb5"; ctx.fillRect(40, 2580 + i * 66, 1520, 56);
    text(`개인 일정 · ${plan.start}–${plan.end}  ${plan.title}`, 54, 2594 + i * 66, 22, "#59360f");
  });
  text("BUSAN ROCK 2026 · MY FESTIVAL PLAN", 40, 2620 + dayPlans.length * 66, 23);
  text("공연 시간은 현장 상황에 따라 변경될 수 있습니다.", 40, 2657 + dayPlans.length * 66, 19, "#52625c", 400);
}

export function TimetableImage({ day, picks, plans, onClose }: { day: Day; picks: string[]; plans: PersonalPlan[]; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [mode, setMode] = useState<"my" | "all">("my");
  const [date, setDate] = useState(day.id);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [size, setSize] = useState("original");
  const [width, setWidth] = useState("1080");
  const [height, setHeight] = useState("1920");
  const output = size === "original" ? null : size === "custom" ? [Number(width), Number(height)] : size.split("x").map(Number);
  const validSize = !output || output.every(n => Number.isInteger(n) && n >= 320 && n <= 4096);
  const chosen = festival.days.find(d => d.id === date)!;
  const count = chosen.performances.filter(p => picks.includes(p.id)).length;
  useEffect(() => { dialog.current?.showModal(); }, []);
  useEffect(() => {
    let cancelled = false;
    setUrl(""); setError("");
    if (!validSize) { setError("가로·세로를 320~4096px 사이의 정수로 입력해주세요."); return; }
    document.fonts.ready.then(() => {
      if (cancelled) return;
      try {
        const canvas = document.createElement("canvas");
        drawTimetable(canvas, chosen, picks, mode, plans);
        if (output) {
          const resized = document.createElement("canvas");
          [resized.width, resized.height] = output;
          const ctx = resized.getContext("2d");
          if (!ctx) throw new Error("Canvas unavailable");
          ctx.fillStyle = "#f4f6f2";
          ctx.fillRect(0, 0, resized.width, resized.height);
          const scale = Math.min(resized.width / canvas.width, resized.height / canvas.height);
          const w = canvas.width * scale, h = canvas.height * scale;
          ctx.drawImage(canvas, (resized.width - w) / 2, (resized.height - h) / 2, w, h);
          setUrl(resized.toDataURL("image/png"));
        } else setUrl(canvas.toDataURL("image/png"));
      } catch { setError("이미지를 만들지 못했습니다. 다시 시도해 주세요."); }
    });
    return () => { cancelled = true; };
  }, [chosen, picks, mode, plans, size, width, height]);
  const filename = `busan-rock-${chosen.date}-${mode}-${output ? output.join("x") : "original"}.png`;
  async function shareImage() {
    setBusy(true); setError("");
    try {
      const blob = await (await fetch(url)).blob();
      const file = new File([blob], filename, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: `부산락페 ${chosen.label}` });
      else setError("이 브라우저에서는 PNG 저장을 사용해 주세요. 미리보기 이미지를 길게 눌러 저장할 수도 있습니다.");
    } catch (e) {
      if (!(e instanceof DOMException && e.name === "AbortError")) setError("공유하지 못했습니다. PNG 저장을 사용해 주세요.");
    } finally { setBusy(false); }
  }
  return <dialog ref={dialog} className="image-dialog" onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="image-dialog-head"><div><p>MY FESTIVAL PLAN</p><h2>타임테이블 이미지</h2></div><button onClick={onClose} aria-label="닫기">×</button></div>
    <label className="export-date">날짜<select value={date} onChange={e => setDate(e.target.value)}>{festival.days.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}</select></label>
    <div className="export-modes">{(["my", "all"] as const).map(m => <button key={m} aria-pressed={mode === m} onClick={() => setMode(m)}>{m === "my" ? "선택한 공연만" : "전체 + 내 선택 강조"}</button>)}</div>
    {!count && <p role="status">이 날짜에 선택한 공연이 없습니다.</p>}
    <label className="export-date">이미지 크기<select value={size} onChange={e => setSize(e.target.value)}>
      <option value="original">원본</option>
      <option value="1080x1920">1080 × 1920</option>
      <option value="1440x2560">1440 × 2560</option>
      <option value="custom">직접 설정</option>
    </select></label>
    {size === "custom" && <div className="export-custom"><label>가로 (px)<input type="number" min="320" max="4096" step="1" value={width} onChange={e => setWidth(e.target.value)}/></label><label>세로 (px)<input type="number" min="320" max="4096" step="1" value={height} onChange={e => setHeight(e.target.value)}/></label></div>}
    {error && <p role="alert">{error}</p>}
    {url ? <img className="export-preview" src={url} alt={`${chosen.label} ${mode === "my" ? "선택 공연" : "전체 시간표와 선택 강조"} 이미지 미리보기`} /> : !error && <p role="status">이미지를 만드는 중…</p>}
    <div className="export-actions">{url && <a href={url} download={filename}>PNG 저장</a>}<button onClick={shareImage} disabled={!url || busy}>{busy ? "공유 중…" : "이미지 공유"}</button></div>
  </dialog>;
}
