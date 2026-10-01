import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 *
 * Carga `.env` de la raiz (HEAL_* para el sistema de healing).
 * No sobreescribe variables ya definidas en el entorno: en CI o en un
 * shell con las variables exportadas, esas tienen prioridad.
 */
dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * Workers del runner: 1 en CI, automático en local.
 * `E2E_WORKERS` lo fija (p. ej. `1` cuando el sitio externo está bajo carga).
 */
function envWorkers(): number | undefined {
  const parsed = Number(process.env.E2E_WORKERS)
  if (Number.isFinite(parsed) && parsed > 0) return parsed
  return process.env.CI ? 1 : undefined
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Workers: 1 en CI, automático en local; E2E_WORKERS lo fija. */
  workers: envWorkers(),
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  //reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: 'https://automationexercise.com',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [

    // playwright.config.ts — (https://playwright.dev/docs/test-projects, https://playwright.dev/docs/test-configuration)
{ name: 'setup', testMatch: /.*\.setup\.spec\.ts/ },
{ name: 'chromium-guest', testIgnore: [/e2e_auth\/.*\.spec\.ts/, /setup\/.*\.spec\.ts/], use: { ...devices['Desktop Chrome'] } },
{ name: 'chromium-logged', testIgnore: [/e2e_guest\/.*\.spec\.ts/, /setup\/.*\.spec\.ts/], use: { ...devices['Desktop Chrome'], storageState: 'tests/playwright/.auth/user.json' }, dependencies: ['setup'] },
    /*
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    */
    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
