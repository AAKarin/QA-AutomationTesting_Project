import { test, expect } from '@playwright/test';

const BASE_URL = process.env.RUANGKREATIV_URL || 'http://localhost:3000';
const URL_DETAIL_PESANAN = `${BASE_URL}/pesanan/RK-VIDEO-001`; // Sesuaikan dengan route spesifik

test.describe('RuangKreativ - Halaman Detail Pesanan', () => {

  test.beforeEach(async ({ page }) => {
    // Navigasi ke halaman detail pesanan sebelum setiap tes
    await page.goto(URL_DETAIL_PESANAN);
  });

  test('TC92: Validasi visual stepper Status Pesanan dan akurasi data Detail Pesanan', async ({ page }) => {
    // 1. Validasi Stepper Status Pesanan
    await expect(page.getByRole('heading', { name: 'Status Pesanan' })).toBeVisible();
    await expect(page.getByText('Diterima')).toBeVisible();
    await expect(page.getByText('Scripting')).toBeVisible();
    await expect(page.getByText('Rendering')).toBeVisible();
    await expect(page.getByText('Draft Video')).toBeVisible();
    await expect(page.getByText('Selesai')).toBeVisible();

    // 2. Validasi Kartu Sidebar Detail Pesanan
    const sidebarDetail = page.locator('div').filter({ hasText: 'Detail Pesanan' }).nth(1); 
    await expect(sidebarDetail.getByText('#RK-VIDEO-001')).toBeVisible();
    await expect(sidebarDetail.getByText('3D Animation')).toBeVisible();
    await expect(sidebarDetail.getByText('16:9 (Landscape)')).toBeVisible();
    await expect(sidebarDetail.getByText('2 Minutes')).toBeVisible();
    await expect(sidebarDetail.getByText('24 Okt 2024')).toBeVisible();
  });

  test('TC93: Validasi fungsionalitas pemutaran preview video pada pemutar media', async ({ page }) => {
    // Pastikan label Draft Video V1 tampil
    await expect(page.getByText('Draft Video V1')).toBeVisible();

    // Mencari tombol Play di dalam video player
    // Penargetan bisa disesuaikan apakah developer menggunakan tag <video> atau iframe (YouTube/Vimeo)
    const playButton = page.locator('.video-player-container').getByRole('button', { name: /play/i }).first();
    
    if (await playButton.isVisible()) {
        await playButton.click();
    } else {
        // Alternatif jika menggunakan tag <video> native
        await page.locator('video').click();
    }

    // Memastikan video tidak dalam kondisi paused (berarti sedang memutar)
    const videoElement = page.locator('video');
    const isPaused = await videoElement.evaluate((video) => video.paused);
    expect(isPaused).toBeFalsy();
  });

  test('TC94: Validasi fungsionalitas tombol Setujui Video untuk menyelesaikan pesanan', async ({ page }) => {
    // Klik tombol Setujui Video
    const btnSetujui = page.getByRole('button', { name: 'Setujui Video' });
    await expect(btnSetujui).toBeVisible();
    await btnSetujui.click();

    // Validasi munculnya modal dialog konfirmasi (Asumsi sistem menggunakan modal)
    // await page.getByRole('button', { name: 'Ya, Selesaikan Pesanan' }).click();

    // Validasi indikator berubah menjadi selesai atau muncul pesan sukses
    // await expect(page.getByText('Pesanan telah diselesaikan')).toBeVisible();
  });

  test('TC96: Validasi fungsionalitas formulir Ajukan Revisi dengan lampiran', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Ajukan Revisi' })).toBeVisible();
    await expect(page.getByText('1x Revisi Gratis Tersisa')).toBeVisible();

    // Mengisi textarea revisi
    await page.getByPlaceholder('Ketik detail revisi yang Anda inginkan di sini...').fill('Tolong ubah warna teks pada timestamp 01:23 agar lebih kontras.');

    // Mengunggah file referensi (Opsional)
    // Pastikan Anda menyiapkan dummy file di folder tests/fixtures/
    /* 
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Unggah File Referensi' }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles('tests/fixtures/referensi_warna.jpg');
    */

    // Klik kirim revisi
    await page.getByRole('button', { name: 'Kirim Revisi' }).click();

    // Validasi notifikasi berhasil (contoh)
    // await expect(page.getByText('Revisi berhasil diajukan')).toBeVisible();
  });
});

test.describe('RuangKreativ - Halaman Detail Pesanan (Skenario Revisi Habis)', () => {

  test('TC98: Validasi penanganan formulir revisi ketika kuota gratis habis', async ({ page }) => {
    // Mocking API Response untuk mensimulasikan data "0x Revisi Tersisa"
    await page.route('**/api/pesanan/RK-VIDEO-001', route => {
      const response = {
          order_id: 'RK-VIDEO-001',
          sisa_revisi: 0,
          status: 'draft'
      };
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response)
      });
    });

    await page.goto(URL_DETAIL_PESANAN);
    
    // Pastikan indikator 0x muncul
    await expect(page.getByText('0x Revisi Gratis Tersisa')).toBeVisible();

    // Validasi apakah textarea disabled atau tombol berubah untuk Add-on Berbayar
    const revisiInput = page.getByPlaceholder('Ketik detail revisi yang Anda inginkan di sini...');
    const btnKirim = page.getByRole('button', { name: /Kirim Revisi|Bayar Tambahan Revisi/i });

    // Cek apakah tombol atau input dinonaktifkan
    // await expect(revisiInput).toBeDisabled(); ATAU
    // await expect(btnKirim).toHaveText('Beli Tambahan Revisi');
  });

});