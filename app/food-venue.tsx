"use client";
import { useState } from "react";
import { ChevronRight, Image as ImageIcon } from "lucide-react";
import type { Venue } from "./venue-data";

export function FoodPhoto({ venue }: { venue: Venue }) {
 const [failed, setFailed] = useState(false);
 const label = `${venue.name} ${venue.photoKind === "logo" ? "로고" : "대표 이미지"}`;
 return venue.photo && !failed
  ? <img className={`food-photo${venue.photoKind === "logo" ? " food-logo" : ""}`} src={venue.photo} alt={label} loading="lazy" decoding="async" width={300} height={250} onError={() => setFailed(true)}/>
  : <div className="food-photo food-photo-unavailable" role="img" aria-label={`${venue.name} 이미지 없음`}><ImageIcon size={24}/></div>;
}

export function FoodSummary({ venue, onOpen }: { venue: Venue; onOpen: () => void }) {
 const first = venue.menus?.[0];
 return <button className="venue-item-open food-item-open" onClick={onOpen} aria-label={`${venue.name} 메뉴 보기`}>
  <FoodPhoto venue={venue}/>
  <div className="food-item-copy"><span>{venue.zone}</span><h2>{venue.name}</h2><p>{venue.description}</p>{first && <p className="food-item-price">{first.name} <strong>{first.price.toLocaleString("ko-KR")}원</strong></p>}</div>
  <ChevronRight className="food-open-chevron" size={18} aria-hidden="true"/>
 </button>;
}

export function FoodMenu({ venue }: { venue: Venue }) {
 const menus = venue.menus || [];
 return <>
  {venue.photo && <figure className="food-representative"><FoodPhoto venue={venue}/><figcaption>{venue.photoKind === "logo" ? "브랜드 로고" : "대표 이미지"}</figcaption></figure>}
  <div className="food-menu-heading"><h3>메뉴</h3><span>{venue.totalMenus && venue.totalMenus > menus.length ? `총 ${venue.totalMenus}종 중 공개 메뉴 ${menus.length}종` : `${menus.length}종`}</span></div>
  <ul className="food-menu-list" aria-label={`${venue.name} 메뉴 및 가격`}>{menus.map(menu => <li key={menu.name}>{menu.photo && <img src={menu.photo} alt={menu.name} loading="lazy" width={64} height={64}/>}<span>{menu.name}</span><strong>{menu.price.toLocaleString("ko-KR")}원</strong></li>)}</ul>
  {venue.note && <p className="food-menu-note">{venue.note}</p>}
 </>;
}
