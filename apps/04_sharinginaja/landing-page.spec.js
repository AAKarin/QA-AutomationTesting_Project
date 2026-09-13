// @ts-check
import { test, expect } from '@playwright/test';
require('dotenv').config(); // Load environment variables dari .env

test.describe('Modul: Landing Page - Sharinginaja', () => {

  // Mengambil URL dari .env, dengan fallback ke localhost jika tidak ada
  const BASE_URL = process.env.BASE_URL_SHARINGINAJA || 'http://localhost:3000';

  test.beforeEach(async ({ page }) => {
    // Navigasi ke halaman utama sebelum setiap tes berjalan
    await page.goto(BASE_URL);
  });

  // TC-01: Verifikasi judul dan deskripsi halaman landing
  test('TC-01: Memverifikasi judul dan deskripsi di Hero Section', async ({ page }) => {
    // Verifikasi keberadaan heading utama
    const mainHeading = page.getByRole('heading', { name: /Bagikan Kenangan|Berbagi Momen/i });
    await expect(mainHeading).toBeVisible();
    
    // Verifikasi deskripsi
    const description = page.getByText(/Platform untuk berbagi kenangan spesial dengan teman dan keluarga/i);
    await expect(description).toBeVisible();
  });

  // TC-02: Memeriksa tombol CTA utama (Mulai Sekarang/Sign Up)
  test('TC-02: Memeriksa fungsi tombol CTA "Mulai Sekarang"', async ({ page }) => {
    // Verifikasi tombol utama tersedia
    const ctaButton = page.getByRole('button', { name: /Mulai Sekarang|Daftar Gratis/i });
    await expect(ctaButton).toBeVisible();
    
    // Klik tombol dan validasi navigasi
    await ctaButton.click();
    
    // Tunggu navigasi dan validasi URL
    await page.waitForURL(/.*register|.*signup/, { timeout: 5000 });
    await expect(page).toHaveURL(/.*register|.*signup/);
  });

  // TC-03: Verifikasi fitur-fitur utama yang ditampilkan
  test('TC-03: Memverifikasi daftar fitur utama platform', async ({ page }) => {
    // Verifikasi heading "Fitur Utama"
    await expect(page.getByRole('heading', { name: /Fitur Utama|Keunggulan/i })).toBeVisible();
    
    // Verifikasi keberadaan fitur-fitur
    await expect(page.getByText(/Berbagi Foto & Video/i)).toBeVisible();
    await expect(page.getByText(/Album Digital/i)).toBeVisible();
    await expect(page.getByText(/Kolaborasi Real-time/i)).toBeVisible();
  });

  // TC-04: Verifikasi navigasi menu header
  test('TC-04: Memeriksa menu navigasi di header', async ({ page }) => {
    // Verifikasi logo/brand
    const logo = page.getByRole('link', { name: /Sharinginaja/i });
    await expect(logo).toBeVisible();
    
    // Verifikasi menu items
    const aboutLink = page.getByRole('link', { name: /Tentang|About/i });
    const featuresLink = page.getByRole('link', { name: /Fitur|Features/i });
    
    await expect(aboutLink).toBeVisible();
    await expect(featuresLink).toBeVisible();
  });

  // TC-05: Memeriksa footer dengan informasi penting
  test('TC-05: Memverifikasi footer dengan links dan informasi', async ({ page }) => {
    // Scroll ke bawah untuk melihat footer
    await page.locator('footer').scrollIntoViewIfNeeded();
    
    // Verifikasi keberadaan footer
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    
    // Verifikasi links penting di footer
    await expect(footer.getByRole('link', { name: /Privasi|Privacy/i })).toBeVisible();
    await expect(footer.getByRole('link', { name: /Syarat|Terms/i })).toBeVisible();
  });

  // TC-06: Memeriksa responsivitas halaman di mobile view
  test('TC-06: Memverifikasi layout pada tampilan mobile', async ({ page }) => {
    // Set viewport ke ukuran mobile
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verifikasi menu burger/hamburger tersedia pada mobile
    const mobileMenu = page.getByRole('button', { name: /Menu|Hamburger/i });
    await expect(mobileMenu).toBeVisible();
    
    // Verifikasi tombol CTA masih terlihat
    const ctaButton = page.getByRole('button', { name: /Mulai Sekarang|Daftar/i });
    await expect(ctaButton).toBeVisible();
  });
});
