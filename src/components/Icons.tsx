// 플레이어 아이콘. 원본에서는 같은 SVG가 데스크탑용·모바일용으로 두 벌씩 마크업에
// 박혀 있었다(path 26개 중 서로 다른 건 13개뿐) — 한쪽만 고치고 짝을 놓치는 사고가
// 가능한 구조였다. 여기 한 곳에만 둔다.

const strokeProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" {...strokeProps} strokeWidth={1.8}>
      <path d="m12 3 2.7 5.9 6.3.7-4.7 4.4 1.2 6.3L12 17.5l-5.5 2.8 1.2-6.3-4.7-4.4 6.3-.7L12 3Z" />
    </svg>
  );
}

export function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <circle cx="5" cy="12" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="19" cy="12" r="1.8" />
    </svg>
  );
}

export function ShuffleIcon() {
  return (
    <svg viewBox="0 0 24 24" {...strokeProps}>
      <path d="m18 14 4 4-4 4" />
      <path d="m18 2 4 4-4 4" />
      <path d="M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22" />
      <path d="M2 6h1.973a4 4 0 0 1 3.3 1.7l5.454 8.6a4 4 0 0 0 3.3 1.7H22" />
    </svg>
  );
}

export function RepeatIcon() {
  return (
    <svg viewBox="0 0 24 24" {...strokeProps}>
      <path d="m17 2 4 4-4 4" />
      <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
      <path d="m7 22-4-4 4-4" />
      <path d="M21 13v1a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

export function PrevIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path
        d="M18.5 5.5v13a.9.9 0 0 1-1.38.76L7.6 13.02a1.15 1.15 0 0 1 0-1.94l9.52-6.34a.9.9 0 0 1 1.38.76Z"
        fill="currentColor" stroke="currentColor" strokeWidth={1} strokeLinejoin="round"
      />
      <rect x="4.3" y="4.5" width="2.4" height="15" rx="1.2" fill="currentColor" />
    </svg>
  );
}

export function NextIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path
        d="M5.5 5.5v13a.9.9 0 0 0 1.38.76l9.52-6.24a1.15 1.15 0 0 0 0-1.94L6.88 4.74A.9.9 0 0 0 5.5 5.5Z"
        fill="currentColor" stroke="currentColor" strokeWidth={1} strokeLinejoin="round"
      />
      <rect x="17.3" y="4.5" width="2.4" height="15" rx="1.2" fill="currentColor" />
    </svg>
  );
}

// hidden일 때 style="display:none"을 svg에 직접 건다 — 원본과 같은 DOM 구조다.
export function PlayIcon({ id, hidden }: { id?: string; hidden?: boolean }) {
  return (
    <svg id={id} viewBox="0 0 24 24" style={hidden ? { display: "none" } : undefined}>
      <path
        d="M8 5.14v13.72a1 1 0 0 0 1.5.87l11.5-6.86a1 1 0 0 0 0-1.74L9.5 4.27A1 1 0 0 0 8 5.14Z"
        fill="currentColor" stroke="currentColor" strokeWidth={1.1} strokeLinejoin="round"
      />
    </svg>
  );
}

export function PauseIcon({ id, hidden }: { id?: string; hidden?: boolean }) {
  return (
    <svg id={id} viewBox="0 0 24 24" style={hidden ? { display: "none" } : undefined}>
      <rect x="5.5" y="4" width="4.4" height="16" rx="1.6" fill="currentColor" />
      <rect x="14.1" y="4" width="4.4" height="16" rx="1.6" fill="currentColor" />
    </svg>
  );
}

// 막대 3개의 색은 CSS(.vol-icon-btn.vol-lo / .vol-mid / .vol-hi)가 정한다.
export function VolumeIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path className="spk-body" d="M4.5 9.2v5.6a.8.8 0 0 0 .8.8h2.9l4.6 4.53a.7.7 0 0 0 1.2-.5V4.37a.7.7 0 0 0-1.2-.5L8.2 8.4H5.3a.8.8 0 0 0-.8.8Z" />
      <path className="wave1" d="M15.4 9.3a4 4 0 0 1 0 5.4" strokeWidth={1.8} fill="none" strokeLinecap="round" />
      <path className="wave2" d="M17.3 7a7.3 7.3 0 0 1 0 10" strokeWidth={1.8} fill="none" strokeLinecap="round" />
      <path className="wave3" d="M19.2 4.7a10.6 10.6 0 0 1 0 14.6" strokeWidth={1.8} fill="none" strokeLinecap="round" />
      <path className="mute-x" d="M15.6 8.6l5 6.8M20.6 8.6l-5 6.8" strokeWidth={1.8} fill="none" strokeLinecap="round" />
    </svg>
  );
}
