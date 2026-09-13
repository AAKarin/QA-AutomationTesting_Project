import { test, expect } from '@playwright/test';

const BASE_URL = process.env.RUANGKREATIV_URL || 'http://localhost:3000';
const URL_REDIRECT_ZOOM = `${BASE_URL}/sesi/zoom-redirect/SES-12345`; // Sesuaikan route dengan aplikasi

test.describe('RuangKreativ - Halaman Pengalihan Ruang Zoom', () => {

  test.beforeEach(async ({ page }) => {
    // Navigasi ke halaman pengalihan / loading Zoom
    await page.goto(URL_REDIRECT_ZOOM);
  });

  test('TC72: Validasi kelengkapan informasi sesi kelas pada kartu pratinjau', async ({ page }) => {
    // Validasi Header & Sub-header
    await expect(page.getByRole('heading', { name: 'Mempersiapkan Sesi Belajar Anda...' })).toBeVisible();
    await expect(page.getByText('Anda akan diarahkan ke ruang kelas dalam beberapa saat.')).toBeVisible();

    // Validasi Kartu Sesi
    const kartuSesi = page.locator('.bg-gray-50, .card-session').first(); // Sesuaikan class
    await expect(kartuSesi.getByText('SESI MENDATANG', { exact: true })).toBeVisible();
    await expect(kartuSesi.getByText('Mastering Midjourney V6')).toBeVisible();
    await expect(kartuSesi.getByText('Mentor: Budi Santoso')).toBeVisible();
  });

  test('TC73: Validasi keterbacaan teks panduan/instruksi fallback', async ({ page }) => {
    // Validasi keberadaan teks instruksi jika auto-redirect gagal
    const teksFallback = page.getByText('Jika Anda tidak diarahkan secara otomatis, silakan klik tombol di atas.');
    await expect(teksFallback).toBeVisible();
  });

  test('TC71: Validasi fungsionalitas manual melalui tombol "Buka Zoom Sekarang"', async ({ page, context }) => {
    const btnBukaZoom = page.getByRole('button', { name: 'Buka Zoom Sekarang' });
    await expect(btnBukaZoom).toBeVisible();

    // Menangkap tab/halaman baru yang terbuka saat tombol diklik
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      btnBukaZoom.click()
    ]);

    // Memastikan tautan yang terbuka mengarah ke platform Zoom
    await newPage.waitForLoadState();
    expect(newPage.url()).toContain('zoom.us');
  });

  test('TC70: Validasi fungsionalitas pengalihan otomatis (auto-redirect) ke ruang Zoom', async ({ context, page }) => {
    // Test ini tidak mengeklik tombol apa pun, murni menunggu auto-redirect yang dipicu script frontend
    
    // Asumsi sistem melakukan redirect tab baru atau merubah top-level location dalam 3-5 detik
    // Kita tangkap tab baru yang mungkin muncul secara otomatis (jika target="_blank")
    try {
      const newPage = await context.waitForEvent('page', { timeout: 6000 });
      await newPage.waitForLoadState();
      expect(newPage.url()).toContain('zoom.us');
    } catch (e) {
      // Jika sistem merubah URL di tab yang sama (window.location.href)
      await page.waitForURL(/.*zoom\.us.*/, { timeout: 6000 });
      expect(page.url()).toContain('zoom.us');
    }
  });
});

test.describe('RuangKreativ - Halaman Pengalihan Zoom (Skenario Negatif)', () => {

  test('TC74: Validasi penanganan tautan Zoom sebelum jam sesi', async ({ page }) => {
    // Mocking API / Mengakses sesi yang sengaja diset belum mulai
    await page.goto(`${BASE_URL}/sesi/zoom-redirect/SES-FUTURE`); 
    
    // Memastikan tombol disabled atau muncul notifikasi countdown
    const alertBelumMulai = page.getByText(/Ruang Zoom belum dibuka|Sesi belum dimulai/i);
    await expect(alertBelumMulai).toBeVisible();
  });

  test('TC75: Validasi respon sistem jika tautan Zoom rusak atau bernilai null', async ({ page }) => {
    // Mocking API response untuk mengembalikan link zoom null/kosong
    await page.route('**/api/sesi/SES-BROKEN', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ link_zoom: null })
      });
    });

    await page.goto(`${BASE_URL}/sesi/zoom-redirect/SES-BROKEN`); 
    
    // Klik tombol Buka Zoom Sekarang
    await page.getByRole('button', { name: 'Buka Zoom Sekarang' }).click();

    // Validasi error handling sistem (misal memunculkan toast/alert bukan error page browser)
    await expect(page.getByText(/Tautan Zoom tidak tersedia/i)).toBeVisible();
  });

});