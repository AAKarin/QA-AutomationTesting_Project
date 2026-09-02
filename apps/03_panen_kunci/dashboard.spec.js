// @ts-check
import { test, expect } from '@playwright/test';
require('dotenv').config();

test.describe('Modul: Home Dashboard - Panen Kunci', () => {

  const BASE_URL = process.env.BASE_URL_PANEN_KUNCI || 'http://localhost:3000';

  test.beforeEach(async ({ page }) => {
    // Navigasi ke halaman dashboard
    await page.goto(`${BASE_URL}/dashboard`); // atau '/' tergantung routing utama
    
    // Validasi header logo dan nama aplikasi agar memastikan halaman termuat
    await expect(page.getByText('Panen Kunci').first()).toBeVisible();
  });

  // TC-21: Validasi tampilan ringkasan Saldo (Aktif & Pasif)
  test('TC-21: Memastikan widget Saldo Aktif dan Saldo Pasif dirender dengan benar', async ({ page }) => {
    // Memeriksa label kartu saldo
    await expect(page.getByText('Total Saldo Aktif')).toBeVisible();
    await expect(page.getByText('Total Saldo Pasif')).toBeVisible();

    // Memeriksa nominal yang dirender (Berdasarkan dummy mockup)
    const saldoAktif = page.getByText('Rp25.000');
    const saldoPasif = page.getByText('Rp22.000');
    
    await expect(saldoAktif).toBeVisible();
    await expect(saldoPasif).toBeVisible();
    
    // Validasi visual menggunakan CSS untuk memastikan warna hijau (jika diperlukan)
    // await expect(saldoAktif).toHaveCSS('color', 'rgb(0, 128, 0)'); // Sesuaikan RGB hijau dari developer
  });

  // TC-22: Validasi aksesibilitas tombol aksi utama
  test('TC-22: Memastikan fungsi navigasi tombol "Setor API Key" dan "Tarik Saldo"', async ({ page }) => {
    const btnSetor = page.getByRole('button', { name: /Setor API Key/i }); // Menggunakan regex untuk mentolerir typo mockup
    const btnTarik = page.getByRole('button', { name: /Tarik Saldo/i });

    await expect(btnSetor).toBeVisible();
    await expect(btnTarik).toBeVisible();

    // Uji klik tombol Setor
    await btnSetor.click();
    // await expect(page).toHaveURL(/.*setor-api/); 
    
    // (Dalam praktiknya, kita akan kembali ke dashboard untuk menguji tombol kedua, 
    // atau memisahkan test case ini menjadi dua blok `test` terpisah)
  });

  // TC-23: Validasi indikator jumlah API Key terverifikasi
  test('TC-23: Menampilkan informasi jumlah API Key berhasil dengan akurat', async ({ page }) => {
    await expect(page.getByText('API Key Berhasil')).toBeVisible();
    
    // Memvalidasi angka metrik (3 pada mockup)
    // Sebaiknya developer menambahkan test-id khusus untuk angka metrik ini
    const angkaKeberhasilan = page.getByText('3', { exact: true });
    await expect(angkaKeberhasilan).toBeVisible();
  });

  // TC-24: Validasi daftar aktivitas terkini dan penanda warna nominal
  test('TC-24: Memeriksa daftar aktivitas terkini (Keluar/Masuk saldo)', async ({ page }) => {
    // Validasi judul section
    await expect(page.getByRole('heading', { name: 'Aktivitas Terkini' })).toBeVisible();

    // Validasi list aktivitas masuk (Penambahan Saldo)
    const setoranTerkini = page.getByText('+Rp2.000').first();
    await expect(setoranTerkini).toBeVisible();
    // Validasi penanda positif (Asumsi class warna hijau atau tanda +)
    await expect(setoranTerkini).toContainText('+');

    // Validasi list aktivitas keluar (Penarikan Saldo)
    const penarikanTerkini = page.getByText('-Rp15.000');
    await expect(penarikanTerkini).toBeVisible();
    // Validasi penanda negatif (Asumsi class warna merah atau tanda -)
    await expect(penarikanTerkini).toContainText('-');

    // Validasi tautan navigasi riwayat penuh
    const linkLihatSemua = page.getByRole('link', { name: 'Lihat Semua Aktivitas' });
    await expect(linkLihatSemua).toBeVisible();
  });

  test('Memastikan ketersediaan Bottom Navigation', async ({ page }) => {
    // Pengujian tambahan untuk menu navigasi bawah
    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'History' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Profile' })).toBeVisible();
  });
});