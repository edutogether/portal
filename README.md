# 같교오락실 (edutogether portal)

같이교육이 만든 교육용 앱 6종을 한자리에서 골라 체험하는 전시용 포털. 교육청 행사와
교사연구회 활동 지원 목적으로 운영한다.

- **라이브**: <https://edutogether.kr> (Firebase Hosting)
- **구성**: 빌드 과정 없는 단일 정적 사이트. 실제 배포 대상은 `public/`
  (`public/index.html` + `public/assets/`)이고, 그 밖의 `scripts/`·`tests/`·`.github/`·
  `_docs/`는 저장소에만 있고 배포되지 않는다.

수록 앱: Poster Studio · Voice Cinema · QUIZ TOGETHER · CLASSCADE · AI Ways Incheon ·
Be a Googler. 카드를 누르면 각 앱이 새 탭으로 열린다(포털은 원래 탭에 그대로 남는다).

## 개발자용 문서

- [AGENTS.md](AGENTS.md) — 도구 종류와 무관하게 이 저장소에서 작업할 때 알아야 할
  명령·배포 경로·함정. **코드를 고치기 전에 먼저 읽을 것.**
- [CLAUDE.md](CLAUDE.md) — 클로드 코드 세션용 상세 지침과 설계 결정 이력.
- [_docs/](_docs/) — 운영 문서·과거 핸드오프 등.
