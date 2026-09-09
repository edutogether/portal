# 배포·비용·롤백 — 사람이 손으로 확인/실행하는 절차

`AGENTS.md`의 "운영" 절이 여기로 옮겨온 것이다(2026-09-09, 문서 표준 정리 —
`D:\Projects\_shared\DOC-STANDARD.md`). 평소엔 CI가 알아서 하므로 아래는 **직접 손을
대야 하는 상황에서만** 읽는다.

## 수동 배포

**Firebase 프로젝트 `edutogether-portal`은 `edutogether2015@gmail.com` 계정 소속.**
로컬에서 수동 배포할 일이 생기면:

```bash
firebase deploy --only hosting --account=edutogether2015@gmail.com
```

`--account`를 꼭 지정할 것 — `817beatles@gmail.com` 계정에는 이 프로젝트 접근 권한이
없다. 평소에는 CI가 배포하므로 수동 배포할 일이 없다.

## 비용 점검

**요금제는 2026-09-02부터 Blaze(종량제)다.** 결제계정 연결 + 월 25,000원 예산 알림이
설정돼 있다. Spark 시절엔 결제계정이 없어 과금 폭탄이 구조적으로 불가능했지만 지금은
그 안전장치가 예산 알림뿐이다 — **알림이 실제로 살아있는지, 임계값이 맞는지는
주기적으로 [GCP 콘솔](https://console.cloud.google.com/billing/budgets?project=edutogether-portal)에서
재확인할 것**(코드로는 확인 불가, 대표님 계정 필요).

**Hosting 무료 전송 한도는 월 10GB.** 첫 방문 전송량 약 2.88MB이고 그중 73%(2.09MB)가
배경음악이다(자동재생이 항상 걸리므로 음악을 안 듣는 방문자도 전곡을 받는다 — 의도된
설계). `firebase.json`의 `Cache-Control`: HTML은 `no-cache`, `/assets/**`는
`max-age=86400`. **트래픽이 몰릴 행사 당일엔 예산 알림이 실제로 작동하는지 미리
확인해둘 것.**

## 장애 시 롤백

[Firebase Hosting 콘솔](https://console.firebase.google.com/project/edutogether-portal/hosting/sites)의
"Previous releases"에서 이전 릴리스를 원클릭으로 되돌릴 수 있다(재배포 불필요, 수십
초). 저장소를 건드리지 않으므로 원인 분석 시간을 벌 수 있다 — **사고 시엔 이걸
먼저 하고**, 그다음 `git revert` + push로 저장소 상태를 맞춘다(CI 실측 평균 1.7분).
