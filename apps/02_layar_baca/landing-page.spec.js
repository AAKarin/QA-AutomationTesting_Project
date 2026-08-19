const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://layarbaca.app/app/home';

test.use({ 
  video: 'retain-on-failure',
  screenshot: 'only-on-failure',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
});

test.describe('Pengujian Frontend Landing Page & Fitur Utama LayarBaca', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  });

  test('1. Verifikasi judul halaman, URL redirected, dan elemen utama UI', async ({ page }) => {
    await expect(page).toHaveTitle(/LayarBaca/i, { timeout: 15000 });
    await expect(page).toHaveURL(/layarbaca\.app/);

    const searchInput = page.locator('input[placeholder*="Cari" i]').first();
    await expect(searchInput).toBeVisible({ timeout: 15000 });

    const installBtn = page.locator('button, a, div').filter({ hasText: /Install Aplikasi/i }).first();
    await expect(installBtn).toBeVisible({ timeout: 10000 });

    const langBtn = page.locator('button[title="Switch to English"]');
    await expect(langBtn).toBeVisible({ timeout: 10000 });
  });

  test('2. Uji fungsi pencarian film spesifik via Search Bar', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Cari" i]').first();
    await expect(searchInput).toBeVisible({ timeout: 15000 });
    
    const searchQuery = 'Kabushikigaisha Magi-Lumière Season 2 Sub Indo';
    await searchInput.click();
    await searchInput.fill(searchQuery);
    await searchInput.press('Enter');
    await expect(page.locator('body')).toContainText(/Kabushikigaisha|Magi-Lumière|Tidak ditemukan/i, { timeout: 15000 });
  });

  test('3. Verifikasi kategori genre & katalog film di Landing Page', async ({ page }) => {
    const allFilter = page.locator('button, div').filter({ hasText: /^Semua$/i }).first();
    await expect(allFilter).toBeVisible({ timeout: 15000 });

    const sectionRekomendasi = page.locator('text=/REKOMENDASI/i').first();
    await sectionRekomendasi.scrollIntoViewIfNeeded();
    await expect(sectionRekomendasi).toBeVisible({ timeout: 15000 });

    const firstMovieCard = page.locator('img').first();
    await expect(firstMovieCard).toBeVisible({ timeout: 15000 });
  });

  test('4. Uji klik filter genre (misal: Action)', async ({ page }) => {
    const actionGenre = page.locator('button, div').filter({ hasText: /Action/i }).first();
    await expect(actionGenre).toBeVisible({ timeout: 15000 });
    await actionGenre.click();
  });

  test('5. Uji Pusat Bantuan (Modal Help) & Daftar Pertanyaan Umum', async ({ page }) => {
    const helpBtn = page.locator('button.w-14.h-14, button[class*="bg-indigo"]').first();
    await helpBtn.click({ force: true });

    const modalHeader = page.getByText(/Pusat Bantuan/i).first();
    await expect(modalHeader).toBeVisible({ timeout: 15000 });

    const faqItems = [
      'Bagaimana cara beli paket?',
      'Kode akses belum dikirim ke email',
      'Gagal input kode akses',
      'Berapa lama masa aktif akses konten?',
      'Belum terjawab? Tanya Admin'
    ];

    for (const itemText of faqItems) {
      const faqItem = page.getByText(itemText, { exact: false }).first();
      await expect(faqItem).toBeVisible({ timeout: 10000 });
    }
  });

  test('6. Verifikasi Floating Bottom Navigation', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

    const navItems = ['AWAL', 'FILM', 'PAKET', 'BUKA KUNCI', 'ANIME', 'BOOKMARK'];

    for (const itemText of navItems) {
      const navBtn = page.locator('button, a, div').filter({ hasText: new RegExp(itemText, 'i') }).first();
      await expect(navBtn).toBeVisible({ timeout: 15000 });
    }
  });

  test('7. Uji responsivitas Tampilan Mobile & Bottom Navigation', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

    const awalTab = page.locator('button, a, div').filter({ hasText: /^AWAL$/i }).first();
    await expect(awalTab).toBeVisible({ timeout: 15000 });
  });
});