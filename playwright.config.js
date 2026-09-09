// @ts-check
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 15000,
  webServer: {
    // 실제 배포되는 것과 동일한 빌드 산출물(dist/)을 서빙한다 — vite dev로 테스트하면
    // 번들링 전 코드라 배포본과 달라질 수 있다. 그래서 테스트 전에 빌드가 필요하다.
    //
    // 파이썬 내장 서버를 쓰다가 vite preview로 바꿨다(2026-09-09). 파이썬 서버는
    // HTTP Range 요청을 지원하지 않아서 오디오가 아예 탐색 불가 상태였고
    // (audio.seekable.end === 0), 그래서 "탐색이 실제로 되는가"를 검증할 수 없었다.
    // vite preview는 Range를 지원한다(실측: 206 Partial Content + Content-Range).
    //
    // --host 127.0.0.1 필수 — 기본값은 localhost 이름 해석에 맡겨져 IPv6로만 열릴 수
    // 있고, --host를 넓게 주면 같은 네트워크의 다른 사람이 테스트 도는 몇 분간
    // 저장소 산출물(음원 포함)에 접근할 수 있다(2026-08-25에 실제로 겪은 유형).
    command: 'npx vite preview --host 127.0.0.1 --port 4319 --strictPort',
    url: 'http://127.0.0.1:4319',
    reuseExistingServer: !process.env.CI,
    timeout: 10000,
  },
  use: {
    baseURL: 'http://127.0.0.1:4319',
    // 절대 실제 스피커로 소리 내지 않는다 — CI/로컬 어느 쪽이든 항상 음소거.
    launchOptions: { args: ['--mute-audio'] },
    // 실패한 테스트만 trace.zip을 남긴다(통과하면 안 남아 저장 공간을 안 먹는다).
    // 2026-09-09에 CI에서 한 번 흔들린 테스트를 재현하려 했는데 그 실행의 흔적이
    // 전혀 없어서 추측에만 의존해야 했다 — 다음에 또 흔들리면 최소한 실제 증거가
    // 남게 하려고 켠다. CI 쪽에서 test-results/를 아티팩트로 올리는 스텝은
    // deploy.yml에 있다.
    trace: 'retain-on-failure',
  },
});
