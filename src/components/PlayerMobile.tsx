import { useState } from "react";
import { usePlayer } from "../player/PlayerContext";
import { useSeekDrag } from "../player/useSeekDrag";
import { fmt, volumeClass } from "../player/format";
import { LyricsView } from "../player/LyricsView";
import { MoreIcon, StarIcon, VolumeIcon } from "./Icons";
import { Transport } from "./Transport";
import "./PlayerMobile.css";

// 화면 아래 고정되는 압축 플레이어. 데스크탑 플레이어와 같은 상태를 구독하므로
// 어느 쪽에서 조작해도 양쪽이 함께 움직인다.
export function PlayerMobile({ onMore }: { onMore: () => void }) {
  const p = usePlayer();
  const seek = useSeekDrag();
  const [coverBroken, setCoverBroken] = useState(false);

  return (
    <div className="player-mobile" id="playerMobile">
      <div className="pm-top">
        <img
          className="pm-cover" id="coverImgM" src={p.track.cover} alt={`${p.track.title} 앨범 커버`}
          style={coverBroken ? { visibility: "hidden" } : undefined}
          onError={() => setCoverBroken(true)}
        />
        <div className="pm-meta">
          <div className="pm-title" id="trackTitleM">{p.track.title}</div>
          <div className="pm-artist" id="trackArtistM">{p.track.artist}</div>
          <LyricsView
            maskId="lyricsMaskM" trackId="lyricsTrackM"
            maskClass="pm-lyrics-mask" trackClass="pm-lyrics-track"
          />
        </div>
        <button
          className={`icon-btn${p.favOn ? " active" : ""}`} id="favBtnM"
          aria-label="즐겨찾기" type="button" onClick={p.toggleFav}
        >
          <StarIcon />
        </button>
        <button className="icon-btn more-btn" id="moreBtnM" aria-label="더보기" type="button" onClick={onMore}>
          <MoreIcon />
        </button>
      </div>
      <input type="range" className="pm-seek" id="seekM" {...seek.sliderProps} />
      <div className="pm-time-row">
        <span id="curTimeM">{fmt(seek.displayTime)}</span>
        <span id="durTimeM">-{fmt(seek.remaining)}</span>
      </div>
      <div className="pm-controls">
        <Transport idSuffix="M" />
        <div className="pm-volume">
          <button
            className={`vol-icon-btn ${volumeClass(p.volume)}`} id="muteBtnM"
            aria-label="음소거" type="button" onClick={p.toggleMute}
          >
            <VolumeIcon />
          </button>
          <input
            type="range" id="volM" min={0} max={1} step={0.01} value={p.volume}
            onChange={(e) => p.setVolume(Number(e.currentTarget.value))}
          />
        </div>
      </div>
    </div>
  );
}
