# AGENTS.md — 이 저장소에서 코드를 고치기 전에 읽을 것

도구(Claude Code, Codex, 그 외)와 무관하게 이 저장소를 건드리는 모든 작업자에게
해당한다. 클로드 코드 세션 전용 지침·설계 결정 이력은 [CLAUDE.md](CLAUDE.md)에 있다.

## 이 저장소가 뭔지

같이교육 앱 6종으로 링크를 거는 전시용 정적 포털(라이브: <https://edutogether.kr>).
**빌드 과정이 없다** — 번들러도 트랜스파일러도 없고, `public/index.html` 한 파일이
HTML·CSS·인라인 `<script>`를 전부 담고 있으며 그대로 배포된다.

## 배포 경로

- Firebase Hosting. 배포 대상은 `firebase.json`의 `"public": "public"` 이므로
  **`public/` 안에 있는 것만 라이브에 나간다.** `_docs/`, `scripts/`, `tests/`,
  `.github/`, `.claude/`는 저장소에만 있고 배포되지 않는다.
  (예전엔 저장소 루트 전체를 배포 대상으로 두고 위험한 것만 빼는 방식이었다가
  빠뜨린 파일이 그대로 공개된 사고가 있었다. 이 구조를 되돌리지 말 것.)
- `main`에 push하면 GitHub Actions(`.github/workflows/deploy.yml`)가 아래 게이트를
  전부 통과시킨 뒤에만 배포한다. 로컬에서 수동 배포할 일은 없다.

## 명령

```bash
npm ci                              # 의존성 설치
npm run lint                        # eslint (저장소의 .js 파일 = 테스트/설정 파일)
npm test                            # Playwright 스모크 테스트 14개
python3 scripts/check-csp-hash.py   # CSP script-src 해시 검증
python3 scripts/check-font-coverage.py  # Pretendard 서브셋 글자 커버리지 검증
```

CI가 이 4가지를 배포 전 게이트로 돌린다. 로컬에서 미리 다 돌려보고 push하는 게 안전하다.

로컬 미리보기는 `node .claude/static-server.js` 후 <http://localhost:4319>
(오디오 재생 테스트에 필요한 HTTP Range 요청을 지원하는 로컬 전용 도구다.
`.claude/` 안의 이 도구들은 gitignore 대상이라 새로 클론하면 없을 수 있다).

## ⚠️ 자주 틀리는 것 — 여기가 이 저장소의 핵심

1. **`public/index.html`을 고쳤으면 반드시 `cp public/index.html public/404.html`**.
   빌드가 없어서 자동 동기화가 안 된다. 안 하면 없는 경로로 들어온 방문자가 옛날
   버전을 본다. CI가 두 파일이 다르면 실패시킨다.
2. **인라인 `<script>`를 한 글자라도 고치면 CSP 해시가 깨진다.** `index.html` 상단
   `<meta http-equiv="Content-Security-Policy">`의 `script-src 'sha256-...'` 값을
   갱신해야 하며, 안 하면 스크립트 전체가 **조용히** 실행되지 않는다(에러도 안 뜸).
   `python3 scripts/check-csp-hash.py`를 돌리면 올바른 해시를 알려주니 그 값으로
   갈아끼우면 된다.
   - Windows에서 작업한다면: 파일이 CRLF로 저장되면 로컬 해시와 브라우저가 계산하는
     해시가 달라진다(브라우저는 CRLF를 LF로 정규화한 뒤 해시한다). 해시를 믿기 전에
     줄바꿈이 LF인지 먼저 확인할 것.
3. **`index.html`에 새 텍스트(카드 문구·가사 등)를 추가하면 폰트 서브셋에 없는
   글자가 안 보일 수 있다.** Pretendard를 실제 쓰는 글자만 남겨 서브셋해뒀기
   때문이다. `scripts/check-font-coverage.py`가 잡아주고, 재서브셋 방법은
   `public/assets/fonts/pretendard/pretendard.css` 상단 주석에 있다.
4. **외부 CDN 리소스에 SRI(`integrity`)를 넣지 말 것.** 과거에 적용했다가 라이브
   폰트 로드가 전면 차단되는 장애가 났다(그 CDN이 요청마다 다른 바이트를 준다).
   지금은 폰트를 자가호스팅하므로 해당 사항이 아예 없어야 정상이다.
5. **6개 앱의 코드는 이 저장소에서 절대 고치지 않는다.** 포털은 링크만 건다. 앱 수정이
   필요하면 그 앱 저장소로 넘긴다.
6. **`*-freeze-*` 태그를 삭제하거나 옮기지 말 것.** `.githooks/pre-push`와 GitHub
   저장소 룰셋이 둘 다 막는다. 새로 고정할 땐 새 날짜 태그를 만든다.
   새 클론에서는 `git config core.hooksPath .githooks`를 한 번 실행해야 훅이 걸린다.
7. **배포 확인을 HTTP 200만으로 하지 말 것.** 실제 HTML 내용과 자산 로드까지 확인한다.
8. 브라우저 캐시 때문에 변경이 안 보일 수 있다 — `?v=숫자`를 붙이거나 Ctrl+F5.

## 건드리면 안 되는 것

- `public/assets/bg-loading.webp` — 현재 미사용이지만 재사용 대비 의도적 보존.
- 로딩 애니메이션의 `prefers-reduced-motion` 미적용 — 명시적으로 제거한 것이라
  되살리지 않는다.
- 반딧불이(`.motes`) 파티클 개수·애니메이션 구성, 카드 그리드 열 구성, 플레이어 높이
  동기화 로직 — 전부 여러 차례 조정을 거쳐 확정된 값이다. 임의로 "개선"하지 말 것.
- 방문 시 배경음악 자동재생은 의도된 설계다. 테스트하느라 소리를 끄고 싶으면 제품
  코드가 아니라 테스트하는 쪽에서 처리한다.

자세한 배경과 이유는 [CLAUDE.md](CLAUDE.md)의 "LOCKED — 핵심 설계 결정",
"알려진 / 수용된 사항" 섹션에 있다.
