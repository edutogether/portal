import { useEffect, useState } from "react";
import "./Loader.css";

// 로딩 화면은 **화면이 실제로 준비돼야** 사라진다. 연출 시간만 보고 숨기면 느린
// 회선에서 아직 다 안 그려진 메인 화면이 0.5초 크로스페이드 동안 그림자처럼 비쳐
// 보인다(2026-09-03 실사용 중 보고된 버그).
//
// 예전에는 "준비됨"을 window의 load 이벤트로 판정했는데, 리액트에서는 그게 성립하지
// 않는다: load는 **HTML 파싱 시점에 발견된** 자산만 기다린다. 화면이 자바스크립트로
// 그려지면 이미지 요청이 그 뒤에 시작되므로 load는 그걸 기다려주지 않고 먼저 끝나
// 버린다. 그래서 프록시 이벤트 대신 실제로 화면에 필요한 것을 직접 기다린다:
//   - 웹폰트 로드 완료 (안 그러면 폰트 폴백 상태의 화면이 먼저 보인다)
//   - 화면에 있는 모든 <img>의 로드 완료 (카드 썸네일, 앨범 커버)
//   - 로딩 화면 자신의 배경 이미지
// 셋 다 실패해도(네트워크 오류 등) 화면은 떠야 하므로 에러도 "끝난 것"으로 친다.
const MIN_SHOW_MS = 2100;
const SAFETY_MS = 8000;

// 로더 배경 이미지 경로의 유일한 출처. 여기서 CSS 변수로 넘겨 Loader.css가 쓰고,
// 아래 준비 판정도 같은 값을 기다린다 — 두 곳에 따로 적어두면 한쪽만 바뀐다.
const LOADER_BG = "/assets/bg-main.webp";

function whenSettled(el: HTMLImageElement): Promise<void> {
  if (el.complete) return Promise.resolve();
  return new Promise((resolve) => {
    el.addEventListener("load", () => resolve(), { once: true });
    el.addEventListener("error", () => resolve(), { once: true });
  });
}

function loadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
}

export function Loader() {
  const [minDone, setMinDone] = useState(false);
  const [assetsReady, setAssetsReady] = useState(false);
  const [forceHide, setForceHide] = useState(false);

  useEffect(() => {
    const minTimer = window.setTimeout(() => setMinDone(true), MIN_SHOW_MS);
    // 어떤 자산이 영영 안 오는 경우를 대비한 안전장치.
    const safety = window.setTimeout(() => setForceHide(true), SAFETY_MS);
    return () => {
      clearTimeout(minTimer);
      clearTimeout(safety);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await Promise.all([
        document.fonts.ready,
        loadImage(LOADER_BG),
        ...Array.from(document.images).map(whenSettled),
      ]);
      if (!cancelled) setAssetsReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const done = forceHide || (minDone && assetsReady);

  return (
    <div
      id="loader"
      className={done ? "done" : undefined}
      style={{ "--loader-bg": `url("${LOADER_BG}")` } as React.CSSProperties}
    >
      <img className="mark" src="/assets/gyo-mark-wh.webp" alt="같이교육" />
      <div className="logo">같교오락실</div>
      <div className="bar" aria-hidden="true"><i /></div>
      <div className="coin">같교오락실의 포털을 불러오는 중입니다 ...</div>
    </div>
  );
}
