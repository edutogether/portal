# CLAUDE.md — portal (같교오락실)

같이교육이 만든 앱들을 골라서 체험하는 전시용 포털. 상위 원칙은 [D:\Projects\CLAUDE.md](../../CLAUDE.md) 상속 — 여기는 이 저장소 전용 상태/규칙만 기록한다.

## 정체성
- **저장소**: `github.com/edutogether/portal` (2026-08-13 신규 생성)
- **라이브**: `https://edutogether.kr` — **2026-09-01부터 Firebase Hosting**(프로젝트 `edutogether-portal`, 계정 `edutogether2015@gmail.com`). 원래 GitHub Pages였다가 legacy→Actions 기반으로 한 번 바뀌었고(2026-08-29), 그다음 Firebase Hosting으로 완전히 이전했다(2026-09-01) — **GitHub Pages는 이제 이 저장소에서 완전히 꺼져있다**(`gh api -X DELETE repos/edutogether/portal/pages`로 비활성화, `edutogether.github.io/portal/`도 더 이상 안 뜸). `CNAME`/`_config.yml`(Jekyll 전용)도 삭제함 — 다시 만들지 말 것.
- **구성**: `index.html` 단일 정적 파일(약 1270줄, PC 데스크탑 뮤직 플레이어 + 모바일 하단 고정 플레이어 포함) + `assets/` + `firebase.json`/`.firebaserc`(Firebase Hosting 설정) + `.github/workflows/`(배포·링크 헬스체크·동기화 확인·월간 하트비트·재생 스모크 테스트·폰트 커버리지·PR 미리보기 배포). **index.html 자체엔 빌드 과정 없음**(변환/번들링 없이 그대로 배포). `deploy.yml`이 push마다 sync-check(index.html/404.html 동기화) + CSP 해시 검증(`scripts/check-csp-hash.py`) + Playwright 스모크테스트를 먼저 돌리고, **전부 통과해야만** `deploy` job이 실행돼 `FirebaseExtended/action-hosting-deploy`로 Firebase Hosting에 실제 반영된다(이전 legacy Pages 시절엔 테스트 결과와 무관하게 무조건 배포됐음). 배포 직후엔 `deploy.yml`이 실제 라이브 URL을 curl로 재확인해 예상 콘텐츠가 실제로 나오는지까지 검증한다(2026-09-01 추가). 배포 크리덴셜은 GitHub 저장소 시크릿 `FIREBASE_SERVICE_ACCOUNT_EDUTOGETHER_PORTAL`(Firebase Hosting Admin 권한 서비스 계정)로 관리되며 `firebase init hosting:github`로 생성됨. `firebase-hosting-pull-request.yml`은 PR마다 별개의 임시 미리보기 URL에만 배포하고 프로덕션엔 영향 없음. `sync-check.yml`/`player-smoke-test.yml`은 `deploy.yml`의 test job과 검사 내용이 겹쳐서 2026-09-01부터 `push`가 아니라 `pull_request`에서만 돈다(PR 사전검증 용도로만 남기고 main push 시 3중 실행되던 것 정리) — main에 직접 push할 땐 `deploy.yml`의 test job만 게이트로 작동한다.
- **보안 헤더(2026-09-01 추가)**: GitHub Pages는 커스텀 HTTP 헤더를 지원 안 해서 `X-Frame-Options` 등을 못 걸었는데, Firebase Hosting으로 옮기면서 `firebase.json`의 `hosting.headers`에 `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`를 추가함(Codyssey와 동일 패턴). CSP는 여전히 `index.html`의 `<meta>` 태그 방식을 그대로 유지 — Firebase 헤더로 중복 선언하면 정책이 겹쳐 예상 밖 충돌이 날 수 있어 일부러 안 건드림.
- **상태**: **프리즈됨** — 최신 태그 `portal-freeze-20260901-firebase`(GitHub Pages→Firebase Hosting 완전 이전 완료 시점). 그 이전 태그들은 옮기지 말고 보존: `20260813/14/14b/17/20/23/23b/24/24b/25/25b/824c/25c/25d/25e/25f/25g/25h/26/26b/26c/26d/26e/26f/26f2/26g/829/901/901-final`. `edutogether.kr`는 2026-08-25에 GitHub 조직 도메인 인증(Verified) 완료됨(이건 GitHub 조직 인증이라 Firebase 이전과 무관하게 유지됨).
- **테스트**: `tests/player.spec.js`(Playwright, 회귀 스모크 테스트 8개)가
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
- **카드 순서/번호(2026-08-26 최종 확정 — 아래 이력의 마지막 변경)**: 번호 뱃지(①~⑥)는
  **완전히 제거됨** — 되살리지 말 것. 카드 DOM 순서는 Poster Studio → Voice Cinema →
  QUIZ TOGETHER → CLASSCADE → AI Ways Incheon → Be a Googler이고, 데스크탑
  3열x2행 열 우선(column) 채우기와 맞물려 화면 배치는 **윗줄: Poster Studio /
  QUIZ TOGETHER / AI Ways Incheon, 아랫줄: Voice Cinema / CLASSCADE / Be a
  Googler**가 된다(대표 지정). `.badge` CSS 규칙도 이제 안 쓰는 코드라 함께 삭제함 —
  다시 추가하지 말 것.
- 카드 그리드 열 수·채우기 방향(2026-08-26 최종 확정 — 같은 날 세 번 바뀜, 아래
  이력 참고): **>1180px(데스크탑, 왼쪽 플레이어+오른쪽 카드 그리드) 3열x2행,
  열 우선(column) 채우기** — CSS는 `grid-template-columns: repeat(3,1fr)` +
  `grid-template-rows: repeat(2,1fr)` + `grid-auto-flow: column` 조합이고, 화면
  배치는 카드 DOM 순서에 따라 결정된다(위 카드 순서 항목 참고). ≤1180px(모바일
  하단 고정 플레이어로 전환)는 2열, ≤560px는 1열, 두 breakpoint 모두
  `grid-auto-flow: row`/`grid-template-rows: none`으로 명시적으로 되돌려 데스크탑
  column-flow가 새지 않게 해뒀다 — 임의로 되돌리지 말 것. 모바일은 이 DOM 순서
  그대로 위→아래로 2열씩(Poster/Voice, Quiz/CLASSCADE, AI Ways/Googler) 쌓인다.
  - **이력**: 카드 4개→6개가 되며 2열 그대로 뒀다가(2열/3행) 플레이어가 그 3행
    높이를 따라가 불필요하게 길어지는 사고가 나서 3열/2행(행우선)으로 바꿨다가,
    대표가 "5·6번은 눈에 덜 띄게 아래로, 2열로 되돌려달라"고 해서 2열로
    재복귀했다가, 다시 "3열/2행은 유지하되 열 우선으로 채워서 5·6번이 오른쪽
    열에 몰리게 해달라"고 해서 지금의 3열x2행 열우선 구조로 정착했고, 이후
    대표가 카드 배치 자체를 Poster Studio/QUIZ TOGETHER/AI Ways Incheon(윗줄),
    Voice Cinema/CLASSCADE/Be a Googler(아랫줄)로 재지정하며 번호 뱃지를
    전부 없애 최종 확정.
  - **플레이어 높이 동기화**: `syncPlayerHeight`(JS)가 `.player` 높이를 그리드
    전체가 아니라 **위쪽 2행(첫 `cols`×2개 카드) 높이**에만 맞춘다(`SYNC_ROWS = 2`
    상수, `cols`는 `getComputedStyle`로 실측). 지금처럼 그리드가 정확히 3열x2행
    (카드 6개 전부)일 땐 이 값이 그리드 전체 높이와 같아져서 결과적으로 딱
    맞는다(실측 561.75px 일치 확인). 그리드 전체 높이에 맞추는 방식으로
    단순화하지 말 것 — 카드 행이 늘 때마다 플레이어도 같이 길어지는 게 애초
    사고 원인이었다. 딱 1행만 기준으로 잡는 것도 시도했다가 플레이어 내부
    (가사·컨트롤)가 `overflow:hidden`에 잘리는 걸 스크린샷으로 확인해서
    기각했으니 그쪽으로도 되돌리지 말 것.
  - **플레이어-그리드 이음매를 페이지 중심선에 정확히 맞춤(2026-08-26)**:
    `.stage`를 `display:flex`+`gap`(전체 블록을 하나로 묶어 중앙정렬)에서
    `display:grid; grid-template-columns:1fr 1fr;`로 바꾸고, 왼쪽 칸엔
    플레이어를 `justify-self:end`, 오른쪽 칸엔 그리드를 `justify-self:start`로
    넣었다. 플레이어(640px)와 그리드(900px)는 폭이 서로 달라서, 예전처럼
    "전체 블록의 바깥 여백을 동일하게" 맞추면 그 안의 경계선(이음매)이
    중심선보다 왼쪽으로 치우친다 — 대표가 "왼쪽으로 쏠려 보인다"고 느낀
    정확한 원인이었다. 1fr/1fr 그리드로 두 칸의 너비를 강제로 동일하게 만들면
    두 칸의 경계는 항상 `.stage` 박스의 정확히 50% 지점에 오고, `.stage` 박스
    자체는 `body{align-items:center}`로 항상 페이지 정중앙에 오므로 이 50%
    지점이 곧 페이지 중심선과 일치한다(실측 diff=0 확인). **바깥쪽 여백은
    이제 좌우가 다른 게(오른쪽이 카드그리드 폭만큼 더 좁게 튀어나옴) 의도된
    결과다** — 좌우 여백을 다시 동일하게 맞추려고 되돌리지 말 것.

## 현재 링크 (2026-08-26 기준, 카드 DOM 순서와 동일 — 번호 뱃지는 화면에 없음)
| # | 앱 | URL |
|---|---|---|
| 1 | Poster Studio | `https://poster-studio.web.app` (2026-09-01 Firebase Hosting으로 이전 — GitHub Pages 주소는 더 이상 안 씀) |
| 2 | Voice Cinema | `https://voice-cinema.web.app` (2026-09-01 Firebase Hosting으로 이전 — GitHub Pages 주소는 더 이상 안 씀. 클립 6종 플레이스홀더 여부는 이번 이전에서 확인 안 됨, 기존 캐비어트 유지) |
| 3 | QUIZ TOGETHER | `https://joo.is/같이교육퀴즈` (Google Apps Script로 리다이렉트) |
| 4 | CLASSCADE | `https://edutogether.github.io/classcade/` |
| 5 | AI Ways Incheon | `https://edutogether.github.io/aiways-incheon/` |
| 6 | Be a Googler | `https://edutogether.github.io/googler/` |

**2026-08-31~09-01 카드 문구/썸네일 최종화**: 6개 카드 전부 "훅 한 줄 +
설명 + 이모지" 형식의 대표 확정 소개 문구로 교체 완료(그 전엔 Poster
Studio/Voice Cinema가 `InKY Poster Studio` 같은 임시 placeholder 텍스트였음).
Voice Cinema는 회색 placeholder 썸네일 대신 실제 이미지(WebP, 800px)가
들어감. Poster Studio는 아직 회색 placeholder 썸네일 상태 — 대표가 이미지
확정하는 대로 교체 예정. 느낌표/물음표 앞 띄어쓰기(예: `시간 !`)는 대표
표준 규칙이니 새 문구 추가 시에도 지킬 것.

`.github/workflows/link-healthcheck.yml`이 매일 09:00 KST에 **6개 앱 전부(+포털 자기
자신)**를 curl로 확인하고, 응답 본문에 그 앱을 나타내는 문자열이 실제로 들어있는지까지
검사한다(HTTP 200이어도 내용이 깨져있으면 실패로 잡음, 2026-08-26 정밀감사에서 5·6번
누락 발견해 추가). 실패하면 워크플로우가 빨간
X로 표시되고, 기본적으로 GitHub이 그 워크플로우 파일을 마지막으로 고친 사람에게
이메일을 보낸다(저장소 구독자 전체가 아니라 — 워치/알림 설정을 따로 켠 사람도
포함될 수 있음). 실패 시 자동 생성되는 이슈(`healthcheck-failure`/
`font-coverage-failure` 라벨)에는 2026-09-01부터 `--assignee 817beatles`가 붙어서
담당자가 명시적으로 지정된다 — 그 전엔 이메일 알림에만 의존해서, 2026-08-31에 발생한
AI Ways Incheon 일시 오류 이슈(#1, 재확인 결과 자연 해소돼 닫음)가 방치될 뻔했음.
`keepalive.yml`이 매달 빈 커밋을 넣어 60일 뒤 이 예약 작업들이
자동 비활성화되는 걸 막는다.

## 도메인 이전 이력 (2026-08-13) — 중요
`edutogether.kr`은 원래 **classcade**가 쓰던 도메인이었다. 이 포털로 이전하면서:
1. classcade repo에서 커스텀 도메인 제거 → portal repo에 부여 (`gh api`로 처리, apex DNS는 이미 GitHub를 가리키고 있어 DNS 변경 불필요했음)
2. classcade는 자산을 절대경로(`/assets/`)로 참조해 서브경로에서 깨졌으므로, **classcade 세션에서 `vite base='/classcade/'`로 재빌드**해 `edutogether.github.io/classcade/`로 이동 → 정상 동작 확인
3. **classcade가 다시 `edutogether.kr`을 claim하면 이 포털이 깨진다.** classcade 쪽에 CNAME/커스텀도메인을 다시 추가하지 않도록 주의.
   - 2026-09-01 Firebase Hosting 이전 이후: DNS(가비아) A/TXT 레코드가 이제 GitHub Pages IP가 아니라 Firebase Hosting IP(`199.36.158.100`)를 가리키므로, classcade가 GitHub Pages 쪽에서 커스텀 도메인을 다시 설정해도 예전처럼 곧바로 포털을 가로채지는 못한다(DNS 자체가 이미 Firebase를 향해 있어서). 다만 여전히 혼란을 일으킬 수 있으니 classcade 쪽에서 이 도메인을 다시 건드리지 않는 게 원칙이다.

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
- **Pretendard는 pyftsubset으로 서브셋됨(2026-08-25, 2026-08-26 재서브셋)** — 사이트가 실제 화면에 그리는 글자만 남겨서 5개 굵기 합쳐 3.94MB → 약 65~70KB. **`index.html`에 새 텍스트(새 가사·새 카드명 등)를 추가하면 서브셋에 없는 글자가 안 보일 수 있다** — `.github/workflows/font-coverage-check.yml`이 push/PR마다 자동으로 잡아주고(실패하면 이슈 자동 생성, 2026-08-26 추가), 재서브셋 방법은 `assets/fonts/pretendard/pretendard.css` 상단 주석에 있음. (첫 서브셋 시도에서 HTML/JS 주석 텍스트까지 "사용 글자"로 잘못 잡는 버그가 있었는데, 실제 필요한 글자만 정확히 뽑도록 `scripts/check-font-coverage.py`에서 고침 — 그 과정에서 원래 존재하던 원문자 `ⓒ`가 Pretendard에 아예 없는 글자라는 것도 발견해 표준 `©`로 교체함. **2026-08-26 정밀감사에서 Poster Studio/Voice Cinema 카드 추가 후 재서브셋을 빠뜨려 CI가 2연속 실패 중이던 것을 발견·재서브셋으로 해결** — 현재 188자 전부 커버.)
- **"8.14 일본군 위안부 피해자 기림의 날" 추모 문구 + 나비 배경 이미지는 2026-08-24에 완전히 제거됨**(사용자 결정). 이때 자가호스팅했던 Nanum Myeongjo 폰트(`assets/fonts/`)도 같이 삭제 — 그 폰트를 쓰던 곳이 그 문구뿐이었음. 반딧불이(`.motes`) 배경 효과는 그대로 유지.
- 데스크탑/모바일 플레이어 컨트롤은 `players` 배열(길이 2) 하나로 통합돼 있음(2026-08-24 리팩터) — 컨트롤을 새로 추가할 땐 `players.forEach`로 양쪽에 자동 적용되게 짤 것, 예전처럼 `xxxBtn`/`xxxBtnM`을 따로따로 만들지 말 것.
- **반딧불이(`.motes`) 200개(원래 100개 대비 2배, 2026-08-26 중 100→150→200 두 단계로
  증량), 경로 애니메이션 3종(`mote-drift`/`-b`/`-c`) 균등 순환, delay는 각 입자
  자신의 dur에 비례해서 뽑음** — 원래 애니메이션 1종·delay가 dur와 무관한 고정
  범위였는데, 대표가 라이브 화면에서 "같은 시기에 우르르 올라갔다 내려온다"고
  지적해서 위상을 흩어지게 바꿈. 델레이를 dur에 비례시키지 않고 고정 범위로
  뽑으면 주기가 짧은 입자들이 한 바퀴를 여러 번 돌아 결국 다시 비슷한 위상끼리
  뭉친다 — 이 방식으로 되돌리지 말 것.
- **CSP script-src가 2026-09-01부터 `'unsafe-inline'` 대신 sha256 해시로 좁혀짐** — 2026-08-25에 처음 시도했다가 로컬에서 계산한 해시값이 실제 브라우저 CSP 엔진이 요구하는 값과 안 맞아서(원인 특정 못 함) unsafe-inline으로 되돌린 적이 있다. 2026-09-01 재조사로 원인을 찾음: CSP 해시는 `<script>` 태그 바로 뒤의 첫 줄바꿈(`\n`)까지 포함한 텍스트 전체를 대상으로 계산해야 하는데, 그때 쓴 추출 방식이 그 첫 `\n`을 빠뜨리고 있었다 — 바이트 하나만 빠져도 SHA256 값 전체가 완전히 달라지므로, Python/Node.js/브라우저 crypto.subtle.digest 세 방법이 서로는 일치하면서도 실제 필요한 값과는 다른 값을 낸 것과 정확히 들어맞는다. 로컬에서 실제 CSP 위반 콘솔 에러로 재현해 원인을 확인한 뒤 고치고, Playwright 8개 전부 통과 확인 후 재적용함(구체적 근거는 `index.html` 상단 주석 참고). **`<script>` 내용을 단 한 글자라도 고치면 이 해시가 깨져서 스크립트 전체가 조용히 실행되지 않게 되므로**, `scripts/check-csp-hash.py`가 이걸 push/PR마다 자동으로 검증한다(`deploy.yml`/`sync-check.yml`에 연결됨) — 수동으로 해시를 재계산할 필요는 없고, CI가 실패하면 그 스크립트가 알려주는 실제 해시값으로 갈아끼우면 된다.

- **⚠️ `firebase.json`의 `ignore` 패턴 `**/.*`는 점(.)으로 시작하는 디렉터리 "안의, 점으로 시작하지 않는 파일"은 걸러내지 못한다** — 2026-09-01 Firebase Hosting 이전 직후 이 맹점 때문에 `.git/config`, `.git/HEAD`, `.github/workflows/deploy.yml`, `.claude/settings.json`, `.githooks/pre-push`가 그대로 라이브에 공개됐었다(Opus 독립 감사로 발견, `.git/config`엔 배포마다 갱신되는 GitHub Actions 토큰(~1시간 유효)까지 노출되고 있었음 — 워크플로우 권한이 `contents: read`뿐이고 저장소도 공개라 실질 피해는 없었지만 구조적으로 위험했음). `ignore`에 `.git/**`, `.github/**`, `.claude/**`, `.githooks/**`, `.agents/**`, `.firebase/**`를 명시적으로 추가해 해결(발견 즉시 로컬 테스트→배포→라이브 확인까지 완료). **앞으로 새 점디렉터리(`.env` 폴더 등)가 저장소에 생기면 `firebase.json`의 `ignore`에도 명시적으로 추가할 것** — `**/.*`만 믿지 말 것.

## 자산 파일
| 파일 | 용도 |
|---|---|
| `bg-main.webp` | 메인/로딩 배경 (네온 오락기 아트) |
| `bg-loading.webp` | 미사용, 보존 |
| `og-thumb.jpg` | 카카오톡 공유 배너 (1200×630) |
| `quiz.webp` / `classcade.webp` / `incheon.webp` / `googler.webp` | 카드 썸네일 4종 |

## 음원 저작권/출처 (2026-08-25 기록, 2026-08-26 사용 목적 보강)
- 곡: 산울림(Sanullim) 〈개구장이〉 (`assets/gaegujangi.m4a`, 앨범 커버 `assets/gaegujangi-cover.jpg`)
- 산울림 〈개구장이〉 음원은 지니뮤직(GENIE)에서 유료 구매한 MP3를 공식 다운로드
  경로로 취득했다. 구매내역 및 다운로드 기록을 보관한다. 해당 음원은 교사연구회
  비영리 아동 교육용 앱의 학교 수업·수업지원 목적 범위에서만 사용하며, 광고·판매·
  일반 대중 대상 상업 배포에는 사용하지 않는다.
- **이 포털 자체가 교육청 행사용**으로 만들어진 것 — 일반 대중 대상 상업 서비스가 아니라 교육청 관련 행사·교사연구회 활동 지원 목적으로 운영된다는 점도 비영리·교육목적 사용 근거에 포함된다.
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
- Firebase 프로젝트(`edutogether-portal`)는 `edutogether2015@gmail.com` 계정 소속. 로컬에서 수동 배포하려면 `firebase deploy --only hosting --account=edutogether2015@gmail.com`(다른 계정으로 로그인돼있으면 `--account` 꼭 지정할 것 — `817beatles@gmail.com` 계정엔 이 프로젝트 접근 권한 없음).
- **⚠️ Firebase 요금제는 Spark(무료) 플랜 — 절대 이유 없이 Blaze(종량제)로 올리지 말 것.** Spark는 결제 계정이 아예 연결 안 돼있어서 무한루프·악성 트래픽으로 인한 "과금 폭탄"이 구조적으로 불가능하다(한도 초과 시 청구가 아니라 서비스 일시중단으로 처리됨) — 이게 이 프로젝트의 유일한 비용 안전장치다. Blaze로 올리는 순간 이 안전장치가 사라지므로, 정말 필요해서(예: Cloud Functions 추가) 올려야 한다면 **반드시 먼저 예산 알림(budget alert)을 설정**하고 진행할 것.
- **Hosting 무료 전송 한도는 월 10GB.** 첫 방문 시 전송량 실측(2026-09-01 기준) 약 2.88MB — 그중 73%(2.09MB)가 배경음악 파일(`assets/gaegujangi.m4a`, 자동재생이 항상 걸리므로 음악을 안 듣는 방문자에게도 전곡이 다운로드됨, 의도된 설계). `firebase.json`에 `Cache-Control` 헤더가 없어 HTML/자산 전부 Firebase 기본값(1시간)으로만 캐싱된다 — 같은 행사장 재방문자도 매번 재다운로드. 대략 하루 2,000기기 방문이면 월 한도의 절반 이상을 하루 만에 소진할 수 있으니, 행사 당일 트래픽이 몰릴 걸 대비해 `Cache-Control` 정책 추가나 요금제 검토를 미리 해둘 것.
- **장애 시 롤백**: Firebase Hosting 콘솔(`https://console.firebase.google.com/project/edutogether-portal/hosting/sites`)의 "Previous releases"에서 이전 릴리스를 원클릭으로 되돌릴 수 있다(별도 재배포 불필요). git revert 후 재배포보다 빠르다.

## 대표와의 소통 경로 (2026-08-26 확정 — 반드시 지킬 것)
이 세션은 대표와 직접 대화를 시작하지 않는다. 진행상황 공유·질문·의사결정 요청은 전부 **팀장(D:\Projects 최상위 세션, "Project Engineering")을 거쳐서만** 한다 — 대표가 이 세션 창을 직접 열어서 먼저 말을 걸어온 경우에만 그 건에 한해 답한다(최상위 CLAUDE.md "조직 구조" 섹션 참고). 팀장에게서 온 메시지("Project Engineering의 메시지")는 곧 대표의 지시가 전달된 것이므로 별도로 대표에게 재확인하지 말고 그대로 실행한다.
