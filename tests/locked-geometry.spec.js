// LOCKED 설계 결정(CLAUDE.md "LOCKED — 핵심 설계 결정")이 살아있는지 수치로 단언한다.
//
// 스크린샷 비교(visual-snapshot.spec.js)와 짝을 이루는 테스트다. 스크린샷은
// "뭔가 달라졌다"까지만 알려주고 왜 달라졌는지는 못 짚어주는데, 이쪽은 어떤
// 설계 결정이 깨졌는지 이름으로 알려준다. 그리고 이 단언들은 픽셀이 아니라
// 계산된 값이라 OS/렌더러가 달라도 그대로 통하므로 CI에서도 돈다.
import { test, expect } from '@playwright/test';
import { settle } from './helpers.js';

test('LOCKED — 데스크탑 카드 순서·그리드·이음매·반딧불이', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await settle(page);

  // 1) 카드 6개, DOM 순서 고정 (2026-08-26 대표 지정)
  const hrefs = await page.locator('main .app').evaluateAll((els) =>
    els.map((el) => el.getAttribute('href'))
  );
  expect(hrefs).toEqual([
    'https://poster.edutogether.kr',
    'https://voice.edutogether.kr',
    'https://joo.is/같이교육퀴즈',
    'https://edutogether.github.io/classcade/',
    'https://ai-ways-incheon.web.app/',
    'https://googler.edutogether.kr',
  ]);

  // 2) 데스크탑 배치: 윗줄 Poster/Quiz/AI Ways, 아랫줄 Voice/CLASSCADE/Googler.
  //
  // 선언값(grid-template-columns)을 세는 방식은 쓰지 않는다 — grid-auto-flow:column이면
  // 열을 2개로 줄여도 암묵 트랙이 생겨 계산값이 여전히 항목 3개("0px 0px 688px")로
  // 나온다. 실제로 열을 2개로 바꿔놓고 확인해보니 그 방식은 배치가 깨졌는데도 통과했다.
  // 그래서 선언이 아니라 **카드가 실제로 놓인 자리**를 본다.
  const layout = await page.locator('main .app').evaluateAll((els) =>
    els.map((el) => {
      const b = el.getBoundingClientRect();
      return {
        name: el.querySelector('.name').textContent,
        x: Math.round(b.x), y: Math.round(b.y),
        w: Math.round(b.width), right: Math.round(b.right),
      };
    })
  );
  const xs = [...new Set(layout.map((c) => c.x))].sort((a, b) => a - b);
  const ys = [...new Set(layout.map((c) => c.y))].sort((a, b) => a - b);
  expect(xs, '데스크탑은 3열이어야 한다').toHaveLength(3);
  expect(ys, '데스크탑은 2행이어야 한다').toHaveLength(2);

  const rowOf = (y) => layout.filter((c) => c.y === y).sort((a, b) => a.x - b.x);
  expect(rowOf(ys[0]).map((c) => c.name), '윗줄 배치').toEqual([
    'Poster Studio', 'QUIZ TOGETHER', 'AI Ways Incheon',
  ]);
  expect(rowOf(ys[1]).map((c) => c.name), '아랫줄 배치').toEqual([
    'Voice Cinema', 'CLASSCADE', 'Be a Googler',
  ]);

  // 자리 순서만 보면 배치가 무너져도 통과한다 — 열을 2개로 바꿔놓고 확인해보니
  // 카드가 30px 간격으로 겹치고 행 높이가 1072px로 늘어난 상태에서도 이름 순서는
  // 그대로라 위 단언들을 통과했다. 그래서 폭이 균일한지와 서로 겹치지 않는지까지 본다.
  expect(new Set(layout.map((c) => c.w)).size, '카드 폭은 전부 같아야 한다').toBe(1);
  for (const row of [rowOf(ys[0]), rowOf(ys[1])]) {
    for (let i = 0; i < row.length - 1; i++) {
      expect(row[i].right, `${row[i].name} 과 ${row[i + 1].name} 이 겹침`)
        .toBeLessThanOrEqual(row[i + 1].x);
    }
  }

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

test('LOCKED — 카드 썸네일 대체 텍스트가 전환 전과 같다', async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await settle(page);

  // 대체 텍스트는 화면에 그려지지 않아서 스크린샷 비교로도, computed style
  // 대조로도 안 잡힌다. 실제로 리액트 전환 때 카드 제목에서 조립하도록 바꿨다가
  // QUIZ TOGETHER만 "같이교육 퀴즈 미리보기" -> "QUIZ TOGETHER 미리보기"로
  // 바뀐 채 배포된 적이 있다(감사에서 발견). 그래서 값을 여기 고정한다.
  const alts = await page.locator('main .thumb-img').evaluateAll((els) =>
    els.map((el) => el.getAttribute('alt'))
  );
  expect(alts).toEqual([
    'Poster Studio 미리보기',
    'Voice Cinema 미리보기',
    '같이교육 퀴즈 미리보기',
    'CLASSCADE 미리보기',
    'AI Ways Incheon 미리보기',
    'Be a Googler 미리보기',
  ]);
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
  expect(hrefs[0]).toBe('https://poster.edutogether.kr');
  expect(hrefs[5]).toBe('https://googler.edutogether.kr');
});
