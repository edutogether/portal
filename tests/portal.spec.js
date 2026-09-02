// @ts-check
const { test, expect } = require('@playwright/test');

// player.spec.js는 뮤직 플레이어 로직 회귀만 다룬다. 이 파일은 그 바깥,
// 포털 자체의 핵심 계약(카드가 맞는 곳으로 연결되는지, 자동재생이 소리
// 없이 시작하는지, 동작 줄이기 설정을 지키는지)이 조용히 깨지는 걸 잡는다
// — 전부 이번 세션에 추가/변경됐는데 자동 테스트가 없던 항목들
// (2026-09-01 감사에서 발견).

const EXPECTED_CARDS = [
  { name: 'Poster Studio', href: 'https://poster-studio.web.app' },
  { name: 'Voice Cinema', href: 'https://voice-cinema.web.app' },
  { name: 'QUIZ TOGETHER', href: 'https://joo.is/같이교육퀴즈' },
  { name: 'CLASSCADE', href: 'https://edutogether.github.io/classcade/' },
  { name: 'AI Ways Incheon', href: 'https://edutogether.github.io/aiways-incheon/' },
  { name: 'Be a Googler', href: 'https://g00gler.web.app/' },
];

test('6개 카드가 정확한 URL로, 새 탭(target=_blank, rel=noopener)으로 연결된다', async ({ page }) => {
  await page.goto('/');
  const cards = page.locator('.app');
  await expect(cards).toHaveCount(EXPECTED_CARDS.length);

  for (let i = 0; i < EXPECTED_CARDS.length; i++) {
    const card = cards.nth(i);
    await expect(card.locator('.name')).toHaveText(EXPECTED_CARDS[i].name);
    await expect(card).toHaveAttribute('href', EXPECTED_CARDS[i].href);
    await expect(card).toHaveAttribute('target', '_blank');
    await expect(card).toHaveAttribute('rel', 'noopener noreferrer');
  }
});

test('자동재생은 항상 음소거 상태로 시작한다 (브라우저 정책 편차와 무관하게)', async ({ page }) => {
  await page.goto('/');
  const muted = await page.evaluate(() => {
    const audio = document.getElementById('audio');
    return audio ? audio.muted : null;
  });
  expect(muted).toBe(true);
});

test('OS의 동작 줄이기(prefers-reduced-motion) 설정이 켜지면 반딧불이 애니메이션이 정지한다', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const mote = page.locator('.motes i').first();
  await expect(mote).toHaveCSS('animation-name', 'none');
});

test('동작 줄이기 설정이 꺼져 있으면 반딧불이 애니메이션이 정상 작동한다', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const mote = page.locator('.motes i').first();
  await expect(mote).not.toHaveCSS('animation-name', 'none');
});

test('카드 6개 전부 소개 문구가 비어있지 않고, 느낌표/물음표 앞에 띄어쓰기 규칙을 지킨다', async ({ page }) => {
  await page.goto('/');
  const descs = await page.locator('.app .desc').allTextContents();
  expect(descs).toHaveLength(EXPECTED_CARDS.length);
  for (const text of descs) {
    expect(text.trim().length).toBeGreaterThan(0);
    // 대표 표준 규칙: !/? 앞에는 항상 띄어쓰기. 문장 끝(마지막 글자)이거나
    // 뒤에 공백/줄바꿈이 있으면 통과, 붙어있으면 실패.
    const badSpacing = text.match(/\S[!?]/g);
    expect(badSpacing, `"${text}"에 띄어쓰기 없는 !/?가 있음`).toBeNull();
  }
});
