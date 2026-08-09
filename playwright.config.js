// playwright.config.js
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  testDir: './apps',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: process.env.LAYARBACA_PRAPRODUCTION_URL || 'https://layarbaca.app',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'layar-baca-chrome',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /apps\/02_layar_baca\/.*\.spec\.js/,
    },
    {
      name: 'layar-baca-firefox',
      use: { ...devices['Desktop Firefox'] },
      testMatch: /apps\/02_layar_baca\/.*\.spec\.js/,
    },
    {
      name: 'layar-baca-safari',
      use: { ...devices['Desktop Safari'] },
      testMatch: /apps\/02_layar_baca\/.*\.spec\.js/,
    },
  ],
});