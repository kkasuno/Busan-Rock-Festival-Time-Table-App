import { useEffect, useMemo, useState } from "react";
import { Bell } from "lucide-react";
import { festival } from "./festivals/busan-rock-2025";
import { performanceAlerts } from "./festival-insights";
import { routes } from "./travel-overlay";

export function PerformanceNotice({picks,onOpen}:{picks:string[];onOpen:(dayId:string,id:string)=>void}) {
  const [now,setNow] = useState<Date|null>(null);
  const [index,setIndex] = useState(0);
  useEffect(()=>{
    const update=()=>setNow(new Date());
    update();
    const timer=setInterval(update,1000);
    window.addEventListener("focus",update);
    document.addEventListener("visibilitychange",update);
    return()=>{clearInterval(timer);window.removeEventListener("focus",update);document.removeEventListener("visibilitychange",update);};
  },[]);
  const minute = now ? Math.floor(now.getTime()/60000) : null;
  const alerts = useMemo(()=>minute===null?[]:performanceAlerts(festival.days,picks,new Date(minute*60000),routes),[minute,picks]);
  const active = alerts.length > 0;
  useEffect(()=>{document.body.classList.toggle("has-performance-notice",active);return()=>document.body.classList.remove("has-performance-notice");},[active]);
  const item=alerts.length?alerts[index%alerts.length]:null;
  if (!item) return null;
  return <div className={`performance-notice ${item.warning?"warning":""}`} role="region" aria-label="공연 시작 알림">
    <Bell size={18} aria-hidden="true"/>
    <button key={item.id+item.text+index} className="notice-track" aria-label={item.text} onClick={()=>onOpen(item.dayId,item.id)}>
      <span style={{animationDuration:`${Math.max(12,item.text.length*.24)}s`}} onAnimationEnd={()=>setIndex(i=>i+1)}>{item.text}</span>
    </button>
    {alerts.length>1&&<button className="notice-next" aria-label="다음 공연 알림" onClick={()=>setIndex(i=>i+1)}>{index%alerts.length+1}/{alerts.length}</button>}
  </div>;
}
