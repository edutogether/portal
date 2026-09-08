// 화면을 결정적으로 만든다 — 로더가 사라질 때까지 기다리고, 오디오를 정지시켜
// 가사 스크롤 위치를 0으로 고정하고, 폰트 로드를 기다린다. 이걸 안 하면
// 스크린샷이 매번 미세하게 달라져서 비교 자체가 불가능하다.
async function settle(page) {
  await page.goto('/');
  await page.locator('#loader.done').waitFor({ state: 'attached', timeout: 12000 });
  await page.evaluate(async () => {
    const audio = document.getElementById('audio');
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    await document.fonts.ready;
  });
  // seeked -> 가사 스크롤 위치 재계산이 반영될 시간.
  await page.waitForTimeout(250);
}

export { settle };
