import { useEffect, useRef } from "react";
import { usePlayer } from "./PlayerContext";

interface Anchor {
  t: number;
  pos: number;
}

// 가사 스크롤과 카라오케 채우기. **여기서 나오는 갱신은 React state를 거치지
// 않는다** — 재생 중 초당 25회 위치를 다시 쓰기 때문에, state로 올리면 그만큼
// 리렌더가 발생한다. 대신 자기 ref에 transform/style을 직접 쓴다.
//
// 데스크탑과 모바일이 이 컴포넌트를 각각 하나씩 쓴다. 인스턴스가 자기 DOM만 보므로
// 원본처럼 두 벌의 DOM 참조를 손으로 짝지어 배열로 들고 다닐 필요가 없다.
export function LyricsView({
  maskId, trackId, maskClass, trackClass,
}: {
  maskId: string;
  trackId: string;
  maskClass: string;
  trackClass: string;
}) {
  const { audioRef, track } = usePlayer();
  const maskRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const anchorsRef = useRef<Anchor[]>([]);
  const lastActiveRef = useRef(-2);

  const lyrics = track.lyrics;

  useEffect(() => {
    const audio = audioRef.current;
    const mask = maskRef.current;
    const trackEl = trackRef.current;
    if (!audio || !mask || !trackEl) return;

    const lineEls = () => Array.from(trackEl.querySelectorAll("p"));

    // 각 줄의 등장 시각을 앵커로 삼아 그 사이를 선형보간한다. 절 안에서는 원래 줄
    // 간격을 그대로 쓰고, 간주 구간은 가사 데이터의 빈 줄이 간격을 만든다.
    const computeAnchors = () => {
      const els = lineEls();
      if (!els.length) {
        anchorsRef.current = [];
        return;
      }
      const lineHeight = els[0].clientHeight + 28;
      const anchors: Anchor[] = [
        { t: 0, pos: els[0].offsetTop + els[0].clientHeight / 2 - lineHeight },
      ];
      els.forEach((el, i) => {
        anchors.push({ t: lyrics[i].t, pos: el.offsetTop + el.clientHeight / 2 });
      });
      const lastEl = els[els.length - 1];
      const lastLyric = lyrics[lyrics.length - 1];
      const endT = audio.duration && isFinite(audio.duration) ? audio.duration : lastLyric.t + 10;
      anchors.push({
        t: Math.max(endT, lastLyric.t + 1),
        pos: lastEl.offsetTop + lastEl.clientHeight / 2 + lineHeight,
      });
      anchorsRef.current = anchors;
    };

    const applyScroll = (currentTime: number) => {
      const anchors = anchorsRef.current;
      if (anchors.length < 2 || !mask.clientHeight) return;
      let a = anchors[0];
      let b = anchors[anchors.length - 1];
      if (currentTime <= a.t) {
        b = a;
      } else if (currentTime >= b.t) {
        a = b;
      } else {
        for (let i = 0; i < anchors.length - 1; i++) {
          if (currentTime >= anchors[i].t && currentTime <= anchors[i + 1].t) {
            a = anchors[i];
            b = anchors[i + 1];
            break;
          }
        }
      }
      const span = b.t - a.t;
      const progress = span > 0 ? (currentTime - a.t) / span : 0;
      const pos = a.pos + (b.pos - a.pos) * progress;
      trackEl.style.transform = `translateY(${-(pos - mask.clientHeight / 2)}px)`;
    };

    // 활성 줄이 바뀔 때만 채우기 애니메이션을 다시 건다.
    const applyActiveLine = (currentTime: number) => {
      let activeIndex = -1;
      for (let i = 0; i < lyrics.length; i++) {
        if (currentTime >= lyrics[i].t) activeIndex = i;
        else break;
      }
      if (activeIndex === lastActiveRef.current) return;

      const els = lineEls();
      els.forEach((el, i) => {
        el.classList.remove("active");
        el.classList.toggle("past", i < activeIndex);
        el.style.transition = "";
        el.style.backgroundPosition = "";
      });

      if (activeIndex >= 0 && els[activeIndex]) {
        const cur = lyrics[activeIndex];
        const lineEnd = cur.end ?? lyrics[activeIndex + 1]?.t ?? cur.t + 3;
        const fillDur = Math.max(lineEnd - cur.t, 0.4);
        const el = els[activeIndex];
        el.classList.add("active");
        // 트랜지션 없이 "안 채워진" 상태로 되돌린 뒤, 강제 리플로우를 한 번 거쳐
        // 왼쪽에서 오른쪽으로 부드럽게 채워지도록 트랜지션을 건다.
        el.style.transition = "none";
        el.style.backgroundPosition = "100% 0";
        void el.offsetWidth;
        el.style.transition = `background-position ${fillDur}s linear`;
        el.style.backgroundPosition = "0% 0";
      }
      lastActiveRef.current = activeIndex;
    };

    const tick = () => {
      // 모바일 가사는 지금 CSS로 숨겨져 있다(PlayerMobile.css 참고 — 다시 켤 수 있게
      // 로직은 남겨둔 것이다). 숨겨져 있으면 높이가 0이라 눈에 보이는 결과가 전혀
      // 없는데도 초당 25회 DOM을 건드리게 되므로, 그때는 아무 일도 하지 않는다.
      // 다시 보이게 하면 높이가 생겨 그대로 되살아난다.
      if (!mask.clientHeight) return;
      applyScroll(audio.currentTime);
      applyActiveLine(audio.currentTime);
    };

    // timeupdate는 브라우저가 불규칙한 간격(대략 250ms~수백ms)으로만 쏴줘서, 그것만
    // 쓰면 CSS 트랜지션이 다음 이벤트보다 먼저 끝나 "멈췄다 가다"가 반복된다. 재생
    // 중에는 고정 주기 타이머로 따로 갱신한다. requestAnimationFrame이 아니라
    // setInterval인 이유: 탭이 화면에 안 보이면 rAF는 아예 멈추는데 setInterval은
    // 계속 돈다.
    let timer: number | null = null;
    const startTimer = () => {
      if (timer !== null) return;
      timer = window.setInterval(tick, 40);
    };
    const stopTimer = () => {
      if (timer !== null) {
        clearInterval(timer);
        timer = null;
      }
    };

    const onMeta = () => {
      computeAnchors();
      applyScroll(audio.currentTime);
    };
    const onSeeked = () => applyScroll(audio.currentTime);
    const onResize = () => {
      computeAnchors();
      applyScroll(audio.currentTime);
    };

    lastActiveRef.current = -2;
    trackEl.style.transform = "";
    computeAnchors();
    applyScroll(0);

    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("seeked", onSeeked);
    audio.addEventListener("play", startTimer);
    audio.addEventListener("pause", stopTimer);
    audio.addEventListener("ended", stopTimer);
    window.addEventListener("resize", onResize);
    if (!audio.paused) startTimer();

    return () => {
      stopTimer();
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("seeked", onSeeked);
      audio.removeEventListener("play", startTimer);
      audio.removeEventListener("pause", stopTimer);
      audio.removeEventListener("ended", stopTimer);
      window.removeEventListener("resize", onResize);
    };
  }, [audioRef, lyrics]);

  return (
    <div className={maskClass} id={maskId} ref={maskRef}>
      <div className={trackClass} id={trackId} ref={trackRef}>
        {lyrics.map((line, i) => (
          <p key={i}>{line.text}</p>
        ))}
      </div>
    </div>
  );
}
