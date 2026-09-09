# CHANGELOG — 같교오락실 포털

무엇이 언제 왜 바뀌었는지. 감사 이력의 사실은 현황판(`STATUS_REGISTRY.md`)이 아니라
여기다(`D:\Projects\_shared\DOC-STANDARD.md`).

**2026-09-09부터 기록한다.** 그 이전 이력은 지우지 않고 두 곳에 있다: 굵직한 결정과
경위는 [`_docs/archive/history.md`](archive/history.md), 그 시점의 스캔·감사 전문은
프리즈 태그 메시지(`git show portal-freeze-20260813` 등, `CLAUDE.md`의 "프리즈 / 태그"
참고)에 있다.

각 줄은 리포지토리 레벨 변경(배포로 이어진 커밋)만 다룬다 — 문서 정리·재개 지점 갱신
같은 §19 배경작업의 세부 커밋은 묶어서 한 줄로 남긴다.

## 2026-09-09

- **fix**: AI Ways Incheon 카드 주소를 커스텀 도메인(`incheon.edutogether.kr`)으로
  교체했다가, 배포 후 그 도메인에서 Functions 호출이 전부 CORS로 거부되는 것을 발견해
  `.web.app` 주소로 되돌렸다 — 화면은 뜨지만 학교 검색·가입·기록 저장이 전부
  안 되는 상태였다. AI Ways 세션이 오리진에서 기능이 된다고 확인해 줄 때까지
  되돌리지 않는다. CLASSCADE는 커스텀 도메인 그대로 유지(정상 동작 확인).
  (`b9d8789`, `3665644`, `1fb86ff`, `9dfd690`)
- **feat**: 방문하면 소리가 나게 뒤집었다(볼륨 0→50% 부드러운 페이드). 2026-08-31엔
  반대로 "항상 음소거 시작"이었으나 대표 지시로 재반전. 자동재생이 정책으로
  거부되면 페이지 안 조작(단, 앱 카드로 나가는 클릭은 제외)에서 재생을 시작하는
  폴백을 유지. (`1488e7b`, `c373686`)
- **test**: Playwright 테스트 서버를 파이썬 내장 서버에서 `vite preview`로 바꿨다 —
  파이썬 서버가 HTTP Range를 지원하지 않아 오디오 탐색(`currentTime` 설정) 검증이
  아예 불가능한 상태였다. (`0525676`)
- **chore**: QUIZ TOGETHER 썸네일 브리프 12개 중 최종본(16차) 하나만 남기고 정리 —
  미추적 상태였던 9개를 먼저 커밋해 되돌릴 수 있게 한 뒤 11개를 삭제.
  (`80a407c`, `4a39d0f`)
- **docs**: `CLAUDE.md`를 상시 로드 문서 역할에 맞게 226→102줄로 재구성, 옮긴
  내용은 `AGENTS.md`·`.claude/rules/app.md`·`_docs/archive/history.md`로 분산.
  intent-kit 사본(`intent-workflow.md`, `_docs/intents/README.md`)을 원본 최신본과
  동기화. `portal-freeze-20260909-audited-100` 태그. (`6cc3caf`, `82e4ed0`, `262ea60`)
- **fix**: QUIZ TOGETHER 카드 썸네일을 1672×941(원본 그대로 배포 중이던 것)에서
  800×450(16:9)로 재인코딩 — 표시 크기는 같은데 전송량만 두 배였다. 원본은
  `_docs/archive/assets/`에 무손실 보관. (`8482aa0`)
- **chore**: 대표님이 직접 만든 QUIZ TOGETHER 아이콘 원본 2개(`gati-quiz-ox.png`,
  `gati-quiz-face.png`)를 `thumbnail-briefs/quiz-together/`로 반입 — 용도(스플래시 화면
  또는 카드 썸네일 교체)는 아직 미정이라 배포 대상(`public/assets/`)에는 안 두었다.
  (`3b3f64a`)
- **fix**: 모바일 하단 플레이어가 배경(카드 썸네일)과 구분이 안 간다는 실사용
  피드백으로 배경을 더 불투명·어둡게, 위쪽에 옅은 경계선 추가, `backdrop-filter`
  블러 강화(10px→18px). "화면 아래·좌우 여백" 지적은 실측 결과 레이아웃 문제가
  아니었다(이미 뷰포트에 완전히 붙어 있었음) — 대비만 올렸다. (`dfcb3e6`)
- **feat/fix**: 가사 화면에서 지나간 줄만 살짝 밝게 표시(0.32→0.46 대 0.32).
  대표님이 보시고 "차이가 미세하다"고 하셔서, 지나간 줄을 더 밝히는 대신 앞으로
  올 줄을 어둡게 해 간격을 벌렸다(최종: 지나간 0.52 / 앞으로 올 0.26 / 지금 1.0).
  (`d84a7fd`, `39df2d4`)
- **docs/§19**: 배경작업(지시가 없을 때 README·문서를 지금 구조와 대조) 도입.
  1차 점검에서 워크플로우 8종 중 2종(`sync-check.yml`/`player-smoke-test.yml`)의
  설명이 그날 낮 `CLAUDE.md` 축약 때 키워드 유실 검사에 걸리지 않아 사라진 것을
  발견해 복구, `_docs/ops/HANDOFF.md`의 옛 경로 참조 수정. `react-typescript-migration`
  intent 상태를 실제 배포·감사 완료 사실에 맞춰 `draft`→`done`으로. CI에서 한 번
  흔들린 카드 클릭 테스트의 원인을 로더 대기 누락으로 좁혀 순서를 고치고, 재현은
  근접까지만 확인했다는 사실과 함께 실패 시 trace 아티팩트를 남기도록 함(여유
  시간은 늘리지 않음). `D:\Projects\_shared\DOC-STANDARD.md` 기준으로 파일명 정리
  (`HANDOFF.md`→`handoff.md`, 브리프 파일 한글명→영문). 이 CHANGELOG 신설도 그
  기준의 일부. (`2e821a2`, `3d088c0`, `7045aea`, `0f91307`, `eff5042`, `1e64996`,
  `68d6287`, `80ec475`, `3aaabeb`, `126503d`)
- **docs/§19**: `D:\Projects\_shared\DOC-STANDARD.md`(문서 표준) 전면 반영 — `AGENTS.md`의
  절차성 내용("운영 — 배포·비용·롤백")을 `_docs/ops/deploy-and-billing.md`로 이동.
  헌법 §8/COMMON_STANDARDS §20("문서와 기록") 반영 — 프리즈 태그 38개 중 주요
  시점 8개에 [GitHub 릴리스](https://github.com/edutogether/portal/releases)로
  설명 부착(태그 자체는 이동 없음), README.md에 "어떻게 만들어졌는가" 절 추가,
  "지금까지 모든 변경은 `main` 직접 커밋(PR 0건)"을 AGENTS.md에 명시(PR 트리거
  워크플로우 설명 자체는 정확했으나 실사용 여부가 안 적혀 오해 소지가 있었음).
  (`f16d382`, `53d8731`, `6ade65f`, `b571b38`, `60ea0de`)
- **fix/ci**: **CI에서만 Playwright 워커 1로 내림** — 근본 원인 수정이 아니라
  **비결정성 제거를 위한 환경 결정**이다. 볼륨 페이드 테스트가 CI에서 한 번
  흔들려 trace로 조사했지만(진단 스크립트 자체의 `waitForFunction(v>임계값)`
  결함으로 없는 버그를 만든 걸 발견해 정정하기도 했다) `toggleMute` 로직에서
  근본 원인은 끝내 못 찾았다. 대신 2워커 8회 부하 테스트에서 서로 무관한
  테스트 4개가 한꺼번에 흔들리는 걸 봐서, 특정 로직 결함보다 워커 경합 쪽
  설명에 가깝다고 판단 — 워커 1로 CI 시간 1분 남짓을 더 쓰고 비결정성을
  없앴다. 같은 흔들림이 다시 나오면 경합이 원인이 아니라는 새 증거이니 그때
  다시 조사한다(되돌릴 수 있는 실험). `trace: 'retain-on-failure'`는 유지.
  (`playwright.config.js` 변경 — 이 CHANGELOG 항목과 같은 커밋이라 해시 자기
  참조를 피해 파일명으로 남긴다)

## 2026-09-10

- **fix**: `link-healthcheck.yml`이 "페이지가 뜬다"만 보고 "앱이 된다"를 못 잡는
  구멍을 하나 메웠다 — AI Ways Incheon의 학교 검색 함수를 인증 없이 직접 호출해
  정확히 `401 {"code":"app_check_missing"}`이 오는지 확인하는 기능 검사를
  추가했다. 이 정확한 응답이 온다는 것은 함수가 살아 있고 배포됐고 오리진이
  허용됐고 App Check 검사까지 도달했다는 뜻이라 아무 응답이나 받는 것과 다르다
  (허용목록 판정, `COMMON_STANDARDS.md` §21-5). 계기: 2026-09-09 01:58부터
  이 검사가 계속 초록불이었는데, 그날 그 앱의 학교 검색은 실사용자 전원이
  못 쓰는 상태였다(브라우저가 App Check 토큰을 못 만드는 문제, AI Ways 쪽에서
  조사 중). 일부러 없는 함수 이름·없는 호스트로 바꿔 실제로 빨간불이 뜨는 것도
  확인했다(§21-2). Poster Studio/CLASSCADE/Be a Googler도 백엔드가 있지만 이
  저장소 밖에서 정확한 엔드포인트·기대 응답 계약을 확신 있게 알아낼 수 없어서
  지금은 AI Ways 하나만 추가했다 — 억지로 만든 검사보다 없는 게 낫다.
- **fix**: AI Ways Incheon 카드를 `.web.app`에서 정식 서브도메인
  `incheon.edutogether.kr`로 다시 교체 — 조직 전체 주소 정리(헌법 §8)의 일부.
  9/9~10 사이 두 번 되돌렸다 돌아온 이유는 도메인도 코드도 아니었다: 서버
  Functions는 내내 정상이었고, App Check가 한 번 403을 준 브라우저가 24시간
  재시도를 안 하는 클라이언트 캐싱 때문에 특정 기기에서만 안 되는 것처럼
  보였다. `ai-ways-incheon.web.app`은 대비용으로 계속 허용목록에 남는다.
  다섯 곳(`src/data/apps.ts`, `CLAUDE.md`, `tests/portal.spec.js`,
  `tests/locked-geometry.spec.js`, `.github/workflows/link-healthcheck.yml`)
  전부 갱신, 경위 전문은 `_docs/archive/history.md`.
- **feat**: 6개 앱의 카카오톡·소셜 공유 배너를 한 곳(`public/assets/og/`)에서
  만들어 host하기 시작 — 대표 지시로 각 앱의 og 태그를 Portal 기준으로 통일한다.
  카드 썸네일(`*.webp`)을 1200×630 JPEG로 변환(카카오톡이 webp 썸네일을 제대로
  못 써서 JPEG로 통일 — Portal 자신이 처음부터 되던 이유가 이것이었다). 비율이
  다른 셋(Poster Studio/Voice Cinema/QUIZ TOGETHER, 16:9)은 잘라내지 않고
  사이트 배경색으로 여백을 채웠고, 나머지 셋(CLASSCADE/AI Ways/Be a Googler,
  이미 1200×630과 같은 비율)은 그대로 확대. Portal 자신의 `og-thumb.jpg`도
  같은 폴더·체계로 옮겨 통일. 문구 표(og:title/description/image/url)는
  팀장에게 전달, 나머지 다섯 앱은 각 세션이 반영.
