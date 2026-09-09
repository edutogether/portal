// @ts-check
import { test, expect } from '@playwright/test';

// player.spec.js는 뮤직 플레이어 로직 회귀만 다룬다. 이 파일은 그 바깥,
// 포털 자체의 핵심 계약(카드가 맞는 곳으로 연결되는지, 자동재생이 소리
// 없이 시작하는지, 동작 줄이기 설정을 지키는지)이 조용히 깨지는 걸 잡는다
// — 전부 이번 세션에 추가/변경됐는데 자동 테스트가 없던 항목들
// (2026-09-01 감사에서 발견).

const EXPECTED_CARDS = [
  { name: 'Poster Studio', href: 'https://poster.edutogether.kr' },
  { name: 'Voice Cinema', href: 'https://voice.edutogether.kr' },
  { name: 'QUIZ TOGETHER', href: 'https://joo.is/같이교육퀴즈' },
  { name: 'CLASSCADE', href: 'https://classcade.edutogether.kr' },
  { name: 'AI Ways Incheon', href: 'https://incheon.edutogether.kr' },
  { name: 'Be a Googler', href: 'https://googler.edutogether.kr' },
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

// 2026-08-31에는 반대로 "항상 음소거로 시작"이 사양이었다. 2026-09-09에 대표가
// 뒤집었다 — 사람이 직접 주소를 치거나 북마크로 들어오면 소리가 나야 한다.
// 배경과 두 결정의 이유는 .claude/rules/app.md에 있다.
//
// audio.muted를 단언하지 않는 이유: 이 앱은 소리를 volume 하나로만 다루고 muted는
// 아예 쓰지 않는다. 그리고 muted는 리액트에서 속성이 아니라 DOM 프로퍼티로 들어가서
// hasAttribute('muted')로 보면 실제 값과 다르게 나온다 — 프로퍼티로 읽어야 한다.
test('방문하면 음소거가 아니고, 볼륨이 정착값(0.5)까지 올라온다 (2026-09-09 대표 지시)', async ({ page }) => {
  await page.goto('/');
  await expect
    .poll(() => page.evaluate(() => document.getElementById('audio').volume), { timeout: 5000 })
    .toBeCloseTo(0.5, 2);

  const state = await page.evaluate(() => {
    const audio = document.getElementById('audio');
    return {
      mutedProperty: audio.muted,
      mutedAttribute: audio.hasAttribute('muted'),
      sliderValue: Number(document.getElementById('vol').value),
    };
  });
  expect(state.mutedProperty, '음소거로 시작하면 안 된다').toBe(false);
  expect(state.mutedAttribute, 'muted 속성 자체를 쓰지 않는다').toBe(false);
  expect(state.sliderValue, '볼륨바도 같은 값을 가리켜야 한다').toBeCloseTo(0.5, 2);
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

test('로딩 화면은 진행 바 애니메이션이 끝나도 실제 페이지 로드가 끝나기 전엔 사라지지 않는다 (2026-09-03 회귀버그)', async ({ page }) => {
  // 예전엔 진행 바 애니메이션(2.1s)만 끝나면 실제 로딩 상태와 무관하게
  // 로딩 화면이 사라져서, 느린 회선에서 아직 다 안 그려진 메인 화면이
  // 그림자처럼 비쳐 보였다. bg-main.webp를 인위적으로 오래 지연시켜, 바
  // 애니메이션이 끝난 지 한참 지난 시점에도 아직 떠 있고, 이미지가 도착해
  // 로드가 끝난 뒤에야 사라지는지 확인한다. CI 러너는 로컬보다 느리고
  // 스케줄링 지터가 커서, 애니메이션(2.1s) 직후 여유를 짧게 두면 그 지터만
  // 으로 이 테스트가 흔들릴 수 있어 여유를 넉넉히 잡는다(2026-09-02 최초
  // 버전은 2.3s/3s로 CI에서 실제로 흔들렸음).
  await page.route('**/assets/bg-main.webp', async (route) => {
    await new Promise((r) => setTimeout(r, 6000));
    await route.continue();
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  await page.waitForTimeout(4000); // 바 애니메이션(2.1s)은 진작 끝났지만 이미지는 아직 로딩 중(6s 지연)
  const stillShowing = await page.evaluate(
    () => !document.getElementById('loader').classList.contains('done')
  );
  expect(stillShowing, '아직 페이지 로드가 안 끝났는데 로딩 화면이 벌써 사라짐').toBe(true);

  await expect
    .poll(() => page.evaluate(() => document.getElementById('loader').classList.contains('done')), {
      timeout: 10000,
    })
    .toBe(true);
});
