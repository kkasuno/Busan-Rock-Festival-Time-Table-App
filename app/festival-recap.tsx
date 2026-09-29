import { useEffect, useMemo, useRef, useState } from "react";
import { Download, Share2, X, ClipboardCheck } from "lucide-react";
import { festival } from "./festivals/busan-rock-2025";
import { getBadges, stageList } from "./badge-data";
import { attendedShows, uniqueArtists } from "./festival-insights";
import { restaurants } from "./venue-data";
import type { Progress } from "./festival-progress";
import type { PersonalPlan } from "./personal-plan";

export function FestivalRecap({picks,progress,plans,onClose,onRecord}:{picks:string[];progress:Progress;plans:PersonalPlan[];onClose:()=>void;onRecord:()=>void}) {
  const dialog=useRef<HTMLDialogElement>(null);
  const [date,setDate]=useState("all"),[url,setUrl]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false);
  const shows=useMemo(()=>attendedShows(festival.days,progress.attended,date),[progress.attended,date]);
  const badges=useMemo(()=>getBadges(picks,progress,plans).filter(b=>!b.pending&&b.value>=b.target),[picks,progress,plans]);
  const foods=restaurants.filter(v=>!v.demo&&progress.eaten.includes(v.id));
  const stages=stageList.filter(s=>shows.some(p=>p.stage===s.id)||(date==="all"&&progress.visited.includes(s.id)));
  const label=date==="all"?"3일 전체":festival.days.find(d=>d.id===date)!.label;
  useEffect(()=>{dialog.current?.showModal();},[]);
  useEffect(()=>{
    let cancelled=false;
    setUrl("");setError("");
    async function render() {
      try {
        await document.fonts.ready;
        const sprite=new Image();sprite.src="/badge-stickers.png";await sprite.decode();
        if(cancelled)return;
        const canvas=document.createElement("canvas"),ctx=canvas.getContext("2d");
        if(!ctx)throw new Error("Canvas unavailable");
        const commands:(()=>void)[]=[];
        let y=60;
        const line=(value:string,size=30,color="#e9eff0")=>{
          ctx.font=`700 ${size}px Arial, "Malgun Gothic", sans-serif`;
          const lines:string[]=[];let current="";
          for(const char of value){if(current&&ctx.measureText(current+char).width>960){lines.push(current);current=char;}else current+=char;}
          if(current)lines.push(current);
          for(const row of lines){const yy=y;commands.push(()=>{ctx.font=`700 ${size}px Arial, "Malgun Gothic", sans-serif`;ctx.fillStyle=color;ctx.fillText(row,60,yy);});y+=size+14;}
        };
        line("2026 BUSAN ROCK FESTIVAL",24,"#c8f552");
        line("나의 부락 기록",58);line(label,28,"#a8c4cc");y+=24;
        line(`관람 아티스트 ${uniqueArtists(shows)}팀 · 무대 ${stages.length}곳`,36);
        if(date==="all")line(`음식점 ${foods.length}곳 · 획득 뱃지 ${badges.length}개`,32,"#f5c4d5");
        y+=28;line("내가 본 공연",34,"#c8f552");
        if(!shows.length)line("아직 관람 기록이 없어요",28);
        shows.forEach(p=>{line(p.artist,32);line(`${p.dayLabel} · ${p.start} · ${p.stage.toUpperCase()}`,24,"#a8c4cc");y+=16;});
        if(date==="all"){
          if(foods.length){y+=20;line("먹어본 음식점",34,"#f5c4d5");foods.forEach(f=>line(f.name,28));}
          if(badges.length){
            y+=20;line("획득한 뱃지",34,"#c8f552");
            const top=y;
            badges.forEach((b,i)=>{
              const x=60+i%4*240, yy=top+Math.floor(i/4)*220, sw=sprite.width/5.02,sh=sprite.height/5.02;
              commands.push(()=>{
                ctx.save();ctx.beginPath();ctx.arc(x+85,yy+85,80,0,Math.PI*2);ctx.clip();
                ctx.drawImage(sprite,(sprite.width-sw)*(b.image%5)/4,(sprite.height-sh)*[.09,.35,.61,.87][Math.floor(b.image/5)],sw,sh,x+5,yy+5,160,160);ctx.restore();
                ctx.fillStyle="#e9eff0";ctx.font='700 22px Arial, "Malgun Gothic", sans-serif';ctx.fillText(b.name,x,yy+177,220);
              });
            });
            y+=Math.ceil(badges.length/4)*220;
          }
        }
        y+=24;line("직접 체크한 나의 페스티벌 기록",22,"#a8c4cc");
        canvas.width=1080;canvas.height=y+40;
        ctx.fillStyle="#111a1d";ctx.fillRect(0,0,canvas.width,canvas.height);ctx.textBaseline="top";
        commands.forEach(draw=>draw());
        if(!cancelled)setUrl(canvas.toDataURL("image/png"));
      } catch {if(!cancelled)setError("이미지를 만들지 못했습니다. 창을 닫고 다시 열어주세요.");}
    }
    void render();
    return()=>{cancelled=true;};
  },[date,progress,picks,plans,shows,badges]);
  async function share(){
    setBusy(true);setError("");
    try{
      const file=new File([await (await fetch(url)).blob()],`busan-recap-${date}.png`,{type:"image/png"});
      if(navigator.canShare?.({files:[file]}))await navigator.share({files:[file],title:"2026 나의 부락 기록"});
      else setError("이 브라우저에서는 PNG 저장을 이용해주세요.");
    }catch(e){if(!(e instanceof DOMException&&e.name==="AbortError"))setError("공유하지 못했습니다. PNG 저장을 이용해주세요.");}
    finally{setBusy(false);}
  }
  return <dialog ref={dialog} className="image-dialog recap-dialog" aria-label="나의 페스티벌 결산" onCancel={onClose}>
    <div className="image-dialog-head"><div><p>MY FESTIVAL RECAP</p><h2>나의 페스티벌 결산</h2></div><button onClick={onClose} aria-label="결산 닫기"><X/></button></div>
    <label className="export-date">기간<select value={date} onChange={e=>setDate(e.target.value)}><option value="all">전체</option>{festival.days.map(d=><option key={d.id} value={d.id}>{d.label}</option>)}</select></label>
    <dl className="recap-stats"><div><dt>관람 아티스트</dt><dd>{uniqueArtists(shows)}팀</dd></div><div><dt>{date==="all"?"방문 무대":"관람 무대"}</dt><dd>{stages.length}곳</dd></div>{date==="all"&&<><div><dt>먹어본 음식점</dt><dd>{foods.length}곳</dd></div><div><dt>획득 뱃지</dt><dd>{badges.length}개</dd></div></>}</dl>
    {!shows.length&&<button className="badge-action" onClick={onRecord}><ClipboardCheck size={18}/>관람 기록 추가</button>}
    {error&&<p role="alert">{error}</p>}
    {url?<img className="export-preview" src={url} alt={`${label} 나의 부락 기록 이미지`}/>:!error&&<p role="status">결산 이미지 만드는 중…</p>}
    <div className="export-actions">{url&&<a href={url} download={`busan-recap-${date}.png`}><Download size={18}/>PNG 저장</a>}<button onClick={share} disabled={!url||busy}><Share2 size={18}/>{busy?"공유 중…":"이미지 공유"}</button></div>
  </dialog>;
}
