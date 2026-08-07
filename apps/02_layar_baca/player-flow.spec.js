// player-flow.spec.js
const { test, expect } = require('@playwright/test');

test.use({ 
  video: 'retain-on-failure',
  screenshot: 'only-on-failure',
});

test.describe('Pengujian Filter Genre dan Interaksi Film - LayarBaca', () => {

  // Daftar genre yang akan diuji
  const genres = [
    'Semua',
    'Action',
    'Adventure',
    'Animation',
    'Comedy',
    'Drama',
    'Horror',
    'Romance',
    'Sci-Fi',
    'Thriller'
  ];

  test.beforeEach(async ({ page }) => {
    // Buka halaman utama gallery sebelum setiap tes
    await page.goto('https://layarbaca.app/app/gallery?category=Action');
    await page.waitForLoadState('domcontentloaded');
  });

  test('1. Harus dapat melakukan klik pada button genre dan memverifikasi URL', async ({ page }) => {
    for (const genre of genres) {
      const genreButton = page.getByRole('button', { name: genre, exact: true });

      await expect(genreButton).toBeVisible();
      await genreButton.click();

      // Tunggu hingga request data API/DOM selesai dirender
      await page.waitForLoadState('networkidle');

      if (genre === 'Semua') {
        await expect(page).toHaveURL(/https:\/\/layarbaca\.app\/app\/gallery/);
      } else {
        await expect(page).toHaveURL(`https://layarbaca.app/app/gallery?category=${genre}`);
      }
    }
  });

  test('2. Harus dapat mengeklik 3 hingga 5 film dan memverifikasi player video', async ({ page }) => {
    const movieCards = page.locator('a[href*="/view/lk21"]');
    
    // Tunggu kartu film pertama terlihat di layar
    await movieCards.first().waitFor({ state: 'visible' });

    const count = await movieCards.count();
    const limitToClick = Math.min(count, 5); 

    console.log(`Ditemukan ${count} film. Menguji ${limitToClick} film pertama...`);

    for (let i = 0; i < limitToClick; i++) {
      const currentMovie = page.locator('a[href*="/view/lk21"]').nth(i);
      const targetHref = await currentMovie.getAttribute('href');

      await currentMovie.click();

      // 1. Verifikasi URL berubah ke halaman view
      await expect(page).toHaveURL(targetHref);
      await expect(page).toHaveURL(/https:\/\/layarbaca\.app\/view\/lk21\?url=/);

      // 2. Verifikasi elemen player (iframe/video) benar-benar dimuat di halaman
      const videoPlayer = page.locator('iframe, video').first();
      await expect(videoPlayer).toBeVisible({ timeout: 10000 });

      // Kembali ke halaman gallery untuk menguji film berikutnya
      await page.goBack();
      await page.waitForLoadState('domcontentloaded');
    }
  });

  test('3. Skenario Integrasi: Filter berdasarkan genre lalu buka film', async ({ page }) => {
    // Pilih salah satu genre secara spesifik (contoh: Horror)
    const selectedGenre = 'Horror';
    const genreButton = page.getByRole('button', { name: selectedGenre, exact: true });

    await genreButton.click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(`https://layarbaca.app/app/gallery?category=${selectedGenre}`);

    // Pilih film pertama yang muncul dari hasil filter genre tersebut
    const firstMovie = page.locator('a[href*="/view/lk21"]').first();
    await expect(firstMovie).toBeVisible();

    await firstMovie.click();

    // Verifikasi navigasi dan elemen player pada film hasil filter
    await expect(page).toHaveURL(/https:\/\/layarbaca\.app\/view\/lk21\?url=/);
    await expect(page.locator('iframe, video').first()).toBeVisible();
  });

});