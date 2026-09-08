// LOCKED 설계 결정(CLAUDE.md "LOCKED — 핵심 설계 결정")이 살아있는지 수치로 단언한다.
//
// 스크린샷 비교(visual-snapshot.spec.js)와 짝을 이루는 테스트다. 스크린샷은
// "뭔가 달라졌다"까지만 알려주고 왜 달라졌는지는 못 짚어주는데, 이쪽은 어떤
// 설계 결정이 깨졌는지 이름으로 알려준다. 그리고 이 단언들은 픽셀이 아니라
// 계산된 값이라 OS/렌더러가 달라도 그대로 통하므로 CI에서도 돈다.
const { test, expect } = require('@playwright/test');
const { settle } = require('./helpers');

test('LOCKED — 데스크탑 카드 순서·그리드·이음매·반딧불이', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await settle(page);

  // 1) 카드 6개, DOM 순서 고정 (2026-08-26 대표 지정)
  const hrefs = await page.locator('main .app').evaluateAll((els) =>
    els.map((el) => el.getAttribute('href'))
  );
  expect(hrefs).toEqual([
    'https://poster-studio.web.app',
    'https://voice-cinema.web.app',
    'https://joo.is/같이교육퀴즈',
    'https://edutogether.github.io/classcade/',
    'https://edutogether.github.io/aiways-incheon/',
    'https://g00gler.web.app/',
  ]);

  // 2) 데스크탑 그리드 3열 x 2행, 열 우선 채우기
  const grid = await page.locator('main').evaluate((el) => {
    const s = getComputedStyle(el);
    return {
      cols: s.gridTemplateColumns.split(' ').length,
      rows: s.gridTemplateRows.split(' ').length,
      flow: s.gridAutoFlow,
    };
  });
  expect(grid.cols).toBe(3);
  expect(grid.rows).toBe(2);
  expect(grid.flow).toContain('column');

  // 3) 플레이어-그리드 이음매가 페이지 중심선과 일치 (2026-08-26, 실측 diff=0)
  const seam = await page.evaluate(() => {
    const player = document.querySelector('.player');
    const main = document.querySelector('.stage main');
    const mid = (player.getBoundingClientRect().right + main.getBoundingClientRect().left) / 2;
    return Math.abs(mid - window.innerWidth / 2);
  });
  expect(seam).toBeLessThan(1);

  // 4) 반딧불이 200개 (대표가 100->150->200으로 직접 올린 값)
  await expect(page.locator('#motes > i')).toHaveCount(200);

  // 5) 번호 뱃지는 완전히 제거된 상태 (되살리지 말 것)
  await expect(page.locator('.badge')).toHaveCount(0);

  // 6) 앱 링크는 전부 새 탭 + rel 보안 속성 (각 앱에 "돌아가기" 버튼을 안 넣어도
  //    되게 만드는 구조적 전제라 절대 바뀌면 안 된다)
  const linkAttrs = await page.locator('main .app').evaluateAll((els) =>
    els.map((el) => ({ t: el.getAttribute('target'), r: el.getAttribute('rel') }))
  );
  for (const a of linkAttrs) {
    expect(a.t).toBe('_blank');
    expect(a.r).toContain('noopener');
    expect(a.r).toContain('noreferrer');
  }
});

test('LOCKED — 플레이어 높이가 카드 위쪽 2행에 맞춰진다', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await settle(page);

  // 그리드가 정확히 3열x2행(카드 6개 전부)이라 위쪽 2행 높이 = 그리드 전체 높이와
  // 같아진다. "그리드 전체에 맞추는" 구현으로 단순화하면 카드 행이 늘 때 플레이어도
  // 같이 길어지는 원래 사고가 재발하므로, 여기선 결과값이 일치하는지만 본다.
  const diff = await page.evaluate(() => {
    const player = document.querySelector('.player');
    const main = document.querySelector('.stage main');
    return Math.abs(
      player.getBoundingClientRect().height - main.getBoundingClientRect().height
    );
  });
  expect(diff).toBeLessThan(2);
});

test('LOCKED — 모바일에서 하단 고정 플레이어로 전환되고 1열이 된다', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await settle(page);

  await expect(page.locator('#playerMobile')).toBeVisible();
  await expect(page.locator('.player')).toBeHidden();

  const cols = await page.locator('main').evaluate(
    (el) => getComputedStyle(el).gridTemplateColumns.split(' ').length
  );
  expect(cols).toBe(1);

  // 모바일에서도 카드 DOM 순서는 데스크탑과 같아야 한다.
  const hrefs = await page.locator('main .app').evaluateAll((els) =>
    els.map((el) => el.getAttribute('href'))
  );
  expect(hrefs[0]).toBe('https://poster-studio.web.app');
  expect(hrefs[5]).toBe('https://g00gler.web.app/');
});
