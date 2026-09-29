export type ArtistInfo = {
  name: string;
  image: string;
  bio: string;
  youtubeUrl: string;
};

// 사진은 public/artists 폴더에 넣고 image에 /artists/파일명.jpg 형식으로 입력하세요.
// youtubeUrl에는 채널, 뮤직비디오 또는 대표 라이브 영상 주소를 입력할 수 있습니다.
export const artistInfo: Record<string, ArtistInfo> = {
  "2026-day1-river-qwer": {
    name: "QWER",
    image: "",
    bio: "아티스트 소개를 입력해 주세요.",
    youtubeUrl: "",
  },
};
