// 카드 6개. **배열 순서가 곧 화면 배치다** — 데스크탑은 3열x2행 열 우선 채우기라
// 윗줄 Poster/Quiz/AI Ways, 아랫줄 Voice/CLASSCADE/Googler가 된다(2026-08-26 대표
// 지정). 순서를 바꾸면 배치가 바뀌므로 임의로 정렬하지 말 것.
//
// short는 모바일 전용 축약 문구다. 설명이 모바일 폭에서 3줄로 넘어가던 카드에만
// 있고, 원문 의미를 유지한 채 단어 하나 또는 짧은 구 하나를 뺀 수준이다. PC에는
// 언제나 full이 나간다. short가 없는 카드는 원문이 이미 2줄에 들어온다는 뜻이다.
export interface AppLink {
  name: string;
  href: string;
  thumb: string;
  /** 썸네일 대체 텍스트. name에서 조립하지 말 것 — QUIZ TOGETHER는 카드 제목과
   *  대체 텍스트가 일부러 다르다("같이교육 퀴즈 미리보기"). 조립하면 화면에는
   *  아무 변화가 없어서 스크린샷·computed style 비교로도 안 잡힌다. */
  alt: string;
  hook: string;
  full: string;
  short?: string;
}

export const APPS: AppLink[] = [
  {
    name: "Poster Studio",
    href: "https://poster.edutogether.kr",
    thumb: "/assets/poster-studio.webp",
    alt: "Poster Studio 미리보기",
    hook: "사진 한 장이면 나도 영화 주인공 !",
    full: "AI가 뚝딱 만들어주는 나만의 특별한 영화 포스터를 지금 만나보세요 🎬✨",
    short: "AI가 만들어주는 나만의 영화 포스터를 만나보세요 🎬✨",
  },
  {
    name: "Voice Cinema",
    href: "https://voice.edutogether.kr",
    thumb: "/assets/voice-cinema.webp",
    alt: "Voice Cinema 미리보기",
    hook: "내가 배우가 되는 시간 !",
    full: "무성영화에 내 목소리를 더빙해서 나만의 영화를 완성해봐요 🎬🎤",
    short: "무성영화에 내 목소리를 더빙해서 영화를 완성해봐요 🎬🎤",
  },
  {
    name: "QUIZ TOGETHER",
    href: "https://joo.is/같이교육퀴즈",
    thumb: "/assets/quiz.webp",
    alt: "같이교육 퀴즈 미리보기",
    hook: "두뇌 풀가동, 같이교육 OX 퀴즈 !",
    full: "정답을 맞혀가며 같이교육이 어떤 모임인지 자연스럽게 알아가요 🧠❓",
    short: "정답을 맞혀가며 같이교육이 어떤 모임인지 알아가요 🧠❓",
  },
  {
    name: "CLASSCADE",
    href: "https://classcade.edutogether.kr",
    thumb: "/assets/classcade.webp",
    alt: "CLASSCADE 미리보기",
    hook: "나는 어떤 교사일까 ?",
    full: "교실 속 나만의 교사 MBTI를 찾고, 나에게 어울리는 놀이를 추천받아요 🍎🎯",
    short: "교사 MBTI를 찾고, 어울리는 놀이를 추천받아요 🍎🎯",
  },
  {
    name: "AI Ways Incheon",
    href: "https://incheon.edutogether.kr",
    thumb: "/assets/incheon.webp",
    alt: "AI Ways Incheon 미리보기",
    hook: "3초 안에 분리배출 척척 !",
    full: "AI와 데이터로 우리 학교의 자원순환 현황을 확인하고 실천까지 이어가요 ♻️🤖",
    short: "AI와 데이터로 자원순환 현황을 확인하고 실천해요 ♻️🤖",
  },
  {
    name: "Be a Googler",
    href: "https://googler.edutogether.kr",
    thumb: "/assets/googler.webp",
    alt: "Be a Googler 미리보기",
    hook: "호기심이 이끄는 대로 !",
    full: "배우고 만들며 성장하는 구글러의 학습 모험을 떠나요 🔍🚀",
  },
];
