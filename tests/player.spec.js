// @ts-check
const { test, expect } = require('@playwright/test');

// 완벽한 커버리지가 목표가 아니라, 이미 3번 반복됐던 같은 유형 재생 버그가
// 4번째로 재발하는 걸 자동으로 잡는 게 목표다. 절대 실제 소리를 스피커로
// 내지 않는다 — playwright.config.js에서 --mute-audio로 항상 음소거.

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    const audio = document.getElementById('audio');
    if (audio) audio.muted = true;
  });
});

test('재생 버튼을 누르면 audio.paused가 false로 바뀐다', async ({ page }) => {
  await page.click('#playBtn');
  await expect
    .poll(() => page.evaluate(() => document.getElementById('audio').paused))
    .toBe(false);
});

test('볼륨을 0으로 내린 뒤 음소거 버튼을 누르면 최대음량(1.0)이 아니라 0.5로 복귀한다 (2026-08-25 회귀버그)', async ({ page }) => {
  await page.evaluate(() => {
    const vol = document.getElementById('vol');
    vol.value = '0';
    vol.dispatchEvent(new Event('input'));
  });
  await page.click('#muteBtn'); // 볼륨 0 → 사실상 음소거 상태 → 클릭하면 해제 시도
  const volume = await page.evaluate(() => document.getElementById('audio').volume);
  expect(volume).toBeCloseTo(0.5, 5);
  expect(volume).not.toBe(1);
});

test('반복이 꺼져 있고 곡이 1개뿐이면 재생이 끝나도 같은 곡이 무한재생되지 않는다 (2026-08-25 회귀버그)', async ({ page }) => {
  // 기본은 반복 켜짐이므로 꺼서 시나리오를 만든다.
  const repeatActive = await page.evaluate(() => document.getElementById('repeatBtn').classList.contains('active'));
  if (repeatActive) await page.click('#repeatBtn');

  const audioLoadCallsBefore = await page.evaluate(() => {
    window.__loadCalls = 0;
    const audio = document.getElementById('audio');
    const origLoad = audio.load.bind(audio);
    audio.load = function () { window.__loadCalls++; return origLoad(); };
    audio.dispatchEvent(new Event('ended'));
    return window.__loadCalls;
  });
  expect(audioLoadCallsBefore).toBe(0);
});

test('모바일 남은시간 표시가 loadedmetadata 시점에 데스크탑과 함께 초기화된다 (2026-08-23 회귀버그)', async ({ page }) => {
  await page.evaluate(() => {
    document.getElementById('durTime').textContent = '-0:00';
    document.getElementById('durTimeM').textContent = '-0:00';
    Object.defineProperty(document.getElementById('audio'), 'duration', { value: 125, configurable: true });
    document.getElementById('audio').dispatchEvent(new Event('loadedmetadata'));
  });
  const durTimeM = await page.textContent('#durTimeM');
  expect(durTimeM).not.toBe('-0:00');
});

test('셔플 버튼을 누르면 데스크탑/모바일 버튼이 함께 active 상태로 바뀐다', async ({ page }) => {
  await page.click('#shuffleBtn');
  const [desktopActive, mobileActive] = await page.evaluate(() => [
    document.getElementById('shuffleBtn').classList.contains('active'),
    document.getElementById('shuffleBtnM').classList.contains('active'),
  ]);
  expect(desktopActive).toBe(true);
  expect(mobileActive).toBe(true);
});

test('즐겨찾기는 기본 켜짐이고, 모바일 버튼을 눌러도 데스크탑과 같이 꺼진다', async ({ page }) => {
  const initial = await page.evaluate(() => [
    document.getElementById('favBtn').classList.contains('active'),
    document.getElementById('favBtnM').classList.contains('active'),
  ]);
  expect(initial).toEqual([true, true]);

  // favBtnM은 데스크탑 뷰포트에서 .player-mobile이 display:none이라
  // Playwright의 실제 클릭(가시성 요구)이 아니라 DOM 클릭으로 직접 누른다.
  await page.evaluate(() => document.getElementById('favBtnM').click());
  const afterClick = await page.evaluate(() => [
    document.getElementById('favBtn').classList.contains('active'),
    document.getElementById('favBtnM').classList.contains('active'),
  ]);
  expect(afterClick).toEqual([false, false]);
});

test('탐색바를 드래그하면 현재 시간 표시가 그 값으로 갱신된다', async ({ page }) => {
  await page.evaluate(() => {
    const seek = document.getElementById('seek');
    seek.value = '65'; // 1:05
    seek.dispatchEvent(new Event('input'));
  });
  const curTime = await page.textContent('#curTime');
  expect(curTime).toBe('1:05');
});

test('다음 곡 버튼을 누르면 트랙이 다시 로드된다(가사 줄 재구성 포함)', async ({ page }) => {
  const loadCalls = await page.evaluate(() => {
    return new Promise((resolve) => {
      const audio = document.getElementById('audio');
      const origLoad = audio.load.bind(audio);
      let calls = 0;
      audio.load = function () { calls++; return origLoad(); };
      document.getElementById('nextBtn').click();
      setTimeout(() => resolve(calls), 100);
    });
  });
  expect(loadCalls).toBeGreaterThan(0);
});
