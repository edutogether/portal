// 모바일(360)부터 2560까지 열 개 폭에서 화면이 깨지지 않는지 계산된 값으로 단언한다
// (2026-10-27 반응형 정비). 스크린샷이 아니라 수치라서 OS/렌더러와 무관하게 CI에서 돈다.
import { test, expect } from '@playwright/test';
import { settle } from './helpers.js';

const WIDTHS = [
  [360, 800], [390, 844], [430, 932], [768, 1024], [1024, 768],
  [1280, 720], [1366, 768], [1440, 900], [1920, 1080], [2560, 1440],
];

for (const [width, height] of WIDTHS) {
  test(`반응형 ${width}px — 가로 스크롤·잘림·겹침이 없다`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await settle(page);

    const r = await page.evaluate(() => {
      const rect = (el) => el.getBoundingClientRect();
      const doc = document.documentElement;
      const apps = [...document.querySelectorAll('main .app')].map(rect);
      const bar = document.querySelector('.player-mobile');
      const barShown = getComputedStyle(bar).display !== 'none';
      window.scrollTo(0, doc.scrollHeight);
      return {
        sw: doc.scrollWidth, cw: doc.clientWidth,
        apps: apps.map((b) => ({ l: b.left, r: b.right, t: b.top, b: b.bottom })),
        // 카드 안 글자가 카드 밖으로 넘치는지
        clipped: [...document.querySelectorAll('main .app')]
          .filter((a) => a.scrollHeight > a.clientHeight + 1 || a.scrollWidth > a.clientWidth + 1).length,
        h1: rect(document.querySelector('h1')),
        descFont: parseFloat(getComputedStyle(document.querySelector('.desc')).fontSize),
        nameFont: parseFloat(getComputedStyle(document.querySelector('.name')).fontSize),
        // 푸터 글자가 끝나는 자리(푸터 아래 padding은 바 높이만큼 비워둔 공간이라 뺀다)
        footerBottom: rect(document.querySelector('footer')).bottom
          - parseFloat(getComputedStyle(document.querySelector('footer')).paddingBottom),
        barTop: barShown ? rect(bar).top : null,
      };
    });

    expect(r.sw, '가로 스크롤이 생기면 안 된다').toBeLessThanOrEqual(r.cw);
    for (const a of r.apps) {
      expect(a.l, '카드가 화면 왼쪽 밖').toBeGreaterThanOrEqual(0);
      expect(a.r, '카드가 화면 오른쪽 밖').toBeLessThanOrEqual(r.cw + 0.5);
    }
    // 서로 다른 칸의 카드끼리 겹치지 않는다(같은 행에서 가로로, 같은 열에서 세로로).
    for (let i = 0; i < r.apps.length; i++) {
      for (let j = i + 1; j < r.apps.length; j++) {
        const a = r.apps[i], b = r.apps[j];
        const overlapX = Math.min(a.r, b.r) - Math.max(a.l, b.l);
        const overlapY = Math.min(a.b, b.b) - Math.max(a.t, b.t);
        expect(overlapX > 1 && overlapY > 1, `카드 ${i}와 ${j}가 겹침`).toBe(false);
      }
    }
    expect(r.clipped, '카드 안 내용이 카드 밖으로 넘침').toBe(0);
    expect(r.h1.left, '제목이 왼쪽으로 잘림').toBeGreaterThanOrEqual(0);
    expect(r.h1.right, '제목이 오른쪽으로 잘림').toBeLessThanOrEqual(r.cw);
    expect(r.descFont, '카드 설명 글자가 너무 작다').toBeGreaterThanOrEqual(12);
    expect(r.nameFont, '카드 이름 글자가 너무 작다').toBeGreaterThanOrEqual(16);
    if (r.barTop !== null) {
      expect(r.footerBottom, '하단 고정 플레이어가 푸터를 가린다').toBeLessThanOrEqual(r.barTop + 0.5);
    }
  });
}

test('반응형 — 데스크탑은 폭에 비례해 커진다(1280 < 1920 < 2560)', async ({ page }) => {
  const sizes = [];
  for (const [width, height] of [[1280, 720], [1920, 1080], [2560, 1440]]) {
    await page.setViewportSize({ width, height });
    await settle(page);
    sizes.push(await page.evaluate(() => ({
      h1: parseFloat(getComputedStyle(document.querySelector('h1')).fontSize),
      desc: parseFloat(getComputedStyle(document.querySelector('.desc')).fontSize),
      card: document.querySelector('main .app').getBoundingClientRect().width,
      player: document.querySelector('.player').getBoundingClientRect().width,
    })));
  }
  for (const key of ['h1', 'desc', 'card', 'player']) {
    expect(sizes[0][key], `${key}: 1280 < 1920`).toBeLessThan(sizes[1][key]);
    expect(sizes[1][key], `${key}: 1920 < 2560`).toBeLessThan(sizes[2][key]);
  }
});

// 터치 기기: 모든 조작이 손가락으로 눌러져야 한다. 마우스를 올려야만 보이는 기능은 없다
// (카드의 :hover는 움직임 효과뿐이고 링크는 항상 보인다).
for (const [width, height] of [[360, 800], [768, 1024]]) {
  test.describe(`터치 ${width}px`, () => {
    test.use({ viewport: { width, height }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });

    test('하단 플레이어의 버튼은 36px 이상, 슬라이더 입력 칸은 28px 이상이다', async ({ page }) => {
      await settle(page);
      const r = await page.evaluate(() => ({
        coarse: window.matchMedia('(pointer: coarse)').matches,
        buttons: [...document.querySelectorAll('.player-mobile button')].map((b) => {
          const q = b.getBoundingClientRect();
          return { id: b.id, w: q.width, h: q.height };
        }),
        sliders: [...document.querySelectorAll('.player-mobile input[type=range]')].map((b) => {
          const q = b.getBoundingClientRect();
          return { id: b.id, w: q.width, h: q.height };
        }),
      }));
      expect(r.coarse, '터치 에뮬레이션이 켜져야 한다').toBe(true);
      expect(r.buttons.length).toBeGreaterThanOrEqual(8);
      for (const b of r.buttons) {
        expect(b.w, `${b.id} 폭`).toBeGreaterThanOrEqual(36);
        expect(b.h, `${b.id} 높이`).toBeGreaterThanOrEqual(36);
      }
      expect(r.sliders).toHaveLength(2);
      for (const s of r.sliders) {
        expect(s.h, `${s.id} 입력 칸 높이`).toBeGreaterThanOrEqual(28);
        expect(s.w, `${s.id} 폭`).toBeGreaterThanOrEqual(80);
      }
    });

    test('손가락으로 탭하면 재생·음소거·탐색이 된다', async ({ page }) => {
      await settle(page);
      await page.tap('#playBtnM');
      await expect.poll(() => page.evaluate(() => !document.getElementById('audio').paused)).toBe(true);
      await page.tap('#playBtnM');
      await expect.poll(() => page.evaluate(() => document.getElementById('audio').paused)).toBe(true);

      // 막대 한가운데를 탭하면 그 위치로 탐색된다(3px 막대에서도 28px 칸이라 맞는다).
      const box = await page.locator('#seekM').boundingBox();
      await page.touchscreen.tap(box.x + box.width * 0.5, box.y + box.height / 2);
      await expect
        .poll(() => page.evaluate(() => document.getElementById('audio').currentTime), { timeout: 3000 })
        .toBeGreaterThan(20);
    });
  });
}
