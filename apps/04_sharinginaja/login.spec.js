// @ts-check
import { test, expect } from '@playwright/test';
require('dotenv').config();

test.describe('Modul: Login - Sharinginaja', () => {

  const BASE_URL = process.env.BASE_URL_SHARINGINAJA || 'http://localhost:3000';
  const LOGIN_URL = `${BASE_URL}/login`;
  
  // Test credentials (from environment variables)
  const VALID_EMAIL = process.env.TEST_EMAIL_SHARINGINAJA || 'user@example.com';
  const VALID_PASSWORD = process.env.TEST_PASSWORD_SHARINGINAJA || 'password123';

  test.beforeEach(async ({ page }) => {
    // Navigasi ke halaman login sebelum setiap tes
    await page.goto(LOGIN_URL);
  });

  // TC-01: Verifikasi tampilan form login
  test('TC-01: Memverifikasi tampilan form login dengan semua field', async ({ page }) => {
    // Verifikasi judul halaman
    await expect(page.getByRole('heading', { name: /Masuk|Login|Sign In/i })).toBeVisible();
    
    // Verifikasi keberadaan field email
    const emailInput = page.getByLabel(/Email|Alamat Email/i);
    await expect(emailInput).toBeVisible();
    
    // Verifikasi keberadaan field password
    const passwordInput = page.getByLabel(/Password|Kata Sandi/i);
    await expect(passwordInput).toBeVisible();
    
    // Verifikasi tombol login
    const loginButton = page.getByRole('button', { name: /Masuk|Login|Sign In/i });
    await expect(loginButton).toBeVisible();
  });

  // TC-02: Login dengan kredensial yang valid
  test('TC-02: Berhasil login dengan email dan password yang valid', async ({ page }) => {
    // Isi email
    await page.getByLabel(/Email|Alamat Email/i).fill(VALID_EMAIL);
    
    // Isi password
    await page.getByLabel(/Password|Kata Sandi/i).fill(VALID_PASSWORD);
    
    // Klik tombol login
    await page.getByRole('button', { name: /Masuk|Login|Sign In/i }).click();
    
    // Tunggu redirect dan verifikasi dashboard
    await page.waitForURL(/.*dashboard|.*home/, { timeout: 5000 });
    await expect(page).toHaveURL(/.*dashboard|.*home/);
  });

  // TC-03: Validasi error saat email kosong
  test('TC-03: Menampilkan error saat email tidak diisi', async ({ page }) => {
    // Isi hanya password
    await page.getByLabel(/Password|Kata Sandi/i).fill(VALID_PASSWORD);
    
    // Klik tombol login
    await page.getByRole('button', { name: /Masuk|Login|Sign In/i }).click();
    
    // Verifikasi error message
    await expect(page.getByText(/Email wajib diisi|Email is required|Email tidak boleh kosong/i)).toBeVisible();
  });

  // TC-04: Validasi error saat password kosong
  test('TC-04: Menampilkan error saat password tidak diisi', async ({ page }) => {
    // Isi hanya email
    await page.getByLabel(/Email|Alamat Email/i).fill(VALID_EMAIL);
    
    // Klik tombol login tanpa mengisi password
    await page.getByRole('button', { name: /Masuk|Login|Sign In/i }).click();
    
    // Verifikasi error message
    await expect(page.getByText(/Password wajib diisi|Password is required|Password tidak boleh kosong/i)).toBeVisible();
  });

  // TC-05: Validasi error dengan kredensial yang salah
  test('TC-05: Menampilkan error saat kredensial tidak valid', async ({ page }) => {
    // Isi dengan kredensial yang salah
    await page.getByLabel(/Email|Alamat Email/i).fill('wrong@example.com');
    await page.getByLabel(/Password|Kata Sandi/i).fill('wrongpassword');
    
    // Klik tombol login
    await page.getByRole('button', { name: /Masuk|Login|Sign In/i }).click();
    
    // Verifikasi error message
    await expect(page.getByText(/Email atau password salah|Invalid credentials|Login gagal/i)).toBeVisible();
  });

  // TC-06: Memeriksa fitur "Lupa Password"
  test('TC-06: Memeriksa link "Lupa Password"', async ({ page }) => {
    // Verifikasi keberadaan link "Lupa Password"
    const forgotPasswordLink = page.getByRole('link', { name: /Lupa Password|Forgot Password/i });
    await expect(forgotPasswordLink).toBeVisible();
    
    // Klik link dan verifikasi navigasi
    await forgotPasswordLink.click();
    await page.waitForURL(/.*forgot|.*reset/, { timeout: 5000 });
    await expect(page).toHaveURL(/.*forgot|.*reset/);
  });

  // TC-07: Memeriksa link "Daftar Akun Baru"
  test('TC-07: Memeriksa link navigasi ke halaman registrasi', async ({ page }) => {
    // Verifikasi keberadaan link signup
    const signupLink = page.getByRole('link', { name: /Daftar|Registrasi|Sign Up|Buat Akun/i });
    await expect(signupLink).toBeVisible();
    
    // Klik link dan verifikasi navigasi
    await signupLink.click();
    await page.waitForURL(/.*register|.*signup/, { timeout: 5000 });
    await expect(page).toHaveURL(/.*register|.*signup/);
  });

  // TC-08: Toggle visibility password
  test('TC-08: Memeriksa fitur show/hide password', async ({ page }) => {
    const passwordInput = page.getByLabel(/Password|Kata Sandi/i);
    const toggleButton = page.getByRole('button', { name: /tampilkan password|show password|lihat/i });
    
    // Default password harus tersembunyi
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Klik tombol toggle jika ada
    if (await toggleButton.isVisible()) {
      await toggleButton.click();
      
      // Verifikasi tipe input berubah menjadi text
      await expect(passwordInput).toHaveAttribute('type', 'text');
    }
  });

  // TC-09: Memeriksa validasi format email
  test('TC-09: Validasi format email yang tidak valid', async ({ page }) => {
    // Isi email dengan format tidak valid
    await page.getByLabel(/Email|Alamat Email/i).fill('invalid-email');
    await page.getByLabel(/Password|Kata Sandi/i).fill(VALID_PASSWORD);
    
    // Klik tombol login
    await page.getByRole('button', { name: /Masuk|Login|Sign In/i }).click();
    
    // Verifikasi error message tentang format email
    await expect(page.getByText(/Format email tidak valid|Invalid email format|Email tidak sesuai/i)).toBeVisible();
  });

  // TC-10: Memeriksa responsive design di mobile
  test('TC-10: Verifikasi form login di tampilan mobile', async ({ page }) => {
    // Set viewport ke ukuran mobile
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verifikasi form tetap terlihat dengan baik
    await expect(page.getByLabel(/Email|Alamat Email/i)).toBeVisible();
    await expect(page.getByLabel(/Password|Kata Sandi/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Masuk|Login|Sign In/i })).toBeVisible();
  });
});
