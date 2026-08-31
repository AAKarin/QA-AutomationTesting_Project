import { test, expect } from '@playwright/test';

test.describe('Pengujian UI dan Lokalisasi', () => {
  test('Uji Fitur Ubah Bahasa (ID <-> EN)', async ({ page }) => {
    // Navigasi ke halaman utama
    await page.goto('https://layarbaca.app/app/home', { waitUntil: 'domcontentloaded' });

    // 1. Validasi State Awal (Bahasa Indonesia)
    await expect(page.getByRole('button', { name: /TONTON/i }).first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/REKOMENDASI SPESIAL UNTUKMU/i)).toBeVisible();
    await expect(page.getByText(/BELI PAKET/i).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Rilis Terbaru' })).toBeVisible();
    await expect(page.getByText(/Cinta tragis Orpheus dan Eurydice terkait/i)).toBeVisible();

    // 2. Klik Tombol Ubah ke Bahasa Inggris
    const btnIndo = page.getByRole('button', { name: '🇮🇩' }); 
    if (await btnIndo.isVisible()) {
        await btnIndo.click();
    } else {
        await page.getByRole('button', { name: 'ID', exact: true }).click();
    }

    // 3. Validasi Perubahan (Bahasa Inggris)
    await expect(page.getByRole('button', { name: /WATCH/i }).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/SPECIAL RECOMMENDATIONS FOR YOU/i)).toBeVisible();
    await expect(page.getByText(/BUY PACKAGE/i).first()).toBeVisible();
    
    // Validasi Bug 1: Memastikan "Rilis Terbaru" menjadi "New Releases", bukan "New Rilis"
    await expect(page.getByRole('heading', { name: 'New Releases' })).toBeVisible({ timeout: 5000 });
    
    // Validasi Bug 2: Memastikan sinopsis bahasa Indonesia tidak lagi tampil di UI bahasa Inggris
    await expect(page.getByText(/Cinta tragis Orpheus dan Eurydice terkait/i)).toBeHidden({ timeout: 5000 });

    // 4. Klik Tombol Kembalikan ke Bahasa Indonesia
    const btnEng = page.getByRole('button', { name: '🇬🇧' });
    if (await btnEng.isVisible()) {
        await btnEng.click();
    } else {
        await page.getByRole('button', { name: 'GB', exact: true }).click();
    }

    // 5. Validasi Kembali ke State Awal
    await expect(page.getByRole('button', { name: /TONTON/i }).first()).toBeVisible({ timeout: 10000 });
  });
});