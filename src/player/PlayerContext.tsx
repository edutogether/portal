import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
  type ReactNode, type RefObject,
} from "react";
import { PLAYLIST, type Track } from "../data/playlist";
import { useVolumeFade } from "./useVolumeFade";

// 소리가 정착하는 볼륨. 방문하면 0에서 여기까지 부드럽게 올라오고, 음소거를 해제할
// 때도 직전 값이 없으면 여기로 돌아온다.
const RESTING_VOLUME = 0.5;

// 재생 상태는 여기 한 곳에만 있고, 데스크탑/모바일 플레이어가 같은 값을 구독한다.
// 원본에서는 두 벌의 DOM 참조를 손으로 짝지은 players 배열이 이 역할을 했는데,
// 그 짝짓기를 빠뜨려 모바일 쪽만 갱신이 안 되는 버그가 실제로 있었다. 상태가 하나면
// 그 사고가 구조적으로 불가능하다.
//
// 가사 스크롤(초당 25회 갱신)은 여기 들어오지 않는다 — LyricsView가 자기 ref에 직접
// 쓴다. 그걸 state로 올리면 초당 25회 리렌더가 된다.
interface PlayerValue {
  audioRef: RefObject<HTMLAudioElement | null>;
  track: Track;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  shuffleOn: boolean;
  repeatOn: boolean;
  favOn: boolean;
  /** 소리가 꺼진 상태 = volume이 0. audio.muted는 쓰지 않는다. */
  silent: boolean;
  volume: number;
  togglePlay: () => void;
  prev: () => void;
  next: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (value: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleFav: () => void;
}

const PlayerCtx = createContext<PlayerValue | null>(null);

export function usePlayer(): PlayerValue {
  const value = useContext(PlayerCtx);
  if (!value) throw new Error("usePlayer must be used inside <PlayerProvider>");
  return value;
}

export function PlayerProvider({
  audioRef,
  onError,
  children,
}: {
  audioRef: RefObject<HTMLAudioElement | null>;
  onError: () => void;
  children: ReactNode;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  // 이전/다음을 누르면 곡이 하나뿐이라 인덱스가 그대로여도 트랙을 다시 로드해야
  // 한다(원본 동작). 인덱스만 의존성으로 쓰면 같은 값이라 아무 일도 안 일어난다.
  const [loadNonce, setLoadNonce] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shuffleOn, setShuffleOn] = useState(false);
  const [repeatOn, setRepeatOn] = useState(true); // 기본은 "반복 켜짐"
  const [favOn, setFavOn] = useState(true);
  // 소리는 volume 하나로만 다룬다 — audio.muted는 쓰지 않는다(useVolumeFade 주석 참고).
  // 시작 볼륨이 0인 건 무음으로 두려는 게 아니라, 재생이 걸리는 순간 0 -> 0.5로
  // 부드럽게 올리기 위한 출발점이다.
  const { volume, setNow, fadeTo, getTarget } = useVolumeFade(audioRef, 0);
  const silent = volume <= 0;

  // 음소거를 해제할 때 돌아갈 값. 55%에서 껐으면 55%로 돌아온다. 슬라이더를 0까지
  // 내린 뒤 곧바로 음소거 버튼을 누르는 경우를 대비해 기본값도 0.5로 둔다 —
  // 1로 두면 최대음량으로 튀는 버그가 있었다(2026-08-25).
  const lastVolume = useRef(RESTING_VOLUME);
  const track = PLAYLIST[currentIndex];

  // 자동재생이 브라우저 정책으로 거부됐는지. 거부됐을 때만 아래 "사용자 조작이 있으면
  // 그때 시작" 경로를 연다.
  const autoplayBlocked = useRef(false);

  // 플레이어 컨트롤은 전부 이걸 먼저 부른다. 반환값이 true면 "자동재생이 막혀 있었고
  // 이 조작이 그 사람의 첫 조작"이라는 뜻이다. 여기서 플래그를 내리기 때문에, 아래
  // 전역 조작 리스너는 같은 클릭을 두 번째로 처리하지 않는다.
  //
  // 순서가 성립하는 이유: 리액트는 리스너를 #root에 달고 전역 리스너는 document에
  // 달려 있어서, 버블 경로상 컨트롤의 핸들러가 항상 먼저 돈다. 이게 없으면 음소거
  // 버튼을 눌렀는데 전역 리스너가 곧바로 재생을 걸어 사용자의 조작을 덮어썼다(실측).
  const consumeBlocked = useCallback(() => {
    const was = autoplayBlocked.current;
    autoplayBlocked.current = false;
    return was;
  }, []);

  // 트랙 로드 + 소리 있는 자동재생. 성공하면 0에서 정착 볼륨까지 부드럽게 올린다.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = track.src;
    audio.loop = repeatOn;
    audio.load();
    setNow(0);

    void audio
      .play()
      .then(() => {
        autoplayBlocked.current = false;
        fadeTo(RESTING_VOLUME);
      })
      .catch((err: unknown) => {
        // 거부 사유를 구분한다. 예전엔 전부 삼켰는데, 그러면 "정책이 막은 것"과
        // "진짜 재생 실패"가 똑같이 조용히 사라진다.
        const name = err instanceof DOMException ? err.name : "";
        if (name === "NotAllowedError") {
          // 브라우저 자동재생 정책. 첫 방문자에게 흔하다 — 사용자가 페이지에서
          // 무언가 조작하면 그때 시작한다(아래 effect).
          autoplayBlocked.current = true;
          // 볼륨바가 0에 붙어 "음소거된 것"처럼 보이지 않게 정착 볼륨을 표시해 둔다.
          // 재생이 멈춰 있으니 들리는 소리에는 영향이 없다.
          setNow(RESTING_VOLUME);
          return;
        }
        if (name === "AbortError") return; // 다른 로드 요청이 끊은 것 — 무해
        onError();
      });
    // repeatOn은 아래 별도 effect가 반영한다 — 여기 넣으면 반복 토글마다 곡이
    // 처음부터 다시 로드된다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioRef, track.src, loadNonce]);

  // 자동재생이 정책으로 거부됐을 때만, 페이지 안에서의 사용자 조작을 기다렸다가
  // 재생을 시작한다.
  //
  // ⛔ 앱 카드를 눌러 바깥 앱으로 나가는 클릭은 제외한다. 과거 사고가 정확히
  // 이것이었다 — 카드가 새 탭으로 열리는 동시에, 방금 떠난 원래 탭에서 음악이 터졌다.
  // "떠나는 클릭"은 재생 트리거가 아니다.
  //
  // 버블 단계에 다는 이유: 캡처 단계에 달면 페이지의 어떤 처리보다 먼저 끼어들고,
  // 무언가를 이미 처리해 stopPropagation한 이벤트까지 재생 신호로 삼게 된다. 버블
  // 단계면 페이지가 먼저 자기 일을 하고 남은 것만 본다. (제외 판정 자체는 두 단계
  // 모두 event.target이 같아서 어느 쪽이든 되지만, 끼어드는 시점은 다르다.)
  useEffect(() => {
    if (typeof document === "undefined") return;

    const start = (e: Event) => {
      if (!autoplayBlocked.current) return;
      const target = e.target;
      if (target instanceof Element && target.closest('a[target="_blank"]')) return;

      const audio = audioRef.current;
      if (!audio) return;
      autoplayBlocked.current = false;
      detach();
      setNow(0);
      void audio
        .play()
        .then(() => fadeTo(RESTING_VOLUME))
        .catch(() => setNow(RESTING_VOLUME));
    };

    const events = ["click", "keydown", "touchstart"] as const;
    const detach = () => events.forEach((n) => document.removeEventListener(n, start));
    events.forEach((n) => document.addEventListener(n, start));
    return detach;
  }, [audioRef, fadeTo, setNow]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.loop = repeatOn;
  }, [audioRef, repeatOn]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration);
    const onEnded = () => {
      setIsPlaying(false);
      // repeat이 꺼져 있을 때만 여기로 온다(켜져 있으면 audio.loop이 알아서 반복).
      // 곡이 하나뿐인데 "다음 곡"으로 넘기면 같은 곡을 다시 가리켜서 반복을 꺼도
      // 무한 재생되는 버그가 있었다 — 그럴 땐 그냥 멈춘다.
      if (!repeatOn && PLAYLIST.length === 1) return;
      setCurrentIndex((i) => (i + 1) % PLAYLIST.length);
      setLoadNonce((n) => n + 1);
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [audioRef, onError, repeatOn]);

  const pickAdjacent = useCallback(
    (direction: 1 | -1) => {
      // 셔플이 켜져 있고 곡이 여럿이면 무작위(직전 곡 제외).
      if (shuffleOn && PLAYLIST.length > 1) {
        let r = currentIndex;
        while (r === currentIndex) r = Math.floor(Math.random() * PLAYLIST.length);
        return r;
      }
      return (currentIndex + direction + PLAYLIST.length) % PLAYLIST.length;
    },
    [currentIndex, shuffleOn]
  );

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused) {
      audio.pause();
      return;
    }
    // 자동재생이 정책에 막혀 있던 상태라면, 이 클릭이 그 사람의 첫 조작이다 —
    // 0에서 정착 볼륨까지 부드럽게 올리며 시작한다. 여기서 플래그를 내려서
    // 위의 전역 조작 리스너가 같은 클릭으로 한 번 더 재생을 걸지 않게 한다.
    const wasBlocked = consumeBlocked();
    if (wasBlocked) setNow(0);
    void audio
      .play()
      .then(() => {
        if (wasBlocked) fadeTo(RESTING_VOLUME);
      })
      .catch(() => {
        if (wasBlocked) setNow(RESTING_VOLUME);
      });
  }, [audioRef, consumeBlocked, fadeTo, setNow]);

  // 애플뮤직처럼 3초 넘게 재생했으면 처음부터, 아니면 진짜 이전 곡으로.
  const prev = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      void audio.play().catch(() => {});
      return;
    }
    setCurrentIndex(pickAdjacent(-1));
    setLoadNonce((n) => n + 1);
  }, [audioRef, pickAdjacent]);

  const next = useCallback(() => {
    setCurrentIndex(pickAdjacent(1));
    setLoadNonce((n) => n + 1);
  }, [pickAdjacent]);

  const seekTo = useCallback(
    (seconds: number) => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.currentTime = seconds;
      // 표시도 즉시 옮긴다. 안 그러면 실제 seek이 반영된 timeupdate가 올 때까지
      // 시간 표시가 잠깐 이전 위치로 되돌아간 것처럼 보인다.
      setCurrentTime(seconds);
    },
    [audioRef]
  );

  // 슬라이더 조작 — 진행 중인 페이드를 취소하고 즉시 그 값이 된다(사용자가 이긴다).
  const setVolume = useCallback(
    (value: number) => {
      const wasBlocked = consumeBlocked();
      setNow(value);
      if (value > 0) lastVolume.current = value;
      // 볼륨을 올리는 건 "소리를 듣고 싶다"는 조작이다 — 자동재생이 막혀 있었다면
      // 이때 시작한다.
      if (wasBlocked && value > 0) {
        const audio = audioRef.current;
        if (audio && audio.paused) void audio.play().catch(() => {});
      }
    },
    [audioRef, consumeBlocked, setNow]
  );

  // 음소거 버튼 — 끌 땐 0으로, 켤 땐 직전 값으로 "부드럽게" 이동한다. 볼륨바가
  // 그 흐름을 그대로 따라간다(슬라이더 값이 volume 상태를 그리기 때문).
  const toggleMute = useCallback(() => {
    // 순간값이 아니라 "향하고 있는 값"으로 판정한다. 0으로 내려가는 페이드 도중에
    // 다시 누르면 순간값은 아직 0보다 커서 또 끄는 것으로 잘못 읽히고, 그때 직전
    // 볼륨이 그 찰나의 값으로 덮여버린다.
    const wasBlocked = consumeBlocked();
    const current = getTarget();
    if (current <= 0) {
      // 소리를 켜는 쪽 — 막혀 있었다면 이때 재생도 시작한다.
      fadeTo(lastVolume.current || RESTING_VOLUME);
      if (wasBlocked) {
        const audio = audioRef.current;
        if (audio && audio.paused) void audio.play().catch(() => {});
      }
      return;
    }
    // 소리를 끄는 쪽 — 재생을 시작하지 않는다. 사용자가 방금 "조용히 해달라"고 했다.
    lastVolume.current = current;
    fadeTo(0);
  }, [audioRef, consumeBlocked, fadeTo, getTarget]);

  const value = useMemo<PlayerValue>(
    () => ({
      audioRef, track, isPlaying, currentTime, duration,
      shuffleOn, repeatOn, favOn, silent, volume,
      togglePlay, prev, next, seekTo, setVolume, toggleMute,
      toggleShuffle: () => setShuffleOn((v) => !v),
      toggleRepeat: () => setRepeatOn((v) => !v),
      toggleFav: () => setFavOn((v) => !v),
    }),
    [
      audioRef, track, isPlaying, currentTime, duration, shuffleOn, repeatOn,
      favOn, silent, volume, togglePlay, prev, next, seekTo, setVolume, toggleMute,
    ]
  );

  return <PlayerCtx.Provider value={value}>{children}</PlayerCtx.Provider>;
}
