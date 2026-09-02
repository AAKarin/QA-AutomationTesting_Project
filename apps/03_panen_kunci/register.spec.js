// @ts-check
import { test, expect } from '@playwright/test';
require('dotenv').config();

test.describe('Modul: Autentikasi (Register) - Panen Kunci', () => {

  const BASE_URL = process.env.BASE_URL_PANEN_KUNCI || 'http://localhost:3000';

  test.beforeEach(async ({ page }) => {
    // Navigasi ke halaman pendaftaran
    await page.goto(`${BASE_URL}/register`);
    
    // Validasi tampilan header
    await expect(page.getByRole('heading', { name: 'Daftar Akun Baru' })).toBeVisible();
    await expect(page.getByText('Mulai kumpulkan saldo dengan setor API Key sekarang.')).toBeVisible();
  });

  // TC-11: Validasi pendaftaran akun baru dan popup sukses
  test('TC-11: Berhasil mendaftar dan memvalidasi popup Pendaftaran Berhasil', async ({ page }) => {
    // 1. Mengisi formulir (Lanjutan dari skrip sebelumnya)
    await page.getByPlaceholder('Masukkan nama lengkap').fill('Budi Automasi');
    await page.getByPlaceholder('contoh@email.com').fill('budi.auto@panenkunci.com');
    await page.getByPlaceholder('Minimal 8 karakter').fill('Katasandi123!');
    await page.getByPlaceholder('Ulangi kata sandi').fill('Katasandi123!');
    await page.getByRole('checkbox', { name: /Saya setuju dengan Syarat dan Ketentuan/i }).check();
    
    // 2. Submit Formulir
    await page.getByRole('button', { name: 'Daftar Sekarang' }).click();

    // 3. Validasi Elemen Modal "Pendaftaran Berhasil!"
    const modalHeading = page.getByRole('heading', { name: 'Pendaftaran Berhasil!' });
    await expect(modalHeading).toBeVisible();

    // Memvalidasi deskripsi persis seperti mockup
    const deskripsi = page.getByText('Selamat! Akun Anda telah berhasil dibuat. Sekarang Anda bisa mulai mengumpulkan saldo dengan menyetor API Key.');
    await expect(deskripsi).toBeVisible();

    // 4. Validasi Tombol CTA Modal
    const btnMulaiSekarang = page.getByRole('button', { name: 'Mulai Sekarang' });
    await expect(btnMulaiSekarang).toBeVisible();

    const btnLihatDashboard = page.getByRole('button', { name: 'Lihat Dashboard' });
    await expect(btnLihatDashboard).toBeVisible();

    // 5. Uji Navigasi dari Modal (Misal: klik "Mulai Sekarang")
    await btnMulaiSekarang.click();
    
    // Pastikan modal tertutup setelah diklik
    await expect(modalHeading).toBeHidden();
    
    // Validasi URL atau halaman tujuan selanjutnya (misal alur penyetoran kunci)
    // await expect(page).toHaveURL(/.*setor-kunci/);
  });

  // TC-12: Pengujian fungsionalitas ikon mata (Toggle Password Visibility)
  test('TC-12: Memeriksa fitur Show/Hide pada field Kata Sandi dan Konfirmasi', async ({ page }) => {
    const inputKataSandi = page.getByPlaceholder('Minimal 8 karakter');
    const inputKonfirmasi = page.getByPlaceholder('Ulangi kata sandi');

    await inputKataSandi.fill('Rahasia123');
    await inputKonfirmasi.fill('Rahasia123');

    // Validasi state default adalah tersembunyi (password)
    await expect(inputKataSandi).toHaveAttribute('type', 'password');
    await expect(inputKonfirmasi).toHaveAttribute('type', 'password');

    // Mencari ikon toggle (asumsi menggunakan class umum atau posisi di dalam DOM)
    // Sebaiknya developer menambahkan data-testid pada icon mata ini, misal: data-testid="toggle-password"
    const toggleIcons = page.locator('.password-toggle-icon'); 
    
    // Test toggle field pertama (Kata Sandi)
    await toggleIcons.first().click();
    await expect(inputKataSandi).toHaveAttribute('type', 'text');
    
    // Test toggle field kedua (Konfirmasi Kata Sandi)
    await toggleIcons.nth(1).click();
    await expect(inputKonfirmasi).toHaveAttribute('type', 'text');
  });

  // TC-13: Validasi persetujuan Syarat & Ketentuan Layanan
  test('TC-13: Memastikan checkbox Syarat & Ketentuan berfungsi dan tautan dapat diklik', async ({ page }) => {
    const checkboxTNC = page.getByRole('checkbox', { name: /Saya setuju dengan Syarat dan Ketentuan/i });
    const linkTNC = page.getByRole('link', { name: 'Syarat dan Ketentuan' });

    // Pastikan checkbox awalnya tidak tercentang
    await expect(checkboxTNC).not.toBeChecked();
    
    // Klik checkbox dan validasi statusnya
    await checkboxTNC.check();
    await expect(checkboxTNC).toBeChecked();

    // Pastikan tautan dokumen legal tersedia
    await expect(linkTNC).toBeVisible();
    await expect(linkTNC).toHaveAttribute('href', /.*terms/); // Asumsi path URL legal
  });

  // TC-14: Validasi pendaftaran menggunakan SSO Google dan Apple
  test('TC-14: Memeriksa ketersediaan opsi pendaftaran SSO', async ({ page }) => {
    await expect(page.getByText('ATAU DAFTAR DENGAN')).toBeVisible();

    const btnGoogle = page.getByRole('button', { name: 'Lanjutkan dengan Google' });
    const btnApple = page.getByRole('button', { name: 'Lanjutkan dengan Apple' });

    await expect(btnGoogle).toBeVisible();
    await expect(btnApple).toBeVisible();
  });

  // TC-15: Validasi navigasi tautan "Masuk Sekarang"
  test('TC-15: Navigasi kembali ke halaman Login', async ({ page }) => {
    await expect(page.getByText('Sudah punya akun?')).toBeVisible();

    const linkMasuk = page.getByRole('link', { name: 'Masuk Sekarang' });
    await expect(linkMasuk).toBeVisible();

    await linkMasuk.click();
    
    // Validasi bahwa navigasi berhasil
    // await expect(page).toHaveURL(/.*login/);
  });

});