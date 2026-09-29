export type Venue = { id: string; name: string; category: "food" | "stage" | "facility" | "info"; x: number; y: number; description: string; zone?: string; menus?: { name: string; price: number; photo?: string }[]; demo?: boolean };
// Approximate percentages read from the supplied 2026 guide image, not GPS coordinates.
export const venues: Venue[] = [
 { id:"samrock",name:"SAMROCK STAGE",category:"stage",x:60,y:28,description:"삼락 무대 · 2026 안내도 기준" },
 { id:"green",name:"GREEN STAGE",category:"stage",x:80,y:15,description:"그린 무대 · 2026 안내도 기준" },
 { id:"wave",name:"WAVE STAGE",category:"stage",x:37,y:23,description:"웨이브 무대 · 메인 게이트 옆" },
 { id:"hidden",name:"HIDDEN STAGE",category:"stage",x:39,y:63,description:"히든 무대 · FREE AREA" },
 { id:"river",name:"RIVER STAGE",category:"stage",x:39,y:88,description:"리버 무대 · 2026 안내도 기준" },
 { id:"food-zone",name:"FOOD LOUNGE",category:"info",x:76,y:41,description:"음식점 리스트 준비 중. 입점 업체와 메뉴는 확정 자료를 받은 후 공개합니다." },
 { id:"food-zone-south",name:"FOOD LOUNGE 2",category:"info",x:75,y:57,description:"안내도 아래쪽 푸드 라운지. 입점 업체 업데이트 중." },
 { id:"gate",name:"메인 게이트",category:"info",x:47,y:18,description:"최초 입장과 재입장 동선은 현장 안내를 확인하세요." },
 { id:"medical",name:"응급의료센터",category:"facility",x:68,y:32,description:"삼락 무대 옆 응급의료 부스. 현장 안내를 우선 확인하세요." },
 { id:"toilet",name:"화장실",category:"facility",x:83,y:30.5,description:"그린 무대와 푸드 라운지 사이. 다른 화장실은 안내도 아이콘을 확인하세요." },
];
export const restaurants: Venue[] = [];
export const demoRestaurants: Venue[] = [
 {id:"demo-food-0",name:"락페 버거 (예시)",category:"food",x:80,y:44,zone:"테스트 구역",description:"수제 버거와 바삭한 감자튀김. 실제 입점 업체가 아닌 테스트용입니다.",demo:true,menus:[{name:"치즈버거",price:9000},{name:"감자튀김",price:4000},{name:"콜라",price:3000}]},
 {id:"demo-food-1",name:"삼락 분식 (예시)",category:"food",x:81,y:45,zone:"테스트 구역",description:"공연 사이에 즐기는 떡볶이와 김밥. 업체와 가격은 테스트용입니다.",demo:true,menus:[{name:"떡볶이",price:6000},{name:"김밥",price:4500}]},
 {id:"demo-food-2",name:"리버 카페 (예시)",category:"food",x:82,y:46,zone:"테스트 구역",description:"시원한 커피와 레모네이드. 업체와 가격은 테스트용입니다.",demo:true,menus:[{name:"아이스 아메리카노",price:4000},{name:"레모네이드",price:5500},{name:"초코 쿠키",price:3000}]},
];
