# AGENTS.md — 이 저장소에서 코드를 고치기 전에 읽을 것

도구(Claude Code, Codex, 그 외)와 무관하게 이 저장소를 건드리는 모든 작업자에게
해당한다. 클로드 코드 세션 전용 지침·설계 결정 이력은 [CLAUDE.md](CLAUDE.md)에 있다.

## 이 저장소가 뭔지

같이교육 앱 6종으로 링크를 거는 전시용 포털(라이브: <https://edutogether.kr>).
**React + TypeScript + Vite**로 빌드한다(2026-09-08 전환 — 그 전에는 빌드 없이
단일 `public/index.html`을 그대로 배포했다).

```
index.html          Vite 진입 HTML (메타 태그·CSP·폰트 링크)
src/                앱 소스
  components/       화면 조각. 각 컴포넌트가 자기 CSS 파일을 함께 갖는다
  player/           재생 상태(PlayerContext)와 가사 스크롤(LyricsView)
  hooks/            플레이어 높이 동기화, 파비콘
  data/             카드·플레이리스트·배경 원 데이터
  styles/base.css   전역 토큰과 문서 기본값
public/assets/      이미지·폰트·음원 (빌드가 dist/assets로 그대로 복사)
dist/               빌드 산출물 = 배포 대상 (커밋하지 않음)
```

## 배포 경로

- Firebase Hosting. 배포 대상은 `firebase.json`의 `"public": "dist"`이므로
  **빌드 산출물만 라이브에 나간다.** `src/`, `_docs/`, `scripts/`, `tests/`,
  `.github/`, `.claude/`는 저장소에만 있고 배포되지 않는다.
- `main`에 push하면 GitHub Actions(`.github/workflows/deploy.yml`)가 린트 → 빌드 →
  게이트 → 테스트를 전부 통과시킨 뒤에만 배포한다. 로컬에서 수동 배포할 일은 없다.
- `dist/`는 커밋하지 않는다 — CI가 배포 직전에 다시 빌드한다.
- **지금까지 모든 변경은 `main`에 직접 커밋됐다(병합 PR 0건).** 아래 PR 관련
  워크플로우는 설정만 돼 있고 실제로 발동한 적은 없다 — 작고 급한 변경은 계속
  `main` 직접 커밋으로 가고, **구조를 크게 바꾸는 변경은 짧은 브랜치 → PR →
  설명을 남기고 즉시 머지**한다(`D:\Projects\COMMON_STANDARDS.md` §20). PR은
  리뷰 절차가 아니라 **기록**을 남기는 용도다.
- **워크플로우 8종**(`.github/workflows/`) — 각 파일 상단 주석에 왜 그런 트리거인지
  적혀 있으니 자세한 건 거기서 읽을 것:
  - `deploy.yml` — `main` push. 위에서 말한 배포 전 전체 게이트 + 배포.
  - `firebase-hosting-pull-request.yml` — PR마다 임시 미리보기 URL에만 배포.
  - `sync-check.yml` / `player-smoke-test.yml` — 404 동일성·인라인 script 없음 /
    Playwright 전체. **PR에서만 돈다** — `main` push에서 돌리면 `deploy.yml`의
    게이트와 완전히 중복되기 때문(2026-09-01 정리).
  - `font-coverage-check.yml` — push/PR마다 Pretendard 서브셋 커버리지 확인(위
    `check-font-coverage.py`를 CI에서 돌리는 것).
  - `link-healthcheck.yml` — 매일 09:00 KST, 6개 앱 + 포털 자신 응답 확인(아래
    "현재 링크" 절 참고).
  - `budget-alert-check.yml` — 매달 1일, Blaze 예산 알림이 콘솔에 살아있는지
    사람이 재확인하도록 리마인더 이슈를 자동 생성(콘솔 설정이라 코드로 직접
    조회는 못 한다 — 아래 "운영" 절 참고).
  - `keepalive.yml` — 매달 빈 커밋. 위 예약 워크플로우들이 60일 뒤 자동
    비활성화되는 걸 막는다.

## 조직 공통 규칙 — 다른 도구·클라우드에서도 (D:\Projects 헌법 요약)

이 저장소만 받아서 일하는 도구(Codex 클라우드, Claude Code 클라우드, 다른 기기)는 `D:\Projects`의 공통
문서를 못 본다. 그래서 꼭 지켜야 할 것을 여기 옮겨 둔다. 원본은 `817beatles/projects`의 `_shared/constitution.md`.

- **사람**: 최종 결정권자는 **Bumm님**. 모든 답·문서·커밋은 **한국어**, 호칭은 늘 "Bumm님".
- **앱 이름**은 정식 이름 하나로만: CLASSCADE · Poster Studio · Be a Googler · Voice Cinema · Portal ·
  Codyssey · InKY Calculator · AI Ways Incheon (줄임말·별명·번역어 금지).
- **보고 경로**: 앱 담당은 팀장(Project Engineering)과만 주고받는다. Bumm님이 직접 말을 걸면 그 건만 직접 답한다.
- 🔴 **`main` 푸시 = 라이브 배포.** Codex·클라우드·다른 기기에서 한 작업은 `main`에 직접 푸시하지 않는다 —
  작업 가지 → PR로 내고, 합치는 것은 팀장 확인 뒤. 되돌리기는 CI로만(프리즈 태그 기준), 라이브에 직접 손대지 않는다.
- 🔴 **멈추고 Bumm님께 묻는 것**: 콘솔 전용 작업(Firebase/GCP), 돈이 드는 결정, 법률·정책 판단, 되돌리기 어렵거나
  파괴적인 행동, 영구 식별자(프로젝트·사이트 ID, 버킷 이름) 생성, 새 제품 방향.
- **한 번에 완성**: "일단", "차선책", "우회", "나중에" 금지. 제대로 못 하면 멈추고 보고. `TODO`/`FIXME`/`임시` 금지.
  검사를 느슨하게 하거나 빼서 통과시키지 않는다. 검사는 실제로 돌리고 종료 코드로 확인한다.
- **숨길 것**: 어드민 화면·기능은 저장소·배포·커밋 어디에도 드러내지 않는다. 비밀 키·토큰·인증 코드는 쓰지 않는다.
- **인계(도구·기기를 바꿔 가며 이어서 할 때)**: 단계를 끝낼 때마다 작업 가지에 올리고, PR 설명에
  "한 일 / 다음에 할 일 / 주의할 것"을 적는다. 같은 가지를 두 도구가 동시에 고치지 않는다 — 한쪽이 올린 뒤 이어받는다.
- **로컬(집 PC) 전용 작업** — 클라우드에서는 하지 않는다: 콘솔 작업(Firebase Hosting 배포 승인·`edutogether2015@gmail.com`
  계정 확인), 라이브 사이트 실측(카카오 공유 썸네일 갱신 확인 등), 배포 승인, 집 PC 모니터를 쓰는 측정. 클라우드는
  코드 수정·검사·PR까지만.

## 명령

```bash
npm ci                              # 의존성 설치
npm run dev                         # 개발 서버
npm run build                       # 타입 검사 + 빌드 (dist/index.html -> 404.html 복사 포함)
npm run lint                        # eslint (TypeScript + 훅 의존성 배열)
npm test                            # Playwright 25개 (스크린샷 비교 제외)
npm run test:visual                 # 스크린샷 비교 (로컬 전용, 아래 참고)

python3 scripts/check-inline-script.py    # 산출물에 인라인 <script>가 없는지
python3 scripts/check-font-coverage.py    # 폰트 서브셋 글자 커버리지
```

`npm test`와 두 파이썬 검사는 **빌드된 `dist/`를 대상으로** 돈다 — 먼저
`npm run build`를 실행해야 한다. 폰트 검사는 `npm test`가 만들어주는
`.cache/rendered-text.txt`를 읽으므로 테스트 뒤에 실행한다.

## ⚠️ 자주 틀리는 것 — 여기가 이 저장소의 핵심

1. **CSS는 "한 파일이 한 컴포넌트의 클래스를 전부 소유한다"는 규칙으로 나눠져 있다** —
   같은 클래스를 두 파일에서 손대지 말 것. 반응형 규칙(`@media`)도 그 클래스를 소유한
   파일 안에 둔다(경위는 `.claude/rules/app.md`의 "자주 틀리는 것").
2. **`backdrop-filter`를 쓸 때는 `-webkit-` 접두사판을 먼저, 표준 속성을 나중에 쓴다.**
   순서를 반대로 하면 빌드 미니파이어가 표준 속성을 지우고 접두사판만 남기는데,
   현대 크롬은 접두사판을 적용하지 않아서 **블러가 조용히 사라진다**(2026-09-08에
   실제로 겪음 — 스크린샷 비교로 발견).
3. **CSP는 `script-src 'self'`다.** 인라인 `<script>`를 넣으면 브라우저가 조용히
   차단한다(콘솔 CSP 에러 외엔 증상 없음). `scripts/check-inline-script.py`가
   산출물에 인라인 스크립트가 생기면 CI를 실패시킨다. 정말 필요하면 이 검사를 지우지
   말고 CSP에 해시를 함께 추가할 것.
   `style-src`의 `'unsafe-inline'`은 유지해야 한다 — 반딧불이가 입자마다 인라인 CSS
   변수를 설정한다.
4. **화면에 새 문구를 추가하면 폰트 서브셋 재생성이 필요할 수 있다.** Pretendard는
   실제 쓰는 글자만 남겨 서브셋해뒀다. `check-font-coverage.py`가 잡아주며, 검사
   대상 글자는 **렌더된 DOM**에서 뽑는다(소스를 훑으면 코드 식별자까지 사용 글자로
   잡힌다). 재서브셋 방법은 `public/assets/fonts/pretendard/pretendard.css` 상단 주석.
5. **404.html은 빌드가 자동으로 만든다**(`vite.config.ts`의 `copy-index-to-404`).
   손으로 복사하지 말 것.
6. **외부 CDN 리소스에 SRI(`integrity`)를 넣지 말 것** — 경위는 `.claude/rules/app.md`의 "폰트" 절.
7. **6개 앱의 코드는 이 저장소에서 절대 고치지 않는다.** 포털은 링크만 건다.
8. **`*-freeze-*` 태그를 삭제하거나 옮기지 말 것** — 훅·룰셋이 막는다, 새 클론은
   `git config core.hooksPath .githooks` 한 번 필요(자세한 건 `CLAUDE.md`의 "프리즈 / 태그").
9. **배포 확인을 HTTP 200만으로 하지 말 것.** 실제 HTML 내용과 자산 로드까지 확인한다.

## 화면이 바뀌지 않았는지 확인하는 법

이 앱은 화면 구성이 여러 차례 조정을 거쳐 확정된 상태라, 리팩터링으로 **보이는 결과가
바뀌면 안 된다.** 두 가지로 지킨다:

- `tests/locked-geometry.spec.js` — 카드 순서, 3열x2행 열 우선, 플레이어-그리드
  이음매가 페이지 중심선과 일치, 반딧불이 200개, 썸네일 대체 텍스트 등을 **수치·문자열로**
  단언한다. CI에서 돈다.
- `tests/visual-snapshot.spec.js` — 4개 뷰포트(1600/1180/560/390) 픽셀 비교.
  **로컬 전용**이다: Playwright 스냅샷은 파일명에 플랫폼이 들어가고 폰트 렌더링도
  OS마다 달라 리눅스 러너에선 비교가 성립하지 않는다. 기준 이미지는 gitignore 대상이라,
  큰 변경 전에 직접 만들어두고 쓴다:
  ```bash
  git stash && npm run build && npm run test:visual -- --update-snapshots  # 변경 전 기준선
  git stash pop && npm run build && npm run test:visual                    # 변경 후 비교
  ```

## 건드리면 안 되는 것

- `public/assets/bg-loading.webp`(미사용, 보존) · `prefers-reduced-motion` 미적용 ·
  반딧불이·그리드·플레이어 높이 동기화 값 — 전부 확정된 설계다(전문은 `CLAUDE.md`의
  "LOCKED" 절). 임의로 "개선"하지 말 것.
- **방문 시 소리 나는 자동재생(볼륨 50%)은 의도된 설계다** — **음소거로 되돌리지
  말 것.** 차단되면 앱 카드로 나가는 클릭을 제외한 페이지 내 조작에서 재생을
  시작한다(`tests/autoplay-blocked.spec.js`). 전문은 `.claude/rules/app.md`의
  "소리" 절, 테스트에서 소리를 끄려면 `playwright.config.js`의 `--mute-audio`.

## 자산 파일

| 파일 | 용도 |
|---|---|
| `bg-main.webp` | 메인/로딩 배경 (네온 오락기 아트) |
| `bg-loading.webp` | **미사용, 보존** — 재사용 대비 의도적으로 남겨둔 것이라 지우지 말 것 |
| `og/portal.jpg` | 포털 자신의 카카오톡·소셜 공유 배너 (1200×630) |
| `og/poster.jpg` / `voice.jpg` / `quiz.jpg` / `classcade.jpg` / `incheon.jpg` / `googler.jpg` | **원본 보관용 — 포털이 서빙하지 않는다.** 2026-09-10, 6개 앱의 og 태그가 제각각(없거나·설명 없거나·문구가 카드와 다르거나)이라 대표 지시로 포털이 기준 이미지를 만들었다. 처음엔 포털이 `https://edutogether.kr/assets/og/<이름>.jpg`로 직접 host하는 방식이었는데, **한 저장소(포털) 배포가 막히면 6개 앱의 공유 카드가 전부 같이 멈추는 구조라 그날 바로 바꿨다** — 지금은 **각 앱이 이 원본을 받아 자기 저장소에 넣고 자기 도메인에서 서빙**한다(예: Voice Cinema는 `voice.edutogether.kr/og.jpg`). 그래서 이 파일들은 `dist/`로 나가긴 하지만 어떤 페이지도 링크하지 않는 대기 상태다 — 각 앱 세션이 가져가면 지워도 된다. **JPEG인 이유는 카카오톡이 webp 썸네일을 제대로 못 쓰기 때문**(포털 자신은 처음부터 JPEG를 써서 문제가 없었다). 카드 썸네일(`*.webp`, 800×420/450)을 원본으로 1200×630에 맞춰 변환 — 비율이 다른 셋(poster-studio/voice-cinema/quiz, 16:9)은 잘라내지 않고 좌우 여백(사이트 배경색 `#0b0e1f`)을 채웠고, 나머지 셋(classcade/incheon/googler, 이미 1200×630과 같은 비율)은 그대로 확대했다.
| `quiz.webp` / `classcade.webp` / `incheon.webp` / `googler.webp` / `poster-studio.webp` / `voice-cinema.webp` | 카드 썸네일 6종 |

**`quiz.webp` 원본(1672×941, 무손실 보관)은 `_docs/archive/assets/quiz-original-1672x941.webp`에 있다(2026-09-09, 대표 지시).** 원래 파일이 다른 5개(800×420/450)보다 두 배 넘는 해상도라 표시 폭은 같은데 전송량만 컸다 — 카드 폭에 맞춰 800×450(정확히 16:9, `.thumb`의 컨테이너 비율)으로 재인코딩하고, 브라우저가 `object-fit: cover`로 원래도 미세하게 잘라내던 만큼만(1672×941→1672×940, 1px) 반영해서 구도는 그대로다(잘라낸 뒤 리샘플은 LANCZOS). 다시 필요하면 원본에서 재인코딩할 것.
| `gaegujangi.m4a` / `gaegujangi-cover.webp` | 배경음악 + 앨범 커버 |

폰트는 `public/assets/fonts/pretendard/`에 자가호스팅한다(실사용 5개 굵기만, pyftsubset으로
서브셋). SIL OFL 1.1 라이선스 고지(`OFL.txt`)를 같은 폴더에 동봉해뒀으니 지우지 말 것.

## 운영 — 배포·비용·롤백

**손으로 확인/실행하는 절차라 [_docs/ops/deploy-and-billing.md](_docs/ops/deploy-and-billing.md)로
옮겼다** — 수동 배포 명령, Blaze 예산 알림 재확인 방법, 장애 시 롤백 절차가 있다.
평소엔 몰라도 되고, 손을 대야 하는 상황에서만 읽는다.

## 그 밖에 자주 걸리는 것

- **카카오톡은 썸네일을 강하게 캐싱한다.** 공유 이미지를 바꾸면
  [카카오 디버거](https://developers.kakao.com/tool/debugger/sharing)에서
  `https://edutogether.kr`를 초기화해야 갱신된다.
- 브라우저 캐시 때문에 변경이 안 보일 수 있다 — `?v=숫자`를 붙이거나 Ctrl+F5.
- `.claude/`는 `settings.json`과 `rules/`만 커밋되고 나머지는 gitignore다(로컬 전용 도구).

자세한 배경과 이유는 [.claude/rules/app.md](.claude/rules/app.md)(금지·함정 상세)와
[_docs/archive/history.md](_docs/archive/history.md)(지난 이력)에 있다.
