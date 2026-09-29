import { festival, type Performance } from "./festivals/busan-rock-2025";
import type { Progress } from "./festival-progress";
import type { PersonalPlan } from "./personal-plan";
import { restaurants } from "./venue-data";
export const isArtistShow=(p:Performance)=>!/^부락 |^Rookies on the BU-ROCK Awards$/i.test(p.artist);
export const artistKey=(p:Performance)=>p.artist.normalize("NFKC").trim().replace(/\s+/g," ").toLowerCase();
export const artistShows=festival.days.flatMap(d=>d.performances.filter(isArtistShow).map(p=>({...p,dayLabel:d.label})));
export const stageList=festival.days[0].stages;
// Enable completion only after the complete 2026 restroom inventory is supplied.
export const restroomList:{id:string;name:string}[]=[];
export type Badge={id:string;name:string;group:string;value:number;target:number;condition:string;image:number;action:string;pending?:boolean};
export function getBadges(picks:string[],p:Progress,plans:PersonalPlan[]):Badge[]{
 const count=new Set(artistShows.filter(s=>p.attended.includes(s.id)).map(artistKey)).size;
 const days=festival.days.filter(d=>d.performances.some(s=>picks.includes(s.id))).length;
 const stages=stageList.filter(s=>p.visited.includes(s.id)).length;
 const food=restaurants.filter(s=>p.eaten.includes(s.id)&&!s.demo).length;
 const favorite=restaurants.some(s=>!s.demo&&s.menus?.some((_,i)=>p.favoriteMenu===`${s.id}:${i}`));
 return [
 {id:"first",name:"첫 PICK",group:"공연",value:picks.length,target:1,condition:"공연 1개 선택",image:0,action:"pick"},
 {id:"three",name:"나만의 페스티벌",group:"공연",value:days,target:3,condition:"3일 모두 MY 시간표 구성",image:1,action:"pick"},
 ...[1,5,10,15].map((target,i)=>({id:`live-${target}`,name:["첫 라이브","라이브 입문자","라이브 수집가","락페 마스터"][i],group:"공연",value:count,target,condition:`서로 다른 아티스트 ${target}팀 관람`,image:2+i,action:"attend"})),
 {id:"stage-3",name:"무대 탐험가",group:"공연",value:stages,target:3,condition:"서로 다른 무대 3곳 방문",image:6,action:"stage"},
 {id:"stage-all",name:"올 스테이지",group:"공연",value:stages,target:stageList.length,condition:"모든 무대 방문",image:7,action:"stage"},
 ...[1,5,10].map((target,i)=>({id:`food-${target}`,name:["첫 한입","락페 미식가","푸드 탐험가"][i],group:"음식",value:food,target,condition:`서로 다른 음식점 ${target}곳`,image:8+i,action:"food"})),
 {id:"favorite",name:"나의 원픽 메뉴",group:"음식",value:Number(favorite),target:1,condition:"가장 좋았던 메뉴 하나 선정",image:11,action:"favorite"},
 {id:"beer",name:"맥주 타임",group:"음식",value:p.beer+p.alcoholFree,target:1,condition:"첫 음료 기록 · 무알코올 포함",image:12,action:"drink"},
 {id:"mat",name:"돗자리 득템",group:"현장",value:Number(p.completed.includes("mat")),target:1,condition:"아이즈 매거진 돗자리 받기",image:13,action:"manual"},
 {id:"rest",name:"충전 완료",group:"현장",value:plans.filter(plan=>plan.kind==="rest").length,target:1,condition:"MY에 휴식 일정 추가",image:14,action:"rest"},
 {id:"clean",name:"흔적 없이",group:"현장",value:Number(p.completed.includes("clean")),target:1,condition:"내 자리 쓰레기 정리",image:15,action:"manual"},
 {id:"toilet",name:"삼락 화장실 원정대",group:"현장",value:restroomList.filter(r=>p.toilets.includes(r.id)).length,target:restroomList.length||1,condition:"화장실 전체 방문 · 보너스",image:16,action:"toilet",pending:!restroomList.length},
 ];
}
