// @ts-check
import { test, expect } from '@playwright/test';

// 완벽한 커버리지가 목표가 아니라, 이미 3번 반복됐던 같은 유형 재생 버그가
// 4번째로 재발하는 걸 자동으로 잡는 게 목표다. 절대 실제 소리를 스피커로
// 내지 않는다 — playwright.config.js에서 --mute-audio로 항상 음소거.

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  // 예전엔 여기서 audio.muted = true를 걸었는데, 지금은 제품이 muted를 아예 쓰지
  // 않으므로(소리는 volume 하나로만 다룬다) 테스트가 그걸 건드리면 실제와 다른 상태를
  // 만든다. 스피커로 소리가 나가지 않는 것은 playwright.config.js의 --mute-audio가
  // 브라우저 수준에서 보장한다.
});

test('재생 버튼을 누르면 audio.paused가 false로 바뀐다', async ({ page }) => {
  await page.click('#playBtn');
  await expect
    .poll(() => page.evaluate(() => document.getElementById('audio').paused))
    .toBe(false);
});

test('볼륨을 0으로 내린 뒤 음소거 버튼을 누르면 최대음량(1.0)이 아니라 0.5로 복귀한다 (2026-08-25 회귀버그)', async ({ page }) => {
  await page.locator('#vol').fill('0');
  await page.click('#muteBtn'); // 볼륨 0 → 클릭하면 해제 시도
  // 이제 복귀가 페이드라서 값이 즉시 도달하지 않는다 — 끝날 때까지 기다린다.
  await expect
    .poll(() => page.evaluate(() => document.getElementById('audio').volume), { timeout: 3000 })
    .toBeCloseTo(0.5, 2);
});

test('음소거를 껐다 켜면 직전 볼륨으로 돌아온다 (0.5가 아니라 그 값으로)', async ({ page }) => {
  await page.locator('#vol').fill('0.55');
  await page.click('#muteBtn'); // 끔 → 0으로 페이드
  await expect
    .poll(() => page.evaluate(() => document.getElementById('audio').volume), { timeout: 3000 })
    .toBeCloseTo(0, 2);

  await page.click('#muteBtn'); // 켬 → 직전 값(0.55)으로 페이드
  await expect
    .poll(() => page.evaluate(() => document.getElementById('audio').volume), { timeout: 3000 })
    .toBeCloseTo(0.55, 2);
});

test('볼륨 변화는 즉시 튀지 않고 중간값을 거쳐 흐른다 (볼륨바가 따라 움직인다)', async ({ page }) => {
  await page.locator('#vol').fill('0.8');
  // 페이드 도중의 슬라이더 값을 표본으로 모은다. 즉시 0으로 튀면 표본이 0과 0.8뿐이다.
  const samples = await page.evaluate(async () => {
    const slider = document.getElementById('vol');
    const seen = [];
    const timer = setInterval(() => seen.push(Number(slider.value)), 25);
    document.getElementById('muteBtn').click();
    await new Promise((r) => setTimeout(r, 600));
    clearInterval(timer);
    return seen;
  });
  const between = samples.filter((v) => v > 0.02 && v < 0.78);
  expect(between.length, `중간값이 없다 = 값이 튀었다는 뜻. 표본: ${samples.join(',')}`)
    .toBeGreaterThan(2);
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
  // 원래 이 테스트는 두 요소의 textContent를 '-0:00'으로 지워놓고 loadedmetadata를
  // 다시 쏴서 "모바일 쪽도 다시 쓰이는가"를 봤다. 그건 두 벌의 DOM을 손으로 갱신하던
  // 구현에 맞춘 검사였는데, 지금은 두 표시가 같은 상태 하나에서 렌더돼서 DOM을
  // 임의로 지워도 상태가 그대로면 다시 그리지 않는다(리액트의 정상 동작).
  // 그래서 지키려던 것 자체 — "메타데이터가 오면 모바일도 데스크탑과 같은 값으로
  // 초기화된다" — 를 결과로 확인한다. 둘이 서로 어긋나는 것까지 잡으므로 더 강하다.
  await expect.poll(() => page.textContent('#durTime')).not.toBe('-0:00');
  const [durTime, durTimeM] = await Promise.all([
    page.textContent('#durTime'),
    page.textContent('#durTimeM'),
  ]);
  expect(durTimeM).not.toBe('-0:00');
  expect(durTimeM).toBe(durTime);
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
  // 예전엔 value를 직접 넣고 Event('input')을 쏘는 방식이었는데, 그렇게 하면 리액트가
  // 값이 바뀐 걸 못 알아채서(내부 value tracker가 이미 새 값을 본 상태가 됨) 핸들러가
  // 안 불린다. 실제 사용자 조작과 같은 경로인 fill()로 바꾼다 — 진짜 입력 이벤트가
  // 발생하므로 구현 방식과 무관하게 통하고, 검사 내용은 그대로다.
  // 메타데이터가 오기 전에 seek하면 브라우저가 그 위치를 못 잡고, 곧이어 오는
  // timeupdate가 0으로 되돌려버린다 — 길이를 알게 된 뒤에 조작한다.
  await expect
    .poll(() => page.evaluate(() => document.getElementById('audio').duration || 0), { timeout: 5000 })
    .toBeGreaterThan(0);

  await page.locator('#seek').fill('65'); // 1:05
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

// 탐색은 "드래그 중에는 안 되고, 놓을 때 한 번" 이어야 한다. 리액트에서 range 입력의
// onChange는 드래그 중 매 입력마다 발생해서, 거기에 탐색을 걸면 원본의 동작("놓을 때
// 한 번")과 달라진다 — 2026-09-09 리액트 전환 점검에서 실제로 그 상태였다.
//
// 이 테스트는 실제 audio.currentTime을 본다. 그러려면 서버가 HTTP Range를 지원해야
// 하는데(안 그러면 seekable이 비어 있어 currentTime 설정이 조용히 무시된다), 그래서
// playwright.config.js의 테스트 서버를 vite preview로 바꿨다.
test('탐색은 드래그 중이 아니라 놓을 때 한 번만 걸린다', async ({ page }) => {
  await expect
    .poll(() => page.evaluate(() => document.getElementById('audio').duration || 0), { timeout: 5000 })
    .toBeGreaterThan(0);

  // 전제: 이 환경에서 오디오가 실제로 탐색 가능해야 이 테스트가 의미를 가진다.
  const seekableEnd = await page.evaluate(() => {
    const a = document.getElementById('audio');
    return a.seekable.length ? a.seekable.end(0) : 0;
  });
  expect(seekableEnd, '서버가 Range를 지원하지 않으면 탐색 자체가 불가능하다').toBeGreaterThan(0);

  // .player:hover가 플레이어를 6px 위로 들어올린다(transition 0.18s). 탐색바는 높이가
  // 3px뿐이라, 호버 전에 잰 좌표로 누르면 6px 어긋나 빗나간다 — 먼저 호버해서 위치가
  // 정착한 뒤에 다시 잰다.
  await page.locator('#seek').hover();
  await page.waitForTimeout(300);
  const box = await page.locator('#seek').boundingBox();
  const y = box.y + box.height / 2;

  // 슬라이더를 잡고 오른쪽으로 끌되, 아직 놓지 않는다.
  await page.mouse.move(box.x + 2, y);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.6, y, { steps: 10 });

  const duringDrag = await page.evaluate(() => ({
    current: document.getElementById('audio').currentTime,
    shown: document.getElementById('curTime').textContent,
  }));
  expect(duringDrag.current, '드래그 중에는 아직 탐색되면 안 된다').toBeLessThan(1);
  expect(duringDrag.shown, '그래도 표시는 손을 따라가야 한다').not.toBe('0:00');

  // 놓는 순간 한 번 탐색된다.
  await page.mouse.up();
  await expect
    .poll(() => page.evaluate(() => document.getElementById('audio').currentTime), { timeout: 3000 })
    .toBeGreaterThan(1);
});
