import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';

// Load variabel dari file .env
dotenv.config();

test.describe('Pusat Bantuan - Floating Button Flow', () => {

  test('Kirim Pesan ke Admin lewat Floating Button', async ({ page }) => {
    // 1. Buka Halaman Utama (mengambil URL dari .env)
    const targetUrl = process.env.LAYARBACA_PRAPRODUCTION_URL || 'https://layarbaca.app/app/home';
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });

    // 2. Klik Floating Button (Ikon '?' di kanan bawah)
    const floatingBtn = page.locator('button').filter({ has: page.locator('svg') }).last();
    await expect(floatingBtn).toBeVisible({ timeout: 15000 });
    await floatingBtn.click();

    // 3. Pastikan Modal "Pusat Bantuan" muncul & Klik "Belum terjawab? Tanya Admin"
    const tanyaAdminOption = page.getByText(/Belum terjawab\? Tanya Admin/i).first();
    await expect(tanyaAdminOption).toBeVisible({ timeout: 10000 });
    await tanyaAdminOption.click();

    // 4. Pastikan Form Kirim Pesan Terbuka
    const emailInput = page.locator('input[placeholder*="email"]').first();
    const messageInput = page.locator('textarea, input[placeholder*="kendala"]').first();

    await expect(emailInput).toBeVisible({ timeout: 10000 });

    // 5. Isi Email dari .env & Input Pesan
    const userEmail = process.env.TEST_USER_EMAIL || 'angel.akun.test.1@gmail.com';
    await emailInput.fill(userEmail);
    await messageInput.fill('Playwright Testing');

    // 6. Klik Tombol "Kirim Pesan"
    const sendBtn = page.getByRole('button', { name: /Kirim Pesan/i }).first();
    await expect(sendBtn).toBeVisible({ timeout: 10000 });
    await sendBtn.click();

    // 7. Validasi Toast Pesan Berhasil Terkirim (atau penutupan form)
    const successToast = page.getByText(/Berhasil|Terkirim|Pesan kamu telah terkirim/i).first();
    await expect(successToast).toBeVisible({ timeout: 10000 });
  });

});