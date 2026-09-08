export function fmt(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r < 10 ? "0" : ""}${r}`;
}

// 음량 아이콘의 막대 3개 중 몇 개를 켤지. 음소거이거나 0이면 아무것도 안 켠다.
export function volumeClass(volume: number, muted: boolean): string {
  if (muted || volume <= 0) return "muted";
  if (volume < 1 / 3) return "vol-lo";
  if (volume < 2 / 3) return "vol-mid";
  return "vol-hi";
}
