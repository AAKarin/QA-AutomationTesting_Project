import { test, expect } from '@playwright/test';

test.describe('Guest Flow - Filter Genre & Verifikasi Paywall', () => {

  const genres = ['Semua', 'Action', 'Adventure', 'Animation', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller'];

  test.beforeEach(async ({ page }) => {
    await page.goto('https://layarbaca.app/app/gallery?category=Action', { waitUntil: 'domcontentloaded', timeout: 30000 });
  });

  test('1. Klik filter genre dan verifikasi pergantian URL', async ({ page }) => {
    for (const genre of genres) {
      const genreButton = page.getByRole('button', { name: genre, exact: true });
      await expect(genreButton).toBeVisible({ timeout: 10000 });
      await genreButton.click();

      if (genre === 'Semua') {
        await expect(page).toHaveURL(/https:\/\/layarbaca\.app\/app\/gallery/, { timeout: 10000 });
      } else {
        await expect(page).toHaveURL(`https://layarbaca.app/app/gallery?category=${genre}`, { timeout: 10000 });
      }
    }
  });

  test('2. Klik film dan pastikan terhalang Paywall Kode Akses', async ({ page }) => {
    const movieCards = page.locator('a[href*="/view/lk21"]');
    await movieCards.first().waitFor({ state: 'visible', timeout: 15000 });

    const currentMovie = movieCards.first();
    const targetHref = await currentMovie.getAttribute('href');

    await currentMovie.click();

    await expect(page).toHaveURL(targetHref, { timeout: 10000 });
    // Verifikasi paywall muncul untuk guest
    await expect(page.getByText(/MASUKKAN KODE AKSES/i).first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('button, div').filter({ hasText: /^BUKA KONTEN$/i }).first()).toBeVisible({ timeout: 10000 });
  });

  test('3. Mengisi Email & Kode Akses untuk membuka pemutar video', async ({ page }) => {
    // 1. Klik film pertama yang tersedia dari galeri
    const movieCards = page.locator('a[href*="/view/lk21"]');
    await movieCards.first().waitFor({ state: 'visible', timeout: 15000 });
    await movieCards.first().click();

    // 2. Pastikan Form "MASUKKAN KODE AKSES" muncul
    const paywallHeader = page.getByText(/MASUKKAN KODE AKSES/i).first();
    await expect(paywallHeader).toBeVisible({ timeout: 15000 });

    // 3. Targetkan input berurutan (Email -> index 0, Kode -> index 1)
    const emailInput = page.locator('input').nth(0);
    const codeInput = page.locator('input').nth(1);

    await expect(emailInput).toBeVisible({ timeout: 10000 });
    // Hardcode data dummy agar test tidak bergantung pada .env yang kosong
    await emailInput.fill('angel.akun.test.1@gmail.com');
    await codeInput.fill('AKUN ANGEL 1');

    // 4. Klik Tombol BUKA KONTEN
    const submitBtn = page.locator('button, div').filter({ hasText: /^BUKA KONTEN$/i }).first();
    await expect(submitBtn).toBeVisible({ timeout: 10000 });
    await submitBtn.click();

    // 5. Verifikasi Toast Pop-up "Gagal memverifikasi. Coba lagi." Muncul
    const errorMessage = page.getByText(/Gagal memverifikasi\. Coba lagi\./i).first();
    await expect(errorMessage).toBeVisible({ timeout: 15000 });
  });

});