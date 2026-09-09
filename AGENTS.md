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

## 명령

```bash
npm ci                              # 의존성 설치
npm run dev                         # 개발 서버
npm run build                       # 타입 검사 + 빌드 (dist/index.html -> 404.html 복사 포함)
npm run lint                        # eslint (TypeScript + 훅 의존성 배열)
npm test                            # Playwright 24개 (스크린샷 비교 제외)
npm run test:visual                 # 스크린샷 비교 (로컬 전용, 아래 참고)

python3 scripts/check-inline-script.py    # 산출물에 인라인 <script>가 없는지
python3 scripts/check-font-coverage.py    # 폰트 서브셋 글자 커버리지
```

`npm test`와 두 파이썬 검사는 **빌드된 `dist/`를 대상으로** 돈다 — 먼저
`npm run build`를 실행해야 한다. 폰트 검사는 `npm test`가 만들어주는
`.cache/rendered-text.txt`를 읽으므로 테스트 뒤에 실행한다.

## ⚠️ 자주 틀리는 것 — 여기가 이 저장소의 핵심

1. **CSS는 "한 파일이 한 컴포넌트의 클래스를 전부 소유한다"는 규칙으로 나눠져 있다.**
   같은 클래스를 두 파일에서 손대지 말 것. 이 규칙이 있어야 파일이 로드되는 순서가
   결과를 바꾸지 못한다. 반응형 규칙(`@media`)도 그 클래스를 소유한 파일 안에,
   기본 규칙 바로 뒤에 둔다. (전환 전에는 "베이스 뒤에 놓여야 이긴다"에 의존하는
   구조여서 모바일 전용 규칙이 조용히 무시되는 사고가 두 번 났다.)
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
6. **외부 CDN 리소스에 SRI(`integrity`)를 넣지 말 것.** 과거에 적용했다가 라이브 폰트
   로드가 전면 차단되는 장애가 났다(그 CDN이 요청마다 다른 바이트를 준다).
7. **6개 앱의 코드는 이 저장소에서 절대 고치지 않는다.** 포털은 링크만 건다.
8. **`*-freeze-*` 태그를 삭제하거나 옮기지 말 것.** 훅과 저장소 룰셋이 둘 다 막는다.
   새 클론에서는 `git config core.hooksPath .githooks`를 한 번 실행해야 훅이 걸린다.
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

- `public/assets/bg-loading.webp` — 현재 미사용이지만 재사용 대비 의도적 보존.
- 로딩 애니메이션의 `prefers-reduced-motion` 미적용 — 명시적으로 제거한 것이라
  되살리지 않는다.
- 반딧불이 파티클 개수·애니메이션 구성, 카드 그리드 열 구성, 플레이어 높이 동기화
  로직 — 전부 여러 차례 조정을 거쳐 확정된 값이다. 임의로 "개선"하지 말 것.
- **방문 시 소리 나는 자동재생(볼륨 50%)은 의도된 설계다**(2026-09-09 대표 확정 —
  볼륨 0에서 50%까지 부드럽게 올라온다). 2026-08-31에는 반대로 "항상 음소거로 시작"이
  사양이었다가 뒤집혔으니, **음소거로 되돌리지 말 것.** `audio.muted`는 아예 쓰지
  않는다 — 소리는 `volume` 하나로만 다루고 음소거 = volume 0이다.
  - **차단 시 폴백이 있다**: 소리 있는 자동재생은 첫 방문자에게 브라우저가 막는다.
    그때는 페이지 안에서의 조작(클릭·탭·키 입력)이 있으면 그 시점에 재생을 시작하고
    0 → 50%로 올린다. 그래서 첫 방문자가 정지 상태로 방치되지 않는다.
  - ⛔ **"전역 첫 상호작용에 무조건 재생"은 금지다.** 예전에 그렇게 했다가, 앱 카드를
    탭하는 것도 첫 상호작용으로 잡혀서 **카드가 새 탭으로 열리는 동시에 방금 떠난
    원래 탭에서 음악이 터지는 사고**가 났다. 지금 리스너는 바깥으로 나가는 링크
    (`a[target="_blank"]`)에서 올라온 이벤트를 반드시 제외하고, 한 번 성공하면 즉시
    해제한다. `tests/autoplay-blocked.spec.js`가 이 예외를 회귀 테스트로 고정한다.
  - 배경과 나머지 구현 제약은 `.claude/rules/app.md`의 "소리" 절에 있다. 테스트하느라
    소리를 끄고 싶으면 제품 코드가 아니라 테스트하는 쪽에서 처리한다
    (`playwright.config.js`의 `--mute-audio`).

자세한 배경과 이유는 [CLAUDE.md](CLAUDE.md)의 "LOCKED — 핵심 설계 결정",
"알려진 / 수용된 사항" 섹션에 있다.
