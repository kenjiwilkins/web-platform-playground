import { defineConfig, devices } from '@playwright/test';

/**
 * 安定版ブラウザ（chromium / firefox / webkit）で全 Playground を実行する。
 * PRERELEASE=1 のときは Chrome Beta だけで実行する（夜間ジョブ。結果は情報として扱い、マージは止めない）。
 */
const prerelease = process.env.PRERELEASE === '1';

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [
        ['github'],
        ['html', { open: 'never' }],
        ['json', { outputFile: 'test-results/results.json' }],
      ]
    : 'list',
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'retain-on-failure',
  },
  projects: prerelease
    ? [{ name: 'chrome-beta', use: { ...devices['Desktop Chrome'], channel: 'chrome-beta' } }]
    : [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
        { name: 'webkit', use: { ...devices['Desktop Safari'] } },
      ],
  webServer: [
    {
      command: 'node tools/serve-static.mjs apps/web/dist 4321',
      url: 'http://localhost:4321',
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'pnpm --filter @wpp/sandbox preview',
      url: 'http://localhost:4322/runner.js',
      reuseExistingServer: !process.env.CI,
    },
  ],
});
