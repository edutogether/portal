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

// 2026-09-10에 og:image 메타 태그와 og/portal.jpg 파일을 추가했는데, 파일이
// 지워지거나 경로가 바뀌어도 잡아주는 검사가 하나도 없었다(2026-09-10 감사에서
// 발견) — 메타 태그의 문자열과 실제 배포 산출물이 다른 것이었을 뿐이라 코드
// 리뷰로는 안 잡히고, 카카오톡 공유 카드가 조용히 깨진 뒤에야 드러났을 것이다.
test('og:image가 가리키는 파일이 실제로 존재하고 응답한다', async ({ page, request }) => {
  await page.goto('/');
  const content = await page.locator('meta[property="og:image"]').getAttribute('content');
  expect(content, 'og:image 메타 태그가 있어야 한다').toBeTruthy();

  const url = new URL(content);
  const res = await request.get(url.pathname);
  expect(res.status(), `${url.pathname} 응답 코드`).toBe(200);
  expect(res.headers()['content-type'], 'JPEG여야 한다 — 카카오톡이 webp를 못 씀').toContain('image/jpeg');
});

// COMMON_STANDARDS §27(2026-09-11) — 스플래시는 자기 반복 애니메이션이 최소
// 두 바퀴 도는 동안 떠 있어야 한다. 상수(MIN_SHOW_MS)를 넣은 것만으로는
// 부족하다 — 다른 경로(예: assetsReady가 그보다 먼저 끝나는 조건)가 실제로는
// 상수보다 먼저 끊는지 실측해야 한다. 그래서 자산 지연을 걸지 않은
// 빠른(캐시 있는 재방문에 해당) 조건에서, 로더가 DOM에 나타난 시각과
// `.done` 클래스가 붙는 시각을 페이지 안에서 performance.now()로 직접 재서
// 비교한다 — 바깥에서 page.goto() 앞뒤로 재면 내비게이션 시간이 섞여
// 실제보다 길게 나와 하한이 깨져도 통과할 수 있다.
test('로딩 화면은 반복 애니메이션이 최소 두 바퀴(3200ms) 도는 동안 떠 있는다 (COMMON_STANDARDS §27)', async ({ page }) => {
  await page.addInitScript(() => {
    window.__loaderTiming = { mountTime: null, doneTime: null };
    const record = () => {
      const el = document.getElementById('loader');
      if (!el) return;
      if (window.__loaderTiming.mountTime === null) {
        window.__loaderTiming.mountTime = performance.now();
      }
      if (el.classList.contains('done') && window.__loaderTiming.doneTime === null) {
        window.__loaderTiming.doneTime = performance.now();
      }
    };
    // document.documentElement은 addInitScript 실행 시점엔 아직 없다(<html>이
    // 파싱되기 전) — document 자신은 항상 있으므로 그걸 관찰 대상으로 쓴다.
    new MutationObserver(record).observe(document, {
      childList: true, subtree: true, attributes: true, attributeFilter: ['class'],
    });
  });

  // 한 번 미리 방문해 브라우저 캐시를 데운다 — "캐시가 다 있는 재방문 상태,
  // 스로틀 없이" 조건(§27)을 맞추기 위함. 느린 조건에서만 재면 assetsReady가
  // 늦게 끝나 하한(MIN_SHOW_MS)이 실제로 안 걸려도 통과해버린다.
  await page.goto('/');
  await page.waitForSelector('#loader.done');

  await page.goto('/');
  await page.waitForFunction(() => window.__loaderTiming?.doneTime !== null, { timeout: 10000 });
  const timing = await page.evaluate(() => window.__loaderTiming);
  const visibleMs = timing.doneTime - timing.mountTime;
  expect(visibleMs, '로딩 화면이 화면에 떠 있던 실제 시간(ms)').toBeGreaterThanOrEqual(3200);
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
