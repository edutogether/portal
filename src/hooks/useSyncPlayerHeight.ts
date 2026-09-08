import { useLayoutEffect } from "react";

// 플레이어 높이를 카드 그리드 "위쪽 2행"의 실제 렌더 높이에 맞춘다.
//
// 그리드 전체 높이에 맞추면 카드 행이 늘 때마다 플레이어도 같이 길어진다 — 그게
// 원래 사고였다. 반대로 딱 1행에만 맞추면 플레이어 내부(앨범아트/가사/컨트롤)가
// overflow:hidden에 잘린다. 그래서 2행이다. 지금은 카드가 정확히 3열x2행이라
// 결과값이 그리드 전체 높이와 같아지지만, "그리드 전체에 맞추기"로 단순화하지 말 것.
const SYNC_ROWS = 2;
const MOBILE_QUERY = "(max-width: 1180px)";

export function useSyncPlayerHeight() {
  useLayoutEffect(() => {
    const sync = () => {
      const player = document.querySelector<HTMLElement>(".player");
      const main = document.querySelector<HTMLElement>(".stage main");
      if (!player || !main) return;

      // 하단 고정 플레이어로 바뀌는 폭에서는 높이를 건드리지 않는다.
      if (window.matchMedia(MOBILE_QUERY).matches) {
        player.style.height = "";
        return;
      }

      const apps = main.querySelectorAll<HTMLElement>(".app");
      const cols = getComputedStyle(main).gridTemplateColumns.split(" ").length;
      const lastIndex = Math.min(cols * SYNC_ROWS, apps.length) - 1;
      const height = apps.length
        ? apps[lastIndex].getBoundingClientRect().bottom - main.getBoundingClientRect().top
        : main.getBoundingClientRect().height;
      player.style.height = `${height}px`;
    };

    sync();
    window.addEventListener("load", sync);
    window.addEventListener("resize", sync);

    // 카드 썸네일이 뒤늦게 로드되면서 그리드 높이가 바뀌는 경우까지 따라간다 —
    // 원본은 load/resize만 봐서 그 사이 변화를 놓칠 수 있었다.
    const main = document.querySelector(".stage main");
    const observer = main ? new ResizeObserver(sync) : null;
    if (main && observer) observer.observe(main);

    return () => {
      window.removeEventListener("load", sync);
      window.removeEventListener("resize", sync);
      observer?.disconnect();
    };
  }, []);
}
