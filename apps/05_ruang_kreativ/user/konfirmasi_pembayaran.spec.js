import { test, expect } from '@playwright/test';

const BASE_URL = process.env.RUANGKREATIV_URL || 'http://localhost:3000';
const URL_SUKSES = `${BASE_URL}/pembayaran-sukses`; // Sesuaikan dengan route konfirmasi Anda

test.describe('RuangKreativ - Halaman Konfirmasi Pembayaran', () => {

  // Untuk TC50-TC54, kita asumsikan pengguna berada di halaman sukses pembayaran yang valid
  test.beforeEach(async ({ page }) => {
    // Pada implementasi riil, Anda mungkin perlu melakukan mock/stub API checkout 
    // agar halaman ini bisa diakses tanpa harus mengulangi flow pembayaran sungguhan setiap saat.
    await page.goto(URL_SUKSES);
  });

  test('TC50: Validasi Kelengkapan dan Ketepatan Informasi Ringkasan Pesanan', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Pembayaran Berhasil!' })).toBeVisible();
    await expect(page.getByText('RINGKASAN PESANAN')).toBeVisible();

    // Validasi data spesifik pada ringkasan pesanan
    // (Dalam pengujian nyata, data ini mungkin dinamis, Anda bisa menggunakan regex)
    await expect(page.getByText(/#RK-20241025-\d+/)).toBeVisible(); // Order ID
    await expect(page.getByText('Budi Santoso')).toBeVisible(); // Mentor
    await expect(page.getByText('Google Meet')).toBeVisible(); // Platform
    await expect(page.getByText('Selasa, 25 Agustus 2026')).toBeVisible(); // Jadwal (Contoh teks)
  });

  test('TC51: Validasi Kemunculan Badge Status Pembayaran "LUNAS" dan Nominal', async ({ page }) => {
    const barisTotal = page.locator('div').filter({ hasText: 'Total Pembayaran' }).last();

    // Validasi badge LUNAS
    const badgeLunas = barisTotal.getByText('LUNAS');
    await expect(badgeLunas).toBeVisible();
    
    // Validasi format nominal mata uang Rp
    const teksNominal = barisTotal.getByText(/Rp\s?150\.000/);
    await expect(teksNominal).toBeVisible();
  });

  test('TC52: Validasi Keterbacaan Pesan Instruksi Email (Info Alert)', async ({ page }) => {
    const infoAlert = page.locator('.bg-blue-100, .alert-info').first(); // Sesuaikan class background dari developer

    // Memastikan alert box muncul
    await expect(infoAlert).toBeVisible();

    // Memastikan teks instruksi tampil dengan benar
    await expect(infoAlert.getByText(/Detail sesi dan invoice telah dikirimkan ke email Anda/i)).toBeVisible();
    await expect(infoAlert.getByText(/Silakan cek folder inbox atau spam/i)).toBeVisible();
  });

  test('TC53: Validasi Fungsionalitas Tombol "Lihat Sesi Saya"', async ({ page }) => {
    const btnLihatSesi = page.getByRole('button', { name: 'Lihat Sesi Saya' });
    
    await btnLihatSesi.click();

    // Validasi pengalihan halaman ke dashboard Sesi Saya
    await expect(page).toHaveURL(/.*(sesi-saya|pesanan-saya)/);
  });

  test('TC54: Validasi Fungsionalitas Tombol "Kembali ke Beranda"', async ({ page }) => {
    const btnBeranda = page.getByRole('button', { name: 'Kembali ke Beranda' });
    
    await btnBeranda.click();

    // Validasi pengalihan halaman kembali ke landing page / home
    await expect(page).toHaveURL(BASE_URL + '/'); 
  });
});

test.describe('RuangKreativ - Keamanan Halaman Konfirmasi (Negative Case)', () => {
  
  test('TC56: Validasi Pencegahan Akses Langsung (Direct URL Access) Tanpa Sesi Pembayaran', async ({ context }) => {
    // Membuka context browser baru/bersih yang belum memiliki riwayat checkout
    const freshPage = await context.newPage();
    
    // Mencoba mengakses halaman sukses pembayaran secara langsung
    await freshPage.goto(URL_SUKSES);

    // Sistem seharusnya mendeteksi tidak ada session transaksi dan menolak akses
    // Validasi bahwa pengguna dilempar (redirect) kembali ke beranda atau halaman lain
    await freshPage.waitForLoadState('networkidle');
    expect(freshPage.url()).not.toContain('pembayaran-sukses');
  });

});