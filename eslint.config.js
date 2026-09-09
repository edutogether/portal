// 린트 대상은 저장소의 소스(src/**/*.ts,tsx)와 테스트·설정 파일이다.
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ["node_modules/", "dist/", "playwright-report/", "test-results/", ".claude/"],
  },
  {
    // 앱 소스 — 브라우저에서 돈다.
    files: ["src/**/*.{ts,tsx}"],
    plugins: { "react-hooks": reactHooks },
    // 훅 규칙은 이 둘만 켠다. 플러그인이 제공하는 recommended 프리셋에는 React
    // Compiler 계열 규칙이 함께 들어있는데, 이 코드에서는 정당한 사용(문맥이 들고
    // 있는 ref를 <audio ref=...>로 넘기는 것 등)까지 오류로 잡아서 쓸 수 없었다.
    // 실제로 얻고 싶은 건 의존성 배열 검사다 — 빠뜨리면 증상이 "가끔 안 갱신됨"으로
    // 나와서 눈으로 잡기 어렵다.
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: {
        document: "readonly",
        window: "readonly",
        clearInterval: "readonly",
        clearTimeout: "readonly",
        isFinite: "readonly",
        getComputedStyle: "readonly",
        ResizeObserver: "readonly",
        HTMLAudioElement: "readonly",
        HTMLDivElement: "readonly",
        HTMLInputElement: "readonly",
        HTMLElement: "readonly",
      },
    },
  },
  {
    // Playwright 설정과 테스트 — Node에서 돌지만, page.evaluate 콜백 안은
    // 브라우저 컨텍스트라 document/window를 쓴다.
    files: ["tests/**/*.js", "playwright.config.js", "vite.config.ts"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        process: "readonly",
        console: "readonly",
        __dirname: "readonly",
        setTimeout: "readonly",
        document: "readonly",
        window: "readonly",
        Event: "readonly",
        DOMException: "readonly",
        HTMLMediaElement: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        getComputedStyle: "readonly",
      },
    },
  },
];
