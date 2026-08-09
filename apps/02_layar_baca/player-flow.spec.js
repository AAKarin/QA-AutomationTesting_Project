// apps/player-flow-guest.spec.js
import { test, expect } from '@playwright/test';

test.describe('Guest Flow - Filter Genre & Verifikasi Paywall', () => {

  const genres = ['Semua', 'Action', 'Adventure', 'Animation', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller'];

  test.beforeEach(async ({ page }) => {
    await page.goto('https://layarbaca.app/app/gallery?category=Action', { waitUntil: 'domcontentloaded' });
  });

  test('1. Klik filter genre dan verifikasi pergantian URL', async ({ page }) => {
    for (const genre of genres) {
      const genreButton = page.getByRole('button', { name: genre, exact: true });
      await expect(genreButton).toBeVisible();
      await genreButton.click();
      await page.waitForTimeout(300);

      if (genre === 'Semua') {
        await expect(page).toHaveURL(/https:\/\/layarbaca\.app\/app\/gallery/);
      } else {
        await expect(page).toHaveURL(`https://layarbaca.app/app/gallery?category=${genre}`);
      }
    }
  });

  test('2. Klik film dan pastikan terhalang Paywall Kode Akses', async ({ page }) => {
    const movieCards = page.locator('a[href*="/view/lk21"]');
    await movieCards.first().waitFor({ state: 'visible', timeout: 10000 });

    const currentMovie = movieCards.first();
    const targetHref = await currentMovie.getAttribute('href');

    await currentMovie.click();

    await expect(page).toHaveURL(targetHref);
    // Verifikasi paywall muncul untuk guest
    await expect(page.locator('text=MASUKKAN KODE AKSES')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: 'BUKA KONTEN' })).toBeVisible();
  });

  test('3. Mengisi Email & Kode Akses untuk membuka pemutar video', async ({ page }) => {
    const email = process.env.TEST_USER_EMAIL;
    const accessCode = process.env.TEST_USER_PASSWORD;

    // 1. Masuk ke halaman gallery
    await page.goto('https://layarbaca.app/app/gallery?category=Action', { waitUntil: 'domcontentloaded' });

    // 2. Klik film pertama yang tersedia
    const movieCards = page.locator('a[href*="/view/lk21"]');
    await movieCards.first().waitFor({ state: 'visible', timeout: 10000 });
    await movieCards.first().click();

    // 3. Pastikan Form "MASUKKAN KODE AKSES" muncul
    const paywallHeader = page.locator('text=MASUKKAN KODE AKSES');
    await expect(paywallHeader).toBeVisible({ timeout: 10000 });

    // 4. Isi Form Email dan Kode Akses dari .env
    const emailInput = page.locator('input[placeholder*="Email" i], input[type="email"]');
    const codeInput = page.locator('input[placeholder*="KODE AKSES" i]');

    await emailInput.fill(email);
    await codeInput.fill(accessCode);

    // 5. Klik Tombol BUKA KONTEN
    const submitBtn = page.getByRole('button', { name: 'BUKA KONTEN' });
    await submitBtn.click();

    // 6. Verifikasi Form Paywall Hilang & Player Video (Iframe/Video) Berhasil Rendere
    await expect(paywallHeader).not.toBeVisible({ timeout: 10000 });
    
    const videoPlayer = page.locator('iframe, video, .player-container').first();
    await expect(videoPlayer).toBeVisible({ timeout: 15000 });
  });

});