import { readFileSync } from 'node:fs';
import process from 'node:process';
import console from 'node:console';

const expected = "53 23 * * *"; // 한국 시간 매일 08:53, UTC 전날 23:53.
const check = (source) => {
  const schedules = [...source.matchAll(/^\s*-\s*cron:\s*['"]([^'"]+)['"]\s*$/gm)];
  return schedules.length === 1 && schedules[0][1] === expected;
};

if (process.argv.includes('--self-test')) {
  if (!check(`    - cron: '${expected}'`) || check("    - cron: '0 0 * * *'")) {
    throw new Error('예약 검사기의 정상 · 오류 판정이 실패했습니다.');
  }
  console.log('예약 검사기 정상 · 오류 판정 통과');
} else if (!check(readFileSync('.github/workflows/link-healthcheck.yml', 'utf8'))) {
  throw new Error('링크 헬스체크 예약이 한국 시간 08:53과 다릅니다.');
} else {
  console.log('링크 헬스체크 예약: 한국 시간 08:53');
}
