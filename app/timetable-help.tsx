"use client";
import { useEffect, useRef, type ReactNode } from "react";

export function TimetableHelp({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { dialog.current?.showModal(); }, []);
  return <dialog ref={dialog} className="timetable-help" aria-label="타임테이블 이용 안내" onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="help-heading"><h2>이용 안내</h2><button onClick={onClose} aria-label="이용 안내 닫기">×</button></div>
    {children}
  </dialog>;
}
