"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { festival, type Performance } from "./festivals/busan-rock-2025";
import { artistInfo } from "./festivals/artist-info";
import { TimetableImage } from "./timetable-image";
import { ZoomableTimetable } from "./zoomable-timetable";
import { usePickCounts } from "./use-pick-counts";
import { TimetableHelp } from "./timetable-help";
import { PersonalPlanEditor, PLAN_STORAGE, validPlan, toTime, type PersonalPlan } from "./personal-plan";
import { TravelOverlay } from "./travel-overlay";
import { VenueMap } from "./venue-map";
import { useFestivalProgress } from "./festival-progress";
import { BadgeHome } from "./badge-home";
import { FestivalRecap } from "./festival-recap";
import { PerformanceNotice } from "./performance-notice";
import { isArtistShow } from "./badge-data";
import "./badges.css";
import "./venue.css";
import { Smartphone, ChevronDown, ChartNoAxesCombined, ChevronRight } from "lucide-react";

const START = 11 * 60;
const END = 22 * 60;
const SCALE = 4;
const STORAGE_KEY = "busan-rock-timetable-picks";
const CONTEXT_STORAGE_KEY = "busan-rock-timetable-show-others";
const LEGACY_PICKS: Record<string, string> = {
  "2026-day1-river-tokai": "2026-day1-green-1",
  "2026-day1-samrock-shin-in-ryu": "2026-day2-samrock-2",
  "2026-day1-green-cnblue": "2026-day3-green-6",
};
function normalizePicks(value: unknown): string[] {
  const valid = new Set(festival.days.flatMap(d => d.performances.map(p => p.id)));
  return Array.isArray(value) ? [...new Set(value.filter((id): id is string => typeof id === "string").map(id => LEGACY_PICKS[id] ?? id).filter(id => valid.has(id)))] : [];
}

function formatPicks(value: number) {
  return value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value.toLocaleString("ko-KR");
}

function minutes(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

function overlaps(a: Performance, b: Performance) {
  return minutes(a.start) < minutes(b.end) && minutes(b.start) < minutes(a.end);
}

export default function Home() {
  const {progress,toggle:toggleProgress,changeDrink,setFavorite,warning:progressWarning}=useFestivalProgress();
  const [view, setView] = useState<"home" | "lineup" | "timetable" | "map">("home");
  const [artistId, setArtistId] = useState<string | null>(null);
  const [dayId, setDayId] = useState(festival.days[0].id);
  const [mode, setMode] = useState<"all" | "my">("all");
  const [picks, setPicks] = useState<string[]>([]);
  const [sharedPicks, setSharedPicks] = useState<string[] | null>(null);
  const [notice, setNotice] = useState("");
  const [imageShare, setImageShare] = useState(false);
  const [recapOpen, setRecapOpen] = useState(false);
  const [recordRequest,setRecordRequest] = useState(0);
  const [guideOpen, setGuideOpen] = useState(false);
  const [showTravel, setShowTravel] = useState(false);
  const [showOtherPerformances, setShowOtherPerformances] = useState(false);
  const [ready, setReady] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [now, setNow] = useState<Date | null>(null);
  const [plans, setPlans] = useState<PersonalPlan[]>([]);
  const [editingPlan, setEditingPlan] = useState<PersonalPlan | null>(null);
  const { counts: pickCounts, status: pickStatus } = usePickCounts(picks, ready && sharedPicks === null && storageAvailable);
  const countLabel = (id: string) => pickCounts === null ? "—" : formatPicks(pickCounts[id] ?? 0);

  useEffect(() => {
    const refresh = () => setNow(new Date());
    refresh();
    const timer = window.setInterval(refresh, 15_000);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("pick");
    const incoming = param === null ? null : normalizePicks(param.split(","));
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      setPicks(incoming ?? normalizePicks(saved));
    } catch {
      setStorageAvailable(false);
      setPicks(incoming ?? []);
    }
    setSharedPicks(incoming);
    try {
      setShowOtherPerformances(localStorage.getItem(CONTEXT_STORAGE_KEY) === "true");
    } catch { /* Display preferences are optional when storage is unavailable. */ }
    try {
      const saved = JSON.parse(localStorage.getItem(PLAN_STORAGE) || "[]");
      setPlans(Array.isArray(saved) ? saved.filter(validPlan) : []);
    } catch { setStorageAvailable(false); }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready && !sharedPicks) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(picks));
      } catch {
        setStorageAvailable(false);
      }
    }
  }, [picks, ready, sharedPicks]);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(PLAN_STORAGE, JSON.stringify(plans)); }
    catch { setStorageAvailable(false); }
  }, [plans, ready]);

  function toggleOtherPerformances(visible: boolean) {
    setShowOtherPerformances(visible);
    try { localStorage.setItem(CONTEXT_STORAGE_KEY, String(visible)); }
    catch { /* Keep the display toggle usable without persistent storage. */ }
  }

  const day = festival.days.find((item) => item.id === dayId) ?? festival.days[0];
  const clockParts = now ? new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
  }).formatToParts(now) : [];
  const clock = Object.fromEntries(clockParts.map(part => [part.type, part.value]));
  const currentMinute = Number(clock.hour) * 60 + Number(clock.minute) + Number(clock.second) / 60;
  const showNow = now !== null;
  const nowTop = Math.max(0, Math.min(END - START, currentMinute - START)) * SCALE;
  const nowLabel = `${clock.hour}:${clock.minute}`;
  const selected = useMemo(() => day.performances.filter((item) => picks.includes(item.id)), [day.performances, picks]);
  const dayPlans = plans.filter(p => p.dayId === day.id);
  function newPlan(at = START) {
    const start = Math.max(START, Math.min(END - 10, Math.round(at / 5) * 5));
    const id = Array.from(crypto.getRandomValues(new Uint8Array(12)), b => b.toString(16).padStart(2, "0")).join("");
    setEditingPlan({ id, dayId: day.id, title: "", start: toTime(start), end: toTime(Math.min(END, start + 30)) });
  }
  function savePlan(plan: PersonalPlan) {
    if (plans.some(other => other.id !== plan.id && other.dayId === plan.dayId && minutes(other.start) < minutes(plan.end) && minutes(plan.start) < minutes(other.end))) return "다른 개인 일정과 시간이 겹칩니다. 시간을 조정해 주세요.";
    setPlans(current => [...current.filter(p => p.id !== plan.id), plan]);
    setEditingPlan(null);
  }
  const activePerformance = festival.days.flatMap((item) => item.performances).find((item) => item.id === artistId);
  const activeArtist = artistId ? artistInfo[artistId] : null;
  const conflictIds = useMemo(() => {
    const ids = new Set<string>();
    selected.forEach((item, index) => selected.slice(index + 1).forEach((other) => {
      if (overlaps(item, other)) { ids.add(item.id); ids.add(other.id); }
    }));
    return ids;
  }, [selected]);

  function togglePick(id: string) {
    setPicks((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function saveShared() {
    setSharedPicks(null);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(picks));
    } catch {
      setStorageAvailable(false);
    }
    setNotice("내 타임테이블로 저장했어요");
  }


  const height = (END - START) * SCALE;
  const hours = Array.from({ length: 12 }, (_, index) => 11 + index);

  return (
    <main className={view === "timetable" ? "timetable-active" : undefined}>
      <PerformanceNotice picks={picks} onOpen={(day,id)=>{setDayId(day);setMode("my");setView("timetable");window.setTimeout(()=>document.querySelector(`[data-performance-id="${id}"]`)?.scrollIntoView({block:"center",inline:"center"}),100);}}/>
      {recapOpen&&<FestivalRecap picks={picks} progress={progress} plans={plans} onClose={()=>setRecapOpen(false)} onRecord={()=>{setRecapOpen(false);setView("home");setRecordRequest(v=>v+1);}}/>}
      {view === "home" && <section className="content-view home-view">
        <div className="section-brand"><p>BUSAN ROCK FESTIVAL</p><span>MY FESTIVAL GUIDE</span></div>
        <details className="home-install"><summary><Smartphone size={23} aria-hidden="true"/><span>홈 화면에 설치 방법 <small>(어플처럼 사용하기)</small></span><ChevronDown className="install-expand" size={22} aria-hidden="true"/></summary>
        <div className="install-guides">
          <details className="install-guide">
            <summary><div><strong>아이폰 유저용</strong><span>iPhone · Safari</span></div><span className="guide-chevron" aria-hidden="true">⌄</span></summary>
            <div className="install-guide-body">
              <h2>Safari에서 웹사이트를 앱으로 만들기</h2>
              <p>홈 화면에 아이콘을 추가하면 웹사이트를 앱처럼 열고 사용할 수 있습니다.</p>
              <ol>
                <li>iPhone에서 <strong>Safari</strong> 앱을 여세요.</li>
                <li>이 타임테이블 웹사이트로 이동하세요.</li>
                <li><strong>더보기(…)</strong>를 누른 다음 <strong>공유</strong>를 누르세요.<p>탭 레이아웃이 하단 또는 상단이면 공유 버튼(위쪽 화살표가 있는 사각형)을 바로 누르세요.</p></li>
                <li>공유 목록을 아래로 내려 <strong>홈 화면에 추가</strong>를 누르세요.<p>보이지 않으면 목록 맨 아래의 <strong>동작 편집</strong>에서 ‘홈 화면에 추가’를 추가하세요.</p></li>
                <li><strong>웹 앱으로 열기</strong>를 켜세요.<p>iOS 버전에 따라 이 옵션이 표시되지 않을 수 있습니다.</p></li>
                <li><strong>추가</strong>를 누르세요.</li>
              </ol>
              <p className="install-result">이제 홈 화면에 생긴 아이콘을 눌러 타임테이블을 열 수 있습니다.</p>
            </div>
          </details>
          <details className="install-guide android-install-guide">
            <summary><div><strong>안드로이드 유저용</strong><span>Galaxy · Android · Chrome</span></div><span className="guide-chevron" aria-hidden="true">⌄</span></summary>
            <div className="install-guide-body">
              <h2>Chrome에서 홈 화면에 추가하기</h2>
              <p>갤럭시 등 안드로이드 휴대폰에서는 Chrome으로 진행하세요.</p>
              <ol>
                <li>휴대폰에서 <strong>Chrome</strong> 앱을 여세요.</li>
                <li>이 타임테이블 웹사이트로 이동하세요.</li>
                <li>주소 표시줄 옆 <strong>더보기(⋮)</strong> 메뉴를 누르세요.</li>
                <li><strong>설치 및 바로가기 만들기 → 설치</strong>를 선택하세요.<p>Chrome 버전에 따라 ‘홈 화면에 추가’ 또는 ‘앱 설치’로 표시될 수 있습니다.</p></li>
                <li>안내에 따라 <strong>설치</strong> 또는 <strong>추가</strong>를 눌러 완료하세요.<p>설치 항목이 없고 ‘바로가기 만들기’가 보이면, 이름을 확인한 뒤 홈 화면에 추가하세요. 바로가기는 Chrome에서 열릴 수 있습니다.</p></li>
                <li>홈 화면이나 앱 목록에 추가된 아이콘을 눌러 실행하세요.</li>
              </ol>
              <p className="install-result">카카오톡 등 다른 앱 안에서 열었다면 주소를 복사해 Chrome에서 다시 여세요.</p>
              <a href="https://support.google.com/chrome/answer/9658361?co=GENIE.Platform%3DAndroid&hl=ko" target="_blank" rel="noreferrer">Google 공식 설치 안내 ↗</a>
            </div>
          </details>
        </div>
        </details>
        <button className="recap-open" onClick={()=>setRecapOpen(true)}><ChartNoAxesCombined size={24}/><span>나의 페스티벌 결산</span><ChevronRight size={20}/></button>
        <BadgeHome recordRequest={recordRequest} picks={picks} progress={progress} plans={plans} toggle={toggleProgress} changeDrink={changeDrink} setFavorite={setFavorite} onTimetable={()=>{setMode("my");setView("timetable");}} onFood={()=>setView("map")}/>
        {progressWarning&&<p role="status">{progressWarning}</p>}
        <button className="primary-action" onClick={() => setView("timetable")}>타임테이블 만들기 →</button>
      </section>}

      {view === "lineup" && <section className="content-view lineup-view">
        <p className="content-update">업데이트 중</p>
        <div className="section-brand"><p>2026 LINE-UP</p><span>{day.label}</span></div>
        <nav className="lineup-day-tabs" aria-label="라인업 날짜 선택">
          {festival.days.map((item, index) => <button key={item.id} className={dayId === item.id ? "active" : ""} onClick={() => setDayId(item.id)}><strong>DAY {index + 1}</strong><span>{item.label}</span></button>)}
        </nav>
        <div className="page-heading"><h1>ARTISTS</h1><span>{day.performances.length} ACTS</span></div>
        <div className="artist-list">
          {day.performances.map((item, index) => <article key={item.id} role="button" tabIndex={0} onClick={() => setArtistId(item.id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setArtistId(item.id); }}>
            <span className="artist-number">{String(index + 1).padStart(2, "0")}</span>
            <div><h2>{item.artist}</h2><p>{item.stage.toUpperCase()} STAGE · {item.start} <span className="lineup-count">{countLabel(item.id)} PICK</span></p></div>
            <button className="lineup-pick" onClick={(event) => { event.stopPropagation(); togglePick(item.id); }} aria-label={`${item.artist} ${picks.includes(item.id) ? "선택 해제" : "선택"}`}>{picks.includes(item.id) ? "−" : "+"}</button>
          </article>)}
          {!day.performances.length && <div className="empty-lineup"><strong>LINE-UP COMING SOON</strong><p>{day.label} 아티스트 정보가 추가되면 이곳에 표시됩니다.</p></div>}
        </div>
      </section>}

      {view === "map" && <VenueMap progress={progress} toggle={toggleProgress}/>}

      {view === "timetable" && <>
      <header className="app-header">
        <div className="brand-row">
          <div><p className="festival-kicker">2026 · SAMNAK ECO PARK</p><h1>BUSAN<br />ROCK FESTIVAL</h1></div>
          <div className="date-badge"><strong>OCT</strong><span>02—04</span></div>
        </div>
        <nav className="day-tabs" aria-label="날짜 선택">
          {festival.days.map((item, index) => <button key={item.id} className={dayId === item.id ? "active" : ""} onClick={() => setDayId(item.id)}><span>DAY {index + 1}</span><small>{item.label}</small></button>)}
        </nav>
        <div className="toolbar">
          <div className="mode-switch" aria-label="시간표 보기 방식">
            <button className={mode === "all" ? "active" : ""} onClick={() => setMode("all")}>ALL</button>
            <button className={mode === "my" ? "active" : ""} onClick={() => setMode("my")}>MY <span>{picks.length}</span></button>
          </div>
          <button className="share-button" onClick={() => setImageShare(true)}>이미지 저장 / 공유 ↗</button>
        </div>
      </header>

      {sharedPicks && <aside className="shared-banner"><div><strong>공유받은 타임테이블</strong><span>{sharedPicks.length}개 공연이 선택되어 있어요.</span></div><button onClick={saveShared}>내 타임테이블로 저장</button></aside>}

      <section className="schedule-section" aria-label={`${day.label} 공연 시간표`}>
        <div className="schedule-intro">
          <p>{mode === "my" ? "MY TIMETABLE" : "FULL LINE-UP"}</p>
          <div className="schedule-commands">
            {mode === "my" && <>
              <label className="travel-switch"><input type="checkbox" checked={showOtherPerformances} onChange={e => toggleOtherPerformances(e.target.checked)} /><span>다른 공연 흐리게</span></label>
              <label className="travel-switch"><input type="checkbox" checked={showTravel} onChange={e => setShowTravel(e.target.checked)} /><span>이동시간</span></label>
              <button className="guide-open" onClick={() => newPlan()}>일정 추가</button>
            </>}
            <button className="guide-open" onClick={() => setGuideOpen(true)}>이용 안내</button>
          </div>
        </div>
        <ZoomableTimetable height={height + 48}>
          <div className="time-rail">
            <div className="time-head">TIME</div>
            <div className="time-body" style={{ height }}>{hours.map((hour) => <span key={hour} style={{ top: (hour * 60 - START) * SCALE }}>{hour}:00</span>)}{showNow && <div className="current-time-label" style={{ top: nowTop }} aria-label={`현재 한국 시각 ${nowLabel}`}>{nowLabel}</div>}</div>
          </div>
          <div className="stage-scroll">
            <div className="stages">
              {mode === "my" && showTravel && <TravelOverlay selected={selected} plans={dayPlans} stages={day.stages} height={height} scale={SCALE} />}
              {mode === "my" && dayPlans.map(plan => <div key={plan.id} className="personal-plan-band" style={{ top: 48 + (minutes(plan.start) - START) * SCALE, height: (minutes(plan.end) - minutes(plan.start)) * SCALE }}>
                <button className="personal-plan-label" onClick={() => setEditingPlan(plan)} aria-label={`${plan.title} ${plan.start}~${plan.end} 개인 일정 수정`}><strong>{plan.title}</strong><span>{plan.start}–{plan.end}</span></button>
              </div>)}
              {day.stages.map((stage) => <div className="stage-column" key={stage.id}>
                <div className={`stage-head stage-${stage.id}`}><span>{stage.name}</span><small>STAGE</small></div>
                <div className="stage-track" style={{ height }} onClick={event => {
                  if (mode !== "my" || (event.target as HTMLElement).closest(".performance")) return;
                  const rect = event.currentTarget.getBoundingClientRect();
                  newPlan(START + (event.clientY - rect.top) / rect.height * (END - START));
                }}>
                  {showNow && <div className="current-time-line" style={{ top: nowTop }} aria-hidden="true" />}
                  {hours.map((hour) => <i className="hour-line" key={hour} style={{ top: (hour * 60 - START) * SCALE }} />)}
                  {day.performances.filter((item) => item.stage === stage.id && (mode === "all" || showOtherPerformances || picks.includes(item.id))).map((item) => {
                    const picked = picks.includes(item.id);
                    return <Fragment key={item.id}><button data-performance-id={item.id} type="button" aria-pressed={picked} aria-label={`${item.artist} ${item.start}~${item.end} ${picked ? "PICK 취소" : "PICK 추가"}`} onClick={event => { event.stopPropagation(); togglePick(item.id); }} className={`performance stage-${stage.id} ${picked ? "picked" : ""} ${mode === "my" && !picked ? "unpicked-context" : ""} ${conflictIds.has(item.id) ? "conflict" : ""} ${mode==="my"&&picked&&isArtistShow(item)?"with-attendance":""}`}
                      style={{
                        top: (minutes(item.start) - START) * SCALE + 16,
                        height: Math.max((minutes(item.end) - minutes(item.start)) * SCALE - 20, 52),
                      }}>
                      <span className="performance-pick-badge">{countLabel(item.id)} PICK</span>
                      <span className="artist">{item.artist}</span><span className="performance-meta">{conflictIds.has(item.id) && <i title="시간 중복">!</i>}<span>{item.start}—{item.end}</span></span>
                      {picked && <span className="picked-mark" aria-hidden="true">✓</span>}
                    </button>{mode==="my"&&picked&&isArtistShow(item)&&<button className="attendance-check" aria-label={`${item.artist} 관람 완료`} aria-pressed={progress.attended.includes(item.id)} style={{top:(minutes(item.end)-START)*SCALE-31}} onClick={event=>{event.stopPropagation();toggleProgress("attended",item.id);}}>{progress.attended.includes(item.id)?"✓ 관람 완료":"관람 완료 체크"}</button>}</Fragment>;
                  })}
                </div>
              </div>)}
            </div>
          </div>
        </ZoomableTimetable>
      </section>
      {guideOpen && <TimetableHelp onClose={() => setGuideOpen(false)}><footer className="timetable-guide">
        <div className="guide-title"><p>MY TIMETABLE GUIDE</p><strong>내 페스티벌 일정을<br />간편하게 만들어 보세요.</strong></div>
        <div className="guide-list">
          <article><b>✓</b><div><strong>PICK 추가와 취소</strong><p>공연 카드 어디든 누르면 내 타임테이블에 추가됩니다. 다시 누르면 선택이 취소됩니다.</p></div></article>
          <article><b>MY</b><div><strong>개인 일정</strong><p>MY의 빈 시간대를 누르거나 ‘일정 추가’를 눌러 식사, 휴식 등의 시간을 정할 수 있습니다. 일정 칸의 이름을 누르면 수정하거나 삭제할 수 있습니다. 개인 일정은 이 기기에만 저장되고 공유 이미지에도 표시됩니다.</p></div></article>
          <article><b>P</b><div><strong>PICK 숫자</strong><p>다른 관객들이 해당 공연을 자신의 타임테이블에 추가한 횟수입니다. 전체 PICK 숫자는 10분마다 갱신됩니다. 개인별 타임테이블은 서버에 저장하지 않습니다.</p></div></article>
          <article><b>!</b><div><strong>시간 중복 표시</strong><p>내가 선택한 두 공연의 시간이 겹치면 카드의 공연 시간 옆에 빨간색 !가 표시됩니다.</p></div></article>
          <article><b>MY</b><div><strong>자동 저장</strong><p>나의 선택은 현재 기기의 브라우저에 자동 저장됩니다. 같은 기기와 브라우저로 다시 접속하면 선택한 일정이 유지됩니다.</p></div></article>
          <article><b>↗</b><div><strong>타임테이블 이미지</strong><p>선택한 공연만 담거나, 전체 시간표에서 내 선택을 강조한 이미지를 날짜별로 저장하고 공유할 수 있습니다.</p></div></article>
        </div>
        <p className="prototype-note" role="status">{pickStatus}</p>
        <span className="festival-signature">2026 BUSAN INTERNATIONAL ROCK FESTIVAL</span>
      </footer></TimetableHelp>}
      </>}
      {notice && <button className="toast" onClick={() => setNotice("")}>{notice}</button>}
      {imageShare && <TimetableImage day={day} picks={picks} plans={plans} onClose={() => setImageShare(false)} />}
      {editingPlan && <PersonalPlanEditor plan={editingPlan} existing={plans.some(p => p.id === editingPlan.id)} onSave={savePlan} onClose={() => setEditingPlan(null)} onDelete={() => { setPlans(current => current.filter(p => p.id !== editingPlan.id)); setEditingPlan(null); }} />}
      {!storageAvailable && <aside className="storage-warning"><strong>현재 화면에서만 저장 중</strong><span>Safari 또는 Chrome에서 주소를 직접 열면 선택한 일정이 자동 저장됩니다.</span></aside>}
      {activePerformance && <div className="artist-modal" role="dialog" aria-modal="true" aria-label={`${activePerformance.artist} 아티스트 정보`} onClick={() => setArtistId(null)}>
        <article className="artist-sheet" onClick={(event) => event.stopPropagation()}>
          <button className="close-sheet" onClick={() => setArtistId(null)} aria-label="닫기">×</button>
          {activeArtist?.image ? <img src={activeArtist.image} alt={activePerformance.artist} /> : <div className="artist-image-placeholder"><span>ARTIST PHOTO</span><strong>{activePerformance.artist}</strong></div>}
          <div className="artist-sheet-body"><p>{activePerformance.stage.toUpperCase()} STAGE · {activePerformance.start}—{activePerformance.end}</p><h2>{activeArtist?.name ?? activePerformance.artist}</h2><div className="detail-pick-count"><strong>{countLabel(activePerformance.id)}</strong><span>PICK · 10분마다 갱신</span></div><span>{activeArtist?.bio ?? "아티스트 소개를 준비하고 있어요."}</span>
            {activeArtist?.youtubeUrl ? <a href={activeArtist.youtubeUrl} target="_blank" rel="noreferrer">YouTube에서 보기 ▶</a> : <button disabled>YouTube 링크 준비 중</button>}
          </div>
        </article>
      </div>}
      <nav className="bottom-nav" aria-label="주요 메뉴">
        <button className={view === "home" ? "active" : ""} onClick={() => setView("home")}><span aria-hidden="true">⌂</span><small>홈</small></button>
        <button className={view === "lineup" ? "active" : ""} onClick={() => setView("lineup")}><span aria-hidden="true">◉</span><small>라인업</small></button>
        <button className={view === "timetable" ? "active" : ""} onClick={() => setView("timetable")}><span aria-hidden="true">▦</span><small>타임테이블</small></button>
        <button className={view === "map" ? "active" : ""} onClick={() => setView("map")}><span aria-hidden="true">⌖</span><small>지도</small></button>
      </nav>
    </main>
  );
}
