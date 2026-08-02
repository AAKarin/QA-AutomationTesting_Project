// apps/01_aikreativ/chaos_api.spec.js
import { test, expect } from '@playwright/test';
import { CHAOS_PAYLOADS } from '../../utils/chaos_prompts.js';
import dotenv from 'dotenv';

dotenv.config();

test.describe('AIKreativ Staging - Chaos & Stress Test', () => {

  test.beforeEach(async ({ page }) => {
    // Tinggal ganti variabel di sini kalau mau pindah dari STAGING ke PREPROD!
    const targetUrl = process.env.AIKREATIV_STAGING_URL || 'https://staging.aikreativ.app/';
    
    console.log(`🎯 Testing on Target URL: ${targetUrl}`);
    await page.goto(targetUrl);
  });

  test('Injeksi Payload Ekstrem ke Input Prompt AI', async ({ page }) => {
    // 1. Pantau respon network untuk mendeteksi crash server (HTTP 500/502/504)
    page.on('response', response => {
      if (response.status() >= 500) {
        console.log(`🚨 SERVER CRASH DETECTED! Status: ${response.status()} pada URL: ${response.url()}`);
      }
    });

    // Combined payloads
    const testPayloads = [...CHAOS_PAYLOADS.numericOverflow, ...CHAOS_PAYLOADS.codeInjections];

    // Locators (Dapat disesuaikan dengan selector elemen riil web staging)
    const promptInput = page.locator('textarea, input[type="text"]').first();
    const generateBtn = page.locator('button:has-text("Generate"), button[type="submit"]').first();

    for (const payload of testPayloads) {
      console.log(`🚀 Sending Payload: ${payload.substring(0, 30)}...`);

      // Ketik payload ke prompt & klik generate
      await promptInput.fill(payload);
      
      if (await generateBtn.isVisible()) {
        await generateBtn.click();
      }

      await page.waitForTimeout(1500); // Jeda singkat

      // Validasi: Aplikasi tidak boleh "White Screen of Death" (Blank)
      const isBodyVisible = await page.locator('body').isVisible();
      expect(isBodyVisible).toBe(true);
    }
  });

});