// @ts-check
import { test, expect } from '@playwright/test';
require('dotenv').config();

test.describe('Modul: Autentikasi (Login) - Panen Kunci', () => {

  const BASE_URL = process.env.BASE_URL_PANEN_KUNCI || 'http://localhost:3000';

  test.beforeEach(async ({ page }) => {
    // Navigasi ke halaman login (sesuaikan rute jika misalnya /login)
    await page.goto(`${BASE_URL}/login`);
    
    // Pastikan header halaman termuat dengan benar
    await expect(page.getByRole('heading', { name: 'Selamat Datang Kembali' })).toBeVisible();
    await expect(page.getByText('Silakan masuk ke akun Panen Kunci Anda.')).toBeVisible();
  });

  // TC-06: Validasi proses Login menggunakan kredensial yang valid dan popup sukses
  test('TC-06: Berhasil login dan memvalidasi popup Login Berhasil', async ({ page }) => {
    // 1. Aksi Form Fill & Submit (Lanjutan dari skrip sebelumnya)
    await page.getByPlaceholder('Masukkan email Anda').fill('tester@panenkunci.com');
    await page.getByPlaceholder('Masukkan kata sandi').fill('Katasandi123!');
    
    // Menggunakan exact: true agar tidak tertukar dengan tombol lain yang mengandung kata "Masuk"
    await page.getByRole('button', { name: 'Masuk', exact: true }).click();

    // 2. Validasi Elemen Modal "Login Berhasil!"
    const modalHeading = page.getByRole('heading', { name: 'Login Berhasil!' });
    await expect(modalHeading).toBeVisible();

    // 3. Memvalidasi teks deskripsi persis seperti pada mockup
    const deskripsi = page.getByText('Selamat datang kembali di Panen Kunci. Siap untuk mulai mengumpulkan saldo hari ini?');
    await expect(deskripsi).toBeVisible();

    // 4. Validasi Tombol CTA Modal
    const btnMasukDashboard = page.getByRole('button', { name: 'Masuk ke Dashboard' });
    await expect(btnMasukDashboard).toBeVisible();

    // 5. Uji Interaksi dan Navigasi
    await btnMasukDashboard.click();
    
    // Pastikan modal tertutup setelah tombol diklik
    await expect(modalHeading).toBeHidden();
    
    // Validasi sistem mengarahkan pengguna ke halaman utama / dashboard
    // await expect(page).toHaveURL(/.*dashboard/);
  });

  // TC-07: Pengujian fungsionalitas ikon mata (Toggle Password Visibility)
  test('TC-07: Memeriksa fitur Show/Hide Kata Sandi', async ({ page }) => {
    const inputPassword = page.getByPlaceholder('Masukkan kata sandi');
    
    // Tipe bawaan harus 'password' (tersembunyi)
    await expect(inputPassword).toHaveAttribute('type', 'password');
    await inputPassword.fill('Rahasia123');

    // Asumsi ikon mata menggunakan label aria atau role button di dalam wrapper input
    // Jika tidak memiliki aria-label, kita bisa memakai parent locator atau ikon terkait
    const toggleMata = page.locator('.password-toggle-icon').first(); // Sesuaikan class/locator dari developer
    
    // Klik icon mata untuk Show Password
    await toggleMata.click();
    await expect(inputPassword).toHaveAttribute('type', 'text'); // Karakter menjadi teks terbuka

    // Klik icon mata lagi untuk Hide Password
    await toggleMata.click();
    await expect(inputPassword).toHaveAttribute('type', 'password'); // Karakter kembali tersembunyi
  });

  // TC-08: Validasi navigasi tautan "Lupa Kata Sandi?"
  test('TC-08: Navigasi Lupa Kata Sandi', async ({ page }) => {
    const linkLupaSandi = page.getByRole('link', { name: 'Lupa Kata Sandi?' });
    await expect(linkLupaSandi).toBeVisible();
    
    await linkLupaSandi.click();
    // Validasi URL atau Elemen di halaman Lupa Password
    // await expect(page).toHaveURL(/.*forgot-password/);
  });

  // TC-09: Validasi proses Login menggunakan Single Sign-On (SSO) Google dan Apple
  test('TC-09: Memeriksa ketersediaan tombol SSO Google dan Apple', async ({ page }) => {
    // Verifikasi teks pembagi
    await expect(page.getByText('ATAU MASUK DENGAN')).toBeVisible();

    // Locator tombol SSO
    const btnGoogle = page.getByRole('button', { name: 'Lanjutkan dengan Google' });
    const btnApple = page.getByRole('button', { name: 'Lanjutkan dengan Apple' });

    await expect(btnGoogle).toBeVisible();
    await expect(btnApple).toBeVisible();

    /* 
      Catatan Praktik Terbaik:
      Untuk otomasi SSO seutuhnya (klik & otorisasi Oauth pihak ke-3) biasanya 
      memerlukan penanganan (handling) multi-tab atau API mock khusus di Playwright 
      agar tidak terblokir proteksi bot dari Google/Apple.
    */
  });

  // TC-10: Validasi navigasi tautan "Daftar Sekarang"
  test('TC-10: Navigasi pengguna baru ke halaman Registrasi', async ({ page }) => {
    await expect(page.getByText('Belum punya akun?')).toBeVisible();
    
    const linkDaftar = page.getByRole('link', { name: 'Daftar Sekarang' });
    await expect(linkDaftar).toBeVisible();
    
    await linkDaftar.click();
    // Validasi navigasi berhasil pindah ke halaman register
    // await expect(page).toHaveURL(/.*register/);
  });

});