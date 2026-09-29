"use client";
import { useEffect, useRef, useState } from "react";

export type PersonalPlan = { id: string; dayId: string; title: string; start: string; end: string; kind?: "general" | "rest" };
export const PLAN_STORAGE = "busan-rock-personal-plans-v1";
export const toMinutes = (value: string) => { const [h, m] = value.split(":").map(Number); return h * 60 + m; };
export const toTime = (value: number) => `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
export function validPlan(p: PersonalPlan) {
  return p && typeof p.id === "string" && ["day1", "day2", "day3"].includes(p.dayId)
    && typeof p.title === "string" && p.title.trim().length > 0 && p.title.length <= 40
    && (p.kind === undefined || p.kind === "general" || p.kind === "rest")
    && /^([01]\d|2[0-3]):[0-5]\d$/.test(p.start) && /^([01]\d|2[0-3]):[0-5]\d$/.test(p.end)
    && toMinutes(p.start) >= 660 && toMinutes(p.end) <= 1320 && toMinutes(p.end) - toMinutes(p.start) >= 10;
}

export function PersonalPlanEditor({ plan, existing, onSave, onDelete, onClose }: {
  plan: PersonalPlan; existing: boolean; onSave: (p: PersonalPlan) => string | void;
  onDelete: () => void; onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState(plan);
  const [error, setError] = useState("");
  useEffect(() => { dialog.current?.showModal(); }, []);
  return <dialog ref={dialog} className="personal-plan-dialog" aria-label="개인 일정" onCancel={onClose}>
    <form onSubmit={e => {
      e.preventDefault();
      const clean = { ...draft, title: draft.title.trim() };
      if (!validPlan(clean)) { setError("11:00~22:00 사이에서 종료 시간을 시작보다 10분 이상 늦게 정해 주세요."); return; }
      const problem = onSave(clean);
      if (problem) setError(problem);
    }}>
      <div className="help-heading"><h2>{existing ? "개인 일정 수정" : "개인 일정 추가"}</h2><button type="button" onClick={onClose} aria-label="개인 일정 닫기">×</button></div>
      <label>일정 이름<input autoFocus required maxLength={40} value={draft.title} placeholder="예: 점심 식사, 친구 만나기" onChange={e => setDraft({ ...draft, title: e.target.value })} /></label>
      <label>일정 종류<select aria-label="일정 종류" value={draft.kind||"general"} onChange={e=>setDraft({...draft,kind:e.target.value as "general"|"rest"})}><option value="general">일반 일정</option><option value="rest">휴식</option></select></label>
      <div className="plan-times"><label>시작<input aria-label="시작 시간" type="time" required min="11:00" max="21:50" value={draft.start} onChange={e => setDraft({ ...draft, start: e.target.value })} /></label><label>종료<input aria-label="종료 시간" type="time" required min="11:10" max="22:00" value={draft.end} onChange={e => setDraft({ ...draft, end: e.target.value })} /></label></div>
      {error && <p className="plan-error" role="alert">{error}</p>}
      <div className="plan-actions">{existing && <button type="button" className="plan-delete" onClick={onDelete}>일정 삭제</button>}<button type="submit">저장</button></div>
    </form>
  </dialog>;
}
