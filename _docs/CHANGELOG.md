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
