import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { copyFileSync } from "node:fs";
import { resolve } from "node:path";

// 빌드가 끝나면 index.html을 404.html로 복사한다. 예전에는 사람이 손으로 cp 하고
// CI가 "둘이 다르면 실패"로 잡는 구조였는데, 잊어버리면 없는 경로로 들어온 방문자가
// 옛날 버전을 보게 됐다. 빌드 단계로 옮기면 잊는 것 자체가 불가능해진다.
function copyIndexTo404() {
  return {
    name: "copy-index-to-404",
    closeBundle() {
      const dist = resolve(import.meta.dirname, "dist");
      copyFileSync(resolve(dist, "index.html"), resolve(dist, "404.html"));
    },
  };
}

export default defineConfig({
  plugins: [react(), copyIndexTo404()],
  // public/assets를 그대로 산출물에 복사한다(이미지·폰트·음원). 파일명을 바꾸지
  // 않으므로 기존 경로(/assets/...)와 og:image 절대 URL이 그대로 유효하다.
  publicDir: "public",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
