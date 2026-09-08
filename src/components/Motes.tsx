import { useMemo } from "react";
import type { CSSProperties } from "react";
import "./Motes.css";

const MOTE_COUNT = 200;
const ANIMS = ["mote-drift", "mote-drift-b", "mote-drift-c"];

// 결정적 의사난수 — CLASSCADE에서 그대로 가져왔다. 새로고침해도 배치가 안 튀고,
// 인덱스마다 위치/속도/밝기가 확실히 갈린다.
function moteHash(seed: number): number {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function Motes() {
  const motes = useMemo(() => {
    return Array.from({ length: MOTE_COUNT }, (_, i) => {
      const dur = 5 + moteHash(i * 7 + 4) * 9;
      return {
        "--x": `${(moteHash(i * 7 + 1) * 96 + 1).toFixed(1)}%`,
        // y의 시드는 다른 값들과 일부러 다른 배수를 쓴다. x/dur/s/delay와 같은 배수(7)
        // 계열로 뽑았더니 화면 위쪽 절반에 약 65%가 몰리는 편향이 실측으로 확인됐고,
        // 여러 배수를 버킷 분포로 비교해 이 조합(11, +17)을 골랐다.
        "--y": `${(moteHash(i * 11 + 17) * 92 + 3).toFixed(1)}%`,
        "--s": 3 + Math.floor(moteHash(i * 7 + 3) * 8),
        "--dur": `${dur.toFixed(2)}s`,
        // delay를 각자의 dur에 비례해서 뽑아야 위상이 완전히 흩어진다. dur와 무관한
        // 고정 범위로 뽑으면 주기가 짧은 입자들이 한 바퀴를 여러 번 돌아 결국 비슷한
        // 위상끼리 다시 뭉친다.
        "--delay": `-${(moteHash(i * 7 + 5) * dur).toFixed(2)}s`,
        "--dx": (moteHash(i * 7 + 6) * 12 - 6).toFixed(1),
        "--amp": (8 + moteHash(i * 7 + 0) * 22).toFixed(1),
        "--anim": ANIMS[i % ANIMS.length],
      } as CSSProperties;
    });
  }, []);

  return (
    <div className="motes" id="motes" aria-hidden="true">
      {motes.map((style, i) => (
        <i key={i} style={style} />
      ))}
    </div>
  );
}
