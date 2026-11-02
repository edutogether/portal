// 사이트에 들어오면 노래가 멈춘 채로 화면이 나와야 한다(2026-11-02 Bumm님 지시 — 자동재생을
// 하지 않는다. 9/9의 "방문하면 소리 난다"를 뒤집음). 재생 단추를 눌러야 소리가 난다.
//
// 헤드리스는 자동재생 정책을 아예 무시하므로, 자동재생을 시도했다면 audio가 실제로 재생돼 버린다 —
// 그래서 paused와 함께 play() 호출 횟수 0도 단언한다(정책에 막혀 멈춘 것과 구분하기 위해).
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLMediaElement.prototype.play;
    window.__playCalls = 0;
    HTMLMediaElement.prototype.play = function () {
      window.__playCalls += 1;
      return original.apply(this, arguments);
    };
  });
});

async function expectStopped(page) {
  await page.waitForFunction(() => document.getElementById('loader')?.classList.contains('done'));
  await page.waitForTimeout(800);
  const s = await page.evaluate(() => ({
    paused: document.getElementById('audio').paused,
    calls: window.__playCalls,
    volume: document.getElementById('audio').volume,
  }));
  expect(s.paused, '들어오자마자 노래가 재생됐다').toBe(true);
  expect(s.calls, '자동재생을 시도했다').toBe(0);
  expect(s.volume, '볼륨은 정착값으로 대기').toBeCloseTo(0.5, 2);
}

test('처음 들어온 사람: 멈춘 채로 나온다', async ({ page }) => {
  await page.goto('/');
  await expectStopped(page);
});

test('다시 들어온 사람(같은 브라우저에서 새로고침·재방문)도 멈춘 채로 나온다', async ({ page }) => {
  await page.goto('/');
  await expectStopped(page);
  await page.click('#playBtn');
  await expect.poll(() => page.evaluate(() => document.getElementById('audio').paused)).toBe(false);
  await page.reload();
  await expectStopped(page);
});

test('페이지 아무 곳을 누르거나 키를 눌러도 재생되지 않는다', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => document.getElementById('loader')?.classList.contains('done'));
  await page.locator('footer').click();
  await page.keyboard.press('Space');
  await page.waitForTimeout(800);
  expect(await page.evaluate(() => document.getElementById('audio').paused)).toBe(true);
});

test('재생 단추를 누르면 정상으로 재생되고, 다시 누르면 멈춘다', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => document.getElementById('loader')?.classList.contains('done'));
  await page.click('#playBtn');
  await expect.poll(() => page.evaluate(() => document.getElementById('audio').paused)).toBe(false);
  await expect
    .poll(() => page.evaluate(() => document.getElementById('audio').currentTime), { timeout: 5000 })
    .toBeGreaterThan(0);
  expect(await page.evaluate(() => document.getElementById('audio').volume)).toBeCloseTo(0.5, 2);
  await page.click('#playBtn');
  await expect.poll(() => page.evaluate(() => document.getElementById('audio').paused)).toBe(true);
});

// 앱 카드를 눌러 바깥으로 나가는 클릭이 원래 탭의 재생을 켜면 안 된다(과거 사고: 카드가
// 새 탭으로 열리는 동시에 방금 떠난 탭에서 음악이 터졌다). 로딩 화면이 끝나길 먼저 기다린다 —
// 로더가 카드를 가리는 동안 click()이 재시도하다 타임아웃을 넘기는 흔들림이 있었다(2026-09-09).
test('앱 카드를 눌러 바깥으로 나가도 원래 탭에서 재생이 시작되지 않는다', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => document.getElementById('loader')?.classList.contains('done'));
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.locator('main .app').first().click(),
  ]);
  await popup.close();
  await page.waitForTimeout(800);
  expect(await page.evaluate(() => document.getElementById('audio').paused)).toBe(true);
});

// 터치 폰에서 재생 버튼을 탭하면 재생이 켜진 채로 남아야 한다(touchstart와 click이 둘 다
// 재생을 건드려 켰다 꺼 버리던 2026-10-27의 사고를 지킨다).
test.describe('터치 폰', () => {
  test.use({ viewport: { width: 360, height: 800 }, hasTouch: true, isMobile: true });

  test('멈춘 채로 나오고, 재생 버튼을 탭하면 재생이 시작된 채로 남는다', async ({ page }) => {
    await page.goto('/');
    await expectStopped(page);
    await page.tap('#playBtnM');
    await page.waitForTimeout(800);
    expect(await page.evaluate(() => document.getElementById('audio').paused)).toBe(false);
  });
});
