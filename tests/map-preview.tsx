import { useState } from "react";
import { createRoot } from "react-dom/client";
import { KakaoVenueMap } from "../app/kakao-map";
import { loadMaps } from "../app/kakao-sdk";
import { imageToWorld, parsePlacement, GUIDE_WIDTH, GUIDE_HEIGHT } from "../app/map-overlay";
import config from "../app/map-overlay-config.json";
import { venues, type Venue } from "../app/venue-data";
import "../app/venue.css";

// Local test entry only: no real GPS request, storage writes, or public build entry.
const placement=parsePlacement(config);
function Preview(){
 const [gps,setGps]=useState<{latitude:number;longitude:number;accuracy:number}|null>(null),[request,setRequest]=useState(0),[reset,setReset]=useState(0),[north,setNorth]=useState(false),[selected,setSelected]=useState<Venue|null>(null),[error,setError]=useState(false);
 const simulate=async(v:Venue,recenter:boolean)=>{const maps=await loadMaps(),p=imageToWorld(placement,{x:v.x/100*GUIDE_WIDTH,y:v.y/100*GUIDE_HEIGHT}),ll=new maps.Coords(p.x,p.y).toLatLng();setGps({latitude:ll.getLat(),longitude:ll.getLng(),accuracy:12});if(recenter)setRequest(n=>n+1);};
 return <><div style={{position:"fixed",top:0,left:0,right:0,zIndex:999,background:"white",padding:5,display:"flex",gap:8,flexWrap:"wrap"}}><button onClick={()=>simulate(venues[0],true)}>GPS 삼락</button><button onClick={()=>simulate(venues[4],false)}>GPS 리버 갱신</button><button onClick={()=>setNorth(v=>!v)}>방향 전환</button><button onClick={()=>setReset(v=>v+1)}>전체</button><span>{error?"지도 실패":selected?.name||"테스트 위치만 사용"}</span></div><KakaoVenueMap height={0} active reset={reset} location={gps} locateRequest={request} onFailure={()=>setError(true)} placement={placement} placePlacement={placement} rotation={north?0:-placement.rotation} opacity={.85} places={venues} selected={selected} onSelect={setSelected}/></>;
}
createRoot(document.getElementById("root")!).render(<Preview/>);
