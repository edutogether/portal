// 전환 전/후 화면을 픽셀로 비교한다. 테스트 이름에 @snapshot 태그가 붙어있고,
// `npm test`(CI가 도는 것)에서는 --grep-invert로 제외된다 — Playwright 스냅샷은
// 파일명에 플랫폼이 들어가서(`-win32.png`) 리눅스 러너엔 기준 이미지가 없고,
// 폰트 렌더링도 OS마다 달라 애초에 비교가 성립하지 않기 때문이다.
//
// 쓰는 법 (전환 작업 중 로컬에서):
//   1) 전환 전 상태에서  npm run test:visual -- --update-snapshots   → 기준선 생성
//   2) 전환 후            npm run test:visual                        → 차이 확인
//
// 기준 이미지는 .gitignore 대상이다(약 4.7MB, Windows 전용이라 저장소에 넣을
// 값어치가 없음). 플랫폼 무관하게 항상 지켜야 하는 것은 locked-geometry.spec.js가
// 수치로 단언하며 그쪽이 CI에서 돈다.
import { test, expect } from '@playwright/test';
import { settle } from './helpers.js';

// LOCKED 분기점 기준 — 데스크탑 3열x2행 / 모바일 플레이어 전환 경계 /
// 1열 경계 / 실제 모바일 기기.
const VIEWPORTS = [
  { name: 'desktop-1600', width: 1600, height: 900 },
  { name: 'boundary-1180', width: 1180, height: 900 },
  { name: 'boundary-560', width: 560, height: 900 },
  { name: 'mobile-390', width: 390, height: 844 },
];

for (const vp of VIEWPORTS) {
  test(`@snapshot 시각 동일성 — ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await settle(page);
    await expect(page).toHaveScreenshot(`${vp.name}.png`, {
      fullPage: true,
      animations: 'disabled',
      // 반딧불이는 결정적으로 생성되지만 서브픽셀 렌더링 편차가 약간 있을 수
      // 있어서 아주 작은 여유만 둔다. 레이아웃이 바뀌면 이 값으로는 절대 못 넘어간다.
      maxDiffPixelRatio: 0.002,
    });
  });
}
