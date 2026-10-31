import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles/base.css";

// iOS Safari는 touchstart 리스너가 하나도 없으면 :active를 계산하지 않는다(index.html 주석 참고).
document.body.addEventListener("touchstart", () => {}, { passive: true });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
