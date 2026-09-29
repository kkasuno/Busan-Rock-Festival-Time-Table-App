"use client";
import { useEffect, useState } from "react";
import { Check, Heart } from "lucide-react";
export type ProgressKey = "wanted" | "eaten" | "visited" | "attended" | "completed" | "toilets";
export type Progress = Record<ProgressKey,string[]> & {beer:number; alcoholFree:number; favoriteMenu:string};
export const PROGRESS_STORAGE="busan-festival-progress-v1";
const arrayKeys:ProgressKey[]=["wanted","eaten","visited","attended","completed","toilets"];
const empty:Progress={wanted:[],eaten:[],visited:[],attended:[],completed:[],toilets:[],beer:0,alcoholFree:0,favoriteMenu:""};
export function normalizeProgress(raw:unknown):Progress {
 const value=(raw&&typeof raw==="object"?raw:{}) as Record<string,unknown>;
 const result={...empty};
 for(const key of arrayKeys)result[key]=Array.isArray(value[key])?[...new Set((value[key] as unknown[]).filter((v):v is string=>typeof v==="string"))]:[];
 for(const key of ["beer","alcoholFree"] as const)result[key]=typeof value[key]==="number"&&Number.isFinite(value[key])?Math.max(0,Math.min(9999,Math.floor(value[key]))):0;
 result.favoriteMenu=typeof value.favoriteMenu==="string"?value.favoriteMenu.slice(0,150):"";
 return result;
}
export function useFestivalProgress(){
 const [progress,setProgress]=useState<Progress>(empty),[warning,setWarning]=useState(""),[ready,setReady]=useState(false);
 useEffect(()=>{try{setProgress(normalizeProgress(JSON.parse(localStorage.getItem(PROGRESS_STORAGE)||"{}")));}catch{setWarning("저장소를 사용할 수 없어 이번 화면에서만 기록됩니다.");}setReady(true);},[]);
 useEffect(()=>{if(ready)try{localStorage.setItem(PROGRESS_STORAGE,JSON.stringify(progress));}catch{setWarning("저장소를 사용할 수 없어 이번 화면에서만 기록됩니다.");}},[progress,ready]);
 const toggle=(key:ProgressKey,id:string)=>setProgress(p=>({...p,[key]:p[key].includes(id)?p[key].filter(v=>v!==id):[...p[key],id]}));
 const changeDrink=(key:"beer"|"alcoholFree",delta:number)=>setProgress(p=>({...p,[key]:Math.max(0,Math.min(9999,p[key]+delta))}));
 const setFavorite=(favoriteMenu:string)=>setProgress(p=>({...p,favoriteMenu}));
 return {progress,toggle,changeDrink,setFavorite,warning};
}
export function FoodChecks({id,progress,toggle}:{id:string;progress:Progress;toggle:(key:ProgressKey,id:string)=>void}){
 return <div className="food-checks">{(["wanted","eaten"] as const).map(key=><button key={key} aria-pressed={progress[key].includes(id)} onClick={()=>toggle(key,id)}>{key==="wanted"?<Heart size={18}/>:<Check size={18}/>} {key==="wanted"?"먹고 싶어요":"먹었어요"}</button>)}</div>;
}
