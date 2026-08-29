import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { setupAdBlocker } from '../../../utils/ad_blocker.js';
import { approveTransactionAndGetCode } from '../../../utils/adminActions.js';

test.describe.serial('E2E Flow Pembelian Paket, Upload Bukti & Aktivasi', () => {
  let context;
  let page;
  let adminContext;
  let adminPage;

  test.beforeAll(async ({ browser }) => {
    // --- 1. SETUP SESI USER (MOBILE) ---
    context = await browser.newContext();
    page = await context.newPage();
    await setupAdBlocker(page); 
    await page.setViewportSize({ width: 390, height: 844 }); 

    // --- 2. SETUP SESI ADMIN & LOGIN (DESKTOP) ---
    adminContext = await browser.newContext();
    adminPage = await adminContext.newPage();
    await adminPage.setViewportSize({ width: 1280, height: 720 });

    // Login Admin 1x di awal
    await adminPage.goto('https://layarbaca.app/admin/login', { waitUntil: 'domcontentloaded', timeout: 30000 })
    
    await adminPage.getByRole('textbox').first().fill('admin')
    await adminPage.getByRole('textbox', { name: "Gunakan 'admin'" }).fill('sampulkreativ.yes')
    await adminPage.getByRole('button', { name: 'Masuk' }).click()

    // Validasi login sukses & tunggu redirect selesai sebelum TC 1 berjalan
    await expect(adminPage.getByText('Login berhasil')).toBeVisible({ timeout: 15000 })
    await adminPage.waitForURL('**/admin/**', { timeout: 20000 })
  });

  test.afterAll(async () => {
    await context.close();
    await adminContext.close(); // Tutup sesi admin setelah selesai
  });

  test('TC 1: Memilih Paket Bulanan (30 Hari)', async () => {
    await page.goto('https://layarbaca.app/app/home', { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Pemicu buka pop-up paket (disesuaikan jika ada tombol Beli Paket, atau jika langsung muncul)
    const btnBeliPaket = page.getByText(/BELI PAKET/i).first();
    if (await btnBeliPaket.isVisible()) {
      await btnBeliPaket.click();
    }

    // Pilih paket 30 Hari
    const paketBulanan = page.getByText(/30 HARI/i, { exact: true }).first();
    await expect(paketBulanan).toBeVisible({ timeout: 10000 });
    await paketBulanan.click();

    const btnLanjutKePembayaran = page.getByRole('button', { name: /LANJUT KE PEMBAYARAN/i });
    await btnLanjutKePembayaran.click();
  });

  test('TC 2: Mengisi Email & Simulasi Ubah Pilihan Paket', async () => {
    const titleForm = page.getByRole('heading', { name: /Kirim Kode Akses/i });
    await expect(titleForm).toBeVisible({ timeout: 10000 });

    // Isi Email
    const emailInput = page.getByRole('textbox', { name: /kamu@contoh.com/i }).first();
    await emailInput.fill('angel.akun.test.1@gmail.com');

    // Uji coba tombol ubah pilihan paket (1, 7, dan kembali ke 30 Hari)
    await page.getByRole('button', { name: '1 HARI' }).click();
    await expect(page.getByText('Rp 3.000')).toBeVisible();

    await page.getByRole('button', { name: '7 HARI' }).click();
    await expect(page.getByText('Rp 15.000')).toBeVisible();

    await page.getByRole('button', { name: '30 HARI' }).click();
    await expect(page.getByText('Rp 35.000')).toBeVisible();

    const btnLanjutPembayaran = page.getByRole('button', { name: /LANJUT PEMBAYARAN/i });
    await btnLanjutPembayaran.click();
  });

  test('TC 3: Verifikasi Halaman Pembayaran & Unduh QRIS', async () => {
    const titleBayar = page.getByRole('heading', { name: /Pilih Pembayaran/i });
    await expect(titleBayar).toBeVisible({ timeout: 10000 });

    const unduhQrisBtn = page.getByRole('link', { name: /Unduh QRIS/i }).first();
    
    // Tangkap tab baru sebagai 'popup' sesuai perilaku asli browser
    const popupPromise = page.waitForEvent('popup');
    await unduhQrisBtn.click();
    const popup = await popupPromise;

    // Langsung tutup tab popup tanpa menunggu waitForLoadState yang bikin flaky
    await popup.close();

    // Fokus kembali ke halaman utama dan klik tombol Lanjutkan
    const btnSudahBayar = page.getByRole('button', { name: /SAYA SUDAH BAYAR/i });
    await btnSudahBayar.scrollIntoViewIfNeeded();
    await btnSudahBayar.click();
  });

  test('TC 4: Validasi Format File & Upload Bukti Pembayaran', async () => {
    const titleUpload = page.getByRole('heading', { name: /Konfirmasi Valid/i });
    await expect(titleUpload).toBeVisible({ timeout: 10000 });

    const fileInput = page.locator('input[type="file"]').first();

    // Buat file dummy secara dinamis di folder test ini berada
    const invalidPath = path.resolve(__dirname, 'temp-dummy.exe');
    const validPath = path.resolve(__dirname, 'temp-dummy.png');
    fs.writeFileSync(invalidPath, 'Ini adalah file exe palsu');
    fs.writeFileSync(validPath, 'Ini adalah file gambar palsu');

    // 1. Uji Upload File Tidak Valid (.exe)
    await fileInput.setInputFiles(invalidPath);
    const errorToast = page.getByText(/Format file tidak didukung/i).first();
    await expect(errorToast).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: /Close toast/i }).click();

    // 2. Uji Upload File Valid (.png)
    await fileInput.setInputFiles(validPath);
    await page.waitForTimeout(1000);

    // Hapus kembali file dummy agar folder tidak berantakan
    fs.unlinkSync(invalidPath);
    fs.unlinkSync(validPath);

    const btnBukaAutentikasi = page.getByRole('button', { name: /BUKA AUTENTIKASI/i });
    await btnBukaAutentikasi.click();

    const successToast = page.getByText(/Transaksi berhasil dikirim/i).first();
    await expect(successToast).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: /Close toast/i }).click();

    const btnKembali = page.getByRole('button', { name: /KEMBALI KE BERANDA/i });
    await btnKembali.click();
  });

  test('TC 5: Aktivasi Kode Akses & Nonton Film', async () => {
    // 1. Admin memproses transaksi dan mengambil kode dinamis
    const accessCode = await approveTransactionAndGetCode(adminPage, 'angel.akun.test.1@gmail.com');
    
    // 2. User kembali ke halaman Home untuk aktivasi
    await page.goto('https://layarbaca.app/app/home', { waitUntil: 'domcontentloaded' });
    const menuBukaKunci = page.locator('button').filter({ hasText: /BUKA KUNCI/i }).first();
    if (await menuBukaKunci.isVisible()) {
        await menuBukaKunci.click();
    }

    const titleBukaKunci = page.getByRole('heading', { name: /Buka Kunci Konten/i });
    await expect(titleBukaKunci).toBeVisible({ timeout: 10000 });

    const inputKode = page.getByRole('textbox', { name: /KODE AKSES/i }).first();
    
    // 3. Masukkan kode dinamis, JANGAN di-hardcode lagi
    await inputKode.fill(accessCode); 

    const btnAktifkan = page.getByRole('button', { name: /AKTIFKAN AKSES/i });
    await btnAktifkan.click();

    // Validasi Akses Berhasil
    const successAlert = page.getByRole('heading', { name: /Akses Happy Aktif/i });
    await expect(successAlert).toBeVisible({ timeout: 15000 });

    // Kembali ke home dan klik satu film
    await page.goto('https://layarbaca.app/app/home', { waitUntil: 'domcontentloaded' });
    const movieCard = page.locator('a[href*="/view/"]').first();
    await expect(movieCard).toBeVisible({ timeout: 10000 });
    await movieCard.click({ force: true });
  });
});