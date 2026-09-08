import type { CSSProperties } from "react";

// 배경 네온 원 39개의 위치·크기·색. 원본 마크업에 인라인 style로 손으로 박혀 있던
// 것을 값 변경 없이 데이터로 옮겼다. className의 "float"가 붙은 소수만 실제로
// 움직인다 — 나머지를 정지시켜 둔 건 성능 때문이라 임의로 켜지 말 것(Orbs.css 참고).
export interface Orb {
  className: string;
  style: CSSProperties;
}

export const ORBS: Orb[] = [
  { className: "orb float", style: { width: "300px", height: "300px", top: "5%", left: "7%", background: "radial-gradient(circle,#7b5cff,transparent 70%)", animationDuration: "24s" } },
  { className: "orb float", style: { width: "240px", height: "240px", top: "11%", right: "9%", background: "radial-gradient(circle,#35b8ff,transparent 70%)", animationDuration: "20s", animationDelay: "-4s" } },
  { className: "orb", style: { width: "260px", height: "260px", top: "42%", left: "-4%", background: "radial-gradient(circle,#ff5ca8,transparent 70%)", animationDuration: "26s", animationDelay: "-8s" } },
  { className: "orb", style: { width: "220px", height: "220px", top: "52%", right: "1%", background: "radial-gradient(circle,#7b5cff,transparent 70%)", animationDuration: "23s", animationDelay: "-2s" } },
  { className: "orb", style: { width: "280px", height: "280px", bottom: "7%", left: "15%", background: "radial-gradient(circle,#35b8ff,transparent 70%)", animationDuration: "27s", animationDelay: "-6s" } },
  { className: "orb", style: { width: "240px", height: "240px", bottom: "10%", right: "17%", background: "radial-gradient(circle,#ff5ca8,transparent 70%)", animationDuration: "21s", animationDelay: "-10s" } },
  { className: "orb", style: { width: "200px", height: "200px", top: "28%", left: "45%", background: "radial-gradient(circle,#35b8ff,transparent 70%)", animationDuration: "25s", animationDelay: "-3s" } },
  { className: "orb", style: { width: "180px", height: "180px", bottom: "30%", left: "62%", background: "radial-gradient(circle,#7b5cff,transparent 70%)", animationDuration: "22s", animationDelay: "-7s" } },
  { className: "orb2 float", style: { width: "120px", height: "120px", top: "20%", left: "22%", background: "radial-gradient(circle,#7b5cff,transparent 70%)", animationDuration: "19s" } },
  { className: "orb2", style: { width: "170px", height: "170px", top: "8%", right: "28%", background: "radial-gradient(circle,#35b8ff,transparent 70%)", animationDuration: "24s", animationDelay: "-5s" } },
  { className: "orb2", style: { width: "90px", height: "90px", top: "60%", left: "30%", background: "radial-gradient(circle,#ff5ca8,transparent 70%)", animationDuration: "17s", animationDelay: "-3s" } },
  { className: "orb2", style: { width: "210px", height: "210px", bottom: "18%", left: "40%", background: "radial-gradient(circle,#7b5cff,transparent 70%)", animationDuration: "28s", animationDelay: "-9s" } },
  { className: "orb2", style: { width: "130px", height: "130px", top: "34%", right: "22%", background: "radial-gradient(circle,#35b8ff,transparent 70%)", animationDuration: "21s", animationDelay: "-6s" } },
  { className: "orb2", style: { width: "100px", height: "100px", bottom: "6%", right: "34%", background: "radial-gradient(circle,#ff5ca8,transparent 70%)", animationDuration: "18s", animationDelay: "-2s" } },
  { className: "orb2", style: { width: "240px", height: "240px", top: "14%", left: "38%", background: "radial-gradient(circle,#7b5cff,transparent 70%)", animationDuration: "26s", animationDelay: "-7s" } },
  { className: "orb2", style: { width: "110px", height: "110px", bottom: "34%", left: "8%", background: "radial-gradient(circle,#35b8ff,transparent 70%)", animationDuration: "20s", animationDelay: "-4s" } },
  { className: "orb-xl", style: { width: "640px", height: "640px", top: "-14%", left: "-12%", background: "radial-gradient(circle,#7b5cff,transparent 70%)", animationDelay: "-4s" } },
  { className: "orb-xl", style: { width: "600px", height: "600px", top: "-10%", right: "-14%", background: "radial-gradient(circle,#35b8ff,transparent 70%)", animationDelay: "-16s" } },
  { className: "orb-xl", style: { width: "680px", height: "680px", bottom: "-20%", left: "20%", background: "radial-gradient(circle,#ff5ca8,transparent 70%)", animationDelay: "-9s" } },
  { className: "orb-xl", style: { width: "560px", height: "560px", bottom: "-16%", right: "-10%", background: "radial-gradient(circle,#7b5cff,transparent 70%)", animationDelay: "-22s" } },
  { className: "orb-xl float", style: { width: "520px", height: "520px", top: "32%", left: "38%", background: "radial-gradient(circle,#35b8ff,transparent 70%)", animationDelay: "-13s" } },
  { className: "orb-md float", style: { width: "220px", height: "220px", top: "3%", left: "38%", background: "radial-gradient(circle,#7b5cff,transparent 70%)", animationDuration: "23s" } },
  { className: "orb-md", style: { width: "190px", height: "190px", top: "18%", right: "4%", background: "radial-gradient(circle,#35b8ff,transparent 70%)", animationDuration: "26s", animationDelay: "-6s" } },
  { className: "orb-md", style: { width: "250px", height: "250px", bottom: "22%", left: "6%", background: "radial-gradient(circle,#ff5ca8,transparent 70%)", animationDuration: "21s", animationDelay: "-12s" } },
  { className: "orb-md", style: { width: "200px", height: "200px", bottom: "5%", right: "30%", background: "radial-gradient(circle,#7b5cff,transparent 70%)", animationDuration: "25s", animationDelay: "-3s" } },
  { className: "orb-md", style: { width: "230px", height: "230px", top: "60%", left: "3%", background: "radial-gradient(circle,#35b8ff,transparent 70%)", animationDuration: "22s", animationDelay: "-9s" } },
  { className: "orb-sm2 float", style: { width: "80px", height: "80px", top: "15%", left: "15%", background: "radial-gradient(circle,#ff5ca8,transparent 70%)", animationDuration: "16s" } },
  { className: "orb-sm2", style: { width: "110px", height: "110px", top: "6%", right: "45%", background: "radial-gradient(circle,#7b5cff,transparent 70%)", animationDuration: "18s", animationDelay: "-5s" } },
  { className: "orb-sm2", style: { width: "70px", height: "70px", bottom: "28%", right: "12%", background: "radial-gradient(circle,#35b8ff,transparent 70%)", animationDuration: "15s", animationDelay: "-8s" } },
  { className: "orb-sm2", style: { width: "95px", height: "95px", bottom: "8%", left: "45%", background: "radial-gradient(circle,#ff5ca8,transparent 70%)", animationDuration: "17s", animationDelay: "-2s" } },
  { className: "orb-sm2", style: { width: "85px", height: "85px", top: "48%", right: "8%", background: "radial-gradient(circle,#7b5cff,transparent 70%)", animationDuration: "19s", animationDelay: "-11s" } },
  { className: "orb-md", style: { width: "340px", height: "340px", top: "36%", left: "52%", background: "radial-gradient(circle,#7b5cff,transparent 70%)", animationDuration: "24s", animationDelay: "-4s" } },
  { className: "orb-sm2", style: { width: "150px", height: "150px", top: "49%", left: "61%", background: "radial-gradient(circle,#35b8ff,transparent 70%)", animationDuration: "20s", animationDelay: "-9s" } },
  { className: "orb-md", style: { width: "340px", height: "340px", top: "36%", left: "65%", background: "radial-gradient(circle,#35b8ff,transparent 70%)", animationDuration: "23s", animationDelay: "-13s" } },
  { className: "orb-sm2", style: { width: "150px", height: "150px", top: "49%", left: "74%", background: "radial-gradient(circle,#ff5ca8,transparent 70%)", animationDuration: "21s", animationDelay: "-6s" } },
  { className: "orb-md", style: { width: "340px", height: "340px", top: "60%", left: "52%", background: "radial-gradient(circle,#ff5ca8,transparent 70%)", animationDuration: "25s", animationDelay: "-10s" } },
  { className: "orb-sm2", style: { width: "150px", height: "150px", top: "73%", left: "61%", background: "radial-gradient(circle,#7b5cff,transparent 70%)", animationDuration: "19s", animationDelay: "-3s" } },
  { className: "orb-md", style: { width: "340px", height: "340px", top: "60%", left: "65%", background: "radial-gradient(circle,#7b5cff,transparent 70%)", animationDuration: "22s", animationDelay: "-15s" } },
  { className: "orb-sm2", style: { width: "150px", height: "150px", top: "73%", left: "74%", background: "radial-gradient(circle,#35b8ff,transparent 70%)", animationDuration: "20s", animationDelay: "-7s" } },
];
