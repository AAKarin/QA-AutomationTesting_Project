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
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    // AIKreativ Project
    {
      name: 'aikreativ-chrome',
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: process.env.AIKREATIV_PRAPRODUCTION_URL || 'https://pra-production.aikreativ.app',
      },
      testMatch: /apps\/01_aikreativ\/.*\.spec\.js/,
    },
    {
      name: 'aikreativ-firefox',
      use: { 
        ...devices['Desktop Firefox'],
        baseURL: process.env.AIKREATIV_PRAPRODUCTION_URL || 'https://pra-production.aikreativ.app',
      },
      testMatch: /apps\/01_aikreativ\/.*\.spec\.js/,
    },
    {
      name: 'aikreativ-safari',
      use: { 
        ...devices['Desktop Safari'],
        baseURL: process.env.AIKREATIV_PRAPRODUCTION_URL || 'https://pra-production.aikreativ.app',
      },
      testMatch: /apps\/01_aikreativ\/.*\.spec\.js/,
    },
    {
      name: 'aikreativ-google-chrome',
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: process.env.AIKREATIV_PRAPRODUCTION_URL || 'https://pra-production.aikreativ.app',
      },
      testMatch: /apps\/01_aikreativ\/.*\.spec\.js/,
    },
    // Layar Baca Project
    {
      name: 'layar-baca-chrome',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /apps\/02_layar_baca\/.*\.spec\.js/,
    },
    {
      name: 'layar-baca-google-chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' }, // Menggunakan Google Chrome asli
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
    // Panen Kunci Project
    {
      name: 'panen-kunci-chrome',
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: process.env.BASE_URL_PANEN_KUNCI || 'https://prototipe-panen-kunci.vercel.app/',
      },
      testMatch: /apps\/03_panen_kunci\/.*\.spec\.js/,
    },
    {
      name: 'panen-kunci-google-chrome',
      use: { 
        ...devices['Desktop Chrome'], channel: 'chrome',
        baseURL: process.env.BASE_URL_PANEN_KUNCI || 'https://prototipe-panen-kunci.vercel.app/',
      },
      testMatch: /apps\/03_panen_kunci\/.*\.spec\.js/,
    },
    {
      name: 'panen-kunci-firefox',
      use: { 
        ...devices['Desktop Firefox'],
        baseURL: process.env.BASE_URL_PANEN_KUNCI || 'https://prototipe-panen-kunci.vercel.app/',
      },
      testMatch: /apps\/03_panen_kunci\/.*\.spec\.js/,
    },
    {
      name: 'panen-kunci-safari',
      use: { 
        ...devices['Desktop Safari'],
        baseURL: process.env.BASE_URL_PANEN_KUNCI || 'https://prototipe-panen-kunci.vercel.app/',
      },
      testMatch: /apps\/03_panen_kunci\/.*\.spec\.js/,
    },
    // Ruang Kreativ Project
    {
      name: 'ruang-kreativ-chrome',
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: process.env.RUANGKREATIV_URL || 'http://localhost:3000',
      },
      testMatch: /apps\/05_ruang_kreativ\/.*\.spec\.js/,
    },
    {
      name: 'ruang-kreativ-google-chrome',
      use: { 
        ...devices['Desktop Chrome'], channel: 'chrome',
        baseURL: process.env.RUANGKREATIV_URL || 'http://localhost:3000',
      },
      testMatch: /apps\/05_ruang_kreativ\/.*\.spec\.js/,
    },
    {
      name: 'ruang-kreativ-firefox',
      use: { 
        ...devices['Desktop Firefox'],
        baseURL: process.env.RUANGKREATIV_URL || 'http://localhost:3000',
      },
      testMatch: /apps\/05_ruang_kreativ\/.*\.spec\.js/,
    },
    {
      name: 'ruang-kreativ-safari',
      use: { 
        ...devices['Desktop Safari'],
        baseURL: process.env.RUANGKREATIV_URL || 'http://localhost:3000',
      },
      testMatch: /apps\/05_ruang_kreativ\/.*\.spec\.js/,
    }
  ],
});