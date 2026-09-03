const { defineConfig } = require('@playwright/test');

const manualSimulation = process.env.CC_MANUAL_SIM === '1';

module.exports = defineConfig({
  testDir: './tests',
  testMatch: manualSimulation ? /manual-project-entry-simulation\.spec\.cjs/ : /.*responsive.*\.spec\.cjs/,
  timeout: 90000,
  expect: { timeout: 12000 },
  fullyParallel: false,
  retries: 1,
  workers: 1,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    browserName: 'chromium',
    headless: true,
    ignoreHTTPSErrors: true,
    actionTimeout: 12000,
    navigationTimeout: 60000,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
});