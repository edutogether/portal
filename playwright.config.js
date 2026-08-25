// @ts-check
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 15000,
  webServer: {
    // .claude/static-server.js는 로컬 전용 도구라 .gitignore돼있어 CI엔 없다.
    // 이 스모크 테스트는 오디오 탐색(Range)이 필요 없어서(재생 시작만 확인)
    // 파이썬 내장 서버로 충분하다.
    command: 'python3 -m http.server 4319',
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
