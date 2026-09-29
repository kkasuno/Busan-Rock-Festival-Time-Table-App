export type Venue = {
 id: string; name: string; category: "food" | "stage" | "facility" | "info" | "booth";
 icon?: "beer" | "water" | "camera" | "gift" | "train" | "coffee" | "toilet" | "accessibility" | "baby" | "utensils" | "cigarette";
 x?: number; y?: number; description: string; zone?: string;
 photo?: string; photoKind?: "food" | "logo"; totalMenus?: number; note?: string;
 menus?: { name: string; price: number; photo?: string }[]; demo?: boolean;
};
export type PositionedVenue = Venue & { x: number; y: number };
export function hasVenuePosition(venue: Venue): venue is PositionedVenue {
 return typeof venue.x === "number" && typeof venue.y === "number" && Number.isFinite(venue.x) && Number.isFinite(venue.y);
}
// Approximate percentages read from the supplied 2026 guide image, not GPS coordinates.
export const venues: PositionedVenue[] = [
 { id:"samrock",name:"SAMROCK STAGE",category:"stage",x:60,y:28,description:"삼락 무대 · 2026 안내도 기준" },
 { id:"green",name:"GREEN STAGE",category:"stage",x:80,y:15,description:"그린 무대 · 2026 안내도 기준" },
 { id:"wave",name:"WAVE STAGE",category:"stage",x:37,y:23,description:"웨이브 무대 · 메인 게이트 옆" },
 { id:"hidden",name:"HIDDEN STAGE",category:"stage",x:39,y:63,description:"히든 무대 · FREE AREA" },
 { id:"river",name:"RIVER STAGE",category:"stage",x:39,y:88,description:"리버 무대 · 2026 안내도 기준" },
 { id:"food-zone",name:"FOOD LOUNGE",category:"info",icon:"utensils",x:76,y:41,description:"로컬푸드 부스 줄 옆 푸드 라운지. 일부 업체만 개별 위치가 확인되었습니다." },
 { id:"food-zone-south",name:"FOOD LOUNGE 2",category:"info",icon:"utensils",x:75,y:57,description:"히든 스테이지 옆 푸드 라운지. 개별 업체의 부스 위치는 확인 중입니다." },
 { id:"gate",name:"메인 게이트",category:"info",x:47,y:18,description:"최초 입장과 재입장 동선은 현장 안내를 확인하세요." },
 { id:"medical",name:"응급의료센터",category:"facility",x:68,y:32,description:"삼락 무대 옆 응급의료 부스. 현장 안내를 우선 확인하세요." },
 { id:"toilet",name:"화장실 · 그린",category:"facility",icon:"toilet",x:83,y:30.5,description:"그린 무대와 푸드 라운지 사이." },
 // Screenshot-derived positions are locally matched to the illustrated blocks, not surveyed GPS.
 {id:"booth-eyes",name:"아이즈매거진",category:"booth",icon:"gift",x:63.5,y:51.7,zone:"중앙광장",description:"중앙광장 곡선 산책로 안쪽, 키즈존 옆 구역."},
 {id:"booth-monster",name:"몬스터 에너지존",category:"booth",x:56.5,y:48.2,zone:"중앙광장",description:"중앙광장 사각형 순환로 옆 부스."},
 {id:"booth-busan-transit",name:"부산교통공사 프로모션존",category:"booth",icon:"train",x:47.5,y:44.9,zone:"중앙광장",description:"중앙광장 순환로와 세로 산책로가 만나는 구역."},
 {id:"booth-toss",name:"토스",category:"booth",x:32.8,y:39.6,zone:"중앙광장",description:"시계탑 쪽 외곽 산책로, 경기장과 중앙광장 사이."},
 {id:"booth-daesun",name:"대선 프로모션존",category:"booth",icon:"beer",x:70.8,y:37.3,zone:"로컬푸드 옆",description:"푸드 라운지 가장자리, 화장실 부스 줄 끝 쪽."},
 {id:"booth-paldo",name:"팔도 프로모션존",category:"booth",x:79.3,y:31.9,zone:"삼락·그린 사이",description:"아이코스와 칭따오 프로모션존 사이, 야구장 가장자리."},
 {id:"booth-iqos",name:"아이코스 프로모션존",category:"booth",icon:"cigarette",x:84.2,y:32.2,zone:"삼락·그린 사이",description:"팔도 프로모션존 옆 부스. 현장 이용 조건을 확인하세요."},
 {id:"booth-tsingtao-main",name:"칭따오 프로모션존 · 메인",category:"booth",icon:"beer",x:73.8,y:31.9,zone:"삼락·그린 사이",description:"팔도 프로모션존과 응급의료 부스 쪽 사이."},
 {id:"booth-korean-medicine",name:"부산한의사회 X PAM",category:"booth",x:70.6,y:25.4,zone:"삼락 옆",description:"삼락 스테이지 옆 야구장 외곽 산책로."},
 {id:"booth-dont-look-up",name:"돈룩업 프로모션존",category:"booth",icon:"camera",x:50.5,y:24.1,zone:"삼락 옆",description:"삼락 스테이지 옆, 제임슨 부스와 나란히 있는 프로모션존."},
 {id:"booth-festival-life",name:"페스티벌라이프 프로모션존",category:"booth",x:45.1,y:68.4,zone:"히든",description:"히든 스테이지 맞은편, 사이클 경기장 안쪽 부스 줄."},
 {id:"hidden-event",name:"히든스테이지 이벤트존",category:"booth",x:45.8,y:66.1,zone:"히든",description:"페스티벌라이프 프로모션존과 히든 스테이지 사이."},
 {id:"booth-cgv",name:"CGV",category:"booth",x:83.9,y:39.2,zone:"로컬푸드",description:"삼진어묵과 이흥용과자점 사이 부스."},
 {id:"booth-jameson-food",name:"제임슨 · 푸드라운지",category:"booth",icon:"beer",x:84,y:46,zone:"로컬푸드",description:"로컬푸드 부스 줄 끝, 워터바 옆."},
 {id:"booth-jameson-samrock",name:"제임슨 · 삼락",category:"booth",icon:"beer",x:50.4,y:26,zone:"삼락 옆",description:"삼락 스테이지 옆 돈룩업 프로모션존과 붙어 있는 부스."},
 {id:"booth-tsingtao-food",name:"칭따오 · 푸드라운지",category:"booth",icon:"beer",x:83.5,y:52.4,zone:"푸드라운지 2",description:"히든 스테이지 옆 푸드 라운지의 외곽 부스."},
 {id:"booth-daesun-cocktail",name:"대선 칵테일바",category:"booth",icon:"beer",x:79.4,y:36.5,zone:"로컬푸드",description:"이흥용과자점과 수안커피 사이."},
 {id:"booth-sasang-mothers",name:"사상구 어머니회",category:"booth",icon:"utensils",x:84,y:43.5,zone:"로컬푸드",description:"워터바와 로컬푸드존 사이. 메뉴 포스터의 부녀회와 같은 업체인지는 확인 중입니다."},
 {id:"local-food-zone",name:"로컬푸드존",category:"info",icon:"utensils",x:84,y:42.3,zone:"로컬푸드",description:"사상구 어머니회와 삼진어묵 사이 부스 줄. 일부 업체의 개별 위치는 확인 중입니다."},
 {id:"water-food",name:"워터바 · 로컬푸드",category:"facility",icon:"water",x:84,y:44.7,zone:"로컬푸드",description:"제임슨과 사상구 어머니회 사이."},
 {id:"water-standing",name:"워터바 · 스탠딩 라운지",category:"facility",icon:"water",x:83,y:65,zone:"스탠딩 라운지",description:"푸드 라운지(스탠딩) 외곽 부스."},
 {id:"kids",name:"키즈존",category:"facility",icon:"baby",x:50,y:51.2,zone:"중앙광장",description:"아이즈매거진 옆, 히든 구역으로 이어지는 길 쪽."},
 {id:"toilet-central",name:"화장실 · 중앙광장",category:"facility",icon:"toilet",x:48.5,y:39.6,zone:"중앙광장",description:"중앙광장과 삼락 구역 사이 세로 산책로."},
 {id:"toilet-food",name:"화장실 · 로컬푸드",category:"facility",icon:"toilet",x:71.9,y:37.5,zone:"로컬푸드",description:"푸드 라운지 가장자리, 대선 프로모션존 옆 부스 줄."},
 {id:"toilet-hidden",name:"화장실 · 히든",category:"facility",icon:"toilet",x:59.8,y:58.1,zone:"히든",description:"사이클 경기장과 중앙광장 사이 산책로."},
 {id:"booth-tsingtao-river",name:"칭따오 프로모션존 · 리버",category:"booth",icon:"beer",x:51.1,y:92.7,zone:"리버",description:"리버 스테이지 맞은편, 워터바와 붙어 있는 프로모션존."},
 {id:"tsingtao-river",name:"칭따오 · 리버",category:"booth",icon:"beer",x:51.1,y:88.8,zone:"리버",description:"리버 구역 입구와 칭따오 프로모션존 사이."},
 {id:"water-river",name:"워터바 · 리버",category:"facility",icon:"water",x:48.9,y:93.2,zone:"리버",description:"칭따오 프로모션존과 응급의료 부스 사이."},
 {id:"medical-river",name:"응급의료 · 리버",category:"facility",x:44.9,y:93.1,zone:"리버",description:"컴포터블존과 워터바가 있는 부스 줄."},
 {id:"comfortable-river",name:"컴포터블존",category:"facility",icon:"accessibility",x:37.6,y:93.1,zone:"리버",description:"리버 구역 끝, 응급의료 부스 옆."},
 {id:"toilet-river",name:"화장실 · 리버",category:"facility",icon:"toilet",x:42.7,y:83.5,zone:"리버",description:"리버 구역 출구 쪽 가로 부스 줄."},
 {id:"toilet-accessible-river",name:"장애인 화장실 · 리버",category:"facility",icon:"accessibility",x:46.8,y:83.5,zone:"리버",description:"리버 구역 화장실 옆."},
];
// Only the three vendors labelled individually in the map screenshots have positions.
export const restaurants: Venue[] = [
 {id:"food-suan-coffee",name:"수안커피",category:"food",icon:"coffee",x:76.4,y:35.3,zone:"부산 로컬푸드",photo:"/food/suan-coffee.webp",description:"커피 · 소프트아이스크림",totalMenus:5,menus:[{name:"아이스커피",price:4800},{name:"아이스라떼",price:5500},{name:"소프트아이스크림",price:5500}]},
 {id:"food-lee-heung-yong",name:"이흥용과자점",category:"food",x:82.3,y:38,zone:"부산 로컬푸드",photo:"/food/lee-heung-yong.webp",description:"소금빵 · 츄러스 · 초코슈페스타",totalMenus:8,menus:[{name:"소금빵 2입",price:5000},{name:"츄러스 3입",price:6000},{name:"초코슈페스타 2입",price:5500}]},
 {id:"food-samjin",name:"삼진어묵",category:"food",x:84,y:40.4,zone:"부산 로컬푸드",photo:"/food/samjin.webp",description:"어묵탕 · 부산어묵떡볶이",menus:[{name:"삼진어묵한상(삼진어묵탕+부산어묵떡볶이)",price:15000},{name:"삼진어묵탕",price:8500},{name:"부산어묵떡볶이",price:8500}]},
 {id:"food-cheongcheon",name:"청천돼지국밥",category:"food",zone:"부산 로컬푸드",photo:"/food/cheongcheon.webp",description:"돼지국밥",menus:[{name:"돼지국밥",price:9000}]},
 {id:"food-jangho",name:"장호밀면",category:"food",zone:"부산 로컬푸드",photo:"/food/jangho.webp",description:"밀면 · 왕만두",menus:[{name:"장호밀면",price:10000},{name:"왕만두",price:8000}]},
 {id:"food-dwaegalhu",name:"돼갈후",category:"food",zone:"부산 로컬푸드",photo:"/food/dwaegalhu.webp",description:"돼지갈비후라이드",menus:[{name:"돼지갈비후라이드",price:20000}]},
 {id:"food-hanshin",name:"사상 한신2차아파트 부녀회",category:"food",zone:"부산 로컬푸드",photo:"/food/hanshin.webp",description:"부추전 · 소고기국밥",menus:[{name:"부추전",price:8000},{name:"소고기국밥",price:9000}]},
 {id:"food-joy-chef",name:"조이쉐프",category:"food",zone:"푸드라운지",photo:"/food/joy-chef.webp",description:"김치말이국수 · 제육비빔국수",menus:[{name:"김치말이국수",price:9000},{name:"제육비빔국수",price:10000}]},
 {id:"food-jugahyang",name:"주가향",category:"food",zone:"푸드라운지",photo:"/food/jugahyang.webp",description:"냉면 · 소고기불초밥",menus:[{name:"물냉면",price:10000},{name:"물비빔냉면",price:10000},{name:"소고기불초밥",price:12000}]},
 {id:"food-namhae-sausage",name:"남해독일마을 수제소시지",category:"food",zone:"푸드라운지",photo:"/food/namhae-sausage.webp",description:"모듬소시지 세트",menus:[{name:"모듬소시지 A세트",price:20000},{name:"모듬소시지 B세트",price:25000}]},
 {id:"food-osaka-yaki",name:"오사카야끼",category:"food",zone:"푸드라운지",photo:"/food/osaka-yaki.webp",description:"야끼소바 · 큐브스테이크",menus:[{name:"야끼소바",price:15000},{name:"큐브스테이크",price:18000}]},
 {id:"food-hapswho",name:"햅스후",category:"food",zone:"푸드라운지",photo:"/food/hapswho.webp",description:"타코야끼 · 오꼬노미야끼",menus:[{name:"타코야끼",price:7000},{name:"오꼬노미야끼",price:13000}]},
 {id:"food-daum-cupbap",name:"다옴컵밥",category:"food",zone:"푸드라운지",photo:"/food/daum-cupbap.webp",description:"마요컵밥 · 철판제육덮밥",menus:[{name:"스팸마요컵밥",price:10500},{name:"치킨마요컵밥",price:11000},{name:"철판제육덮밥",price:13000}]},
 {id:"food-must-eat",name:"머스트잇",category:"food",zone:"푸드라운지",photo:"/food/must-eat.webp",description:"잘익은삼겹살 · 공기밥",menus:[{name:"잘익은삼겹살",price:18000},{name:"공기밥",price:2000}]},
 {id:"food-pops-smoke-train",name:"팝스스모크트레인",category:"food",zone:"푸드라운지",photo:"/food/pops-smoke-train.webp",description:"스모크 풀드포크 브리또 · 멜티타코",menus:[{name:"스모크 풀드포크 브리또",price:16000},{name:"스모크 멜티타코(3pcs)",price:13000}]},
 {id:"food-daeho",name:"대호반점",category:"food",zone:"푸드라운지",photo:"/food/daeho.webp",description:"짜장면",menus:[{name:"짜장면",price:10000}]},
 {id:"food-crazy-pizza",name:"미친피자",category:"food",zone:"푸드라운지",photo:"/food/crazy-pizza.webp",description:"시그니처 · 페퍼로니 · 더블치즈 피자",menus:[{name:"미친피자 시그니처",price:21900},{name:"미친피자 페퍼로니",price:15900},{name:"미친피자 더블치즈",price:13900}]},
 {id:"food-mogeon",name:"모건",category:"food",zone:"푸드라운지",photo:"/food/mogeon.webp",description:"치즈닭강정 · 쯔란닭강정",menus:[{name:"치즈닭강정 한판",price:15000},{name:"치즈닭강정 한박스",price:20000},{name:"쯔란닭강정 한판",price:15000},{name:"쯔란닭강정 한박스",price:20000}]},
 {id:"food-yob-burger",name:"욥버거",category:"food",zone:"푸드라운지",photo:"/food/yob-burger.webp",description:"한우치즈버거 · 콘치즈핫도그 · 프라이즈",menus:[{name:"한우치즈버거",price:10000},{name:"솔팅XYOB 콘치즈핫도그",price:10000},{name:"프렌치프라이즈",price:5000},{name:"비프치즈프라이즈",price:10000}]},
 {id:"food-youth-snack",name:"청춘분식",category:"food",zone:"푸드라운지",photo:"/food/youth-snack.webp",description:"닭꼬치 · 떡볶이 · 분식 세트",totalMenus:7,menus:[{name:"닭꼬치",price:6000},{name:"쫀드기",price:6000},{name:"떡볶이",price:5000},{name:"어묵탕",price:6000},{name:"떡+튀+순",price:18000}]},
 {id:"food-shrimp-box",name:"쉬림프박스",category:"food",zone:"푸드라운지",photo:"/food/shrimp-box.webp",description:"새우강정 · 새우튀김",menus:[{name:"칠리새우강정",price:14000},{name:"크림새우강정",price:14000},{name:"반반새우강정",price:15000},{name:"새우튀김",price:14000},{name:"쉬림프박스",price:27000}]},
 {id:"food-texas-dogs",name:"텍사스독스",category:"food",zone:"푸드라운지",photo:"/food/texas-dogs.webp",description:"소고기 · 새우 · 마라 팟타이",menus:[{name:"소고기팟타이",price:12000},{name:"새우팟타이",price:12000},{name:"마라소고기팟타이",price:13000},{name:"마라새우팟타이",price:13000}]},
 {id:"food-vegan",name:"비건",category:"food",zone:"푸드라운지",photo:"/food/vegan.webp",description:"키토김밥 · 아이스콩물",totalMenus:5,menus:[{name:"키토김밥 순한맛",price:7000},{name:"키토김밥 불닭맛",price:7000},{name:"아이스콩물",price:5000}]},
 {id:"food-birak",name:"비락식혜",category:"food",zone:"푸드라운지",photo:"/food/birak.webp",photoKind:"logo",description:"비락식혜 슬러시",note:"이벤트 참여 시 굿즈 제공",menus:[{name:"비락식혜 슬러시(495ml)",price:2000}]},
 {id:"food-pig-bingsu",name:"돼지팥빙수",category:"food",zone:"푸드라운지",photo:"/food/pig-bingsu.webp",description:"수제팥 · 망고치즈 · 샤인청포도 빙수",menus:[{name:"수제팥 돼지빙수",price:13000},{name:"망고치즈빙수",price:15000},{name:"샤인청포도빙수(한정판매)",price:15000}]},
];
export const demoRestaurants: PositionedVenue[] = [
 {id:"demo-food-0",name:"락페 버거 (예시)",category:"food",x:80,y:44,zone:"테스트 구역",description:"수제 버거와 바삭한 감자튀김. 실제 입점 업체가 아닌 테스트용입니다.",demo:true,menus:[{name:"치즈버거",price:9000},{name:"감자튀김",price:4000},{name:"콜라",price:3000}]},
 {id:"demo-food-1",name:"삼락 분식 (예시)",category:"food",x:81,y:45,zone:"테스트 구역",description:"공연 사이에 즐기는 떡볶이와 김밥. 업체와 가격은 테스트용입니다.",demo:true,menus:[{name:"떡볶이",price:6000},{name:"김밥",price:4500}]},
 {id:"demo-food-2",name:"리버 카페 (예시)",category:"food",x:82,y:46,zone:"테스트 구역",description:"시원한 커피와 레모네이드. 업체와 가격은 테스트용입니다.",demo:true,menus:[{name:"아이스 아메리카노",price:4000},{name:"레모네이드",price:5500},{name:"초코 쿠키",price:3000}]},
];
