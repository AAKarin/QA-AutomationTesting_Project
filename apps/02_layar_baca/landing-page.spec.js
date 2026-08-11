const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://layarbaca.app/app/home';

test.use({ 
  video: 'retain-on-failure',
  screenshot: 'only-on-failure',
});

test.describe('Pengujian Frontend Landing Page & Fitur Utama LayarBaca', () => {

  test.beforeEach(async ({ page }) => {
    // Navigasi langsung ke /app/home untuk menghindari redirect berulang
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  });

  test('1. Verifikasi judul halaman, URL redirected, dan elemen utama UI', async ({ page }) => {
    await expect(page).toHaveTitle(/LayarBaca/i);
    await expect(page).toHaveURL(/layarbaca\.app/);

    // Search Bar utama (menggunakan placeholder persis atau type search)
    const searchInput = page.locator('input[type="search"], input[placeholder*="Cari" i]').first();
    await expect(searchInput).toBeVisible({ timeout: 10000 });

    // Tombol Install Aplikasi & Bahasa ID
    const installBtn = page.getByRole('button', { name: /Install Aplikasi/i }).or(page.locator('text=Install Aplikasi'));
    await expect(installBtn.first()).toBeVisible();

    const langBtn = page.locator('button').filter({ hasText: '🇮🇩' }).first();
    await expect(langBtn).toBeVisible();
  });

  test('2. Uji fungsi pencarian film spesifik via Search Bar', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="Cari" i]').first();
    await expect(searchInput).toBeVisible({ timeout: 10000 });
    
    const searchQuery = 'Kabushikigaisha Magi-Lumière Season 2 Sub Indo';
    await searchInput.click();
    await searchInput.fill(searchQuery);
    await searchInput.press('Enter');

    // Tunggu navigasi atau rendering hasil pencarian
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toContainText(/Kabushikigaisha|Magi-Lumière|Tidak ditemukan/i);
  });

  test('3. Verifikasi kategori genre & katalog film di Landing Page', async ({ page }) => {
    const allFilter = page.locator('button, div').filter({ hasText: /^Semua$/i }).first();
    await expect(allFilter).toBeVisible();

    const sectionRekomendasi = page.locator('text=REKOMENDASI SPESIAL UNTUKMU');
    await expect(sectionRekomendasi).toBeVisible({ timeout: 10000 });

    const firstMovieCard = page.locator('img').first();
    await expect(firstMovieCard).toBeVisible();
  });

  test('4. Uji klik filter genre (misal: Action)', async ({ page }) => {
    const actionGenre = page.locator('button, div').filter({ hasText: /^Action$/i }).first();
    await expect(actionGenre).toBeVisible();
    await actionGenre.click();
    
    await page.waitForTimeout(1000);
  });

  test('5. Uji Pusat Bantuan (Modal Help) & Daftar Pertanyaan Umum', async ({ page }) => {
    // Targetkan tombol Help melayang ungu di pojok kanan bawah
    const helpBtn = page.locator('button, div').filter({ has: page.locator('svg') }).last();
    await helpBtn.scrollIntoViewIfNeeded();
    await helpBtn.click({ force: true });

    // Verifikasi Modal "Pusat Bantuan" muncul
    const modalHeader = page.locator('text=Pusat Bantuan');
    await expect(modalHeader).toBeVisible({ timeout: 10000 });

    // Cek ketersediaan daftar FAQ
    const faqItems = [
      'Bagaimana cara donasi?',
      'Kode akses belum dikirim ke email',
      'Gagal input kode akses',
      'Berapa lama masa aktif akses konten?',
      'Belum terjawab? Tanya Admin'
    ];

    for (const itemText of faqItems) {
      const faqItem = page.locator(`text=${itemText}`).first();
      await expect(faqItem).toBeVisible();
    }
  });

  test('6. Verifikasi Floating Bottom Navigation', async ({ page }) => {
    const navItems = ['AWAL', 'FILM', 'PAKET', 'BUKA KUNCI', 'ANIME', 'BOOKMARK'];

    for (const itemText of navItems) {
      const navBtn = page.locator(`text=${itemText}`).first();
      await expect(navBtn).toBeVisible();
    }
  });

  test('7. Uji responsivitas Tampilan Mobile & Bottom Navigation', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

    const awalTab = page.locator('text=AWAL').first();
    await expect(awalTab).toBeVisible({ timeout: 10000 });
  });

});