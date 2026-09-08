import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
  type ReactNode, type RefObject,
} from "react";
import { PLAYLIST, type Track } from "../data/playlist";

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
  muted: boolean;
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
  const [muted, setMuted] = useState(true);
  const [volume, setVolumeState] = useState(0.5);

  // 슬라이더를 0까지 내린 뒤 곧바로 음소거 버튼을 누르면 이 값이 그대로 쓰인다.
  // 1로 두면 최대음량으로 튀는 버그가 있었어서 초기값도 0.5로 맞춘다.
  const lastVolume = useRef(0.5);
  const track = PLAYLIST[currentIndex];

  // 첫 재생은 항상 음소거로 시작한다. 브라우저 자동재생 정책은 방문 이력(미디어
  // 참여도)에 따라 달라져서, 방문을 반복하면 무음소거 자동재생이 허용되어 소리가
  // 나가버릴 수 있다 — 사용자가 음소거 버튼을 눌러야만 소리가 나가게 한다.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = true;
    audio.volume = 0.5;
  }, [audioRef]);

  // 트랙 로드 + 자동재생. 자동재생이 정책에 막히면 재생 버튼을 눌렀을 때 play()가
  // 걸리므로 별도 폴백을 두지 않는다 — 예전에 document 전역 첫 상호작용에 재생을
  // 걸었더니, 앱 카드를 탭하는 것도 "첫 상호작용"으로 잡혀서 카드가 새 탭으로 열리는
  // 동시에 원래 탭에서 음악이 재생되는 사고가 났다.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = track.src;
    audio.loop = repeatOn;
    audio.load();
    // catch가 비어있는 건 에러를 숨기는 게 아니다: play() promise의 reject 사유(정책
    // 거부, 다른 재생 요청에 의한 중단)는 전부 무해하고, 진짜 재생 실패는 아래 error
    // 리스너가 토스트로 알린다.
    void audio.play().catch(() => {});
    // repeatOn은 아래 별도 effect가 반영한다 — 여기 넣으면 반복 토글마다 곡이
    // 처음부터 다시 로드된다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioRef, track.src, loadNonce]);

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
    if (audio.paused) void audio.play().catch(() => {});
    else audio.pause();
  }, [audioRef]);

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

  const setVolume = useCallback(
    (value: number) => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.volume = value;
      setVolumeState(value);
      if (value > 0) {
        audio.muted = false;
        setMuted(false);
        lastVolume.current = value;
      }
    },
    [audioRef]
  );

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.muted || audio.volume === 0) {
      audio.muted = false;
      setMuted(false);
      if (audio.volume === 0) {
        const restored = lastVolume.current || 0.5;
        audio.volume = restored;
        setVolumeState(restored);
      }
      return;
    }
    lastVolume.current = audio.volume;
    audio.muted = true;
    setMuted(true);
  }, [audioRef]);

  const value = useMemo<PlayerValue>(
    () => ({
      audioRef, track, isPlaying, currentTime, duration,
      shuffleOn, repeatOn, favOn, muted, volume,
      togglePlay, prev, next, seekTo, setVolume, toggleMute,
      toggleShuffle: () => setShuffleOn((v) => !v),
      toggleRepeat: () => setRepeatOn((v) => !v),
      toggleFav: () => setFavOn((v) => !v),
    }),
    [
      audioRef, track, isPlaying, currentTime, duration, shuffleOn, repeatOn,
      favOn, muted, volume, togglePlay, prev, next, seekTo, setVolume, toggleMute,
    ]
  );

  return <PlayerCtx.Provider value={value}>{children}</PlayerCtx.Provider>;
}
