import { test, expect } from '@playwright/test';

test.describe.serial('Admin Panel - Verifikasi Dasbor Utama & Aksi Cepat', () => {
  let page;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();

    // Login Admin 1x di awal
    await page.goto('https://layarbaca.app/admin/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
    const usernameInput = page.getByRole('textbox').first();
    const passwordInput = page.getByRole('textbox', { name: "Gunakan 'admin'" });
    const submitBtn = page.getByRole('button', { name: 'Masuk' });

    await usernameInput.fill('admin');
    await passwordInput.fill('sampulkreativ.yes');
    await submitBtn.click();

    // Validasi toast login & redirect ke dasbor
    await expect(page.getByText('Login berhasil')).toBeVisible({ timeout: 15000 });
    await page.waitForURL('**/admin/**', { timeout: 20000 });
  });

  test('1. Verifikasi Komponen Statistik & Informasi Dasbor', async () => {
    test.setTimeout(60000);
    // Header Dasbor
    await expect(page.getByRole('heading', { name: 'Dasbor Kreator' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Sistem Akses Online')).toBeVisible();

    // Kartu-kartu Metrik Statistik
    await expect(page.getByText('Total Pendapatan')).toBeVisible();
    await expect(page.getByText('Total Pelanggan')).toBeVisible();
    await expect(page.getByText('Konten Aktif')).toBeVisible();
    await expect(page.getByText('Transaksi Menunggu')).toBeVisible();

    // Section InformasiTambahan
    await expect(page.getByRole('heading', { name: 'Transaksi Terbaru' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Tips Manajemen Paket Akses 💡' })).toBeVisible();
  });

  test('2. Uji Navigasi Pintasan (Quick Action) di Dasbor', async () => {
    test.setTimeout(60000);
    const dasborLink = page.getByRole('link', { name: 'Dasbor' });

    // 1. Tombol Tambah Konten Baru -> Navigasi ke Manajemen Video & Film
    await page.getByRole('button', { name: 'Tambah Konten Baru' }).click();
    await expect(page.getByRole('heading', { name: 'Manajemen Video & Film' })).toBeVisible({ timeout: 10000 });
    await dasborLink.click();

    // 2. Tombol Verifikasi Pembayaran -> Navigasi ke Konfirmasi Pembayaran
    await page.getByRole('button', { name: 'Verifikasi Pembayaran' }).click();
    await expect(page.getByRole('heading', { name: 'Konfirmasi Pembayaran' })).toBeVisible({ timeout: 10000 });
    await dasborLink.click();

    // 3. Tombol Generate Kode Akses -> Navigasi ke Kode Akses
    await page.getByRole('button', { name: 'Generate Kode Akses' }).click();
    await expect(page.getByRole('heading', { name: 'Kode Akses' })).toBeVisible({ timeout: 10000 });
    await dasborLink.click();

    // 4. Tombol Lihat Semua Transaksi -> Navigasi ke Konfirmasi Pembayaran
    await page.getByRole('button', { name: 'Lihat Semua' }).click();
    await expect(page.getByRole('heading', { name: 'Konfirmasi Pembayaran' })).toBeVisible({ timeout: 10000 });
    await dasborLink.click();
  });

});