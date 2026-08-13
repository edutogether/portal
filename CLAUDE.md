# CLAUDE.md — portal (같교오락실)

같이교육이 만든 앱 4개를 골라서 체험하는 전시용 포털. 상위 원칙은 [D:\Project\CLAUDE.md](../../CLAUDE.md) 상속 — 여기는 이 저장소 전용 상태/규칙만 기록한다.

## 정체성
- **저장소**: `github.com/edutogether/portal` (2026-08-13 신규 생성)
- **라이브**: `https://edutogether.kr` (GitHub Pages, `CNAME` 파일로 도메인 연결)
- **구성**: `index.html` 단일 정적 파일(약 270줄) + `assets/` 이미지 7개. **빌드 과정 없음** — npm/vite/테스트 스위트 전부 없다. 고치고 push하면 1~2분 뒤 라이브 반영.
- **상태**: **프리즈됨** — 태그 `portal-freeze-20260813`

## 핵심 설계 결정 (되돌리지 말 것)

- **앱 링크는 전부 새 탭(`target="_blank" rel="noopener noreferrer"`)으로 연다.** 새 탭으로 열면 포털이 원래 탭에 그대로 남아, 앱 탭만 닫으면 선택 화면으로 복귀한다. 이 결정 덕분에 **각 앱에 "포털로 돌아가기" 버튼을 넣을 필요가 없어졌다** — 앱 4개 코드를 한 줄도 안 건드리는 게 이 구조의 핵심 이점이다.
- **앱 코드는 절대 여기서 수정하지 않는다.** 포털은 링크만 건다. 앱 자체 수정이 필요하면 그 앱 세션으로 넘긴다.
- 카드 순서: ① QUIZ TOGETHER ② CLASSCADE ③ AI Ways Incheon ④ Be a Googler (번호 뱃지 표시)
- 전시장 기본 해상도 **1920×1080에서 4열 한 줄**, ≤1180 2열, ≤560 1열.

## 현재 링크 (2026-08-13 기준, 전부 HTTP 200 확인)
| # | 앱 | URL |
|---|---|---|
| 1 | QUIZ TOGETHER | `http://joo.is/같이교육퀴즈` (Google Apps Script로 리다이렉트) |
| 2 | CLASSCADE | `https://edutogether.github.io/classcade/` |
| 3 | AI Ways Incheon | `https://edutogether.github.io/aiways-incheon/` |
| 4 | Be a Googler | `https://edutogether.github.io/googler/` |

## 도메인 이전 이력 (2026-08-13) — 중요
`edutogether.kr`은 원래 **classcade**가 쓰던 도메인이었다. 이 포털로 이전하면서:
1. classcade repo에서 커스텀 도메인 제거 → portal repo에 부여 (`gh api`로 처리, apex DNS는 이미 GitHub를 가리키고 있어 DNS 변경 불필요했음)
2. classcade는 자산을 절대경로(`/assets/`)로 참조해 서브경로에서 깨졌으므로, **classcade 세션에서 `vite base='/classcade/'`로 재빌드**해 `edutogether.github.io/classcade/`로 이동 → 정상 동작 확인
3. **classcade가 다시 `edutogether.kr`을 claim하면 이 포털이 깨진다.** classcade 쪽에 CNAME/커스텀도메인을 다시 추가하지 않도록 주의.

## 프리즈 / 태그 보호
- 태그 `portal-freeze-20260813` — 스캔 결과 전문이 태그 메시지에 있음 (`git show portal-freeze-20260813`)
- `.githooks/pre-push`가 `*-freeze-*` 태그의 삭제·강제이동을 차단(생성은 허용). 새 클론에서는 한 번 실행 필요:
  ```
  git config core.hooksPath .githooks
  ```
- 큰 변경 후 다시 고정할 땐 기존 태그를 옮기지 말고 **새 날짜 태그**를 만든다.

## 스캔 결과 (2026-08-13, 라이브 실측 A / 94점)
- 코드 위생: TODO/FIXME/HACK 0, console 0, 하드코딩 시크릿 0
- 용량: 전체 배포 686KB (썸네일 전부 WebP, 원본 5.9MB → 205KB)
- 접근성: `lang="ko"`, viewport, img alt 4/4
- 링크: 4개 전부 200 + `target="_blank"` + `rel="noopener"`
- 공유: og 8종 + twitter 4종, 카톡 배너 1200×630
- 레이아웃: 1920×1080에서 4열, 가로 오버플로우 0

## 알려진 / 수용된 사항
- `assets/bg-loading.webp`(83KB)는 **현재 미사용이나 재사용 대비 의도적으로 보존**(사용자 결정 2026-08-13). 지우지 말 것.
- 로딩 애니메이션에 `prefers-reduced-motion` 정지 없음 — **사용자가 명시적으로 제거 요청**했다. 되살리지 말 것.
- Pretendard는 외부 CDN(jsdelivr, 버전 고정 `@v1.3.9`) 의존. CDN 장애 시 시스템 폰트로 폴백되어 화면은 정상.

## 자산 파일
| 파일 | 용도 |
|---|---|
| `bg-main.webp` | 메인/로딩 배경 (네온 오락기 아트) |
| `bg-loading.webp` | 미사용, 보존 |
| `og-thumb.jpg` | 카카오톡 공유 배너 (1200×630) |
| `quiz.webp` / `classcade.webp` / `incheon.webp` / `googler.webp` | 카드 썸네일 4종 |

## 작업 시 주의
- 카카오톡은 썸네일을 강하게 캐싱한다. 공유 이미지를 바꾸면 [카카오 디버거](https://developers.kakao.com/tool/debugger/sharing)에서 `https://edutogether.kr` 초기화해야 갱신된다.
- 브라우저 캐시 때문에 변경이 안 보일 수 있다. 확인할 땐 `?v=숫자`를 붙이거나 Ctrl+F5.
- 배포 확인은 HTTP 200만으로 판단하지 말고, 실제 HTML 내용·자산 로드까지 확인한다(상위 CLAUDE.md 공통 원칙).
