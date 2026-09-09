// 브라우저가 소리 있는 자동재생을 거부했을 때의 동작을 고정한다.
//
// 실제 첫 방문자에게 크롬이 하는 일을 헤드리스로는 재현할 수 없어서(헤드리스는
// 자동재생 정책을 아예 무시한다 — 정책을 명시 지정해도 마찬가지), play()의 첫 호출만
// NotAllowedError로 거부시켜 그 상황을 만든다. 두 번째 호출부터는 통과시키는데,
// 이것이 실제 정책과 같은 모양이다(사용자 조작 뒤에는 허용).
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLMediaElement.prototype.play;
    let firstCall = true;
    window.__playCalls = 0;
    HTMLMediaElement.prototype.play = function () {
      window.__playCalls += 1;
      if (firstCall) {
        firstCall = false;
        return Promise.reject(new DOMException('blocked by policy', 'NotAllowedError'));
      }
      return original.apply(this, arguments);
    };
  });
  await page.goto('/');
  // 자동재생이 거부된 상태에서 출발하는지 확인한다.
  await expect
    .poll(() => page.evaluate(() => document.getElementById('audio').paused))
    .toBe(true);
});

test('자동재생이 거부되면 페이지 아무 곳이나 조작했을 때 재생이 시작된다', async ({ page }) => {
  await page.locator('footer').click();
  await expect
    .poll(() => page.evaluate(() => document.getElementById('audio').paused), { timeout: 3000 })
    .toBe(false);
  // 그리고 정착 볼륨까지 올라온다.
  await expect
    .poll(() => page.evaluate(() => document.getElementById('audio').volume), { timeout: 3000 })
    .toBeCloseTo(0.5, 2);
});

// 이게 과거 사고의 회귀 테스트다. 예전에 document 전역 첫 상호작용에 재생을 걸었더니,
// 앱 카드를 탭하는 것도 "첫 상호작용"으로 잡혀서 카드가 새 탭으로 열리는 동시에 방금
// 떠난 원래 탭에서 음악이 터졌다. 떠나는 클릭은 재생 트리거가 아니어야 한다.
//
// 로딩 화면이 끝나길 먼저 기다린다 — 실제 방문자도 #loader(z-index:60, 화면 전체를
// 덮음)가 떠 있는 동안은 카드를 누를 수 없으므로 이게 실제 동작과 맞는 순서다. 이걸
// 안 기다리면 click()이 카드가 로더에 가려 안 눌리는 동안 내부적으로 계속 재시도하다가
// waitForEvent('popup')의 타임아웃(테스트 전체 시간과 같음)을 넘겨버릴 수 있다 —
// 2026-09-09 CI에서 실제로 한 번 그렇게 흔들렸다(재현: 로더 자산을 인위로 지연 +
// CPU 스로틀 조합에서 15초 타임아웃에 육박하는 걸 확인, 완전한 재현은 못 했지만
// 근접까지는 확인함). 로더가 이미 끝난 상태라면 이 대기는 즉시 통과한다.
test('앱 카드를 눌러 바깥으로 나갈 때는 원래 탭에서 재생이 시작되지 않는다 (과거 사고)', async ({ page }) => {
  await page.waitForFunction(() => document.getElementById('loader')?.classList.contains('done'));

  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.locator('main .app').first().click(),
  ]);
  await popup.close();

  // 카드 클릭 뒤에도 원래 탭은 조용해야 한다.
  await page.waitForTimeout(800);
  const paused = await page.evaluate(() => document.getElementById('audio').paused);
  expect(paused, '카드를 눌러 나갔는데 원래 탭에서 음악이 시작됐다').toBe(true);
});

test('한 번 시작된 뒤에는 조작 리스너가 남아 있지 않다', async ({ page }) => {
  await page.locator('footer').click();
  await expect
    .poll(() => page.evaluate(() => document.getElementById('audio').paused), { timeout: 3000 })
    .toBe(false);

  const before = await page.evaluate(() => window.__playCalls);
  await page.locator('footer').click();
  await page.locator('header').click();
  await page.waitForTimeout(300);
  const after = await page.evaluate(() => window.__playCalls);

  expect(after, '리스너가 남아서 클릭마다 play()를 다시 부르고 있다').toBe(before);
});
