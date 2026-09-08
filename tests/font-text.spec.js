// 실제로 화면에 그려지는 텍스트를 통째로 뽑아 파일로 남긴다.
// scripts/check-font-coverage.py가 이 파일을 읽어서 Pretendard 서브셋 커버리지를 본다.
//
// 왜 소스를 훑지 않고 렌더된 DOM에서 뽑는가: 빌드 후에는 문구가 번들된 JS 안의
// 문자열 리터럴로 흩어져 있어서, 소스나 번들을 정규식으로 훑으면 코드 식별자와 주석
// 글자까지 "사용 글자"로 잡힌다. 이 저장소는 예전에 정확히 그 버그를 겪었다(주석 속
// 단어가 사용 글자로 잡혀 서브셋이 오염됨). 렌더된 DOM에는 그런 오염이 없다.
//
// textContent를 쓰는 이유(innerText가 아니라): 모바일 전용 축약 문구(.desc .short)처럼
// 지금 화면에서는 숨겨져 있지만 다른 화면 폭에서는 실제로 그려지는 텍스트까지 포함해야
// 한다. innerText는 숨겨진 요소를 빼버린다.
import { test } from '@playwright/test';
import { settle } from './helpers.js';
import { mkdirSync, writeFileSync } from 'node:fs';

// DOM에 처음부터 들어있지 않은, 코드가 상황에 따라 보여주는 문구.
// 사용자에게 보이는 새 문구를 코드에 추가했는데 초기 DOM에는 안 나온다면 여기 적을 것.
const DYNAMIC_STRINGS = [
  '재생할 수 없습니다', // 오디오 로드/재생 실패 토스트
];

test('@fonttext 렌더된 텍스트를 폰트 커버리지 검사용으로 덤프한다', async ({ page }) => {
  await settle(page);
  const rendered = await page.evaluate(() => document.body.textContent ?? '');
  mkdirSync('test-results', { recursive: true });
  writeFileSync(
    'test-results/rendered-text.txt',
    rendered + '\n' + DYNAMIC_STRINGS.join('\n'),
    'utf-8'
  );
});
