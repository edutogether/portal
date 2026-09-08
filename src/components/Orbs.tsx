import { ORBS } from "../data/orbs";
import "./Orbs.css";

export function Orbs() {
  return (
    <div className="orbs" aria-hidden="true">
      {ORBS.map((orb, i) => (
        <span key={i} className={orb.className} style={orb.style} />
      ))}
    </div>
  );
}
