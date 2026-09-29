import { useEffect, useRef, useState } from "react";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Crosshair, Maximize, RotateCcw, RotateCw, FlipHorizontal2, FlipVertical2, Undo2, Save, Download, Check, X } from "lucide-react";
import { KakaoVenueMap } from "../app/kakao-map";
import { GUIDE_IMAGE, GUIDE_WIDTH, GUIDE_HEIGHT, initialPlacement, parsePlacement, alignLandmarks, anchorPlacement, type GuidePlacement, type XY } from "../app/map-overlay";
import "./editor.css";

const DRAFT = "busan-map-editor-draft-v1";
const steps = ["① 안내도에서 기준점 A 선택", "② 카카오 지도에서 같은 지점 A 선택", "③ 안내도에서 기준점 B 선택", "④ 카카오 지도에서 같은 지점 B 선택"];
export function MapEditor() {
  const [placement, setPlacement] = useState<GuidePlacement>(initialPlacement);
  const [saved, setSaved] = useState(""), [token, setToken] = useState("");
  const [message, setMessage] = useState("로컬 설정 불러오는 중…"), [busy, setBusy] = useState(false);
  const [opacity, setOpacity] = useState(60), [visible, setVisible] = useState(true), [reset, setReset] = useState(0);
  const [failed, setFailed] = useState(false), [retry, setRetry] = useState(0);
  const [step, setStep] = useState<number | null>(null), [sources, setSources] = useState<XY[]>([]), [targets, setTargets] = useState<XY[]>([]);
  const [alignMode, setAlignMode] = useState<"one" | "two">("two");
  const [draft, setDraft] = useState<GuidePlacement | null>(null);
  const history = useRef<GuidePlacement[]>([]);
  useEffect(() => {
    let disposed = false;
    fetch("/__map-editor/config").then(async response => {
      if (!response.ok) throw new Error("npm run dev:map으로 실행한 PC 전용 주소에서 열어주세요.");
      const data = await response.json();
      const p = parsePlacement(data.placement);
      if (disposed) return;
      setPlacement(p); setSaved(JSON.stringify(p)); setToken(data.token); setMessage("이 PC에서만 편집 가능 · 공개 사이트와 분리됨");
      try { const raw = localStorage.getItem(DRAFT); if (raw) { const d = parsePlacement(JSON.parse(raw)); if (JSON.stringify(d) !== JSON.stringify(p)) setDraft(d); } } catch {}
    }).catch(error => { if (!disposed) setMessage(error.message); });
    return () => { disposed = true; };
  }, []);
  const remember = (p: GuidePlacement) => { try { localStorage.setItem(DRAFT, JSON.stringify(p)); } catch {} };
  const change = (next: GuidePlacement) => {
    try { const p = parsePlacement(next); history.current.push(placement); if (history.current.length > 100) history.current.shift(); setPlacement(p); remember(p); }
    catch (error) { setMessage((error as Error).message); }
  };
  const adjust = (next: Partial<GuidePlacement>) => {
    let p = { ...placement, ...next, calibrated: false };
    if (next.center) p.anchor = undefined;
    else if (p.anchor) p = anchorPlacement(p, p.anchor.image, p.anchor.world);
    change(p);
  };
  const undo = () => { const p = history.current.pop(); if (p) { setPlacement(p); remember(p); } };
  const mapClick = (p: XY) => {
    if (step === 1) {
      setTargets([p]);
      if (alignMode === "one") {
        try { change(anchorPlacement(placement, sources[0], p)); setStep(null); setReset(n => n + 1); setMessage("기준점을 고정했습니다. 회전·반전·크기를 바꿔도 이 지점은 유지됩니다."); }
        catch (error) { setMessage((error as Error).message); }
      } else setStep(2);
    }
    else if (step === 3) {
      setTargets([targets[0], p]);
      try { change(alignLandmarks(sources as [XY, XY], [targets[0], p], placement)); setStep(null); setVisible(true); setReset(n => n + 1); setMessage("두 지점을 맞췄습니다. 나머지 무대와 도로도 확인 후 저장하세요."); }
      catch (error) { setMessage((error as Error).message); setStep(null); }
    }
  };
  const save = async () => {
    const snapshot = JSON.stringify(placement); setBusy(true);
    try {
      const response = await fetch("/__map-editor/config", { method: "POST", headers: { "Content-Type": "application/json", "X-Editor-Token": token }, body: snapshot });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "저장 실패");
      setSaved(snapshot); setMessage("프로젝트에 저장했습니다. 공개 반영은 배포 ZIP을 다시 만든 뒤 업로드하세요.");
    } catch (error) { setMessage((error as Error).message); }
    finally { setBusy(false); }
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(placement, null, 2)], { type: "application/json" }));
    const a = document.createElement("a"); a.href = url; a.download = "map-overlay-config.json"; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const move = (x: number, y: number) => adjust({ center: { x: placement.center.x + x, y: placement.center.y + y } });
  const dirty = JSON.stringify(placement) !== saved;
  return <div className="map-editor">
    <header className="editor-header"><div><h1>안내도 위치 보정</h1><span>부산국제록페스티벌 2026 · PC 전용</span></div><div className="editor-actions"><span>{dirty ? "미저장" : "저장됨"}</span><button title="이전 상태" aria-label="이전 상태" disabled={!history.current.length} onClick={undo}><Undo2 size={18}/></button><button title="설정 파일 다운로드" aria-label="설정 파일 다운로드" onClick={download}><Download size={18}/></button><button className="primary" onClick={save} disabled={!token || busy || !dirty}><Save size={18}/>{busy ? "저장 중" : "프로젝트에 저장"}</button></div></header>
    <aside className="editor-sidebar">
      {draft && <div className="draft-actions"><span>저장하지 않은 작업이 있습니다.</span><button onClick={() => { change(draft); setDraft(null); }}>이어서 편집</button><button aria-label="임시 작업 무시" onClick={() => setDraft(null)}><X size={16}/></button></div>}
      <section><h2>안내도 방향</h2><div className="orientation-controls">
        <button title="180도 회전" aria-label="180도 회전" onClick={() => { setStep(null); adjust({ rotation: placement.rotation > 0 ? placement.rotation - 180 : placement.rotation + 180 }); }}><RotateCw size={20}/></button>
        <button title="좌우 반전" aria-label="좌우 반전" aria-pressed={placement.mirrorX} onClick={() => { setStep(null); adjust({ mirrorX: !placement.mirrorX }); }}><FlipHorizontal2 size={20}/></button>
        <button title="상하 반전" aria-label="상하 반전" aria-pressed={placement.mirrorY} onClick={() => { setStep(null); adjust({ mirrorY: !placement.mirrorY }); }}><FlipVertical2 size={20}/></button>
      </div><output className="orientation-status">{Number(placement.rotation.toFixed(1))}°{placement.mirrorX ? " · 좌우 반전" : ""}{placement.mirrorY ? " · 상하 반전" : ""}{placement.anchor ? " · 기준점 고정" : ""}</output></section>
      <section><h2>기준점 맞추기</h2>
        <button className="align-start" disabled={failed} onClick={() => { setAlignMode("one"); setSources([]); setTargets([]); setStep(0); setMessage("안내도와 카카오 지도에서 같은 교차로를 선택하세요."); }}><Crosshair size={18}/>한 지점 고정</button>
        <button className="align-start" disabled={failed} onClick={() => { setAlignMode("two"); setSources([]); setTargets([]); setStep(0); setMessage("운동장 모서리 등 두 지도에서 확실히 같은 곳을 선택하세요."); }}><Crosshair size={18}/>두 지점 자동 맞춤</button>
        {step !== null && <div className="alignment-step" role="status"><strong>{steps[step]}</strong><button title="기준점 선택 취소" aria-label="기준점 선택 취소" onClick={() => setStep(null)}><X size={16}/></button></div>}
        <button className={`source-image ${step === 0 || step === 2 ? "picking" : ""}`} aria-label="안내도 기준점 선택" disabled={step !== 0 && step !== 2} onClick={e => {
          const r = e.currentTarget.getBoundingClientRect();
          const p = { x: Math.max(0, Math.min(GUIDE_WIDTH, (e.clientX - r.left) / r.width * GUIDE_WIDTH)), y: Math.max(0, Math.min(GUIDE_HEIGHT, (e.clientY - r.top) / r.height * GUIDE_HEIGHT)) };
          if (step === 0) { setSources([p]); setStep(1); } else { setSources([sources[0], p]); setStep(3); }
        }}><img src={GUIDE_IMAGE} alt="2026 행사장 안내도 원본" draggable={false}/>{sources.map((p, i) => <span key={i} className="source-point" style={{ left: `${p.x / GUIDE_WIDTH * 100}%`, top: `${p.y / GUIDE_HEIGHT * 100}%` }}>{i === 0 ? "A" : "B"}</span>)}</button>
      </section>
      <section><h2>미세 조정</h2><div className="move-controls"><button aria-label="위로 이동" title="위로 이동" onClick={() => move(0, 20)}><ArrowUp/></button><button aria-label="왼쪽으로 이동" title="왼쪽으로 이동" onClick={() => move(-20, 0)}><ArrowLeft/></button><button aria-label="아래로 이동" title="아래로 이동" onClick={() => move(0, -20)}><ArrowDown/></button><button aria-label="오른쪽으로 이동" title="오른쪽으로 이동" onClick={() => move(20, 0)}><ArrowRight/></button></div>
        <label className="range-label">크기 <output>{Math.round(placement.width / initialPlacement.width * 100)}%</output><input aria-label="안내도 크기" type="range" min="100" max="6000" step="10" value={placement.width} onChange={e => adjust({ width: Number(e.target.value) })}/></label>
        <label className="range-label">회전 <input aria-label="회전 각도" type="number" min="-180" max="180" step=".1" value={Number(placement.rotation.toFixed(1))} onChange={e => { if (e.target.value !== "") adjust({ rotation: Number(e.target.value) }); }}/><input aria-label="안내도 회전" type="range" min="-180" max="180" step=".1" value={placement.rotation} onChange={e => adjust({ rotation: Number(e.target.value) })}/></label>
        <label className="range-label">안내도 농도 <output>{opacity}%</output><input aria-label="안내도 농도" type="range" min="0" max="100" step="5" value={opacity} onChange={e => setOpacity(Number(e.target.value))}/></label>
        <label className="editor-check"><input type="checkbox" checked={visible} onChange={e => setVisible(e.target.checked)}/>안내도 표시</label>
        <label className="editor-check"><input type="checkbox" checked={placement.calibrated} onChange={e => change({ ...placement, calibrated: e.target.checked })}/><Check size={16}/>배치 확인 완료</label>
        <p className="editor-note">일러스트의 거리·비율은 실제와 다를 수 있습니다. GPS 정밀 지도는 아닙니다.</p>
      </section>
    </aside>
    <main className={`editor-map-area ${step === 1 || step === 3 ? "picking" : ""}`}>
      <KakaoVenueMap key={retry} className="editor-map-canvas" height={0} location={null} active reset={reset} placement={placement} opacity={step === 1 || step === 3 ? 0 : visible ? opacity / 100 : 0} onMapClick={mapClick} onFailure={() => setFailed(true)}/>
      <div className="editor-map-toolbar"><button title="안내도 전체 보기" aria-label="안내도 전체 보기" onClick={() => setReset(n => n + 1)}><Maximize size={20}/></button><button title="임시 배치로 되돌리기" aria-label="임시 배치로 되돌리기" onClick={() => { change(initialPlacement); setReset(n => n + 1); }}><RotateCcw size={20}/></button><span>{step === 1 || step === 3 ? steps[step] : placement.calibrated ? "배치 확인 완료 · 일러스트 오차 있음" : "임시 배치 · 위치 보정 전"}</span></div>
      {failed && <div className="editor-map-error" role="alert"><strong>카카오 지도를 불러오지 못했습니다.</strong><p>카카오 Developers에 http://localhost:4180 도메인과 카카오맵 사용 설정을 확인하세요.</p><button onClick={() => { setFailed(false); setRetry(n => n + 1); }}>다시 연결</button></div>}
    </main>
    <footer className="editor-status" role="status">{message}</footer>
  </div>;
}
