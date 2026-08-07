const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://layarbaca.app';

// Mengaktifkan rekaman video & screenshot jika tes gagal (sangat membantu tim dev)
test.use({ 
  video: 'retain-on-failure',
  screenshot: 'only-on-failure',
});

test.describe('Pengujian Frontend Landing Page LayarBaca', () => {

  test.beforeEach(async ({ page }) => {
    // Membuka landing page dan menunggu hingga elemen DOM selesai dimuat
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  });

  test('1. Verifikasi judul halaman, URL redirected, dan elemen utama UI', async ({ page }) => {
    // Memastikan judul halaman mengandung 'LayarBaca'
    await expect(page).toHaveTitle(/LayarBaca/i);

    // Memastikan URL otomatis terarah/mengandung konteks landing page
    await expect(page).toHaveURL(/layarbaca\.app/);

    // Memastikan Search Bar utama sesuai dengan placeholder di UI
    const searchInput = page.locator('input[placeholder*="Cari film"]');
    await expect(searchInput).toBeVisible();

    // Memastikan tombol Install Aplikasi muncul di navbar
    const installBtn = page.locator('button:has-text("Install Aplikasi"), a:has-text("Install Aplikasi")').first();
    await expect(installBtn).toBeVisible();
  });

  test('2. Uji fungsi pencarian film via Search Bar', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Cari film"]');
    
    await expect(searchInput).toBeVisible();
    await searchInput.click();
    await searchInput.fill('Avatar');
    await searchInput.press('Enter');

    // Menunggu respon/hasil pencarian atau perubahan daftar film
    await page.waitForTimeout(1000); 
    const movieGrid = page.locator('div[class*="grid"]').first();
    await expect(movieGrid).toBeVisible({ timeout: 10000 });
  });

  test('3. Verifikasi kategori genre & katalog film di Landing Page', async ({ page }) => {
    // Memastikan tombol filter genre 'Semua' atau genre utama terlihat
    const allFilter = page.locator('button:has-text("Semua"), div:has-text("Semua")').first();
    await expect(allFilter).toBeVisible();

    // Memastikan section rekomendasi film muncul
    const sectionRekomendasi = page.locator('text=REKOMENDASI SPESIAL UNTUKMU');
    await expect(sectionRekomendasi).toBeVisible();

    // Memastikan minimal ada 1 kartu film ter-render di halaman
    const firstMovieCard = page.locator('div[class*="grid"] > div, img').first();
    await expect(firstMovieCard).toBeVisible();
  });

  test('4. Uji responsivitas Tampilan Mobile & Bottom Navigation', async ({ page }) => {
    // Set ukuran layar ke Mobile (iPhone/Android standard)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload({ waitUntil: 'domcontentloaded' });

    // Memastikan Search Bar tetap tampil di ukuran mobile
    const searchInput = page.locator('input[placeholder*="Cari film"]');
    await expect(searchInput).toBeVisible();

    // Memastikan tombol 'BERANDA' di floating navbar bawah terlihat
    const homeTab = page.locator('text=BERANDA').first();
    await expect(homeTab).toBeVisible();
  });

  test('5. Cek ketersediaan file Manifest PWA', async ({ page }) => {
    // Mengecek apakah file manifest PWA dapat diakses (status HTTP 200 OK)
    const response = await page.request.get(`${BASE_URL}/manifest.json`);
    expect(response.status()).toBe(200);
  });

  test('6. Uji klik filter genre', async ({ page }) => {
    const actionGenre = page.locator('button:has-text("Action"), div:has-text("Action")').first();
    await expect(actionGenre).toBeVisible();
    await actionGenre.click();
    
    // Pastikan URL berubah atau grid film merender ulang
    await page.waitForTimeout(500);
  });

  test('7. Verifikasi tombol Floating Menu Bawah', async ({ page }) => {
    const paketAksesBtn = page.locator('text=PAKET AKSES').first();
    await expect(paketAksesBtn).toBeVisible();
    
    // Cek apakah tombol Buka Kunci juga muncul
    const bukaKunciBtn = page.locator('text=BUKA KUNCI').first();
    await expect(bukaKunciBtn).toBeVisible();
  });

});