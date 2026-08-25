# CLAUDE.md — portal (같교오락실)

같이교육이 만든 앱들을 골라서 체험하는 전시용 포털. 상위 원칙은 [D:\Projects\CLAUDE.md](../../CLAUDE.md) 상속 — 여기는 이 저장소 전용 상태/규칙만 기록한다.

## 정체성
- **저장소**: `github.com/edutogether/portal` (2026-08-13 신규 생성)
- **라이브**: `https://edutogether.kr` (GitHub Pages, `CNAME` 파일로 도메인 연결)
- **구성**: `index.html` 단일 정적 파일(약 1270줄, PC 데스크탑 뮤직 플레이어 + 모바일 하단 고정 플레이어 포함) + `assets/` + `.github/workflows/`(링크 헬스체크·동기화 확인·월간 하트비트·재생 스모크 테스트). **배포 자체엔 빌드 과정 없음** — `index.html`을 고치고 push하면 1~2분 뒤 그대로 라이브 반영(변환/번들링 없음). 다만 2026-08-25부터 `package.json`/Playwright가 테스트 전용으로 추가됨(아래 "테스트" 항목) — 배포되는 건 여전히 index.html 그 자체.
- **상태**: **프리즈됨** — 최신 태그 `portal-freeze-20260826`(그 이전 태그들은 옮기지 말고 보존: `20260813/14/14b/17/20/23/23b/24/24b/25/25b/824c/25c/25d/25e/25f/25g/25h`). `edutogether.kr`는 2026-08-25에 GitHub 조직 도메인 인증(Verified) 완료됨.
- **테스트**: `tests/player.spec.js`(Playwright, 회귀 스모크 테스트 4개)가
  push/PR마다 CI에서 돈다 — index.html 자체는 여전히 빌드 없는 정적 파일이고
  package.json/playwright는 테스트 전용(배포 산출물과 무관).
- **⚠️ 태그 이름의 날짜만 보고 "이게 최신이겠지"라고 판단하지 말 것.** 과거에
  UTC/KST 타임스탬프 혼선으로 `portal-freeze-20260825`가 실제로는
  `portal-freeze-20260824c`보다 더 과거 커밋을 가리키는 일이 있었다.
  진짜 최신은 항상 이 줄(위의 "최신 태그")이 가리키는 태그다 — 헷갈리면
  `git log -1 --format=%ci <태그>`로 커밋 시각을 직접 대조할 것.

## LOCKED — 핵심 설계 결정 (되돌리지 말 것)

- **앱 링크는 전부 새 탭(`target="_blank" rel="noopener noreferrer"`)으로 연다.** 새 탭으로 열면 포털이 원래 탭에 그대로 남아, 앱 탭만 닫으면 선택 화면으로 복귀한다. 이 결정 덕분에 **각 앱에 "포털로 돌아가기" 버튼을 넣을 필요가 없어졌다** — 앱 4개 코드를 한 줄도 안 건드리는 게 이 구조의 핵심 이점이다.
- **앱 코드는 절대 여기서 수정하지 않는다.** 포털은 링크만 건다. 앱 자체 수정이 필요하면 그 앱 세션으로 넘긴다.
- 카드 순서: ① QUIZ TOGETHER ② CLASSCADE ③ AI Ways Incheon ④ Be a Googler ⑤ Poster Studio ⑥ Voice Cinema (번호 뱃지 표시)
- 전시장 기본 해상도 **1920×1080에서 4열 한 줄**, ≤1180 2열, ≤560 1열.

## 현재 링크 (2026-08-26 기준)
| # | 앱 | URL |
|---|---|---|
| 1 | QUIZ TOGETHER | `https://joo.is/같이교육퀴즈` (Google Apps Script로 리다이렉트) |
| 2 | CLASSCADE | `https://edutogether.github.io/classcade/` |
| 3 | AI Ways Incheon | `https://edutogether.github.io/aiways-incheon/` |
| 4 | Be a Googler | `https://edutogether.github.io/googler/` |
| 5 | Poster Studio | `https://github.com/edutogether/poster-studio` (아직 배포된 웹사이트 없음 — 저장소 페이지로 임시 연결, 배포되면 교체할 것) |
| 6 | Voice Cinema | `https://github.com/edutogether/voice-cinema` (아직 배포된 웹사이트 없음 — 저장소 페이지로 임시 연결, 배포되면 교체할 것) |

`.github/workflows/link-healthcheck.yml`이 매일 09:00 KST에 **1~4번(+포털 자기 자신)만**
curl로 확인하고, 응답 본문에 그 앱을 나타내는 문자열이 실제로 들어있는지까지 검사한다
(HTTP 200이어도 내용이 깨져있으면 실패로 잡음). **5·6번(Poster Studio/Voice Cinema)은
아직 이 헬스체크 대상이 아니다** — 저장소 페이지 임시 링크라 검사 의미가 약하기 때문.
실제 사이트가 배포되면 이 워크플로우에도 추가할 것. 실패하면 워크플로우가 빨간
X로 표시되고, 기본적으로 GitHub이 그 워크플로우 파일을 마지막으로 고친 사람에게
이메일을 보낸다(저장소 구독자 전체가 아니라 — 워치/알림 설정을 따로 켠 사람도
포함될 수 있음). `keepalive.yml`이 매달 빈 커밋을 넣어 60일 뒤 이 예약 작업들이
자동 비활성화되는 걸 막는다.

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
- **Pretendard는 2026-08-25부터 자가호스팅**(`assets/fonts/pretendard/`, 실사용 5개 굵기만) — 더 이상 jsdelivr CDN에 의존하지 않는다. SIL OFL 1.1 라이선스 고지(`OFL.txt`)를 같은 폴더에 동봉해뒀으니 지우지 말 것. **SRI(integrity) 재시도 금지** — 2026-08-23에 jsdelivr가 이 URL에 요청마다 바이트가 다른 응답을 줘서 SRI 해시를 넣자마자 프로덕션 폰트 로드가 전면 차단되는 사고가 났음(즉시 되돌림). Google Fonts도 UA별 응답이 달라 SRI 적용 불가 — 이 사이트는 Google Fonts를 아예 안 쓴다(아래 참고).
- **Pretendard는 pyftsubset으로 서브셋됨(2026-08-25)** — 사이트가 실제 화면에 그리는 글자만 남겨서 5개 굵기 합쳐 3.94MB → 약 65KB. **`index.html`에 새 한글 텍스트(특히 새 가사)를 추가하면 서브셋에 없는 글자가 안 보일 수 있다** — `.github/workflows/font-coverage-check.yml`이 push/PR마다 자동으로 잡아주고, 재서브셋 방법은 `assets/fonts/pretendard/pretendard.css` 상단 주석에 있음. (첫 서브셋 시도에서 HTML/JS 주석 텍스트까지 "사용 글자"로 잘못 잡는 버그가 있었는데, 실제 필요한 177자만 정확히 뽑도록 `scripts/check-font-coverage.py`에서 고침 — 그 과정에서 원래 존재하던 원문자 `ⓒ`가 Pretendard에 아예 없는 글자라는 것도 발견해 표준 `©`로 교체함.)
- **"8.14 일본군 위안부 피해자 기림의 날" 추모 문구 + 나비 배경 이미지는 2026-08-24에 완전히 제거됨**(사용자 결정). 이때 자가호스팅했던 Nanum Myeongjo 폰트(`assets/fonts/`)도 같이 삭제 — 그 폰트를 쓰던 곳이 그 문구뿐이었음. 반딧불이(`.motes`) 배경 효과는 그대로 유지.
- 데스크탑/모바일 플레이어 컨트롤은 `players` 배열(길이 2) 하나로 통합돼 있음(2026-08-24 리팩터) — 컨트롤을 새로 추가할 땐 `players.forEach`로 양쪽에 자동 적용되게 짤 것, 예전처럼 `xxxBtn`/`xxxBtnM`을 따로따로 만들지 말 것.
- **CSP script-src를 sha256 해시로 좁히는 것 재시도 금지** — 2026-08-25에 시도했다가 원인불명 불일치로 되돌림. Python/Node.js/브라우저 자체 crypto.subtle.digest 세 가지 독립된 방법이 전부 같은 해시값을 계산했는데, 실제 브라우저의 CSP 집행 엔진이 요구하는 값은 달랐음(왜 다른지 특정 못 함). script-src는 이미 `'self'`로 제한돼있어 실제 악용 경로가 없는 상태라 이득도 없었음 — SRI 사고와 같은 유형의 위험이니 다시 시도하지 말 것.

## 자산 파일
| 파일 | 용도 |
|---|---|
| `bg-main.webp` | 메인/로딩 배경 (네온 오락기 아트) |
| `bg-loading.webp` | 미사용, 보존 |
| `og-thumb.jpg` | 카카오톡 공유 배너 (1200×630) |
| `quiz.webp` / `classcade.webp` / `incheon.webp` / `googler.webp` | 카드 썸네일 4종 |

## 음원 저작권/출처 (2026-08-25 기록)
- 곡: 산울림(Sanullim) 〈개구장이〉 (`assets/gaegujangi.m4a`, 앨범 커버 `assets/gaegujangi-cover.jpg`)
- 산울림 〈개구장이〉 음원은 지니뮤직(GENIE)에서 유료 구매한 MP3를 공식 다운로드
  경로로 취득했다. 구매내역 및 다운로드 기록을 보관한다. 해당 음원은 교사연구회
  비영리 아동 교육용 앱의 학교 수업·수업지원 목적 범위에서만 사용하며, 광고·판매·
  일반 대중 대상 상업 배포에는 사용하지 않는다.
- 구매 확인: 지니뮤직 `MP3 다운로드` 구매내역에 산울림 〈개구장이〉가 표시되어
  있으며, 재다운로드 유효기간은 2027-08-25로 확인됨(구매내역 화면 캡처 보관).
- **"저작권 확보 완료" / "제작권 확보 완료" / "상업적 사용권 확보" 같은 과장된
  표현은 쓰지 말 것** — 정확한 사실은 위와 같다: 개인 유료 구매 MP3를 비영리
  교육 목적 범위에서 사용 중이라는 것이며, 별도의 상업적 라이선스나 공연권을
  확보한 것이 아니다.

## 작업 시 주의
- `404.html`은 `index.html`을 그대로 복사한 파일이다(빌드 과정이 없어서 자동 동기화가
  안 됨). **`index.html`을 고칠 때마다 `cp index.html 404.html`을 잊지 말 것** —
  안 하면 존재하지 않는 경로로 들어온 방문자가 옛날 버전을 보게 된다.
- `.claude/settings.json`(2026-08-26부터 다른 5개 앱과 동일하게 git 추적 대상 — 이전엔
  `.claude/` 전체가 `.gitignore` 처리돼 안 올라가고 있었음)은 커밋 대상이지만,
  `.claude/` 안의 나머지(로컬 정적 서버 `static-server.js` + `launch.json`)는 여전히
  `.gitignore`(`.claude/*` + `!.claude/settings.json`)로 제외된다. HTTP Range 요청을
  지원해야 오디오 재생을 로컬에서 테스트할 수 있어서 직접 만든 도구. `node
  .claude/static-server.js` 실행 후 `http://localhost:4319`. 127.0.0.1에만
  바인딩되고 상위 경로 접근은 차단된다.
- 카카오톡은 썸네일을 강하게 캐싱한다. 공유 이미지를 바꾸면 [카카오 디버거](https://developers.kakao.com/tool/debugger/sharing)에서 `https://edutogether.kr` 초기화해야 갱신된다.
- 브라우저 캐시 때문에 변경이 안 보일 수 있다. 확인할 땐 `?v=숫자`를 붙이거나 Ctrl+F5.
- 배포 확인은 HTTP 200만으로 판단하지 말고, 실제 HTML 내용·자산 로드까지 확인한다(상위 CLAUDE.md 공통 원칙).
