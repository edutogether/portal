# 같교오락실 (edutogether portal)

같이교육이 만든 교육용 앱 6종을 한자리에서 골라 체험하는 전시용 포털. 교육청 행사와
교사연구회 활동 지원 목적으로 운영한다.

- **라이브**: <https://edutogether.kr> (Firebase Hosting)
- **구성**: React + TypeScript + Vite. 소스는 `src/`, 이미지·폰트·음원은
  `public/assets/`, 배포 대상은 빌드 산출물 `dist/`다(커밋하지 않음).
  `scripts/`·`tests/`·`.github/`·`_docs/`는 저장소에만 있고 배포되지 않는다.

```bash
npm ci && npm run dev     # 개발 서버
npm run build             # 빌드 (dist/)
npm test                  # Playwright
npm run lint              # eslint
```

수록 앱: Poster Studio · Voice Cinema · QUIZ TOGETHER · CLASSCADE · AI Ways Incheon ·
Be a Googler. 카드를 누르면 각 앱이 새 탭으로 열린다(포털은 원래 탭에 그대로 남는다).

## 실운영 상태

지금은 **실운영 모드**다 — 새 기능을 만들지 않고, 피드백이나 버그가 있을 때만 고친다.

- **자동으로 도는 것**: `main`에 push하면 검사(린트·빌드·테스트·폰트 커버리지)를 통과한 산출물이
  Firebase Hosting에 자동 배포되고 라이브 반영까지 확인한다(`deploy.yml`). 매일 09:00 KST에 6개 앱
  링크·OG 이미지·주소 리다이렉트를 확인하고 문제가 있으면 GitHub 이슈를 자동으로 만든다
  (`link-healthcheck.yml`). 월 1회 빈 커밋으로 예약 워크플로가 멈추지 않게 한다(`keepalive.yml`).
  Dependabot 보안 알림·CodeQL·비밀 스캔이 켜져 있다.
- **백업**: 해당 없음 — 수집·저장하는 데이터가 없다(로그인·폼·쿠키·DB 없음). 소스는 GitHub에 있고,
  되돌리기는 Firebase Hosting의 이전 릴리스 또는 프리즈 태그로 한다.
- **사람이 주기적으로 할 일**: **없음.** (월 1회 Firebase 예산 알림 확인은 콘솔에서만 되는 일이라
  팀장의 월간 예약 작업이 맡는다.)
- **문제가 생기면 어디부터**: ① <https://edutogether.kr>을 직접 연다 ② GitHub Actions 최근 실행과 열린
  이슈(`healthcheck-failure`)를 본다 ③ 되돌리는 법은 [_docs/ops/deploy-and-billing.md](_docs/ops/deploy-and-billing.md).
- **끝나는 날짜**: 없음(상시 운영). 다만 카드와 주소 리다이렉트(`firebase.json`)가 가리키는 앱이 내려가면
  그 선언도 같이 정리한다.

## 어떻게 만들어졌는가

2026-08-13에 단일 정적 HTML(270줄) 하나로 시작해, 호스팅을 GitHub Pages →
Actions 기반 배포 → Firebase Hosting으로 두 번 옮기고, 2026-09-08에
React + TypeScript + Vite로 전면 재작성했다(빌드 없는 단일 파일 1,453줄 →
컴포넌트 단위 소스). 재작성 과정에서 "화면과 조작감이 전환 전과 체감까지
동일해야 한다"는 것이 절대 조건이었고, 4개 뷰포트 스크린샷 픽셀 비교와
전환 전후 계산된 스타일(computed style) 전수 대조로 그걸 증명했다(당시
`_docs/intents/2026-09-08-react-typescript-migration/intent.md` 참고).

이후로도 Sonnet+Opus가 서로 사전 정보를 공유하지 않고 각자 독립적으로
채점하는 방식(`COMMON_STANDARDS.md` §7)의 종합감사를 여러 차례 거쳐 매번
10/10을 받았다. 각 고정점에 무엇이 완성됐는지는
[릴리스](https://github.com/edutogether/portal/releases)에 한 문단씩 적혀 있고,
그 이후 변경은 [`_docs/CHANGELOG.md`](_docs/CHANGELOG.md)에 있다.

## 개발자용 문서

- [AGENTS.md](AGENTS.md) — 도구 종류와 무관하게 이 저장소에서 작업할 때 알아야 할
  명령·배포 경로·함정. **코드를 고치기 전에 먼저 읽을 것.**
- [CLAUDE.md](CLAUDE.md) — 클로드 코드 세션용 상세 지침과 설계 결정 이력.
- [_docs/CHANGELOG.md](_docs/CHANGELOG.md) — 무엇이 언제 왜 바뀌었는지.
- [_docs/](_docs/) — 운영 문서·intent·지난 이력 등.
