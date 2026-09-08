import { usePlayer } from "../player/PlayerContext";
import { NextIcon, PauseIcon, PlayIcon, PrevIcon, RepeatIcon, ShuffleIcon } from "./Icons";

// 셔플·이전·재생/일시정지·다음·반복 다섯 개. 데스크탑과 모바일이 같은 구성을 쓰므로
// 여기 한 곳에만 둔다 — 두 벌로 두면 한쪽만 고치고 짝을 놓치는 사고가 가능해진다
// (아이콘이 정확히 그 이유로 Icons.tsx로 모였는데 이 마크업만 두 벌 남아 있었다).
//
// 버튼 크기는 각 플레이어의 컨테이너 CSS가 정한다(.pm-controls .play-btn svg 등).
export function Transport({ idSuffix = "" }: { idSuffix?: string }) {
  const p = usePlayer();

  return (
    <>
      <button
        className={`skip-btn toggle-btn${p.shuffleOn ? " active" : ""}`}
        id={`shuffleBtn${idSuffix}`} aria-label="셔플" type="button" onClick={p.toggleShuffle}
      >
        <ShuffleIcon />
      </button>
      <button
        className="skip-btn" id={`prevBtn${idSuffix}`}
        aria-label="이전 곡" type="button" onClick={p.prev}
      >
        <PrevIcon />
      </button>
      <button
        className="play-btn" id={`playBtn${idSuffix}`}
        aria-label="재생/일시정지" type="button" onClick={p.togglePlay}
      >
        <PlayIcon id={`iconPlay${idSuffix}`} hidden={p.isPlaying} />
        <PauseIcon id={`iconPause${idSuffix}`} hidden={!p.isPlaying} />
      </button>
      <button
        className="skip-btn" id={`nextBtn${idSuffix}`}
        aria-label="다음 곡" type="button" onClick={p.next}
      >
        <NextIcon />
      </button>
      <button
        className={`skip-btn toggle-btn${p.repeatOn ? " active" : ""}`}
        id={`repeatBtn${idSuffix}`} aria-label="반복" type="button" onClick={p.toggleRepeat}
      >
        <RepeatIcon />
      </button>
    </>
  );
}
