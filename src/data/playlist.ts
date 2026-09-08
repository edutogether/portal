// 플레이리스트. 지금은 한 곡이지만 이전/다음/셔플/반복이 배열 기준으로 동작하므로
// 항목만 늘리면 그대로 작동한다.
//
// 가사 타임스탬프는 사용자가 직접 들으며 초 단위로 확인해준 실측값이다. text가 공백
// 한 칸인 줄은 간주 구간의 "빈 줄"로, 스크롤 속도를 맞추는 앵커 역할을 한다 —
// 지우거나 간격을 바꾸면 가사가 흐르는 속도가 바뀌므로 손대지 말 것.
export interface LyricLine {
  t: number;
  end: number;
  text: string;
}

export interface Track {
  title: string;
  artist: string;
  cover: string;
  src: string;
  lyrics: LyricLine[];
}

export const PLAYLIST: Track[] = [
  {
    title: "개구장이",
    artist: "산울림 — 개구장이",
    cover: "/assets/gaegujangi-cover.webp",
    src: "/assets/gaegujangi.m4a",
    lyrics: [
      { t: 5, end: 8, text: "우리 같이 놀아요" },
      { t: 8, end: 12, text: "뜀을 뛰며 공을 차며 놀아요" },
      { t: 14, end: 17, text: "우리 같이 불러요" },
      { t: 17, end: 21, text: "예쁜 노래 고운 노래 불러요" },
      { t: 23, end: 28, text: "이마엔 땀방울 마음엔 꽃방울" },
      { t: 29, end: 34, text: "나무에 오를래 하늘에 오를래" },
      { t: 34, end: 35, text: "개구쟁이" },
      { t: 39, end: 40, text: " " },
      { t: 43, end: 44, text: " " },
      { t: 47, end: 48, text: " " },
      { t: 51, end: 52, text: " " },
      { t: 55, end: 56, text: " " },
      { t: 59, end: 60, text: " " },
      { t: 63, end: 64, text: " " },
      { t: 67, end: 68, text: " " },
      { t: 69, end: 71, text: "우리 같이 놀아요" },
      { t: 72, end: 75, text: "뜀을 뛰며 공을 차며 놀아요" },
      { t: 78, end: 80, text: "우리 같이 불러요" },
      { t: 80, end: 84, text: "예쁜 노래 고운 노래 불러요" },
      { t: 86, end: 91, text: "이마엔 땀방울 마음엔 꽃방울" },
      { t: 92, end: 97, text: "나무에 오를래 하늘에 오를래" },
      { t: 99, end: 100, text: "개구장이" },
      { t: 104, end: 105, text: " " },
      { t: 108, end: 109, text: " " },
      { t: 112, end: 113, text: " " },
      { t: 116, end: 117, text: " " },
      { t: 120, end: 121, text: " " },
      { t: 124, end: 125, text: " " },
    ],
  },
];
