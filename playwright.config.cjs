const { defineConfig } = require('@playwright/test');

const manualSimulation = process.env.CC_MANUAL_SIM === '1';

module.exports = defineConfig({
  testDir: './tests',
  // La validación arquitectónica forma parte del navegador real aunque no lleve
  // "responsive" en el nombre. Mantenerla aquí evita el falso verde de un
  // workflow que instala Chromium pero termina con "No tests found".
  testMatch: manualSimulation
    ? /manual-project-entry-simulation\.spec\.cjs/
    : /(?:.*responsive.*|architecture-auth-boot)\.spec\.cjs/,
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