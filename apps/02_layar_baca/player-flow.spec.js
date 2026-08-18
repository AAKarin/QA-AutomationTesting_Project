import { test, expect } from '@playwright/test';

test.describe('Guest Flow - Filter Genre & Verifikasi Paywall', () => {

  const genres = ['Semua', 'Action', 'Adventure', 'Animation', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller'];

  test.beforeEach(async ({ page }) => {
    await page.goto('https://layarbaca.app/app/gallery?category=Action', { waitUntil: 'domcontentloaded', timeout: 30000 });
  });

  test('1. Klik filter genre dan verifikasi pergantian URL', async ({ page }) => {
    // Naikkan timeout khusus untuk tes ini karena meloop 10 genre
    test.setTimeout(60000); 

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

  test('4. Klik semua opsi Season pada dropdown', async ({ page }) => {
    test.setTimeout(60000); // Naikkan timeout jaga-jaga koneksi lambat saat ganti season

    // 1. Langsung buka URL series (The Walking Dead)
    await page.goto('https://layarbaca.app/view/lk21?url=https%3A%2F%2Fdramamu.lk21.de%2Fthe-walking-dead-season-1-episode-1-2010', { waitUntil: 'domcontentloaded' });

    // 2. Targetkan elemen <select> dropdown season
    const selectElement = page.locator('select').first();
    await expect(selectElement).toBeVisible({ timeout: 15000 });

    // 3. Ambil semua opsi season yang tersedia
    const options = await selectElement.locator('option').allInnerTexts();

    // 4. Pilih tiap season satu per satu menggunakan selectOption (Metode bawaan Playwright yang paling stabil)
    for (const optionText of options) {
      const cleanText = optionText.trim();
      await selectElement.selectOption({ label: cleanText });
      await page.waitForTimeout(500); // Jeda singkat agar UI sempat update
    }
  });

  test('5. Klik daftar episode dan validasi perubahan angka di judul', async ({ page }) => {
    // Mencari area yang membungkus tombol-tombol episode (1, 2, 3, dst.)
    const episodeButtons = page.locator('text="DAFTAR EPISODE"').locator('..').locator('button, [class*="btn-episode"]');
    const episodeCount = await episodeButtons.count();

    for (let i = 0; i < episodeCount; i++) {
      const btn = episodeButtons.nth(i);
      const episodeNumber = await btn.innerText(); 
      
      await btn.click();
      
      // Tunggu sebentar agar judul sempat dirender ulang oleh sistem
      await page.waitForTimeout(1000); 

      // Validasi teks judul utama (di bawah video)
      const mainTitle = page.locator('h1, h2').filter({ hasText: /The Walking Dead/i }).first();
      await expect(mainTitle).toContainText(`Episode ${episodeNumber}`);

      // Validasi teks judul kecil (di atas pilihan season)
      const miniTitle = page.getByText(/SEASON 1 EPISODE/i).first();
      await expect(miniTitle).toContainText(`EPISODE ${episodeNumber}`);
    }
  });

  test('6. Klik tombol Bookmark & Download dan validasi Toast Pesan', async ({ page }) => {
    // 1. Buka film/series dari galeri
    const movieCards = page.locator('a[href*="/view/lk21"]');
    await movieCards.first().waitFor({ state: 'visible', timeout: 15000 });
    await movieCards.first().click();

    // 2. Targetkan tombol Bookmark berdasarkan atribut title
    const btnBookmark = page.locator('button[title*="Bookmark"]').first(); 
    await expect(btnBookmark).toBeVisible({ timeout: 15000 });
    await btnBookmark.click();
    
    // Validasi Toast Bookmark
    const toastBookmark = page.getByText(/Berhasil disimpan ke Bookmark!/i).first();
    await expect(toastBookmark).toBeVisible({ timeout: 5000 });

    // 3. Tes Tombol Download (opsional/jika tombolnya tampil di halaman)
    const btnDownload = page.locator('button[title="Unduh"]').first();
    const isDownloadVisible = await btnDownload.isVisible().catch(() => false);
    
    if (isDownloadVisible) {
      await btnDownload.click();
      const toastDownload = page.getByText(/Mulai mengunduh/i).first();
      await expect(toastDownload).toBeVisible({ timeout: 5000 });
    }
  });

});