# RUNBOOK — Portal

> 이 저장소에서 되풀이하는 일을 **그대로 따라 하면 끝나는 순서**로 적는다. 명령은 복사해서 바로 돌릴 수 있게 쓰고,
> 단계마다 «됐는지 확인하는 법»을 붙인다. 무엇을 지켜야 하는지는 `_docs/RULES.md`, 함정이 생긴 사연은
> `.claude/rules/app.md`에 있다 — 이 문서는 «어떻게 하나»만 다룬다(원본 양식: `D:\Projects\_shared\doc-kit\`).
> 일을 시작할 때 그 일의 절을 열고, 첫 진행 설명과 완료 보고에 «읽은 것: RUNBOOK §1»을 적는다.
> 검사기는 자잘하게 고치는 동안 돌리지 않는다 — 한 덩어리가 끝나면 «이제 검사기를 한 번에 돌리겠습니다»라고 알리고 한 번 돌린다.
> Windows에서는 `python3` 대신 `py -3`을 쓴다(`python3`가 스토어 껍데기로 잡혀 아무것도 안 하고 끝난다).

## 목차

| 일 | 언제 하나 | 절 |
|---|---|---|
| 로컬에서 켜 보기 · 한 곳 확인 | 코드나 문구를 고치는 동안 | §1 |
| 전체 검사 | 한 덩어리 작업이 끝났을 때 | §2 |
| 작은 변경 배포 | 검사를 통과한 작은 변경을 올릴 때 | §3 |
| 큰 변경(구조 · CI · 의존성) 배포 | 가지 → PR → 병합이 필요할 때 | §4 |
| 배포 후 라이브 확인 | 배포가 끝난 직후 | §5 |
| 장애 롤백 | 라이브가 깨졌을 때 | §6 |
| 의존성 최신화 | 팀장이 최신화를 지시했을 때 | §7 |
| 폰트 서브셋 다시 만들기 | 화면에 새 글자가 생겼을 때 | §8 |
| 큰 변경 전후 화면 비교 | 리팩터링 · 스타일 대수술 전후 | §9 |
| 앱 주소 바꾸기 | 앱 URL이 바뀌었을 때 | §10 |
| 프리즈 태그 찍기 | 큰 변경 직전 · 감사 통과 직후 | §11 |
| 정기 점검 | 분기 말 · 매달 | §12 |

## 1. 로컬에서 켜 보기 · 한 곳 확인

- **언제**: 코드나 문구를 고치는 동안
- **시작 전에 읽을 규칙**: `RULES.md` R-1 · R-3 · R-4 · R-6 — 이 일에 걸린 규칙을 전부 적는다(고치는 내용에 따라 R-11~R-22를 더한다)
- **순서**
  1. `npm ci` → **확인**: `found 0 vulnerabilities`로 끝남
  2. `npm run dev` → **확인**: 터미널에 로컬 주소가 뜬다(브라우저로 그 주소를 열어 고친 자리만 본다)
  3. 고친 자리에 걸린 시험 파일 하나만 돌린다. 예: `npx playwright test tests/no-autoplay.spec.js` → **확인**: `passed`(시험은 빌드된 `dist/`를 대상으로 하므로 먼저 `npm run build`)
  4. 확인용으로 손으로 띄운 `vite preview` · dev 서버는 끝나면 끈다
- **끝나면 남길 것**: 없음(배포로 이어질 때만 §3 · §4)
- **막히면**: 시험이 빌드 전 `dist/`를 보고 실패하면 `npm run build`부터. 그래도 이유를 모르면 팀장에게 한 줄 보고

## 2. 전체 검사

- **언제**: 한 덩어리 작업이 끝났을 때 — «이제 검사기를 한 번에 돌리겠습니다»라고 알리고 한 번
- **시작 전에 읽을 규칙**: `RULES.md` R-6 · R-18 · R-20 · R-21 · R-25 · R-26
- **순서**
  1. `npm run lint` → **확인**: 경고 · 오류 없이 끝남
  2. `npm run build` → **확인**: `✓ built`, `dist/index.html` · `dist/404.html`이 생김
  3. `npm test` → **확인**: `54 passed`(2분 안팎, 개수는 시험을 더하면 바뀐다 — AGENTS.md 숫자도 같이 고친다)
  4. `py -3 scripts/check-inline-script.py` → **확인**: `OK — dist\index.html 에 인라인 <script> 없음` 두 줄
  5. `py -3 scripts/check-font-coverage.py` → **확인**: `OK — 화면에 그려지는 글자 N자 전부 서브셋에 포함됨`(`npm test`가 만든 `.cache/rendered-text.txt`를 읽으므로 3번 뒤에)
- **끝나면 남길 것**: 완료 보고에 «규칙 N · 검사기 통과 N · 빨간불 시험 · 직접 열어 본 N»(R-5)
- **막히면**: 폰트 검사가 «빠진 글자»를 내면 §8. 시험이 흔들리면(가끔만 실패) 시간을 늘려 덮지 말고 `playwright-report`의 trace를 먼저 본다(`.claude/rules/app.md` «자주 틀리는 것»)

## 3. 작은 변경 배포 (main 직접)

- **언제**: 작고 급한 변경이 §2를 통과했을 때(구조 · CI · 의존성은 §4)
- **시작 전에 읽을 규칙**: `RULES.md` R-8 · R-10 · R-29 · R-30
- **순서**
  1. `git status` → **확인**: 의도한 파일만 바뀜
  2. 커밋(한국어 메시지, 승인 근거 `(승인 Bumm M/D)` 또는 `(지시 Bumm M/D)`) → **확인**: `git log --oneline -1`
  3. **코드가 바뀌면** 팀장에게 «배포 직전 한 줄»을 보내고 «승인» 답이 올 때까지 기다린다(문서만 바뀐 커밋은 기다리지 않는다)
  4. `git pull --rebase` → `git push` → **확인**: 푸시 성공(다른 쪽 월간 하트비트 커밋이 먼저 들어와 거절되면 `git pull --rebase` 뒤 다시)
  5. `gh run list --branch main --limit 4` 로 `배포 (테스트 통과 후 Firebase Hosting)`를 지켜본다 → **확인**: `success`(2분 안팎). 문서만 바뀐 커밋은 배포 job이 건너뛰어진다
- **끝나면 남길 것**: `_docs/CHANGELOG.md` 한 줄, §5 확인
- **막히면**: 빨간불이면 `gh run view <id> --log-failed`로 원인을 본다. 라이브가 깨졌으면 §6 먼저

## 4. 큰 변경 배포 (가지 → PR → 병합)

- **언제**: 프레임워크 · CI · 의존성 · 액션 판 변경처럼 구조가 바뀔 때, 또는 CI가 처음 검증하는 변경
- **시작 전에 읽을 규칙**: `RULES.md` R-8 · R-9 · R-30
- **순서**
  1. 먼저 §11로 직전 고정점 태그를 찍는다 → **확인**: `git ls-remote --tags origin`에 보임
  2. 가지를 만들어 커밋: `git checkout -b chore/<이름>-<날짜>` → **확인**: `git branch --show-current`. 로컬 `main`에는 커밋하지 않는다(실수로 했으면 `git branch -f main origin/main`으로 되돌린다)
  3. `git push -u origin <가지>` → `gh pr create --base main --head <가지> --title … --body …` → **확인**: PR 주소가 나옴
  4. `gh pr checks <번호> --watch` → **확인**: 배포 없이 도는 검사(`build` · `check-build-output` · `check-coverage` · `smoke-test` · CodeQL · `preview`)가 전부 `pass`. 실패하면 가지에 고쳐 다시 push한다
  5. 팀장 승인(R-8) 뒤 `gh pr merge <번호> --merge --delete-branch` → **확인**: `main`에 병합 커밋
  6. `git checkout main && git pull --rebase` → `gh run watch <배포 run id> --exit-status` → **확인**: 배포 job과 «라이브 반영 확인» 단계 성공
- **끝나면 남길 것**: `_docs/CHANGELOG.md` 한 줄, §5 확인
- **막히면**: PR CI가 첫 검증이다 — `requirements-ci.txt`처럼 CI에서만 도는 파일을 고쳤다면 로컬에서도 `py -3 -m pip install --dry-run --require-hashes --only-binary=:all: -r scripts/requirements-ci.txt`로 미리 본다

## 5. 배포 후 라이브 확인

- **언제**: 배포가 끝난 직후(HTTP 200만으로 끝내지 않는다 — AGENTS.md 9번)
- **시작 전에 읽을 규칙**: `RULES.md` R-11 · R-12 · R-18 · R-20
- **순서**
  1. 세션 자체 브라우저(헤드리스 Playwright 또는 내부 브라우저)로 `https://edutogether.kr`를 연다 → **확인**: HTTP 200
  2. 카드 6개(`a[target=_blank]`)가 보인다 → **확인**: 개수 6, 순서가 R-12와 같음
  3. 1920 폭에서 `h1` 글자 크기 78px, 가로 스크롤 없음(`scrollWidth` = 폭) → **확인**: 값이 맞음
  4. 노래가 멈춘 채로 있다(`audio.paused === true`) → **확인**: 재생 단추를 누르기 전엔 소리가 나지 않음
  5. 콘솔 오류 0개(`page.on('console')`, `pageerror`) → **확인**: 빈 목록
  6. 바뀐 부분이 화면에 보이는 변경이면 원본 해상도(2560)로 캡처해 팀장에게 보고한다(R-31)
- **끝나면 남길 것**: 확인 결과를 팀장 보고에 한 줄. 확인용 서버를 띄웠으면 끈다(R-34)
- **막히면**: 이상하면 §6. 카카오톡 공유 썸네일이 안 바뀌면 [카카오 디버거](https://developers.kakao.com/tool/debugger/sharing)에서 `https://edutogether.kr`를 초기화한다

## 6. 장애 롤백

- **언제**: 라이브가 깨졌을 때 — 원인 분석보다 **복구를 먼저**
- **시작 전에 읽을 규칙**: `RULES.md` R-30
- **순서**
  1. [Firebase Hosting 콘솔](https://console.firebase.google.com/project/edutogether-portal/hosting/sites)(계정 `edutogether2015@gmail.com`)의 «Previous releases»에서 직전 릴리스를 되돌린다 → **확인**: 수십 초 안에 라이브가 복구됨(§5 확인)
  2. 그다음 저장소를 맞춘다: `git revert <나쁜 커밋>` → §3으로 push → **확인**: CI 배포 성공
  3. 콘솔 작업은 Bumm님 계정이 필요하므로, 세션이 못 하면 팀장에게 «Bumm님이 직접 하실 일»로 올린다
- **끝나면 남길 것**: `_docs/CHANGELOG.md`에 사고 한 줄, 새로 겪은 함정은 `.claude/rules/app.md`에
- **막히면**: 상세 절차 → `_docs/ops/deploy-and-billing.md`

## 7. 의존성 최신화

- **언제**: 팀장이 «최신화»를 지시했을 때(R-9, COMMON_STANDARDS §36)
- **시작 전에 읽을 규칙**: `RULES.md` R-4 · R-8 · R-9 · R-25
- **순서**
  1. §11로 `portal-freeze-<날짜>-pre-deps` 태그를 찍어 push → **확인**: 원격에 보임
  2. `npm outdated` → **확인**: 올릴 목록과 못 올릴 것(상류가 허용하지 않는 것)이 가려짐. 못 올리는 것은 `npm view <패키지> peerDependencies`로 이유를 확인
  3. `package.json`의 범위를 최신판으로 고치고 `npm install` → **확인**: `found 0 vulnerabilities`, `npm outdated`에 못 올리는 것만 남음. `overrides`(minimatch)도 최신 판으로
  4. 고정 액션(`.github/workflows/*.yml`의 `uses: <액션>@<SHA> # vX`)을 최신 릴리스 SHA로 바꾼다. SHA는 `gh api repos/<액션>/releases/latest --jq .tag_name`로 태그를 얻은 뒤 `gh api repos/<액션>/git/ref/tags/<태그>`로 대조(주석 태그면 `git/tags/<sha>`까지) → **확인**: `grep -rh "uses:" .github/workflows | sort | uniq -c`에 옛 SHA가 없음
  5. 파이썬 패키지(`scripts/requirements-ci.txt`)는 새 버전의 **모든 파일 해시**를 PyPI JSON에서 받아 파일을 통째로 다시 쓴다(줄 이음 `\` 뒤에 줄바꿈 — 글자 `\r`이 들어가면 안 된다) → **확인**: `py -3 -m pip install --dry-run --require-hashes --only-binary=:all: -r scripts/requirements-ci.txt`가 성공
  6. §2 전체 검사 → §4(가지 → PR → 병합 → 배포) → §5
- **끝나면 남길 것**: `_docs/CHANGELOG.md` 한 줄(올린 것 · 못 올린 것과 이유)
- **막히면**: 올리지 못하는 이유는 팀장 보고에 적는다(팀장이 COMMON_STANDARDS §36 표 · 매일 점검에 올린다)

## 8. 폰트 서브셋 다시 만들기

- **언제**: `check-font-coverage.py`가 «빠진 글자»를 낼 때(화면에 새 글자가 생겼을 때)
- **시작 전에 읽을 규칙**: `RULES.md` R-24 · R-26
- **순서**
  1. `public/assets/fonts/pretendard/pretendard.css` 맨 위 주석의 `pyftsubset` 방법을 따른다 → **확인**: 새 서브셋 파일이 `public/assets/fonts/pretendard/`에 생김
  2. `npm run build` → `npm test` → `py -3 scripts/check-font-coverage.py` → **확인**: `OK — … 전부 서브셋에 포함됨`
- **끝나면 남길 것**: `_docs/CHANGELOG.md` 한 줄
- **막히면**: 글자가 Pretendard에 아예 없으면(예: `ⓒ`) 서브셋이 아니라 문구를 표준 글자(`©`)로 바꾼다

## 9. 큰 변경 전후 화면 비교

- **언제**: 리팩터링 · 스타일 대수술 등 «보이는 결과가 바뀌면 안 되는» 변경
- **시작 전에 읽을 규칙**: `RULES.md` R-12 ~ R-17 · R-20
- **순서**
  1. 변경 전 기준선: `git stash` → `npm run build` → `npm run test:visual -- --update-snapshots` → **확인**: `tests/visual-snapshot.spec.js-snapshots/`에 4개 뷰포트(1600 · 1180 · 560 · 390) 이미지가 생김(gitignore 대상, 로컬 전용)
  2. `git stash pop` → `npm run build` → `npm run test:visual` → **확인**: 4개 모두 `passed`
  3. `npm test`(수치로 지키는 `tests/locked-geometry.spec.js` 포함) → **확인**: `passed`
- **끝나면 남길 것**: 완료 보고에 비교 결과
- **막히면**: 이미지가 없다고 실패하면 1번을 먼저 한다(기준선 없이는 실패하는 것이 정상)

## 10. 앱 주소 바꾸기

- **언제**: 6개 앱 중 하나의 URL이 바뀔 때
- **시작 전에 읽을 규칙**: `RULES.md` R-10 · R-29
- **순서**
  1. 해당 앱 세션(팀장 경유)에 새 오리진에서 기능이 실제로 되는지 확인을 받는다 → **확인**: 확인 답이 옴(200과 본문 문자열만으로는 백엔드 장애를 못 잡는다)
  2. 여섯 곳을 같이 고친다: `src/data/apps.ts` · `tests/locked-geometry.spec.js` · `tests/portal.spec.js` · `.github/workflows/link-healthcheck.yml` · `firebase.json`(리다이렉트 목적지) · `CLAUDE.md` 표 → **확인**: 옛 주소로 저장소 전체 검색(`web.app` · `github.io` 포함)하면 0건
  3. §2 → §3(또는 §4) → §5 → **확인**: 새 주소가 200이고 기대 문자열이 본문에 있음
  4. 다음 날 `link-healthcheck.yml`이 초록인지 `gh run list --workflow link-healthcheck.yml --limit 3`로 본다
- **끝나면 남길 것**: `_docs/CHANGELOG.md` 한 줄
- **막히면**: 한 앱 세션의 확인이 늦으면 기다리고 주소를 바꾸지 않는다

## 11. 프리즈 태그 찍기

- **언제**: 큰 변경 직전(`-pre-<이유>`) 또는 감사 통과 직후(`-audited-100`)
- **시작 전에 읽을 규칙**: `RULES.md` R-30
- **순서**
  1. `git tag -a portal-freeze-<YYYYMMDD>-<꼬리말> -m "<설명>"` → **확인**: `git show <태그> --stat | head`
  2. `git push origin <태그>` → **확인**: `git ls-remote --tags origin <태그>`에 보임
  3. `-audited-100` 태그만 GitHub 릴리스를 붙이고(태그 메시지를 그대로 본문으로), `pre-` 태그는 릴리스를 만들지 않는다(COMMON_STANDARDS §23-7)
- **끝나면 남길 것**: `CLAUDE.md`의 «최신 태그»를 `-audited-100` 태그일 때만 갱신
- **막히면**: 기존 태그는 옮기지 않는다 — 새 날짜 태그를 만든다. 새 클론에서 푸시가 막히면 `git config core.hooksPath .githooks` 한 번

## 12. 정기 점검

- **언제**: 분기 말(3 · 6 · 9 · 12월 말, 다음 2026-12-31)에 종합감사, 매달 예산 알림 확인
- **시작 전에 읽을 규칙**: `RULES.md` R-33
- **순서**
  1. 마지막 감사 이후 변화량: `git rev-list --count portal-freeze-20261031-audited-100..main` → **확인**: 숫자(0이면 바뀐 것이 없다)
  2. 종합감사는 팀장 지시가 있을 때만 `D:\Projects\COMMON_STANDARDS.md` §4~§7 원문대로 한다
  3. 매달 1일 Blaze 예산 알림 점검은 팀장의 예약 작업이 한다. 콘솔 전용이라 Bumm님 계정이 필요하다 → **확인**: 팀장 보고
  4. 매일 09:00 KST `link-healthcheck.yml`(6개 앱 응답 · OG 이미지 · 주소 리다이렉트)이 초록인지는 `gh run list --workflow link-healthcheck.yml --limit 3`
- **끝나면 남길 것**: 감사 결과는 `_docs/CHANGELOG.md`와 프리즈 태그 메시지
- **막히면**: 지시 없이 이 세션이 먼저 감사를 시작하지 않는다(R-33)

## 따로 있는 상세 런북

- `_docs/ops/deploy-and-billing.md` — 수동 배포 명령(`firebase deploy --only hosting --account=edutogether2015@gmail.com`) · Blaze 예산 알림 재확인 · 롤백 상세
- `_docs/ops/handoff.md` — 2026-08-14 스냅샷(옛 인계 기록, 최신은 `CLAUDE.md`)
