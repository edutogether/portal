// 이 저장소는 빌드가 없어서 실제 사이트 로직은 public/index.html 안 인라인
// <script>에 있다(HTML 파서가 필요해 여기선 다루지 않음) — 린트 대상은
// 저장소에 실제로 있는 .js 파일(Playwright 설정/테스트)뿐이다.
const js = require('@eslint/js');

module.exports = [
  js.configs.recommended,
  {
    ignores: ['node_modules/', 'playwright-report/', 'test-results/', '.claude/'],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        require: 'readonly',
        module: 'readonly',
        __dirname: 'readonly',
        process: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
      },
    },
  },
  {
    // Playwright의 page.evaluate(() => {...}) 콜백은 브라우저 컨텍스트에서
    // 실행되므로 document/window를 쓴다.
    files: ['tests/**/*.js', 'playwright.config.js'],
    languageOptions: {
      globals: {
        document: 'readonly',
        window: 'readonly',
        Event: 'readonly',
      },
    },
  },
];
