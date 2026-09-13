import { test, expect } from '@playwright/test';

// Sesuaikan URL dengan env lokal atau staging Anda
const BASE_URL = process.env.RUANGKREATIV_URL || 'http://localhost:3000';

test.describe('RuangKreativ - Skenario Landing Page User', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('TC01: Validasi Header Navbar dan Ketersediaan Menu Utama', async ({ page }) => {
    await expect(page.getByText('ruangkreasi').first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Layanan' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Portofolio' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Kelas' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Pesanan Saya' })).toBeVisible();
  });

  test('TC02: Validasi Fungsionalitas Tombol CTA Hero Section', async ({ page }) => {
    const btnMulai = page.getByRole('button', { name: 'Mulai Sekarang' });
    const btnLayanan = page.getByRole('button', { name: 'Lihat Layanan' });

    await expect(btnMulai).toBeVisible();
    await expect(btnLayanan).toBeVisible();
    // Validasi klik CTA mengarah ke bagian/halaman yang tepat (ubah URL jika perlu)
    await btnLayanan.click();
  });

  test('TC03: Validasi Tampilan Kartu Layanan (Jasa AI & Kelas Online)', async ({ page }) => {
    // Validasi Kartu Jasa Pembuatan Video AI
    await expect(page.getByText('Jasa Pembuatan Video AI')).toBeVisible();
    await expect(page.getByText('Mulai Rp 50.000')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Pesan Sekarang' })).toBeVisible();

    // Validasi Kartu Kelas Online AI
    await expect(page.getByText('Kelas Online AI')).toBeVisible();
    await expect(page.getByText('Mulai Rp 150.000')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Daftar Sesi' })).toBeVisible();
  });

  test('TC04: Validasi Interaktivitas Section Karya & Portofolio', async ({ page }) => {
    await expect(page.getByText('Video Skincare Estetik')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Lihat Semua' })).toBeVisible();
  });

  test('TC05: Validasi Section Keunggulan dan Konsultasi Trainer', async ({ page }) => {
    await expect(page.getByText('100% Ramah Pemula')).toBeVisible();
    await expect(page.getByText('Efisiensi Waktu & Biaya')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Konsultasi dengan Trainer' })).toBeVisible();
  });

  test('TC06: Validasi Fungsionalitas Accordion FAQ', async ({ page }) => {
    const faq1 = page.getByText('Bagaimana cara memesan video AI?');
    await faq1.click(); // Expand
    await expect(page.getByText('Teks jawaban FAQ')).toBeVisible(); // Sesuaikan teks jawaban aslinya
    await faq1.click(); // Collapse
  });

  test('TC07: Validasi Keterbacaan Hak Cipta dan Tautan Footer', async ({ page }) => {
    await expect(page.getByText('© 2024 ruangkreasi')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Privacy Policy' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Terms of Service' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Contact Us' })).toBeVisible();
  });
});

test.describe('RuangKreativ - Skenario Penjadwalan Kelas', () => {
  // Prasyarat: Masuk ke halaman penjadwalan
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/jadwal`); // Sesuaikan rute URL aslinya
  });

  test('TC08: Validasi Tampilan Informasi Trainer dan Biaya', async ({ page }) => {
    await expect(page.getByText('Budi Santoso (AI Specialist)')).toBeVisible();
    await expect(page.getByText('Rp 150.000 / Sesi')).toBeVisible();
  });

  test('TC09: Validasi Pemilihan Tanggal Belajar', async ({ page }) => {
    const tglPilihan = page.getByRole('button', { name: 'RAB 26' });
    await tglPilihan.click();
    // Memastikan border ter-highlight (sesuaikan nama class atau style yang digunakan)
    await expect(tglPilihan).toHaveClass(/border-ungu/); 
  });

  test('TC10: Validasi Pemilihan Jam Belajar', async ({ page }) => {
    const jamPilihan = page.getByRole('button', { name: '13:00 WIB' });
    await jamPilihan.click();
    // Memastikan tombol jam aktif
    await expect(jamPilihan).toHaveClass(/aktif/); 
  });
});