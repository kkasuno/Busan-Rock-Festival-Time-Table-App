import type { Performance } from "./festivals/busan-rock-2025";

type Day = { id:string; date:string; label:string; performances:Performance[]; stages:{id:string;name:string}[] };
export function attendedShows(days:Day[], ids:string[], dayId:string) {
  return days.filter(d => dayId === "all" || d.id === dayId).flatMap(d =>
    d.performances.filter(p => ids.includes(p.id) && !/^부락 |^Rookies on the BU-ROCK Awards$/i.test(p.artist))
      .map(p => ({...p, dayId:d.id, dayLabel:d.label})));
}
export const uniqueArtists = (shows:Performance[]) => new Set(shows.map(p => p.artist.normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase())).size;
const minute = (value:string) => { const [h,m] = value.split(":").map(Number); return h*60+m; };
export function performanceAlerts(days:Day[], picks:string[], now:Date, routes:Record<string,[number,number]>) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-CA", {timeZone:"Asia/Seoul",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(now).map(p=>[p.type,p.value]));
  const date = `${parts.year}-${parts.month}-${parts.day}`;
  const day = days.find(d => d.date === date);
  if (!day) return [];
  const current = Number(parts.hour)*60+Number(parts.minute);
  const selected = day.performances.filter(p => picks.includes(p.id));
  return selected.filter(p => minute(p.start)-current <= 10 && minute(p.start)-current >= -1).sort((a,b)=>a.start.localeCompare(b.start)).map(p => {
    const gap = minute(p.start)-current;
    const clashes = selected.filter(other => other.id !== p.id && minute(other.start)<minute(p.end) && minute(p.start)<minute(other.end));
    const previous = selected.filter(other => other.id !== p.id && minute(other.end)<=minute(p.start)).sort((a,b)=>b.end.localeCompare(a.end))[0];
    const route = previous && routes[[previous.stage,p.stage].sort().join("|")];
    const tight = route && minute(p.start)-minute(previous.end)<route[1];
    const warning = clashes.length ? `시간 겹침 ${clashes.length+1}개` : tight ? `이동 여유 부족 · 도보 약 ${route.join("~")}분 참고` : "";
    return {id:p.id,dayId:day.id,text:`${gap>0?gap+"분 뒤":"지금 시작"} · ${day.stages.find(s=>s.id===p.stage)?.name || p.stage} · ${p.artist}${warning?" · "+warning:""}`,warning};
  });
}
