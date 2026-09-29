export type Performance = { id: string; artist: string; stage: string; start: string; end: string };
const stages = ["samrock", "green", "river", "wave", "hidden"].map(id => ({ id, name: id.toUpperCase() }));
// Transcribed from the user-provided 2026 timetable images.
export const festival = {
 name: "Busan International Rock Festival", year: 2026,
 days: [
  {
    "id": "day1",
    "label": "10.02 FRI",
    "date": "2026-10-02",
    "performances": [
      {
        "id": "2026-day1-samrock-1",
        "artist": "다다다 DADADA",
        "stage": "samrock",
        "start": "12:00",
        "end": "12:30"
      },
      {
        "id": "2026-day1-samrock-2",
        "artist": "정우 JUNGWOO",
        "stage": "samrock",
        "start": "13:00",
        "end": "13:30"
      },
      {
        "id": "2026-day1-samrock-3",
        "artist": "KARDI",
        "stage": "samrock",
        "start": "14:00",
        "end": "14:40"
      },
      {
        "id": "2026-day1-samrock-4",
        "artist": "로맨틱펀치 Romantic Punch",
        "stage": "samrock",
        "start": "15:20",
        "end": "16:00"
      },
      {
        "id": "2026-day1-samrock-5",
        "artist": "브로콜리너마저 Broccoli, you too?",
        "stage": "samrock",
        "start": "16:50",
        "end": "17:40"
      },
      {
        "id": "2026-day1-samrock-6",
        "artist": "CreepHyp",
        "stage": "samrock",
        "start": "18:30",
        "end": "19:30"
      },
      {
        "id": "2026-day1-samrock-7",
        "artist": "AVENGED SEVENFOLD",
        "stage": "samrock",
        "start": "20:40",
        "end": "22:00"
      },
      {
        "id": "2026-day1-green-1",
        "artist": "Tokai",
        "stage": "green",
        "start": "11:30",
        "end": "12:00"
      },
      {
        "id": "2026-day1-green-2",
        "artist": "hathaw9y",
        "stage": "green",
        "start": "12:30",
        "end": "13:00"
      },
      {
        "id": "2026-day1-green-3",
        "artist": "Redoor",
        "stage": "green",
        "start": "13:30",
        "end": "14:00"
      },
      {
        "id": "2026-day1-green-4",
        "artist": "LUCKLIFE",
        "stage": "green",
        "start": "14:40",
        "end": "15:20"
      },
      {
        "id": "2026-day1-green-xdinary-heroes",
        "artist": "Xdinary Heroes",
        "stage": "green",
        "start": "16:00",
        "end": "16:50"
      },
      {
        "id": "2026-day1-green-6",
        "artist": "장범준 JANG BEOM JUNE",
        "stage": "green",
        "start": "17:40",
        "end": "18:30"
      },
      {
        "id": "2026-day1-green-7",
        "artist": "이승윤 LEE SEUNG YOON",
        "stage": "green",
        "start": "19:30",
        "end": "20:30"
      },
      {
        "id": "2026-day1-river-1",
        "artist": "hrtz.wav",
        "stage": "river",
        "start": "11:40",
        "end": "12:10"
      },
      {
        "id": "2026-day1-river-2",
        "artist": "DYGL",
        "stage": "river",
        "start": "12:40",
        "end": "13:10"
      },
      {
        "id": "2026-day1-river-3",
        "artist": "공원 gongwon",
        "stage": "river",
        "start": "13:40",
        "end": "14:20"
      },
      {
        "id": "2026-day1-river-4",
        "artist": "한요한 Han Yo Han",
        "stage": "river",
        "start": "14:50",
        "end": "15:30"
      },
      {
        "id": "2026-day1-river-5",
        "artist": "Elephant Gym",
        "stage": "river",
        "start": "16:00",
        "end": "16:40"
      },
      {
        "id": "2026-day1-river-6",
        "artist": "페퍼톤스 PEPPERTONES",
        "stage": "river",
        "start": "17:10",
        "end": "18:00"
      },
      {
        "id": "2026-day1-river-7",
        "artist": "N.Flying",
        "stage": "river",
        "start": "18:40",
        "end": "19:40"
      },
      {
        "id": "2026-day1-wave-1",
        "artist": "D82",
        "stage": "wave",
        "start": "11:30",
        "end": "12:00"
      },
      {
        "id": "2026-day1-wave-2",
        "artist": "산보 Sanbo",
        "stage": "wave",
        "start": "12:30",
        "end": "13:00"
      },
      {
        "id": "2026-day1-wave-3",
        "artist": "HOA",
        "stage": "wave",
        "start": "13:30",
        "end": "14:00"
      },
      {
        "id": "2026-day1-wave-4",
        "artist": "밴드기린 BANDKIRIN",
        "stage": "wave",
        "start": "14:40",
        "end": "15:20"
      },
      {
        "id": "2026-day1-wave-5",
        "artist": "알레프 ALEPH",
        "stage": "wave",
        "start": "16:00",
        "end": "16:50"
      },
      {
        "id": "2026-day1-wave-6",
        "artist": "강산에 Kang San Eh",
        "stage": "wave",
        "start": "17:40",
        "end": "18:30"
      },
      {
        "id": "2026-day1-wave-7",
        "artist": "J.E.B",
        "stage": "wave",
        "start": "19:30",
        "end": "20:20"
      },
      {
        "id": "2026-day1-hidden-1",
        "artist": "노아코스트 Noa Coast",
        "stage": "hidden",
        "start": "13:20",
        "end": "13:50"
      },
      {
        "id": "2026-day1-hidden-2",
        "artist": "블낫블 Blue is Not Blue",
        "stage": "hidden",
        "start": "14:10",
        "end": "14:40"
      },
      {
        "id": "2026-day1-hidden-3",
        "artist": "퓨처피어클럽 FuturePeerClub",
        "stage": "hidden",
        "start": "15:00",
        "end": "15:30"
      },
      {
        "id": "2026-day1-hidden-4",
        "artist": "아스라이 asrai",
        "stage": "hidden",
        "start": "15:50",
        "end": "16:20"
      },
      {
        "id": "2026-day1-hidden-5",
        "artist": "나타샤 NATASHA",
        "stage": "hidden",
        "start": "16:40",
        "end": "17:10"
      },
      {
        "id": "2026-day1-hidden-6",
        "artist": "부락 대운동회",
        "stage": "hidden",
        "start": "17:40",
        "end": "18:20"
      },
      {
        "id": "2026-day1-hidden-7",
        "artist": "부락 노래자랑",
        "stage": "hidden",
        "start": "18:30",
        "end": "19:20"
      }
    ]
  },
  {
    "id": "day2",
    "label": "10.03 SAT",
    "date": "2026-10-03",
    "performances": [
      {
        "id": "2026-day2-samrock-1",
        "artist": "Wah Wah Wah",
        "stage": "samrock",
        "start": "12:00",
        "end": "12:30"
      },
      {
        "id": "2026-day2-samrock-2",
        "artist": "신인류 Shin In Ryu",
        "stage": "samrock",
        "start": "13:00",
        "end": "13:30"
      },
      {
        "id": "2026-day2-samrock-3",
        "artist": "SPACEY JANE",
        "stage": "samrock",
        "start": "14:00",
        "end": "14:40"
      },
      {
        "id": "2026-day2-samrock-4",
        "artist": "WOODZ",
        "stage": "samrock",
        "start": "15:20",
        "end": "16:00"
      },
      {
        "id": "2026-day2-samrock-5",
        "artist": "터치드 TOUCHED",
        "stage": "samrock",
        "start": "16:50",
        "end": "17:40"
      },
      {
        "id": "2026-day2-samrock-6",
        "artist": "잔나비 JANNABI",
        "stage": "samrock",
        "start": "18:30",
        "end": "19:30"
      },
      {
        "id": "2026-day2-samrock-7",
        "artist": "MEGADETH",
        "stage": "samrock",
        "start": "20:40",
        "end": "22:00"
      },
      {
        "id": "2026-day2-green-1",
        "artist": "프랭클리 FRankly",
        "stage": "green",
        "start": "11:30",
        "end": "12:00"
      },
      {
        "id": "2026-day2-green-2",
        "artist": "캔트비블루 can't be blue",
        "stage": "green",
        "start": "12:30",
        "end": "13:00"
      },
      {
        "id": "2026-day2-green-3",
        "artist": "스카웨이커스 SKAWAKERS",
        "stage": "green",
        "start": "13:30",
        "end": "14:00"
      },
      {
        "id": "2026-day2-green-4",
        "artist": "브로큰 발렌타인 BROKEN VALENTINE",
        "stage": "green",
        "start": "14:40",
        "end": "15:20"
      },
      {
        "id": "2026-day2-green-5",
        "artist": "ADOY",
        "stage": "green",
        "start": "16:00",
        "end": "16:50"
      },
      {
        "id": "2026-day2-green-6",
        "artist": "IDIOTAPE",
        "stage": "green",
        "start": "17:40",
        "end": "18:30"
      },
      {
        "id": "2026-day2-green-7",
        "artist": "Suchmos",
        "stage": "green",
        "start": "19:30",
        "end": "20:30"
      },
      {
        "id": "2026-day2-river-1",
        "artist": "야자수 Yajasu",
        "stage": "river",
        "start": "11:40",
        "end": "12:10"
      },
      {
        "id": "2026-day2-river-2",
        "artist": "이츠 IT’S",
        "stage": "river",
        "start": "12:40",
        "end": "13:10"
      },
      {
        "id": "2026-day2-river-3",
        "artist": "고고학 GOGOHAWK",
        "stage": "river",
        "start": "13:40",
        "end": "14:20"
      },
      {
        "id": "2026-day2-river-4",
        "artist": "오월오일 OWALLOIL",
        "stage": "river",
        "start": "14:50",
        "end": "15:30"
      },
      {
        "id": "2026-day2-river-5",
        "artist": "윤마치 MRCH",
        "stage": "river",
        "start": "16:00",
        "end": "16:40"
      },
      {
        "id": "2026-day2-river-6",
        "artist": "권진아 KWON JIN AH",
        "stage": "river",
        "start": "17:10",
        "end": "18:00"
      },
      {
        "id": "2026-day2-river-7",
        "artist": "Henry Moodie",
        "stage": "river",
        "start": "18:40",
        "end": "19:40"
      },
      {
        "id": "2026-day2-wave-1",
        "artist": "단감자 dangamjah",
        "stage": "wave",
        "start": "11:30",
        "end": "12:00"
      },
      {
        "id": "2026-day2-wave-2",
        "artist": "Chivan",
        "stage": "wave",
        "start": "12:30",
        "end": "13:00"
      },
      {
        "id": "2026-day2-wave-3",
        "artist": "AxMxP",
        "stage": "wave",
        "start": "13:30",
        "end": "14:00"
      },
      {
        "id": "2026-day2-wave-4",
        "artist": "GOODMOOD",
        "stage": "wave",
        "start": "14:40",
        "end": "15:20"
      },
      {
        "id": "2026-day2-wave-5",
        "artist": "Wendy Wander",
        "stage": "wave",
        "start": "16:00",
        "end": "16:50"
      },
      {
        "id": "2026-day2-wave-6",
        "artist": "세이수미 Say Sue Me",
        "stage": "wave",
        "start": "17:40",
        "end": "18:30"
      },
      {
        "id": "2026-day2-wave-7",
        "artist": "HYPNOSIS THERAPY",
        "stage": "wave",
        "start": "19:30",
        "end": "20:20"
      },
      {
        "id": "2026-day2-hidden-1",
        "artist": "베이루트택시 BEIRUT TAXI",
        "stage": "hidden",
        "start": "13:20",
        "end": "13:50"
      },
      {
        "id": "2026-day2-hidden-2",
        "artist": "최초록밴드 BandCMC",
        "stage": "hidden",
        "start": "14:10",
        "end": "14:40"
      },
      {
        "id": "2026-day2-hidden-3",
        "artist": "천둥오리 CheondungOri",
        "stage": "hidden",
        "start": "15:00",
        "end": "15:30"
      },
      {
        "id": "2026-day2-hidden-4",
        "artist": "To More Raw",
        "stage": "hidden",
        "start": "15:50",
        "end": "16:20"
      },
      {
        "id": "2026-day2-hidden-5",
        "artist": "Eddie and the Bricks",
        "stage": "hidden",
        "start": "16:40",
        "end": "17:10"
      },
      {
        "id": "2026-day2-hidden-6",
        "artist": "부락 대운동회",
        "stage": "hidden",
        "start": "17:40",
        "end": "18:20"
      },
      {
        "id": "2026-day2-hidden-7",
        "artist": "부락 노래자랑",
        "stage": "hidden",
        "start": "18:30",
        "end": "19:20"
      }
    ]
  },
  {
    "id": "day3",
    "label": "10.04 SUN",
    "date": "2026-10-04",
    "performances": [
      {
        "id": "2026-day3-samrock-1",
        "artist": "양치기소년단 The Shepherd Bois",
        "stage": "samrock",
        "start": "12:00",
        "end": "12:30"
      },
      {
        "id": "2026-day3-samrock-2",
        "artist": "극동아시아타이거즈 Far East Asian Tigers",
        "stage": "samrock",
        "start": "13:00",
        "end": "13:30"
      },
      {
        "id": "2026-day3-samrock-3",
        "artist": "너드커넥션 Nerd Connection",
        "stage": "samrock",
        "start": "14:00",
        "end": "14:40"
      },
      {
        "id": "2026-day3-samrock-4",
        "artist": "HANABIE.",
        "stage": "samrock",
        "start": "15:20",
        "end": "16:00"
      },
      {
        "id": "2026-day3-samrock-5",
        "artist": "한로로 HANRORO",
        "stage": "samrock",
        "start": "16:50",
        "end": "17:40"
      },
      {
        "id": "2026-day3-samrock-6",
        "artist": "Hitsujibungaku (羊文学)",
        "stage": "samrock",
        "start": "18:40",
        "end": "19:40"
      },
      {
        "id": "2026-day3-samrock-7",
        "artist": "THE LIBERTINES",
        "stage": "samrock",
        "start": "20:50",
        "end": "22:00"
      },
      {
        "id": "2026-day3-green-1",
        "artist": "심아일랜드 SIMILE LAND",
        "stage": "green",
        "start": "11:30",
        "end": "12:00"
      },
      {
        "id": "2026-day3-green-2",
        "artist": "레이지본 LAZYBONE",
        "stage": "green",
        "start": "12:30",
        "end": "13:00"
      },
      {
        "id": "2026-day3-green-3",
        "artist": "Dragon Pony",
        "stage": "green",
        "start": "13:30",
        "end": "14:00"
      },
      {
        "id": "2026-day3-green-4",
        "artist": "AiNA THE END",
        "stage": "green",
        "start": "14:40",
        "end": "15:20"
      },
      {
        "id": "2026-day3-green-5",
        "artist": "LUCY",
        "stage": "green",
        "start": "16:00",
        "end": "16:50"
      },
      {
        "id": "2026-day3-green-6",
        "artist": "CNBLUE",
        "stage": "green",
        "start": "17:40",
        "end": "18:40"
      },
      {
        "id": "2026-day3-green-7",
        "artist": "송골매 Songolmae",
        "stage": "green",
        "start": "19:40",
        "end": "20:40"
      },
      {
        "id": "2026-day3-river-1",
        "artist": "희규 heegyu",
        "stage": "river",
        "start": "11:40",
        "end": "12:10"
      },
      {
        "id": "2026-day3-river-2",
        "artist": "OYSTERS",
        "stage": "river",
        "start": "12:40",
        "end": "13:10"
      },
      {
        "id": "2026-day3-river-3",
        "artist": "Ardhito Pramono",
        "stage": "river",
        "start": "13:40",
        "end": "14:20"
      },
      {
        "id": "2026-day3-river-4",
        "artist": "까치산 KACHISAN",
        "stage": "river",
        "start": "14:50",
        "end": "15:30"
      },
      {
        "id": "2026-day3-river-5",
        "artist": "김뜻돌 Meaningful Stone",
        "stage": "river",
        "start": "16:00",
        "end": "16:40"
      },
      {
        "id": "2026-day3-river-6",
        "artist": "김성규 KIM SUNG KYU",
        "stage": "river",
        "start": "17:10",
        "end": "18:00"
      },
      {
        "id": "2026-day3-river-7",
        "artist": "카더가든 Car, the garden",
        "stage": "river",
        "start": "18:40",
        "end": "19:40"
      },
      {
        "id": "2026-day3-wave-1",
        "artist": "정수민 JUNGSOOMIN",
        "stage": "wave",
        "start": "11:30",
        "end": "12:00"
      },
      {
        "id": "2026-day3-wave-2",
        "artist": "BØJEONG",
        "stage": "wave",
        "start": "12:30",
        "end": "13:00"
      },
      {
        "id": "2026-day3-wave-3",
        "artist": "KIK",
        "stage": "wave",
        "start": "13:30",
        "end": "14:00"
      },
      {
        "id": "2026-day3-wave-4",
        "artist": "Tuesday Beach Club",
        "stage": "wave",
        "start": "14:40",
        "end": "15:20"
      },
      {
        "id": "2026-day3-wave-5",
        "artist": "놀이도감 Noridogam",
        "stage": "wave",
        "start": "16:00",
        "end": "16:50"
      },
      {
        "id": "2026-day3-wave-6",
        "artist": "데이먼스 이어 DAMONS YEAR",
        "stage": "wave",
        "start": "17:40",
        "end": "18:30"
      },
      {
        "id": "2026-day3-wave-7",
        "artist": "타이거디스코 Tiger Disco",
        "stage": "wave",
        "start": "19:40",
        "end": "20:30"
      },
      {
        "id": "2026-day3-hidden-1",
        "artist": "김푸름 KIM PUREUM",
        "stage": "hidden",
        "start": "13:20",
        "end": "13:50"
      },
      {
        "id": "2026-day3-hidden-2",
        "artist": "시인을 위하여 for the poet",
        "stage": "hidden",
        "start": "14:10",
        "end": "14:40"
      },
      {
        "id": "2026-day3-hidden-3",
        "artist": "데이네버체인지 TheyNeverChange",
        "stage": "hidden",
        "start": "15:00",
        "end": "15:30"
      },
      {
        "id": "2026-day3-hidden-4",
        "artist": "포져군단 POSER",
        "stage": "hidden",
        "start": "15:50",
        "end": "16:20"
      },
      {
        "id": "2026-day3-hidden-5",
        "artist": "아사달 Asadal",
        "stage": "hidden",
        "start": "16:40",
        "end": "17:10"
      },
      {
        "id": "2026-day3-hidden-6",
        "artist": "Rookies on the BU-ROCK Awards",
        "stage": "hidden",
        "start": "17:40",
        "end": "18:20"
      },
      {
        "id": "2026-day3-hidden-7",
        "artist": "부락 노래자랑",
        "stage": "hidden",
        "start": "18:30",
        "end": "19:20"
      }
    ]
  }
].map(day => ({ ...day, stages })),
};
