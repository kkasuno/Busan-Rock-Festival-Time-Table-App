import type { Performance } from "./festivals/busan-rock-2025";
import type { PersonalPlan } from "./personal-plan";

export const routes: Record<string, [number, number]> = {
  "green|samrock": [5, 6],
  "hidden|samrock": [7, 8],
  "river|samrock": [10, 13],
};
const minute = (time: string) => { const [h, m] = time.split(":").map(Number); return h * 60 + m; };
export function travelConnections(selected: Performance[], plans: PersonalPlan[]) {
  const sorted = [...selected].sort((a, b) => minute(a.start) - minute(b.start) || a.id.localeCompare(b.id));
  return sorted.slice(0, -1).flatMap((from, i) => {
    const to = sorted[i + 1];
    const duration = routes[[from.stage, to.stage].sort().join("|")];
    const departure = minute(from.end);
    const gap = minute(to.start) - departure;
    if (!duration || gap < 0 || gap > 30) return [];
    const ambiguous = sorted.some(p => p.id !== from.id && p.id !== to.id
      && ((minute(p.start) < minute(from.end) && minute(from.start) < minute(p.end))
        || (minute(p.start) < minute(to.end) && minute(to.start) < minute(p.end))));
    if (ambiguous || plans.some(p => minute(p.start) < Math.max(minute(to.start), departure + duration[1]) && minute(p.end) > departure)) return [];
    return [{ from, to, duration, departure, arrival: departure + duration[1] }];
  });
}

export function TravelOverlay({ selected, plans, stages, height, scale }: {
  selected: Performance[]; plans: PersonalPlan[]; stages: { id: string; name: string }[]; height: number; scale: number;
}) {
  const connections = travelConnections(selected, plans);
  const headerRoutes = [...new Map(connections.map(route => [[route.from.stage, route.to.stage].sort().join("|"), route])).values()];
  return <>
    <div className="travel-stage-links" aria-label="무대 간 참고 이동시간">
      {headerRoutes.map(route => {
        const a = stages.findIndex(s => s.id === route.from.stage) * 180 + 90;
        const b = stages.findIndex(s => s.id === route.to.stage) * 180 + 90;
        return <span key={route.from.id} className="travel-stage-route" style={{ left: (a + b) / 2 - 32, width: 64, top: 32 }} title={`${route.from.stage} ↔ ${route.to.stage} 약 ${route.duration.join("~")}분 · 약간 빠른 걸음 기준`}>↔ {route.duration.join("~")}분</span>;
      })}
    </div>
    <svg className="travel-overlay" width="900" height={height} viewBox={`0 0 900 ${height}`} aria-label="선택한 공연 사이의 예상 도보 이동">
      <defs><marker id="travel-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#f8c978" /></marker></defs>
      {connections.map(route => {
        const from = stages.findIndex(s => s.id === route.from.stage);
        const to = stages.findIndex(s => s.id === route.to.stage);
        const right = to > from;
        const x1 = from * 180 + (right ? 173 : 7);
        const x2 = to * 180 + (right ? 7 : 173);
        const y1 = (route.departure - 660) * scale;
        const y2 = (route.arrival - 660) * scale;
        const middle = (y1 + y2) / 2;
        const labelX = x1 + (right ? -36 : 36);
        return <g key={route.from.id} className="travel-connection" data-departure={route.departure} data-arrival={route.arrival}>
          <title>{route.from.artist} → {route.to.artist}: 도보 약 {route.duration.join("~")}분, 약간 빠른 걸음 기준</title>
          <path d={`M ${x1} ${y1} V ${middle} H ${x2} V ${y2}`} fill="none" stroke="#f8c978" strokeWidth="2" strokeDasharray="4 3" markerEnd="url(#travel-arrow)" />
          <circle cx={x1} cy={y1} r="3" fill="#f8c978" />
          <rect x={labelX - 32} y={middle - 8} width="64" height="16" rx="3" fill="#21190e" stroke="#f8c978" />
          <text x={labelX} y={middle + 4} textAnchor="middle" fill="#ffe2a7" fontSize="11" fontWeight="700">{route.duration.join("~")}분</text>
        </g>;
      })}
    </svg>
  </>;
}
