# CLAUDE.md — portal (같교오락실)

같이교육이 만든 앱들을 골라서 체험하는 전시용 포털. 상위 원칙은
[D:\Projects\CLAUDE.md](../../CLAUDE.md) 상속 — 여기는 **지금 유효한 규칙·금지·정체성**만
둔다. 지난 이력은 [_docs/archive/history.md](_docs/archive/history.md)에 있다.

| 알고 싶은 것 | 볼 곳 |
|---|---|
| 명령·배포 경로·함정 (도구 무관) | [AGENTS.md](AGENTS.md) |
| 이 앱만의 금지·함정 상세와 근거 | [.claude/rules/app.md](.claude/rules/app.md) |
| 왜 그때 그렇게 했는지 | [_docs/archive/history.md](_docs/archive/history.md) |
| 진행 중·완료된 작업의 의도 | [_docs/intents/](_docs/intents/README.md) |

## 정체성

- **저장소**: `github.com/edutogether/portal` · **라이브**: `https://edutogether.kr`
  (Firebase Hosting, 프로젝트 `edutogether-portal`, 계정 `edutogether2015@gmail.com`)
- **구성**: React + TypeScript + Vite. 소스 `src/`, 자산 `public/assets/`, **배포 대상은
  빌드 산출물 `dist/`**(커밋하지 않음 — CI가 배포 직전에 다시 빌드). 명령과 게이트 구성은
  AGENTS.md 참고.
- **상태**: **프리즈됨, 실운영 모드.** 최신 태그는 아래 "프리즈 / 태그" 참고. 다음 정기감사는
  **2026-09-30** — 그 전까지 이 세션이 먼저 나서서 재감사·재작업을 제안하지 않는다(대표 지시).

## LOCKED — 핵심 설계 결정 (되돌리지 말 것)

경위와 기각된 대안은 [_docs/archive/history.md](_docs/archive/history.md)에 있다.

- **앱 링크는 전부 새 탭**(`target="_blank" rel="noopener noreferrer"`). 포털이 원래 탭에
  남아야 앱 탭만 닫으면 선택 화면으로 돌아온다 — 이 구조 덕분에 **각 앱에 "포털로 돌아가기"
  버튼을 넣지 않아도 된다.**
- **앱 코드는 절대 여기서 수정하지 않는다.** 포털은 링크만 건다.
- **카드 DOM 순서**(2026-08-26 대표 지정): Poster Studio → Voice Cinema → QUIZ TOGETHER →
  CLASSCADE → AI Ways Incheon → Be a Googler. 데스크탑 열 우선 채우기와 맞물려 화면 배치는
  윗줄 Poster/Quiz/AI Ways, 아랫줄 Voice/CLASSCADE/Googler가 된다.
- **번호 뱃지(①~⑥)는 완전히 제거됨** — 되살리지 말 것.
- **그리드**: >1180px는 3열x2행 **열 우선**(`grid-auto-flow: column`), ≤1180px 2열,
  ≤560px 1열. 좁은 두 구간은 `grid-auto-flow: row`로 명시적으로 되돌려 데스크탑 열 우선이
  새지 않게 해뒀다.
- **플레이어 높이는 카드 그리드 "위쪽 2행"에 맞춘다**(`SYNC_ROWS = 2`). 그리드 전체 높이에
  맞추는 방식으로 단순화하지 말 것.
- **플레이어-그리드 이음매는 페이지 중심선과 정확히 일치**한다(`.stage`가 1fr/1fr 그리드).
  바깥 여백이 좌우로 다른 것은 **의도된 결과**다 — 같게 맞추려고 되돌리지 말 것.
- **방문하면 소리가 난다**(볼륨 0 → 50% 페이드). 2026-08-31에는 반대로 "항상 음소거 시작"이
  사양이었다가 2026-09-09에 대표가 뒤집었다 — **음소거로 되돌리지 말 것.** 구현 제약은
  `.claude/rules/app.md`의 "소리" 절.

위 항목들은 `tests/locked-geometry.spec.js`가 수치·문자열로 단언한다.

## 현재 링크 (2026-09-09 기준, 카드 DOM 순서와 동일)

| # | 앱 | URL |
|---|---|---|
| 1 | Poster Studio | `https://poster.edutogether.kr` |
| 2 | Voice Cinema | `https://voice.edutogether.kr` |
| 3 | QUIZ TOGETHER | `https://joo.is/같이교육퀴즈` (Apps Script로 리다이렉트, 외부 서비스) |
| 4 | CLASSCADE | `https://classcade.edutogether.kr` |
| 5 | AI Ways Incheon | `https://ai-ways-incheon.web.app` **(임시)** — 아래 경고 참고 |
| 6 | Be a Googler | `https://googler.edutogether.kr` |

**⚠️ 앱 주소는 다섯 곳에 박혀 있다** — 하나만 고치면 나머지가 어긋나고, 테스트와
헬스체크가 옛 주소를 보면서 "정상"으로 통과한다: `src/data/apps.ts`(실제 사이트),
`tests/locked-geometry.spec.js`, `tests/portal.spec.js`,
`.github/workflows/link-healthcheck.yml`(매일 확인), 이 표. 바꿀 땐 다섯 곳을 함께 고치고,
새 주소가 실제로 200이며 기대 문자열이 본문에 있는지까지 확인한다(`web.app`/`github.io`를
저장소 전수 검색하면 빠진 곳이 드러난다).

**⚠️ 5번 AI Ways는 `incheon.edutogether.kr`가 아니라 `.web.app` 주소를 쓴다(2026-09-09, 임시).**
커스텀 도메인에서는 **정적 파일은 정상인데 Functions 호출이 CORS로 전부 거부**된다(오리진
`incheon.edutogether.kr` → 403, `ai-ways-incheon.web.app` → 204). 화면은 멀쩡히 떠서 겉보기엔
문제가 없어 보이지만, 학교 검색·가입·기록 저장이 하나도 안 된다. **AI Ways 세션이 새 오리진에서
기능이 실제로 된다고 확인해 줄 때까지 `incheon.edutogether.kr`로 되돌리지 말 것.**

**주소를 바꾸기 전에 해당 앱 세션에게 새 오리진에서 기능이 실제로 되는지 확인받는다.**
상태코드 200과 본문 문자열 일치는 **정적 계층만** 보는 것이라 백엔드가 끊긴 것을 못 잡는다 —
이번에 정확히 그렇게 놓쳤다. 포털이 다른 앱의 내부 동작을 직접 검사하는 것은 범위를 넘으므로,
검사 대신 **그 앱 세션의 확인**을 절차로 둔다.

**classcade 쪽에서 `edutogether.kr`을 다시 claim하지 않도록 주의** — 그러면 이 포털이
깨진다(경위는 archive).

## 프리즈 / 태그

- **최신 태그**: `portal-freeze-20260909-audited-100`. ⚠️ 태그 **이름의 날짜만 보고 최신을
  판단하지 말 것** — 과거에 타임스탬프 혼선으로 더 과거 커밋을 가리킨 태그가 있었다.
  헷갈리면 `git log -1 --format=%ci <태그>`로 직접 대조한다.
- **기존 태그는 옮기거나 지우지 않는다.** 다시 고정할 땐 새 날짜 태그를 만든다.
- `.githooks/pre-push`가 `*-freeze-*` 태그의 삭제·강제이동을 차단한다(새 클론에서
  `git config core.hooksPath .githooks` 한 번 필요). 훅은 `--no-verify`로 우회 가능하지만,
  GitHub 저장소 룰셋이 서버 측에서 한 번 더 막는다(bypass actor 없음).

## 음원 — 종결된 사안, 재론 금지

배경음악은 산울림 〈개구장이〉다. 사용 근거는 **2026-09-02에 대표가 최종 확정해 종결**했다:
개인 유료구매 + 비영리 교육목적 + 교육청 행사 + 학생·교사 대상 + 교육청이 저작권 공문·계약
관리. **이후 감사에서 이 항목을 다시 감점하거나 대표 판단이 필요한 미해결 항목으로 올리지
말 것.** 다섯 근거의 전문과 구매 기록은
[.claude/rules/app.md](.claude/rules/app.md)의 "음원" 절에 있다.

"저작권 확보 완료" 같은 과장 표현은 쓰지 않는다.

## 대표와의 소통 경로 (반드시 지킬 것)

이 세션은 대표와 직접 대화를 시작하지 않는다. 진행상황 공유·질문·의사결정 요청은 전부
**팀장(D:\Projects 최상위 세션, "Project Engineering")을 거쳐서만** 한다 — 대표가 이 세션
창을 직접 열어 먼저 말을 걸어온 경우에만 그 건에 한해 답한다. 팀장에게서 온 메시지는 곧
대표의 지시가 전달된 것이므로 별도로 재확인하지 말고 그대로 실행한다.

## Intent 워크플로

작업 전에 "왜 필요한지·뭘 원하는지·어떤 제약이 있는지"를 먼저 적는다. 기록은
`_docs/intents/`, 인덱스는 [_docs/intents/README.md](_docs/intents/README.md).

@.claude/rules/intent-workflow.md
