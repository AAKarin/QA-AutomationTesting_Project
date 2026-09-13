import { test, expect } from '@playwright/test';

const BASE_URL = process.env.RUANGKREATIV_URL || 'http://localhost:3000';

test.describe('RuangKreativ - Dashboard Sesi Saya', () => {

  test.beforeEach(async ({ page }) => {
    // Navigasi ke halaman Sesi Saya (asumsi route-nya /pesanan-saya atau /sesi-saya)
    // Pastikan status pengguna sudah dalam kondisi login/terautentikasi pada setup project
    await page.goto(`${BASE_URL}/pesanan-saya`);
  });

  test('TC43: Validasi Perpindahan Tab "Sesi Mendatang" dan "Riwayat Pesanan"', async ({ page }) => {
    const tabSesiMendatang = page.getByText('Sesi Mendatang');
    const tabRiwayatPesanan = page.getByText('Riwayat Pesanan');

    // Uji klik tab Riwayat Pesanan
    await tabRiwayatPesanan.click();
    // Validasi indikator aktif berpindah (sesuaikan dengan class border/font aktif yang digunakan developer)
    await expect(tabRiwayatPesanan).toHaveClass(/active|border-blue|font-semibold/);
    
    // Uji kembali ke Sesi Mendatang
    await tabSesiMendatang.click();
    await expect(tabSesiMendatang).toHaveClass(/active|border-blue|font-semibold/);
  });

  test('TC44: Validasi Fungsionalitas Tombol "Join Zoom"', async ({ page, context }) => {
    // Mencari kartu kelas 'Mastering Midjourney V6' dan tombol Zoom di dalamnya
    const kartuMidjourney = page.locator('div').filter({ hasText: 'Mastering Midjourney V6' }).first();
    const btnJoinZoom = kartuMidjourney.getByRole('button', { name: 'Join Zoom' });

    // Mempersiapkan listener untuk menangkap tab baru yang dibuka saat klik Join Zoom
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      btnJoinZoom.click()
    ]);

    // Validasi bahwa tab baru mengarah ke URL Zoom
    await newPage.waitForLoadState();
    expect(newPage.url()).toContain('zoom.us');
  });

  test('TC45: Validasi Fungsionalitas Tombol "Reschedule"', async ({ page }) => {
    const kartuPrompt = page.locator('div').filter({ hasText: 'Prompt Engineering for Marketing' }).first();
    const btnReschedule = kartuPrompt.getByRole('button', { name: 'Reschedule' });

    await btnReschedule.click();

    // Memastikan modal pop-up jadwal ulang terbuka
    const modalReschedule = page.locator('dialog, .modal, .reschedule-container').first();
    await expect(modalReschedule).toBeVisible();
  });

  test('TC46: Validasi Kelengkapan Informasi Detail pada Kartu Sesi', async ({ page }) => {
    const kartuMidjourney = page.locator('div').filter({ hasText: 'Mastering Midjourney V6' }).first();

    // Memastikan judul, mentor, tanggal, dan jam render dengan tepat
    await expect(kartuMidjourney.getByRole('heading', { name: 'Mastering Midjourney V6' })).toBeVisible();
    await expect(kartuMidjourney.getByText('Budi Santoso')).toBeVisible();
    await expect(kartuMidjourney.getByText('15 Oct 2024')).toBeVisible();
    await expect(kartuMidjourney.getByText('14:00 WIB')).toBeVisible();
  });

  test('TC47: Validasi Fungsionalitas Banner "Butuh Bantuan Mendesak?"', async ({ page }) => {
    const bannerBantuan = page.locator('div').filter({ hasText: 'Butuh Bantuan Mendesak?' }).first();
    const btnCariSpesialis = bannerBantuan.getByRole('link', { name: 'Cari Spesialis' });

    // Klik tombol pada banner
    await btnCariSpesialis.click();

    // Validasi navigasi (asumsi halaman tujuan konsultasi URL-nya /konsultasi atau /spesialis)
    await expect(page).toHaveURL(/.*(konsultasi|spesialis)/);
  });

  test('TC48: Validasi Navigasi Tautan pada Widget "Akses Cepat"', async ({ page }) => {
    const linkMateri = page.getByRole('link', { name: 'Materi Belajar Dasar' });
    const linkTemplate = page.getByRole('link', { name: 'Katalog Template Prompt' });
    const linkKomunitas = page.getByRole('link', { name: 'Komunitas Kreator' });

    // Cek ketersediaan semua tautan
    await expect(linkMateri).toBeVisible();
    await expect(linkTemplate).toBeVisible();
    await expect(linkKomunitas).toBeVisible();

    // Uji salah satu navigasi tautan akses cepat
    await linkMateri.click();
    await expect(page).toHaveURL(/.*(materi|belajar|kelas)/);
  });

  test('TC49: Validasi Tampilan Empty State pada "Riwayat Pesanan"', async ({ page }) => {
    // Asumsi: Skrip ini dijalankan pada akun yang baru/belum memiliki riwayat (seperti tertulis di prasyarat)
    await page.getByText('Riwayat Pesanan').click();

    // Validasi pesan khusus saat tabel data kosong (Empty State)
    await expect(page.getByText(/Belum ada riwayat pesanan/i)).toBeVisible();
    
    // Validasi adanya tombol/link eksplorasi layanan
    const btnEksplorasi = page.getByRole('link', { name: /Cari Kelas|Eksplor/i }); // Sesuaikan nama teks tombol
    await expect(btnEksplorasi).toBeVisible();
  });
});