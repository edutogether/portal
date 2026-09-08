import { useState } from "react";
import { usePlayer } from "../player/PlayerContext";
import { useSeekDrag } from "../player/useSeekDrag";
import { fmt, volumeClass } from "../player/format";
import { LyricsView } from "../player/LyricsView";
import { MoreIcon, StarIcon, VolumeIcon } from "./Icons";
import { Transport } from "./Transport";
import "./PlayerDesktop.css";

export function PlayerDesktop({ onMore }: { onMore: () => void }) {
  const p = usePlayer();
  const seek = useSeekDrag();
  // 배포 중 커버 이미지가 빠져도 깨진 아이콘 대신 조용히 사라지게 한다.
  const [coverBroken, setCoverBroken] = useState(false);

  return (
    <div className="player">
      <div className="player-left">
        <img
          className="cover" id="coverImg" src={p.track.cover} alt={`${p.track.title} 앨범 커버`}
          style={coverBroken ? { visibility: "hidden" } : undefined}
          onError={() => setCoverBroken(true)}
        />
        <div className="track-row">
          <div className="track-meta">
            <div className="track-title" id="trackTitle">{p.track.title}</div>
            <div className="track-artist" id="trackArtist">{p.track.artist}</div>
          </div>
          <div className="track-actions">
            <button
              className={`icon-btn${p.favOn ? " active" : ""}`} id="favBtn"
              aria-label="즐겨찾기" type="button" onClick={p.toggleFav}
            >
              <StarIcon />
            </button>
            <button className="icon-btn more-btn" id="moreBtn" aria-label="더보기" type="button" onClick={onMore}>
              <MoreIcon />
            </button>
          </div>
        </div>
        <div className="transport">
          <input type="range" className="seek" id="seek" {...seek.sliderProps} />
          <div className="time-row">
            <span id="curTime">{fmt(seek.displayTime)}</span>
            <span id="durTime">-{fmt(seek.remaining)}</span>
          </div>
          <div className="controls-row">
            <Transport />
          </div>
          <div className="volume">
            <button
              className={`vol-icon-btn ${volumeClass(p.volume, p.muted)}`} id="muteBtn"
              aria-label="음소거" type="button" onClick={p.toggleMute}
            >
              <VolumeIcon />
            </button>
            <input
              type="range" id="vol" min={0} max={1} step={0.01} value={p.volume}
              onChange={(e) => p.setVolume(Number(e.currentTarget.value))}
            />
          </div>
        </div>
      </div>
      <LyricsView maskId="lyricsMask" trackId="lyricsTrack" maskClass="lyrics" trackClass="lyrics-track" />
      {/* 원본과 같은 위치(플레이어 안)에 둔다 — body 직계 자식으로 옮기면
          body의 flex 레이아웃에 빈 항목이 하나 끼어든다. */}
      <audio id="audio" ref={p.audioRef} preload="metadata" />
    </div>
  );
}
