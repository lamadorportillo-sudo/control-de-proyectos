const { defineConfig } = require('@playwright/test');

const manualSimulation = process.env.CC_MANUAL_SIM === '1';

module.exports = defineConfig({
  testDir: './tests',
  // La validación arquitectónica debe incluir todos los escenarios críticos que
  // los workflows invocan explícitamente. Playwright aplica testMatch incluso
  // cuando se pasan archivos por CLI; omitirlos aquí produciría un falso verde.
  testMatch: manualSimulation
    ? /manual-project-entry-simulation\.spec\.cjs/
    : /(?:.*responsive.*|architecture-auth-boot|admin-mfa-enforcement-browser|contract-explicit-rules-browser|contract-document-safety-browser)\.spec\.cjs/,
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
