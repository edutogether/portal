// @ts-check
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 15000,
  webServer: {
    // .claude/static-server.js는 로컬 전용 도구라 .gitignore돼있어 CI엔 없다.
    // 이 스모크 테스트는 오디오 탐색(Range)이 필요 없어서(재생 시작만 확인)
    // 파이썬 내장 서버로 충분하다. --bind 127.0.0.1 필수 — 안 붙이면 파이썬
    // 기본값이 0.0.0.0이라 같은 네트워크의 다른 사람이 테스트 도는 몇 분간
    // 저장소 전체(음원 원본 포함)에 접근할 수 있었음(2026-08-25 발견).
    // --directory public: 2026-09-02부터 배포 대상이 public/ 서브디렉터리로
    // 좁혀져서(firebase.json "public": "public"), 로컬 테스트 서버도 실제
    // 배포되는 범위와 동일하게 맞춘다.
    command: 'python3 -m http.server 4319 --bind 127.0.0.1 --directory public',
    url: 'http://127.0.0.1:4319',
    reuseExistingServer: !process.env.CI,
    timeout: 10000,
  },
  use: {
    baseURL: 'http://127.0.0.1:4319',
    // 절대 실제 스피커로 소리 내지 않는다 — CI/로컬 어느 쪽이든 항상 음소거.
    launchOptions: { args: ['--mute-audio'] },
  },
});
