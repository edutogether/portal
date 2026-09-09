import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

const FADE_MS = 450;

// 볼륨을 목표값까지 부드럽게 옮긴다. 값이 툭 바뀌지 않고 흘러야 하고, 볼륨바도 같은
// 흐름을 따라가야 해서 매 프레임 상태를 갱신한다 — 450ms 한 번뿐인 애니메이션이라
// 리렌더 비용이 문제되지 않는다(가사 스크롤처럼 계속 도는 것과는 다르다).
//
// 소리를 끄는 데 audio.muted를 쓰지 않고 volume만 쓴다. 두 가지를 같이 쓰면 "조용함"의
// 출처가 둘이 되어(muted=true인데 volume은 0.5) 볼륨바가 실제 상태와 어긋난다.
// 여기서는 volume 하나가 유일한 진실이고, 음소거 = volume 0이다.
export function useVolumeFade(audioRef: RefObject<HTMLAudioElement | null>, initial: number) {
  const [volume, setVolume] = useState(initial);
  const frame = useRef<number | null>(null);
  // 페이드가 향하는 값. 진행 중일 때 "지금 볼륨"을 순간값으로 읽으면, 0으로 내려가는
  // 도중의 0.004를 보고 "아직 소리가 있다"고 판정하게 된다 — 그 상태에서 음소거를
  // 다시 누르면 직전 볼륨이 0.004로 덮여 복귀가 망가진다(실제로 겪음).
  const target = useRef(initial);

  const apply = useCallback(
    (v: number) => {
      const clamped = Math.min(1, Math.max(0, v));
      const audio = audioRef.current;
      if (audio) audio.volume = clamped;
      setVolume(clamped);
    },
    [audioRef]
  );

  const cancel = useCallback(() => {
    if (frame.current !== null) {
      cancelAnimationFrame(frame.current);
      frame.current = null;
    }
  }, []);

  // 사용자가 슬라이더를 잡으면 이걸 부른다 — 진행 중인 페이드를 취소하므로 둘이 값을
  // 두고 다투지 않고 언제나 사용자 조작이 이긴다.
  const setNow = useCallback(
    (v: number) => {
      cancel();
      target.current = v;
      apply(v);
    },
    [apply, cancel]
  );

  // 지금 볼륨이 "논리적으로" 얼마인지 — 페이드 중이면 도착할 값. 토글 판정은 순간값이
  // 아니라 이 값으로 해야 한다.
  const getTarget = useCallback(() => target.current, []);

  const fadeTo = useCallback(
    (to: number) => {
      cancel();
      const audio = audioRef.current;
      if (!audio) return;
      target.current = to;

      // 동작 줄이기 설정이 켜져 있으면 페이드 없이 즉시 반영한다.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        apply(to);
        return;
      }

      const from = audio.volume;
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min((now - start) / FADE_MS, 1);
        const eased = 1 - (1 - t) ** 3; // 끝에서 잦아들게
        apply(from + (to - from) * eased);
        frame.current = t < 1 ? requestAnimationFrame(step) : null;
      };
      frame.current = requestAnimationFrame(step);
    },
    [apply, audioRef, cancel]
  );

  useEffect(() => cancel, [cancel]);

  return { volume, setNow, fadeTo, getTarget, cancelFade: cancel };
}
