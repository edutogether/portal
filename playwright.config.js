// @ts-check
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 15000,
  webServer: {
    // 실제 배포되는 것과 동일한 빌드 산출물(dist/)을 서빙한다 — vite dev로 테스트하면
    // 번들링 전 코드라 배포본과 달라질 수 있다. 그래서 테스트 전에 빌드가 필요하다.
    // 이 스모크 테스트는 오디오 탐색(Range)이 필요 없어서(재생 시작만 확인)
    // 파이썬 내장 서버로 충분하다. --bind 127.0.0.1 필수 — 안 붙이면 파이썬
    // 기본값이 0.0.0.0이라 같은 네트워크의 다른 사람이 테스트 도는 몇 분간
    // 저장소 전체(음원 원본 포함)에 접근할 수 있었음(2026-08-25 발견).
    command: 'python3 -m http.server 4319 --bind 127.0.0.1 --directory dist',
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
