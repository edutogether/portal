# portal (같교오락실) 개별 규칙

헌법(D:\Projects\CLAUDE.md → _shared/CONVENTIONS.md)에 없는 것만.

## 앱
- 무엇: 같이교육 앱 6종으로 링크를 거는 전시용 정적 포털. 빌드 과정 없음.
- 사용자: 학생·교사. 상시 공개돼 있으나 실제 사용은 교육청 행사 중심.
- 배포: Firebase Hosting (프로젝트 `edutogether-portal`, 계정
  `edutogether2015@gmail.com` — `817beatles@gmail.com`엔 접근 권한 없음).
  Functions 없음(순수 정적이라 §4.1대로 두지 않음).

## 배포 폴더
- `firebase.json` public = `public`. `_docs/`, `.claude/`, `scripts/`, `tests/`,
  `.github/`가 여기 포함되지 않음을 확인함 (확인일 9/8)

## 데이터
- 개인정보·미성년자 데이터: **없음**. 폼·로그인·쿠키·분석 스크립트·백엔드가 전부 없고,
  CSP `connect-src 'self'`로 외부 송신 경로도 정책상 막혀 있다.
- 보관·삭제 정책: 해당 없음(수집하는 데이터 자체가 없음).
- rules: firestore.rules / storage.rules **의도적 생략** — 클라이언트가 접근하는
  Firebase 서비스가 Hosting뿐이고 Firestore·Storage를 아예 쓰지 않는다.

## 이 앱에서 절대 하면 안 되는 것
- **6개 앱의 코드를 이 저장소에서 수정하는 것.** 포털은 링크만 건다. 앱 수정이
  필요하면 그 앱 저장소 세션으로 넘긴다.
- **앱 링크를 같은 탭으로 여는 것.** 전부 `target="_blank" rel="noopener noreferrer"`
  여야 한다 — 이 구조 덕분에 각 앱에 "포털로 돌아가기" 버튼을 넣지 않아도 된다.
- **외부 리소스에 SRI(`integrity`) 적용.** 과거 실제 장애 이력이 있다.
- **`prefers-reduced-motion` 정지 로직 부활, `bg-loading.webp` 삭제, 번호 뱃지(①~⑥)
  부활** — 전부 대표가 명시적으로 없애기로 한 것.
- **음원 사용 근거를 "저작권 확보 완료" 류로 과장 표기하는 것.** 정확한 사실은
  CLAUDE.md의 음원 섹션에 있고, 그 5가지 근거는 2026-09-02에 종결 확정됐다.
- **CLASSCADE 쪽에서 `edutogether.kr` 커스텀 도메인을 다시 설정하는 것**(이 저장소
  작업은 아니지만, 그렇게 되면 포털이 깨진다 — 다른 세션에 넘길 때 주의).

## 명령
- 테스트: `npm test` (Playwright 스모크 14개)
- 린트: `npm run lint` (eslint — 대상은 저장소의 `.js` 파일. `index.html` 인라인
  스크립트는 HTML 파서 플러그인이 필요해 의도적으로 범위 밖)
- 로컬 실행: `node .claude/static-server.js` → <http://localhost:4319>
  (HTTP Range 지원 — 이게 없으면 실제 크롬에서 오디오 재생 테스트가 안 된다)
- 배포 전 게이트 수동 확인: `python3 scripts/check-csp-hash.py`,
  `python3 scripts/check-font-coverage.py`
- 에뮬레이터: 해당 없음(Firestore·Functions 미사용)

## 자주 틀리는 것
(헌법의 "이력"이 아니라, 실제로 두 번 이상 반복된 함정 목록)

- **`public/404.html` 동기화를 빠뜨림.** `public/index.html`을 고칠 때마다
  `cp public/index.html public/404.html`. 빌드가 없어 자동 동기화가 안 된다.
- **CSP 해시 갱신을 빠뜨림.** 인라인 `<script>`를 한 글자만 고쳐도 해시가 깨지고
  스크립트가 **조용히** 실행되지 않는다(콘솔 에러 외엔 티가 안 남).
- **Windows CRLF 함정.** 로컬 편집·`git revert` 후 파일이 CRLF로 바뀌면
  `check-csp-hash.py`는 통과하는데 실제 브라우저에선 깨진다(브라우저는 CRLF를 LF로
  정규화한 뒤 해시). 해시를 믿기 전에 줄바꿈을 먼저 확인하고, 필요하면
  `sed -i 's/\r$//' public/index.html public/404.html` 후 해시를 다시 계산할 것.
- **CSS 소스 순서 함정.** 같은 선택자·같은 속성이면 **파일에서 나중에 나오는 규칙이
  이긴다 — 앞엣것이 매칭되는 `@media` 안에 있어도 마찬가지다.** 모바일 전용 override를
  베이스 규칙보다 위쪽 `@media` 블록에 넣으면 조용히 무시된다. 이 저장소에서 이미 두 번
  발생했다(`.app`/`.player-mobile`, `.desc .short`). 고치기 전에 `grep -n`으로 베이스
  규칙과 override의 줄 번호를 대조하고, 필요하면 해당 베이스 규칙 **바로 뒤에** 별도
  `@media` 블록을 만들어 넣을 것.
- **폰트 서브셋 재생성을 빠뜨림.** 새 문구를 추가하면 서브셋에 없는 글자가 안 보인다.
- **지시를 넘겨짚어 문장을 새로 짓는 것.** 문구 수정 지시는 받은 그대로만 반영한다.
  "자연스럽게 줄여달라"는 말을 임의로 문장을 다시 쓰거나 `<br>`을 새로 넣어도 된다는
  뜻으로 해석했다가 전체를 되돌린 사고가 있었다(2026-09-06). 구조를 유지하라는 말이
  있으면 그 구조를 그대로 두고 최소 변경만 한다.
- 느낌표·물음표 앞 띄어쓰기(`시간 !`)는 대표 표준 표기다. 새 문구에도 지킬 것.
