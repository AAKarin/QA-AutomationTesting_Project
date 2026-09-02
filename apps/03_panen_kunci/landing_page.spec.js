// @ts-check
import { test, expect } from '@playwright/test';
require('dotenv').config(); // Load environment variables dari .env

test.describe('Modul: Landing Page - Panen Kunci', () => {

  // Mengambil URL dari .env, dengan fallback ke localhost jika tidak ada
  const BASE_URL = process.env.BASE_URL_PANEN_KUNCI || 'http://localhost:3000';

  test.beforeEach(async ({ page }) => {
    // Navigasi ke halaman utama sebelum setiap tes berjalan
    await page.goto(BASE_URL);
  });

  // TC-01: Mengunduh/Mendaftar via tombol CTA Utama
  test('TC-01: Memeriksa fungsi tombol "Daftar Gratis" atau "Download" di Hero Section', async ({ page }) => {
    // Verifikasi keberadaan teks pendukung di sekitar CTA
    await expect(page.getByText('Ubah API Key Menjadi')).toBeVisible();
    await expect(page.getByText('Versi 1.2.0 • Bebas Iklan')).toBeVisible();
    
    // Verifikasi tombol utama (Bisa "Daftar Gratis" atau "Download Sekarang" tergantung update UI)
    const ctaButton = page.getByRole('button', { name: /Daftar Gratis|Download Sekarang/i });
    await expect(ctaButton).toBeVisible();
    
    // Klik tombol CTA dan validasi aksinya (misal: diarahkan ke /register atau memicu download)
    await ctaButton.click();
    
    // Contoh validasi lanjutan jika pindah ke form pendaftaran:
    // await expect(page).toHaveURL(/.*register/);
  });

  // TC-02: Melihat dan membaca bagian 3 langkah cara kerja platform
  test('TC-02: Memverifikasi informasi 3 langkah cara kerja (Cara Kerja Sangat Mudah)', async ({ page }) => {
    // Verifikasi Header Section
    await expect(page.getByRole('heading', { name: 'Cara Kerja Sangat Mudah' })).toBeVisible();

    // Verifikasi Langkah 1-3
    await expect(page.getByText('Daftar di Kie.ai')).toBeVisible();
    await expect(page.getByText('Setor API Key')).toBeVisible();
    await expect(page.getByText('Tarik Saldo')).toBeVisible();
    
    // Verifikasi klaim deskripsi
    await expect(page.getByText('Tarik kapan saja tanpa batas minimum.')).toBeVisible();
  });

  // TC-03: Melihat informasi total nominal dana (Social Proof)
  test('TC-03: Menampilkan total nominal dana yang telah dicairkan', async ({ page }) => {
    // Lokator teks statistik nominal
    const statistikNominal = page.getByText('Rp 100.000.000+');
    await expect(statistikNominal).toBeVisible();

    // Lokator deskripsi social proof
    const teksBukti = page.getByText(/Telah berhasil dicairkan oleh ribuan pengguna aktif kami/i);
    await expect(teksBukti).toBeVisible();
  });

  // TC-04: Melihat daftar pilihan metode pembayaran didukung
  test('TC-04: Memverifikasi logo/daftar metode pembayaran yang didukung', async ({ page }) => {
    await expect(page.getByText('Mendukung Penarikan Melalui')).toBeVisible();
    
    // Memastikan setiap E-Wallet dan Bank tersedia
    const opsiDANA = page.getByText('DANA', { exact: true });
    const opsiGoPay = page.getByText('GoPay', { exact: true });
    const opsiOVO = page.getByText('OVO', { exact: true });
    const opsiBank = page.getByText('Bank Transfer', { exact: true });

    await expect(opsiDANA).toBeVisible();
    await expect(opsiGoPay).toBeVisible();
    await expect(opsiOVO).toBeVisible();
    await expect(opsiBank).toBeVisible();
  });

  // TC-05: Memeriksa kehadiran logo dan ikon profil di header
  test('TC-05: Memverifikasi kehadiran logo Panen Kunci dan Avatar di Header', async ({ page }) => {
    // Mencari Logo aplikasi di pojok kiri (Menggunakan alt text atau teks "Panen Kunci")
    const headerLogo = page.locator('header').getByText(/Panen Kunci/i).first(); 
    await expect(headerLogo).toBeVisible();

    // Mencari elemen gambar Avatar/Profile di area header
    const profileAvatar = page.locator('header img').last(); // Asumsi avatar menggunakan tag <img> di header
    await expect(profileAvatar).toBeVisible();
  });

});