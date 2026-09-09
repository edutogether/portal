# portal 지난 이력

`CLAUDE.md`는 **매 세션이 항상 읽는 문서**라 "지금도 매번 알아야 하는 것"만 둔다
(`_shared/CONVENTIONS.md` §10). 여기는 그 기준에서 빠진 **지난 이력**을 옮겨온 곳이다 —
지금 행동을 바꾸지는 않지만, "왜 그때 그렇게 했는지"를 나중에 되짚을 때 필요한 기록.

지금도 유효한 **규칙**은 여기가 아니라 `CLAUDE.md`(정체성·LOCKED·링크),
`AGENTS.md`(명령·운영), `.claude/rules/app.md`(금지·함정)에 있다.

---

## 호스팅 이전 경위 (2026-08-13 → 09-01)

- 원래 GitHub Pages(legacy) → 2026-08-29 Actions 기반으로 전환 → 2026-09-01 Firebase
  Hosting으로 완전 이전.
- GitHub Pages는 이제 이 저장소에서 완전히 꺼져 있다(`gh api -X DELETE
  repos/edutogether/portal/pages`로 비활성화, `edutogether.github.io/portal/`도 더 이상
  뜨지 않음). `CNAME`/`_config.yml`(Jekyll 전용)도 삭제했다 — **다시 만들지 말 것**.
- 보안 헤더는 이 이전 덕분에 붙었다: GitHub Pages는 커스텀 HTTP 헤더를 지원하지 않아
  `X-Frame-Options` 등을 걸 수 없었는데, Firebase로 옮기면서 `firebase.json`의
  `hosting.headers`에 `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy`, `Permissions-Policy`를 추가했다(Codyssey와 동일 패턴). CSP는
  `index.html`의 `<meta>` 방식을 유지했다 — Firebase 헤더로 중복 선언하면 정책이 겹쳐
  예상 밖 충돌이 날 수 있어 일부러 건드리지 않았다.

## 도메인 이전 이력 (2026-08-13)

`edutogether.kr`은 원래 **classcade**가 쓰던 도메인이었다. 이 포털로 이전하면서:

1. classcade repo에서 커스텀 도메인 제거 → portal repo에 부여(`gh api`로 처리, apex
   DNS가 이미 GitHub를 가리키고 있어 DNS 변경은 불필요했다).
2. classcade는 자산을 절대경로(`/assets/`)로 참조해 서브경로에서 깨졌으므로,
   classcade 세션에서 `vite base='/classcade/'`로 재빌드해
   `edutogether.github.io/classcade/`로 이동 → 정상 동작 확인.
3. 2026-09-01 Firebase 이전 이후로는 DNS(가비아) A/TXT 레코드가 GitHub Pages IP가 아니라
   Firebase Hosting IP(`199.36.158.100`)를 가리키므로, classcade가 GitHub Pages 쪽에서
   커스텀 도메인을 다시 설정해도 예전처럼 곧바로 포털을 가로채지는 못한다.

> 지금도 유효한 규칙: **classcade 쪽에서 `edutogether.kr`을 다시 건드리지 않는다.**
> (CLAUDE.md에 한 줄로 남겨두었다. 2026-09-09에 classcade가 `classcade.edutogether.kr`로
> 이전을 마쳐 이 위험 자체가 줄었다.)

## 카드 그리드 배치가 정해진 경위 (2026-08-26, 하루에 세 번 바뀜)

카드가 4개→6개가 되며 2열을 그대로 뒀다가(2열/3행) 플레이어가 그 3행 높이를 따라가
불필요하게 길어지는 사고가 났다 → 3열/2행(행 우선)으로 변경 → 대표가 "5·6번은 눈에 덜
띄게 아래로, 2열로 되돌려달라"고 해서 2열로 재복귀 → 다시 "3열/2행은 유지하되 열 우선으로
채워서 5·6번이 오른쪽 열에 몰리게 해달라"고 해서 지금의 **3열x2행 열 우선** 구조로 정착.
이후 대표가 카드 배치를 윗줄 Poster Studio/QUIZ TOGETHER/AI Ways Incheon, 아랫줄 Voice
Cinema/CLASSCADE/Be a Googler로 재지정하며 번호 뱃지를 전부 없애 최종 확정했다.

**플레이어 높이 동기화**: 그리드 전체 높이에 맞추면 카드 행이 늘 때마다 플레이어도 같이
길어진다(그게 애초 사고 원인). 딱 1행만 기준으로 잡는 것도 시도했다가 플레이어 내부
(가사·컨트롤)가 `overflow:hidden`에 잘리는 걸 스크린샷으로 확인해 기각했다. 그래서 위쪽
2행 기준이다.

**플레이어-그리드 이음매를 중심선에 맞춘 경위**: `.stage`를 `display:flex`+`gap`으로 두고
전체 블록을 중앙정렬하면, 플레이어(640px)와 그리드(900px) 폭이 서로 달라서 둘 사이
경계선이 중심선보다 왼쪽으로 치우친다 — 대표가 "왼쪽으로 쏠려 보인다"고 느낀 정확한
원인이었다. 1fr/1fr 그리드로 두 칸 너비를 강제로 같게 만들면 경계가 항상 `.stage` 박스의
정확히 50% 지점에 오고, `.stage`는 `body{align-items:center}`로 페이지 정중앙에 있으므로
그 지점이 곧 페이지 중심선이 된다(실측 diff=0).

## 첫 스캔 결과 (2026-08-13, 라이브 실측 A / 94점)

- 코드 위생: TODO/FIXME/HACK 0, console 0, 하드코딩 시크릿 0
- 용량: 전체 배포 686KB (썸네일 전부 WebP, 원본 5.9MB → 205KB)
- 접근성: `lang="ko"`, viewport, img alt 4/4
- 링크: 4개 전부 200 + `target="_blank"` + `rel="noopener"`
- 공유: og 8종 + twitter 4종, 카톡 배너 1200×630
- 레이아웃: 1920×1080에서 4열, 가로 오버플로우 0

## 카드 문구·썸네일 최종화 (2026-08-31 ~ 09-02)

6개 카드 전부 "훅 한 줄 + 설명 + 이모지" 형식의 대표 확정 문구로 교체(그 전엔 Poster
Studio/Voice Cinema가 `InKY Poster Studio` 같은 임시 placeholder 텍스트였다). Voice
Cinema는 회색 placeholder 대신 실제 이미지(WebP, 800px)로, Poster Studio도 2026-09-02부터
실제 썸네일로 교체했다. QUIZ TOGETHER 썸네일은 2026-09-08에 O/X 일러스트로 재교체.

## 로딩 화면 버그 (2026-09-03, 실사용 중 보고)

로딩 화면이 사라지는 순간 뒤로 메인 화면이 그림자처럼 잠깐 비쳐 보이는 문제. 원인 둘:

1. `#loader` 배경이 반투명 그라디언트(최대 알파 .62)+이미지뿐이라 로더 자신이 완전히
   불투명하지 않았다 → 마지막 레이어에 불투명 단색(`#0b0e1f`) 추가로 해결.
2. 로더를 숨기는 로직이 진행 바 애니메이션(2.1s)만 끝나면 실제 로딩 상태와 무관하게
   실행됐다 → "최소 연출시간"과 "실제 준비 완료" 둘 다 만족해야 숨기도록 변경.

커밋 `6a194a8`, 회귀 테스트는 `tests/portal.spec.js`(`971ee95`).

2026-09-08 리액트 전환에서 판정 방식이 한 번 더 바뀌었다: `window`의 `load`는 HTML 파싱
시점에 발견된 자산만 기다려서, 화면을 자바스크립트로 그리면 그 뒤에 시작되는 이미지 요청을
기다려주지 않는다(그대로 옮겼더니 위 회귀 테스트가 바로 잡아냈다). 지금은 프록시 이벤트
대신 실제로 필요한 것을 직접 기다린다 — 웹폰트, 화면의 모든 `<img>`, 로더 자신의 배경
이미지(`src/components/Loader.tsx`). 8초 안전장치는 유지.

## 배포 대상이 좁혀진 경위 (2026-09-01 사고 → 09-02 해결)

`firebase.json`의 `ignore` 패턴 `**/.*`는 **점으로 시작하는 디렉터리 "안의, 점으로
시작하지 않는 파일"을 걸러내지 못한다.** 2026-09-01 Firebase 이전 직후 이 맹점 때문에
`.git/config`, `.git/HEAD`, `.github/workflows/deploy.yml`, `.claude/settings.json`,
`.githooks/pre-push`가 그대로 라이브에 공개됐었다(Opus 독립 감사로 발견). `.git/config`엔
배포마다 갱신되는 GitHub Actions 토큰(약 1시간 유효)까지 노출되고 있었다 — 워크플로우
권한이 `contents: read`뿐이고 저장소도 공개라 실질 피해는 없었지만 구조적으로 위험했다.

처음엔 `ignore`에 `.git/**` 등을 명시적으로 추가하는 임시 패치로 막았다가, 근본 원인
(저장소 루트 전체를 배포 대상으로 두는 **부정목록 구조 자체**)을 없애기 위해 2026-09-02에
배포 대상을 `public/` 서브디렉터리로 좁혔다. 2026-09-08 리액트 전환에서는 다시 빌드
산출물 `dist/`로 좁혀졌다. 이제 그 밖은 무엇이든 애초에 배포 스캔 대상이 아니라 이 부류의
사고가 구조적으로 재발 불가능하다.

## 링크 헬스체크가 지금 형태가 된 경위

`.github/workflows/link-healthcheck.yml`이 매일 09:00 KST에 6개 앱과 포털 자신을 curl로
확인하고, **응답 본문에 그 앱을 나타내는 문자열이 실제로 들어있는지까지** 검사한다(HTTP
200이어도 내용이 깨져 있으면 실패로 잡는다). 본문 검사는 2026-08-26 정밀감사에서 5·6번
앱이 검사 목록에서 누락된 것을 발견해 추가했다.

실패 시 자동 생성되는 이슈(`healthcheck-failure`/`font-coverage-failure` 라벨)에는
2026-09-01부터 `--assignee 817beatles`가 붙는다 — 그 전엔 이메일 알림에만 의존해서,
2026-08-31에 발생한 AI Ways Incheon 일시 오류 이슈(#1, 재확인 결과 자연 해소돼 닫음)가
방치될 뻔했다. `keepalive.yml`이 매달 빈 커밋을 넣어 60일 뒤 예약 작업이 자동
비활성화되는 것을 막는다.

## 지금은 없는 것

- **"8.14 일본군 위안부 피해자 기림의 날" 추모 문구 + 나비 배경 이미지**는 2026-08-24에
  완전히 제거됐다(대표 결정). 이때 자가호스팅했던 Nanum Myeongjo 폰트도 같이 삭제 — 그
  폰트를 쓰던 곳이 그 문구뿐이었다. 반딧불이(`.motes`) 배경 효과는 그대로 유지됐다.
- **번호 뱃지(①~⑥)**는 2026-08-26에 제거됐고 `.badge` CSS 규칙도 함께 삭제됐다.
- **`players` 배열(길이 2)로 데스크탑/모바일 컨트롤을 짝짓던 구조**(2026-08-24 리팩터)는
  2026-09-08 리액트 전환에서 사라졌다 — 이제 상태가 하나뿐이라 짝짓기 자체가 없다.
- **`.claude/static-server.js`**(HTTP Range를 지원하는 로컬 정적 서버, 127.0.0.1 바인딩)는
  오디오 재생을 로컬에서 테스트하려고 직접 만든 도구였다. 2026-09-08 리액트 전환으로
  `npm run dev`(vite)와 `npm run preview`가 생겼고 둘 다 Range를 지원해서 쓸 일이 없어졌다.
  2026-09-09에 Playwright 테스트 서버도 파이썬 내장 서버에서 `vite preview`로 바꿨다 —
  파이썬 서버가 Range를 지원하지 않아 오디오가 아예 탐색 불가였기 때문이다. 파일 자체는
  여전히 gitignore 대상이라 새 클론에는 없다.
