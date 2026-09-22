import { test, expect } from '@playwright/test';
import { setupAdBlocker } from '../../../utils/ad_blocker.js';

test.describe('Pengujian UI dan Lokalisasi', () => {
  test('Uji Fitur Ubah Bahasa (ID <-> EN)', async ({ page }) => {
    test.setTimeout(90000);
    await setupAdBlocker(page);

    // Navigasi ke halaman utama
    await page.goto('https://layarbaca.app/app/home', { waitUntil: 'domcontentloaded', timeout: 45000 });

    // 1. Validasi State Awal (Bahasa Indonesia)
    const btnIndo = page.locator('button[title*="English"], button:has-text("🇮🇩")').first();
    await expect(btnIndo).toBeVisible({ timeout: 20000 });
    await expect(page.getByText(/Install Aplikasi/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/BELI PAKET/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/AWAL/i).first()).toBeVisible({ timeout: 10000 });

    // 2. Klik Tombol Ubah ke Bahasa Inggris
    await btnIndo.click({ force: true });

    // 3. Validasi Perubahan (Bahasa Inggris)
    const btnEng = page.locator('button[title*="Indonesia"], button:has-text("🇬🇧")').first();
    await expect(btnEng).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Install App/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/BUY PACKAGE/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/HOME/i).first()).toBeVisible({ timeout: 10000 });

    // 4. Klik Tombol Kembalikan ke Bahasa Indonesia
    await btnEng.click({ force: true });

    // 5. Validasi Kembali ke State Awal (Bahasa Indonesia)
    await expect(btnIndo).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Install Aplikasi/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/AWAL/i).first()).toBeVisible({ timeout: 10000 });
  });
});